import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const hasGemini = Boolean(
  process.env.GOOGLE_API_KEY && !process.env.GOOGLE_API_KEY.includes('your_google')
)

export async function POST(req: Request) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  const bytes = await imageFile.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = imageFile.type || 'image/jpeg'

  const prompt = `Analyze this meal photo and estimate its protein content.
Identify all food items visible, using standard serving sizes.
Return ONLY valid JSON (no other text):
{"food_items":[{"name":"Food name","name_en":"English name","protein_g":number,"confidence":"high|medium|low","portion":"serving description"}],"total_protein_g":number,"notes":"brief analysis note"}`

  if (!hasGemini) {
    return NextResponse.json({
      food_items: [{ name: 'Food', name_en: 'Food', protein_g: 10, confidence: 'low' as const, portion: '1 serving' }],
      total_protein_g: 10,
      notes: 'Demo mode: Google API key not configured. Conservative estimate used.',
    })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType } },
    ])

    const text = result.response.text()
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in Gemini response')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    console.error('Gemini Vision error:', err)
    return NextResponse.json({
      food_items: [{ name: 'Food', name_en: 'Food', protein_g: 10, confidence: 'low' as const, portion: '1 serving' }],
      total_protein_g: 10,
      notes: 'Analysis failed. Conservative estimate used.',
    })
  }
}
