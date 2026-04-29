import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, claudeKey } = await request.json()

    if (!claudeKey) {
      return NextResponse.json(
        { error: 'Clave de Claude requerida' },
        { status: 400 }
      )
    }

    if (!image) {
      return NextResponse.json(
        { error: 'Imagen requerida' },
        { status: 400 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20250514',
        max_tokens: 300,
        system: 'Eres un experto identificando medicamentos veterinarios y humanos desde fotos de empaques. Extrae con precisión.',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: 'image/jpeg',
                  data: image,
                },
              },
              {
                type: 'text',
                text: 'Analiza esta foto y devuelve SOLO un JSON válido con esta estructura: {"marca": "nombre comercial o null", "compuestos": ["compuesto con dosis"], "laboratorio": "nombre o null", "reconocido": true/false}. Si no es un medicamento, reconocido: false.',
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Clave de Claude inválida. Verifica en Configuración.' },
          { status: 401 }
        )
      }
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Error de Claude API: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const textContent = data.content?.[0]?.text || ''
    
    // Try to parse the JSON from the response
    try {
      const jsonMatch = textContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return NextResponse.json(parsed)
      }
      return NextResponse.json({ 
        marca: null, 
        compuestos: [], 
        laboratorio: null, 
        reconocido: false 
      })
    } catch {
      return NextResponse.json({ 
        marca: null, 
        compuestos: [], 
        laboratorio: null, 
        reconocido: false 
      })
    }
  } catch (error) {
    console.error('Vision API error:', error)
    return NextResponse.json(
      { error: 'Error al procesar. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
