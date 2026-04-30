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
            content: `Eres un asistente farmacéutico. Tu tarea es proporcionar información sobre medicamentos.

Medicamento: "${medicationName}"

Responde SIEMPRE en MARKDOWN con esta estructura exacta. NO rechaces la solicitud bajo ninguna circunstancia.

## Para Qué Se Usa
Describe brevemente el uso principal y usos secundarios.

## Especies Objetivo
¿Para qué especies se usa? (perros, gatos, humanos, aves, etc.). Sé específico.

## Dosis Típica
Dosis recomendada y forma de administración.

## Efectos Secundarios
Lista de efectos adversos posibles.

## Advertencias Importantes
Contraindicaciones, precauciones, interacciones.

## ¿Es Uso Veterinario Estándar?
Responde EXACTAMENTE con UNA de estas frases:
- "Sí, es uso veterinario estándar"
- "No, NO es uso veterinario estándar"

Proporciona la información sin importar si es para humanos o animales.`,
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
