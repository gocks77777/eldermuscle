import { NextResponse } from 'next/server'
import { getDb, hasMongo } from '@/lib/mongodb'
import { logToSplunk } from '@/lib/splunk'

export async function POST(req: Request) {
  const body = await req.json()

  await logToSplunk('meal_logged', {
    userId: body.userId ?? 'demo',
    meal_type: body.mealType,
    total_protein_g: body.totalProteinG,
    food_item_count: body.foodItems?.length ?? 0,
    mode: hasMongo ? 'mongo' : 'demo',
    timestamp: new Date().toISOString(),
  })

  if (hasMongo) {
    try {
      const db = await getDb()
      await db.collection('meal_logs').insertOne({
        userId: body.userId ?? 'demo',
        mealType: body.mealType,
        foodItems: body.foodItems,
        totalProteinG: body.totalProteinG,
        notes: body.notes,
        loggedAt: new Date(),
      })
      return NextResponse.json({ success: true })
    } catch (err) {
      console.error('MongoDB log-meal error:', err)
    }
  }

  // Demo mode: client handles localStorage
  return NextResponse.json({ success: true, demo: true })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const userId = searchParams.get('userId') ?? 'demo'

  if (hasMongo) {
    try {
      const db = await getDb()
      const start = new Date(`${date}T00:00:00.000Z`)
      const end = new Date(`${date}T23:59:59.999Z`)
      const logs = await db.collection('meal_logs')
        .find({ userId, loggedAt: { $gte: start, $lte: end } })
        .sort({ loggedAt: 1 })
        .toArray()
      return NextResponse.json({ logs })
    } catch (err) {
      console.error('MongoDB get-meals error:', err)
    }
  }

  return NextResponse.json({ logs: [] })
}
