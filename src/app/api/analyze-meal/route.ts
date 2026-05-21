import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic()


export async function POST(req: Request) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const bytes = await imageFile.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mediaType = imageFile.type as 'image/jpeg' | 'image/png' | 'image/webp'

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64 },
          },
          {
            type: 'text',
            text: `Analyze this meal photo and identify all food items with their estimated protein content.
Focus on Korean foods if present (된장찌개, 삼겹살, 닭가슴살, 두부, 계란, 불고기, etc.).

Return JSON only in this format:
{
  "food_items": [
    {"name": "food name in Korean if Korean food", "name_en": "English name", "protein_g": number, "confidence": "high"|"medium"|"low", "portion": "description"}
  ],
  "total_protein_g": number,
  "notes": "any relevant notes about the meal"
}

Use standard Korean serving sizes. If confidence is low, use conservative estimates.`,
          },
        ],
      },
    ],
  })

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    const parsed = JSON.parse(jsonMatch[0])
    return NextResponse.json(parsed)
  } catch {
    // Fallback: return conservative estimate
    return NextResponse.json({
      food_items: [{ name: '음식', name_en: 'Food', protein_g: 10, confidence: 'low', portion: '1인분' }],
      total_protein_g: 10,
      notes: 'Could not fully analyze image. Using conservative estimate.',
    })
  }
}
