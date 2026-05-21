import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getStageLabelEn } from '@/lib/sarcopenia'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const { profile, weekData } = await req.json()

  if (!profile?.caregiverEmail) {
    return NextResponse.json({ error: 'No caregiver email' }, { status: 400 })
  }

  const avgPct = Math.round(
    weekData.reduce((s: number, d: { percentage: number }) => s + d.percentage, 0) / weekData.length
  )
  const daysGoalMet = weekData.filter((d: { percentage: number }) => d.percentage >= 100).length

  const tableRows = weekData.map((d: { date: string; consumed: number; target: number; percentage: number }) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${d.date}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${d.consumed}g / ${d.target}g</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${d.percentage >= 100 ? '#16a34a' : d.percentage >= 60 ? '#d97706' : '#dc2626'}">${d.percentage}%</td>
    </tr>
  `).join('')

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h1 style="color:#16a34a;font-size:28px">💪 ElderMuscle Weekly Report</h1>
      <h2 style="color:#1f2937">${profile.name} (${getStageLabelEn(profile.sarcopeniaStage)})</h2>

      <div style="background:#f0fdf4;border-radius:12px;padding:20px;margin:20px 0">
        <p style="font-size:18px;margin:0"><strong>Weekly Average:</strong> ${avgPct}%</p>
        <p style="font-size:18px;margin:8px 0 0"><strong>Days Goal Met:</strong> ${daysGoalMet} / 7</p>
        <p style="font-size:18px;margin:8px 0 0"><strong>Daily Protein Target:</strong> ${profile.dailyProteinTarget}g</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:16px">
        <thead>
          <tr style="background:#f3f4f6">
            <th style="padding:10px 12px;text-align:left">Date</th>
            <th style="padding:10px 12px;text-align:left">Protein</th>
            <th style="padding:10px 12px;text-align:left">Achievement</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>

      <div style="margin-top:24px;padding:16px;background:#fef3c7;border-radius:12px;font-size:16px">
        <strong>Note:</strong> Based on AWGS 2019 guidelines. SMI: ${profile.smi} kg/m²
        (${getStageLabelEn(profile.sarcopeniaStage)})
      </div>

      <p style="color:#6b7280;font-size:14px;margin-top:24px">
        Sent by ElderMuscle — AI Nutrition Agent for Sarcopenia Prevention
      </p>
    </div>
  `

  const { error } = await resend.emails.send({
    from: 'ElderMuscle <noreply@eldermuscle.app>',
    to: profile.caregiverEmail,
    subject: `[ElderMuscle] ${profile.name}님의 주간 단백질 리포트`,
    html,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
