import { NextResponse } from 'next/server'

const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase')

export async function POST(req: Request) {
  const body = await req.json()

  if (hasSupabase) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabase.from('meal_logs').insert({
      user_id: user.id,
      meal_type: body.mealType,
      image_url: body.imageUrl,
      food_items: body.foodItems,
      total_protein_g: body.totalProteinG,
      notes: body.notes,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, log: data })
  }

  // Demo mode: client handles localStorage persistence
  return NextResponse.json({ success: true, demo: true })
}

export async function GET(req: Request) {
  if (!hasSupabase) return NextResponse.json({ logs: [] })

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${date}T00:00:00.000Z`)
    .lte('logged_at', `${date}T23:59:59.999Z`)
    .order('logged_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ logs: data })
}
