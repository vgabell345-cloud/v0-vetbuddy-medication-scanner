import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { medicationName, searchResults, openaiKey } = await request.json()

    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'Clave de OpenAI requerida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!medicationName) {
      return new Response(
        JSON.stringify({ error: 'Nombre del medicamento requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const searchResultsText = searchResults
      .map((r: { title: string; description: string; url: string }, i: number) => 
        `${i + 1}. ${r.title}\n${r.description}\nFuente: ${r.url}`
      )
      .join('\n\n')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en farmacología veterinaria. Respondes SIEMPRE con JSON válido sin markdown, sin ```json, sin explicaciones adicionales. Solo el objeto JSON puro.',
          },
          {
            role: 'user',
            content: `Medicamento: ${medicationName}

Resultados de búsqueda:
${searchResultsText}

Devuelve SOLO un JSON válido (sin markdown, sin \`\`\` al inicio o final):
{
  "para_que_se_usa": "explicación breve",
  "especies_objetivo": "perros, gatos, etc o 'No aplica'",
  "dosis_tipica": "dosis o 'Consultar veterinario'",
  "efectos_secundarios": "lista breve",
  "advertencias": "advertencias importantes",
  "es_veterinario_estandar": true/false,
  "compuestos_activos": ["compuesto1", "compuesto2"]
}

IMPORTANTE: 'es_veterinario_estandar' es true SOLO si el medicamento se prescribe rutinariamente en medicina veterinaria. Para medicamentos humanos usados off-label en animales, es false.`,
          },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: 'Clave de OpenAI inválida. Verifica en Configuración.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
      const errorText = await response.text()
      return new Response(
        JSON.stringify({ error: `Error de OpenAI API: ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Stream the response
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Synthesize API error:', error)
    return new Response(
      JSON.stringify({ error: 'Error al procesar. Intenta de nuevo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
