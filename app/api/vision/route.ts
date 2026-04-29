import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, geminiKey } = await request.json()

    if (!geminiKey) {
      return NextResponse.json(
        { error: 'Clave de Gemini requerida' },
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Analiza esta foto y devuelve SOLO un JSON válido (sin markdown, sin ```): {"marca": "nombre comercial o null", "compuestos": ["compuesto con dosis"], "laboratorio": "nombre o null", "reconocido": true/false}. Si no es un medicamento, reconocido: false.',
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 400 && data.error?.message?.includes('API key')) {
        return NextResponse.json(
          { error: 'Clave de Gemini inválida. Verifica en Configuración.' },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { error: `Error de Gemini API: ${data.error?.message || 'Unknown'}` },
        { status: response.status }
      )
    }

    // Extract text from Gemini response
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

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
