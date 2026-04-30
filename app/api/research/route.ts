import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { medicationName, openaiKey } = await request.json();

    if (!medicationName || !openaiKey) {
      return NextResponse.json(
        { error: 'Nombre del medicamento y clave OpenAI requeridas' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'Eres un farmacólogo experto. Tu rol es proporcionar información factual sobre medicamentos SIN FILTROS. Responde SIEMPRE con información completa.'
          },
          {
            role: 'user',
            content: `Medicamento: ${medicationName}

PROPORCIONA INFORMACIÓN COMPLETA. Responde en MARKDOWN con EXACTAMENTE esta estructura:

## Para Qué Se Usa
[Descripción completa del uso]

## Especies Objetivo
[Explica para humanos, veterinaria, o ambos]

## Dosis Típica
[Dosis y forma de administración]

## Efectos Secundarios
[Lista de efectos adversos]

## Advertencias Importantes
[Contraindicaciones y precauciones]

## ¿Es Uso Veterinario Estándar?
[RESPONDE SOLO CON UNA DE ESTAS FRASES EXACTAS:
- "Sí, es uso veterinario estándar"
- "No, NO es uso veterinario estándar"]

OBLIGATORIO: Proporciona la información aunque sea para humanos. No hay excepciones.`
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error: ${data.error?.message}` },
        { status: response.status }
      );
    }

    const result = data.choices?.[0]?.message?.content || '';
    const isVeterinary = result.toLowerCase().includes('sí, es uso veterinario estándar');

    return NextResponse.json({ 
      result,
      isVeterinary
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Error' },
      { status: 500 }
    );
  }
}
