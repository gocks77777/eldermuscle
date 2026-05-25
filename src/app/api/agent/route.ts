import { NextResponse } from 'next/server'
import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from '@google/generative-ai'
import { analyzeSarcopenia } from '@/lib/sarcopenia'
import { getDb, hasMongo } from '@/lib/mongodb'

export const maxDuration = 60

const tools: { functionDeclarations: FunctionDeclaration[] }[] = [
  {
    functionDeclarations: [
      {
        name: 'analyze_inbody',
        description: 'Analyze InBody scan data to calculate SMI and daily protein target based on AWGS 2019 guidelines',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            age: { type: SchemaType.NUMBER, description: 'Age in years' },
            gender: { type: SchemaType.STRING, description: 'male or female' },
            weight: { type: SchemaType.NUMBER, description: 'Weight in kg' },
            height: { type: SchemaType.NUMBER, description: 'Height in cm' },
            skeletalMuscleMass: { type: SchemaType.NUMBER, description: 'Skeletal muscle mass in kg' },
          },
          required: ['age', 'gender', 'weight', 'height', 'skeletalMuscleMass'],
        },
      },
      {
        name: 'calculate_daily_progress',
        description: "Get today's protein intake progress",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            userId: { type: SchemaType.STRING, description: 'User ID' },
            date: { type: SchemaType.STRING, description: 'Date in YYYY-MM-DD format' },
            dailyTarget: { type: SchemaType.NUMBER, description: 'Daily protein target in grams' },
          },
          required: ['userId', 'date'],
        },
      },
    ],
  },
]

async function callTool(name: string, args: Record<string, unknown>) {
  if (name === 'analyze_inbody') {
    return analyzeSarcopenia(args as unknown as Parameters<typeof analyzeSarcopenia>[0])
  }
  if (name === 'calculate_daily_progress') {
    const { userId, date, dailyTarget } = args as { userId: string; date: string; dailyTarget?: number }
    if (hasMongo) {
      const db = await getDb()
      const start = new Date(`${date}T00:00:00.000Z`)
      const end = new Date(`${date}T23:59:59.999Z`)
      const logs = await db.collection('meal_logs')
        .find({ userId, loggedAt: { $gte: start, $lte: end } })
        .toArray()
      const profile = await db.collection('profiles').findOne({ userId })
      const consumed = logs.reduce((s, l) => s + Number(l.totalProteinG), 0)
      const target = profile?.dailyProteinTarget ?? dailyTarget ?? 60
      return { consumed: Math.round(consumed * 10) / 10, target, percentage: Math.round((consumed / target) * 100), meals: logs }
    }
    return { consumed: 0, target: dailyTarget ?? 60, percentage: 0, meals: [] }
  }
  return null
}

export async function POST(req: Request) {
  const { messages } = await req.json()

  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY.includes('your_google')) {
    return NextResponse.json({ error: 'Google API key not configured' }, { status: 503 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      tools,
      systemInstruction: `You are ElderMuscle, a friendly AI nutrition agent helping elderly users fight sarcopenia.
Keep responses warm, encouraging, and easy to understand.
Focus on protein intake, muscle health, and AWGS 2019 clinical guidelines.
When analyzing InBody data, always use the analyze_inbody tool.`,
    })

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))
    const lastMessage = messages[messages.length - 1]

    const chat = model.startChat({ history })
    let result = await chat.sendMessage(lastMessage.content)

    // Handle function calls
    let response = result.response
    while (response.functionCalls()?.length) {
      const calls = response.functionCalls()!
      const toolResults = await Promise.all(
        calls.map(async (call) => ({
          functionResponse: {
            name: call.name,
            response: { result: await callTool(call.name, call.args as Record<string, unknown>) },
          },
        }))
      )
      result = await chat.sendMessage(toolResults)
      response = result.response
    }

    const text = response.text()

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('Gemini agent error:', err)
    return NextResponse.json({ error: 'Agent error' }, { status: 500 })
  }
}
