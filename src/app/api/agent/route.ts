import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { z } from 'zod'
import { analyzeSarcopenia } from '@/lib/sarcopenia'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: anthropic('claude-sonnet-4-6'),
    system: `You are ElderMuscle, a friendly AI nutrition agent helping elderly users fight sarcopenia.
Your responses should be warm, encouraging, and easy to understand.
Always respond in the same language the user uses (Korean or English).
Focus on protein intake and muscle health.`,
    messages,
    tools: {
      analyze_inbody: {
        description: 'Analyze InBody scan data to calculate SMI and daily protein target based on AWGS 2019 guidelines',
        inputSchema: z.object({
          age: z.number().describe('Age in years'),
          gender: z.enum(['male', 'female']),
          weight: z.number().describe('Weight in kg'),
          height: z.number().describe('Height in cm'),
          skeletalMuscleMass: z.number().describe('Skeletal muscle mass in kg'),
        }),
        execute: async (data: { age: number; gender: 'male' | 'female'; weight: number; height: number; skeletalMuscleMass: number }) => {
          return analyzeSarcopenia(data)
        },
      },

      calculate_daily_progress: {
        description: "Get today's protein intake progress for a user",
        inputSchema: z.object({
          userId: z.string(),
          date: z.string().describe('Date in YYYY-MM-DD format'),
        }),
        execute: async ({ userId, date }: { userId: string; date: string }) => {
          const supabase = await createClient()
          const startOfDay = `${date}T00:00:00.000Z`
          const endOfDay = `${date}T23:59:59.999Z`

          const { data: logs } = await supabase
            .from('meal_logs')
            .select('total_protein_g, meal_type, logged_at, food_items')
            .eq('user_id', userId)
            .gte('logged_at', startOfDay)
            .lte('logged_at', endOfDay)

          const { data: profile } = await supabase
            .from('profiles')
            .select('daily_protein_target, name')
            .eq('id', userId)
            .single()

          const consumed = logs?.reduce((sum: number, l: { total_protein_g: number }) => sum + Number(l.total_protein_g), 0) ?? 0
          return {
            consumed: Math.round(consumed * 10) / 10,
            target: profile?.daily_protein_target ?? 0,
            percentage: profile?.daily_protein_target
              ? Math.round((consumed / profile.daily_protein_target) * 100)
              : 0,
            meals: logs ?? [],
            name: profile?.name,
          }
        },
      },
    },
  })

  return result.toTextStreamResponse()
}
