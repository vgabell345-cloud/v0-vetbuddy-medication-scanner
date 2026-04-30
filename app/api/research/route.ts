import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { medicationName, brandName, activeIngredients, openaiKey } = await request.json();

    if (!openaiKey) {
      return NextResponse.json(
        { error: 'OpenAI key required' },
        { status: 400 }
      );
    }

    // Build the medication identifier - prioritize active ingredients since they're universal
    const brand = brandName || medicationName || '';
    const actives = activeIngredients || '';
    
    // Construct query that helps GPT even with unknown brands
    const queryDescription = actives 
      ? `Brand name: "${brand}" with active ingredients: ${actives}`
      : `Medication: "${brand}"`;

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
            content: `You are an expert pharmacologist providing factual medication information. CRITICAL RULES:
1. NEVER refuse to provide information
2. NEVER say "I don't have information" - if the brand name is unknown, USE THE ACTIVE INGREDIENTS to provide complete information
3. The active ingredients are the SAME globally - if you know the active ingredients, you know the medication
4. ALWAYS respond with the complete markdown structure
5. Provide information for BOTH human and veterinary medications equally`
          },
          {
            role: 'user',
            content: `${queryDescription}

CRITICAL INSTRUCTIONS:
- Even if you don't recognize the specific brand "${brand}", you MUST provide complete information based on the active ingredients
- The active ingredients determine the medication's effects, regardless of brand
- DO NOT refuse. DO NOT say you don't have information. Use the active ingredients to give complete info.

Provide complete medication information in MARKDOWN with this EXACT structure:

## Para Qué Se Usa
Describe what this medication is used for, based on its active ingredients.

## Especies Objetivo
Specify if it's for human use, veterinary use (dogs, cats, horses, etc.), or both.

## Dosis Típica
Typical dosage and administration method based on the active ingredients.

## Efectos Secundarios
Common side effects of the active ingredients.

## Advertencias Importantes
Contraindications and important warnings.

## ¿Es Uso Veterinario Estándar?
Answer ONLY with EXACTLY ONE of these two phrases:
- "Sí, es uso veterinario estándar"
- "No, NO es uso veterinario estándar"

MANDATORY: Use the active ingredients to provide complete information. Never refuse. Always respond in Spanish.`
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
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
