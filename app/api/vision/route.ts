import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, openaiKey } = await request.json()

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'Clave de OpenAI requerida' },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen requerida' },
        { status: 400 }
      )
    }

    // Extract base64 data (remove data URL prefix if present)
    const base64Data = image.includes(',') ? image.split(',')[1] : image
    const imageUrl = `data:image/jpeg;base64,${base64Data}`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta foto y devuelve SOLO un JSON válido (sin markdown, sin ```): {"marca": "nombre comercial o null", "compuestos": ["compuesto con dosis"], "laboratorio": "nombre o null", "reconocido": true/false}. Si no es un medicamento, reconocido: false.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Clave de OpenAI inválida. Verifica en Configuración.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: `Error de OpenAI API: ${data.error?.message || 'Unknown'}` },
        { status: response.status }
      )
    }

    // Extract text from OpenAI response
    const textContent = data.choices?.[0]?.message?.content || ''

    // Parse JSON from response
    let jsonContent = textContent.trim()

    // Remove markdown if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/```\s*$/, '')
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/```\s*$/, '')
    }

    try {
      const parsed = JSON.parse(jsonContent)
      return NextResponse.json(parsed)
    } catch {
      // Try to extract JSON object from response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      }
      return NextResponse.json({
        marca: null,
        compuestos: [],
        laboratorio: null,
        reconocido: false,
      })
    }
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      { error: 'Error al procesar imagen. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
