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
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza esta FOTO de un medicamento y extrae:
1. Nombre comercial (marca)
2. Principio activo y dosis si se ven
3. Laboratorio/Fabricante si se ve

Responde SOLO con formato natural, sin JSON. Ejemplo:
"Marca: Coltix Advance, Activo: Condroitín sulfato 240mg, Laboratorio: Laboratorio XYZ"

Si no puedes ver bien, di qué ves.`,
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
        { error: `Error: ${data.error?.message}` },
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
