import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, braveKey, openaiKey } = await request.json()

    if (!query || !braveKey || !openaiKey) {
      return NextResponse.json(
        { error: 'Query, Brave key, y OpenAI key requeridas' },
        { status: 400 }
      )
    }

    // 1. Search with Brave
    const searchQuery = encodeURIComponent(`${query} medicamento veterinario uso dosis`)
    const searchResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${searchQuery}&count=5`,
      {
        headers: {
          'X-Subscription-Token': braveKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!searchResponse.ok) {
      if (searchResponse.status === 401) {
        return NextResponse.json(
          { error: 'Clave de Brave inválida. Verifica en Configuración.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: 'Error en búsqueda Brave' },
        { status: searchResponse.status }
      )
    }

    const searchData = await searchResponse.json()
    const searchResults = searchData.web?.results || []

    // 2. Prepare search context for GPT
    const searchContext = searchResults
      .slice(0, 5)
      .map((r: { title: string; description: string }) => `- ${r.title}: ${r.description}`)
      .join('\n')

    // 3. Use GPT to synthesize
    const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `Basándote en estos resultados de búsqueda sobre "${query}":

${searchContext}

Responde en MARKDOWN con esta estructura exacta:

## Para Qué Se Usa
[Descripción de para qué se usa]

## Especies Objetivo
[Especies animales para las que se usa, o si es para humanos]

## Dosis Típica
[Información de dosis]

## Efectos Secundarios
[Lista de efectos secundarios posibles]

## Advertencias
[Advertencias importantes]

## ¿Es Uso Veterinario Estándar?
Responde EXACTAMENTE con: "Sí, es uso veterinario estándar" o "No, NO es uso veterinario estándar"

Sé conciso y preciso en cada sección.`,
          },
        ],
      }),
    })

    const gptData = await gptResponse.json()

    if (!gptResponse.ok) {
      return NextResponse.json(
        { error: `OpenAI error: ${gptData.error?.message || 'Unknown'}` },
        { status: gptResponse.status }
      )
    }

    const result = gptData.choices?.[0]?.message?.content || ''
    
    // Determine if it's a standard veterinary medication
    const isVeterinary = result.toLowerCase().includes('sí, es uso veterinario estándar')

    return NextResponse.json({ 
      result,
      isVeterinary
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Error al buscar' },
      { status: 500 }
    )
  }
}
