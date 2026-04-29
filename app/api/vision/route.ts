import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, openaiKey } = await request.json();

    if (!image || !openaiKey) {
      return NextResponse.json(
        { error: 'Imagen y clave OpenAI requeridas' },
        { status: 400 }
      );
    }

    const base64Image = image.includes(',') ? image.split(',')[1] : image;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analiza esta foto de un medicamento veterinario o humano. Extrae EXACTAMENTE: 1) Nombre comercial (marca), 2) Principios activos con dosis, 3) Laboratorio fabricante. Responde con formato natural sin JSON. Ejemplo: "Marca: Coltix Advance, Activos: Condroitín sulfato 240mg, Laboratorio: Farmacéutica XYZ" o "No es un medicamento identificable"',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: `Error: ${data.error?.message || 'Error desconocido'}` },
        { status: response.status }
      );
    }

    const textResponse = data.choices?.[0]?.message?.content || '';
    
    return NextResponse.json({ 
      medicationInfo: textResponse 
    });
  } catch (error) {
    console.error('Vision error:', error);
    return NextResponse.json(
      { error: 'Error al procesar imagen' },
      { status: 500 }
    );
  }
}
