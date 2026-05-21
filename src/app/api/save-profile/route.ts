import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeSarcopenia, InBodyData } from '@/lib/sarcopenia'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body: InBodyData & { name: string; caregiverEmail?: string } = await req.json()
  const result = analyzeSarcopenia(body)

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: body.name,
    age: body.age,
    gender: body.gender,
    weight: body.weight,
    height: body.height,
    skeletal_muscle_mass: body.skeletalMuscleMass,
    smi: result.smi,
    sarcopenia_stage: result.stage,
    daily_protein_target: result.dailyProteinTarget,
    caregiver_email: body.caregiverEmail,
    updated_at: new Date().toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, result })
}
