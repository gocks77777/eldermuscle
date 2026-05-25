import { NextResponse } from 'next/server'
import { getDb, hasMongo } from '@/lib/mongodb'
import { analyzeSarcopenia, InBodyData } from '@/lib/sarcopenia'

export async function POST(req: Request) {
  const body: InBodyData & { name: string; caregiverEmail?: string; userId?: string } = await req.json()
  const result = analyzeSarcopenia(body)

  if (hasMongo) {
    try {
      const db = await getDb()
      await db.collection('profiles').updateOne(
        { userId: body.userId ?? 'demo' },
        {
          $set: {
            userId: body.userId ?? 'demo',
            name: body.name,
            age: body.age,
            gender: body.gender,
            weight: body.weight,
            height: body.height,
            skeletalMuscleMass: body.skeletalMuscleMass,
            smi: result.smi,
            sarcopeniaStage: result.stage,
            dailyProteinTarget: result.dailyProteinTarget,
            caregiverEmail: body.caregiverEmail,
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      )
    } catch (err) {
      console.error('MongoDB save-profile error:', err)
    }
  }

  return NextResponse.json({ success: true, result })
}
