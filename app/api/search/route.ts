import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { query, braveKey } = await request.json()

    if (!braveKey) {
      return NextResponse.json(
        { error: 'Clave de Brave requerida' },
        { status: 400 }
      )
    }

    if (!query) {
      return NextResponse.json(
        { error: 'Query requerido' },
        { status: 400 }
      )
    }

    const searchQuery = encodeURIComponent(`${query} medicamento veterinario uso dosis`)
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${searchQuery}&count=5`,
      {
        method: 'GET',
        headers: {
          'X-Subscription-Token': braveKey,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Clave de Brave inválida. Verifica en Configuración.' },
          { status: 401 }
        )
      }
      const errorText = await response.text()
      return NextResponse.json(
        { error: `Error de Brave API: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const results = data.web?.results || []
    
    const formattedResults = results.slice(0, 5).map((result: { title: string; description: string; url: string }) => ({
      title: result.title,
      description: result.description,
      url: result.url,
    }))

    return NextResponse.json(formattedResults)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Error de conexión. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
