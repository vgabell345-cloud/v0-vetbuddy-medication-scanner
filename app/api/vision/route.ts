import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { image, openaiKey } = await request.json();

    if (!image || !openaiKey) {
      return NextResponse.json(
        { error: 'Image and OpenAI key required' },
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
        temperature: 0.1,
        messages: [
          {
            role: 'system',
            content: 'You are a medication label reader. Extract information from medication packaging photos. Always respond in valid JSON format only, with no markdown or extra text.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this medication photo and extract information. Respond ONLY with this exact JSON structure (no markdown, no code blocks, just raw JSON):

{
  "brandName": "the commercial brand name visible on the package",
  "activeIngredients": "the active ingredients with dosages (e.g. 'Tetrahydrozoline 0.05% + Povidone 0.5%')",
  "laboratory": "the manufacturer/laboratory name if visible",
  "displayName": "a short display name combining brand and key active ingredient"
}

If something is not visible, use empty string "". The activeIngredients field is CRITICAL - read the small text carefully to find them.`,
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

    const textResponse = data.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleaned = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Fallback: use raw text
      parsed = {
        brandName: textResponse,
        activeIngredients: '',
        laboratory: '',
        displayName: textResponse
      };
    }
    
    return NextResponse.json({ 
      medicationInfo: parsed.displayName || parsed.brandName || textResponse,
      brandName: parsed.brandName || '',
      activeIngredients: parsed.activeIngredients || '',
      laboratory: parsed.laboratory || ''
    });
  } catch (error) {
    console.error('Vision error:', error);
    return NextResponse.json(
      { error: 'Error processing image' },
      { status: 500 }
    );
  }
}
