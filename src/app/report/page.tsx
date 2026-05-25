'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import { getStageLabelKo } from '@/lib/sarcopenia'

interface DayData {
  date: string
  consumed: number
  target: number
  percentage: number
}

interface Profile {
  name: string
  dailyProteinTarget: number
  sarcopeniaStage: 'sarcopenia' | 'at-risk' | 'normal'
  smi: number
  weight: number
  caregiverEmail?: string
}

export default function ReportPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [weekData, setWeekData] = useState<DayData[]>([])
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('eldermuscle_profile')
    if (stored) setProfile(JSON.parse(stored))

    const days: DayData[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const key = `eldermuscle_meals_${dateStr}`
      const meals = JSON.parse(localStorage.getItem(key) || '[]')
      const consumed = meals.reduce((sum: number, m: { total_protein_g: number }) => sum + Number(m.total_protein_g), 0)
      const target = JSON.parse(localStorage.getItem('eldermuscle_profile') || '{}').dailyProteinTarget ?? 60
      days.push({
        date: dateStr,
        consumed: Math.round(consumed * 10) / 10,
        target,
        percentage: Math.min(Math.round((consumed / target) * 100), 100),
      })
    }
    setWeekData(days)
  }, [])

  const avgPercentage = weekData.length > 0
    ? Math.round(weekData.reduce((sum, d) => sum + d.percentage, 0) / weekData.length)
    : 0
  const daysGoalMet = weekData.filter(d => d.percentage >= 100).length

  async function sendReport() {
    if (!profile?.caregiverEmail) {
      alert('Please set a caregiver email first.\nYou can add it in the Profile tab.')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, weekData }),
      })
      if (res.ok) setSent(true)
      else alert('Failed to send. Please try again.')
    } catch {
      alert('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
  }

  const stageConfig = {
    sarcopenia: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    'at-risk': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    normal: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  }

  const feedbackText = avgPercentage >= 80
    ? `Great work this week — ${avgPercentage}% average. Consistent protein intake is protecting your muscle mass.`
    : avgPercentage >= 50
    ? `You averaged ${avgPercentage}% this week. Try adding one protein-rich food to each meal to close the gap.`
    : `Protein intake was low this week (${avgPercentage}% average). Aim for at least 80% of your daily target to prevent muscle loss.`

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Weekly Report</h1>
          <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors">
            Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-4">

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
            <p className="text-sm text-gray-400 mb-1">Avg. Achievement</p>
            <p className="text-3xl font-bold text-gray-900">{avgPercentage}<span className="text-lg font-medium text-gray-400">%</span></p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-5">
            <p className="text-sm text-gray-400 mb-1">Goals Met</p>
            <p className="text-3xl font-bold text-gray-900">{daysGoalMet}<span className="text-lg font-medium text-gray-400"> days</span></p>
          </div>
        </div>

        {/* Profile badge */}
        {profile && (() => {
          const s = stageConfig[profile.sarcopeniaStage]
          return (
            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${s.bg} ${s.border}`}>
              <div className={`w-2 h-2 rounded-full ${s.color.replace('text-', 'bg-')}`} />
              <span className={`text-sm font-semibold ${s.color}`}>{getStageLabelKo(profile.sarcopeniaStage)}</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">Target {profile.dailyProteinTarget}g/day</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">SMI {profile.smi}</span>
            </div>
          )
        })()}

        {/* 7-day chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-bold text-gray-900 mb-4">7-Day Protein Progress</p>
          <div className="space-y-3">
            {weekData.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-16 shrink-0">{formatDate(day.date)}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      day.percentage >= 100 ? 'bg-emerald-500' : day.percentage >= 60 ? 'bg-amber-400' : day.percentage > 0 ? 'bg-red-400' : ''
                    }`}
                    style={{ width: `${day.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-gray-500 w-12 text-right shrink-0">
                  {day.consumed > 0 ? `${day.consumed}g` : '—'}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-4 pt-3 border-t border-gray-50">
            {[
              { color: 'bg-emerald-500', label: 'Goal met' },
              { color: 'bg-amber-400', label: '≥60%' },
              { color: 'bg-red-400', label: 'Low' },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* AI feedback */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900">AI Feedback</p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{feedbackText}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-1">
          {sent ? (
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-semibold text-emerald-800">Report Sent</p>
              <p className="text-sm text-emerald-600 mt-0.5">Emailed to caregiver successfully</p>
            </div>
          ) : (
            <button
              onClick={sendReport}
              disabled={sending}
              className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-base font-semibold rounded-2xl py-4 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              {sending ? 'Sending...' : 'Send Report to Caregiver'}
            </button>
          )}
          <Link
            href="/onboarding"
            className="w-full border border-gray-200 text-gray-600 text-sm font-medium rounded-2xl py-3.5 transition-colors hover:bg-gray-50 flex items-center justify-center"
          >
            Update InBody Data
          </Link>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
