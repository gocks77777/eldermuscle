import { NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

const execFileAsync = promisify(execFile)

export async function POST(req: Request) {
  const formData = await req.formData()
  const imageFile = formData.get('image') as File

  if (!imageFile) {
    return NextResponse.json({ error: 'No image provided' }, { status: 400 })
  }

  // Save uploaded image to temp file
  const bytes = await imageFile.arrayBuffer()
  const ext = imageFile.type.includes('png') ? 'png' : imageFile.type.includes('webp') ? 'webp' : 'jpg'
  const tmpPath = join(tmpdir(), `meal_${Date.now()}.${ext}`)
  await writeFile(tmpPath, Buffer.from(bytes))

  const prompt = `이미지 파일 ${tmpPath} 를 Read 툴로 읽고, 어떤 음식인지 파악해서 단백질 함량을 추정해줘.
한식(된장찌개, 삼겹살, 닭가슴살, 두부, 계란, 불고기 등)이 있으면 한국 표준 1인분 기준으로 계산해줘.
JSON 형식으로만 답해줘 (다른 텍스트 없이):
{"food_items":[{"name":"음식명(한국어)","name_en":"English name","protein_g":숫자,"confidence":"high|medium|low","portion":"분량 설명"}],"total_protein_g":숫자,"notes":"분석 메모"}`

  try {
    const { stdout } = await execFileAsync('claude', [
      '-p', prompt,
      '--allowedTools', 'Read',
      '--add-dir', tmpdir(),
      '--output-format', 'text',
    ], { timeout: 60000 })

    await unlink(tmpPath).catch(() => {})

    const jsonMatch = stdout.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (err) {
    await unlink(tmpPath).catch(() => {})
    console.error('Claude CLI error:', err)
    return NextResponse.json({
      food_items: [{ name: '음식', name_en: 'Food', protein_g: 10, confidence: 'low', portion: '1인분' }],
      total_protein_g: 10,
      notes: '분석에 실패했습니다. 보수적으로 10g으로 기록됩니다.',
    })
  }
}
