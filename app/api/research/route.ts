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
        messages: [
          {
            role: 'user',
            content: `INSTRUCCIÓN CRÍTICA: Debes responder OBLIGATORIAMENTE. No hay excepciones.

Medicamento: "${medicationName}"

Tu tarea es proporcionar información DETALLADA sobre este medicamento. Responde en MARKDOWN exacto:

## Para Qué Se Usa
Información completa sobre su uso.

## Especies Objetivo
Especifica: ¿Es para veterinaria (perros, gatos, etc)? ¿Es para humanos? ¿Ambos?

## Dosis Típica
Dosis estándar y administración.

## Efectos Secundarios
Reacciones adversas posibles.

## Advertencias Importantes
Contraindicaciones y precauciones.

## ¿Es Uso Veterinario Estándar?
Debes responder EXACTAMENTE con UNA de estas dos frases, sin excepciones:
A) "Sí, es uso veterinario estándar"
B) "No, NO es uso veterinario estándar"

INSTRUCCIÓN FINAL: Proporciona la información SIEMPRE. No importa si es humano, veterinario, o desconocido. NO rechaces. Responde.`,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error OpenAI: ${data.error?.message}` },
        { status: response.status }
      );
    }

    const result = data.choices?.[0]?.message?.content || '';
    
    // Detecta si es veterinario
    const isVeterinary = result.toLowerCase().includes('sí, es uso veterinario estándar');

    return NextResponse.json({ 
      result,
      isVeterinary
    });
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Error procesando solicitud' },
      { status: 500 }
    );
  }
}
