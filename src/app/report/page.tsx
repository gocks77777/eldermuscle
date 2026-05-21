'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getStageLabelKo, getStageColor } from '@/lib/sarcopenia'

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

    // Build 7-day history from localStorage
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
      alert('보호자 이메일을 먼저 설정해 주세요.\n온보딩 페이지에서 입력할 수 있습니다.')
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
      else alert('전송에 실패했습니다. 다시 시도해 주세요.')
    } catch {
      alert('전송에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', weekday: 'short' })
  }

  const barColor = (pct: number) =>
    pct >= 100 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-6 py-5">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">주간 리포트</h1>
          <Link href="/dashboard">
            <Button variant="secondary" className="text-base rounded-xl">← 대시보드</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Summary */}
        <Card className="border-2 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {profile?.name ?? '사용자'}님의 이번 주 요약
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile && (
              <div className={`text-lg px-3 py-2 rounded-lg font-semibold ${getStageColor(profile.sarcopeniaStage)} bg-gray-100`}>
                진단: {getStageLabelKo(profile.sarcopeniaStage)} · 일일 목표 {profile.dailyProteinTarget}g
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-green-600">{avgPercentage}%</p>
                <p className="text-lg text-gray-600 mt-1">평균 달성률</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-4xl font-bold text-blue-600">{daysGoalMet}일</p>
                <p className="text-lg text-gray-600 mt-1">목표 달성일</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 7-day chart */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-xl">7일 단백질 달성 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekData.map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-base text-gray-500 w-20 shrink-0">{formatDate(day.date)}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor(day.percentage)}`}
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                  <span className="text-base font-semibold w-16 text-right shrink-0">
                    {day.consumed}g
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-4 text-base">
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded-full inline-block" /> 목표 달성</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-400 rounded-full inline-block" /> 60% 이상</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-400 rounded-full inline-block" /> 부족</span>
            </div>
          </CardContent>
        </Card>

        {/* AI feedback */}
        <Card className="bg-green-50 border-green-200 border-2">
          <CardContent className="pt-5">
            <h3 className="text-xl font-bold text-green-900 mb-2">🤖 AI 피드백</h3>
            <p className="text-lg text-green-800">
              {avgPercentage >= 80
                ? `훌륭합니다! 이번 주 평균 ${avgPercentage}% 달성했어요. 꾸준한 단백질 섭취가 근육을 지키고 있습니다.`
                : avgPercentage >= 50
                ? `이번 주 평균 ${avgPercentage}% 달성했어요. 조금 더 노력하면 근육을 더 잘 지킬 수 있어요. 매 식사마다 단백질 식품을 하나씩 추가해 보세요!`
                : `이번 주 단백질 섭취가 많이 부족했어요. 근감소증 예방을 위해 매일 목표의 80% 이상은 드셔야 해요. 오늘부터 다시 시작해 봅시다!`}
            </p>
          </CardContent>
        </Card>

        {/* Send to caregiver */}
        <div className="space-y-3">
          {sent ? (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-green-700">✅ 리포트 전송 완료!</p>
              <p className="text-lg text-gray-600 mt-1">보호자에게 이메일로 전송되었습니다.</p>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full text-xl py-6 bg-green-600 hover:bg-green-700 rounded-2xl"
              onClick={sendReport}
              disabled={sending}
            >
              {sending ? '전송 중...' : '📧 보호자에게 리포트 보내기'}
            </Button>
          )}
          <Link href="/onboarding">
            <Button variant="outline" className="w-full text-xl py-5 rounded-2xl border-2">
              InBody 정보 업데이트
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
