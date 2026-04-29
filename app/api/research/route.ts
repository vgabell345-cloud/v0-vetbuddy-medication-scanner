import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { medicationName, openaiKey } = await request.json()

    if (!medicationName || !openaiKey) {
      return NextResponse.json(
        { error: 'Nombre del medicamento y clave OpenAI requeridas' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: `Proporciona información completa y precisa sobre "${medicationName}" en MARKDOWN con esta estructura EXACTA:

## Para Qué Se Usa
Describe brevemente para qué se utiliza este medicamento.

## Especies Objetivo
Especifica si es para uso veterinario (perros, gatos, caballos, etc.) o humano.

## Dosis Típica
Proporciona la dosis típica y forma de administración.

## Efectos Secundarios
Lista los efectos secundarios posibles.

## Advertencias Importantes
Detalla contraindicaciones y advertencias.

## ¿Es Uso Veterinario Estándar?
Responde EXACTAMENTE con una de estas dos opciones:
- "Sí, es uso veterinario estándar"
- "No, NO es uso veterinario estándar"

Sé preciso, conciso y usa párrafos cortos en cada sección.`,
          },
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error: ${data.error?.message || 'Error desconocido'}` },
        { status: response.status }
      )
    }

    const result = data.choices?.[0]?.message?.content || ''
    const isVeterinary = result.toLowerCase().includes('sí, es uso veterinario estándar')

    return NextResponse.json({ 
      result,
      isVeterinary
    })
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json(
      { error: 'Error al investigar' },
      { status: 500 }
    )
  }
}
