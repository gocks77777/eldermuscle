'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import MealPhotoUpload from '@/components/MealPhotoUpload'
import { getStageLabelKo, getStageColor } from '@/lib/sarcopenia'

interface Profile {
  name: string
  dailyProteinTarget: number
  sarcopeniaStage: 'sarcopenia' | 'at-risk' | 'normal'
  smi: number
  weight: number
}

interface MealLog {
  total_protein_g: number
  food_items: Array<{ name: string; protein_g: number }>
  logged_at: string
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [meals, setMeals] = useState<MealLog[]>([])
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('eldermuscle_profile')
    if (stored) setProfile(JSON.parse(stored))

    loadTodayMeals()
  }, [])

  function loadTodayMeals() {
    const today = new Date().toISOString().split('T')[0]
    const key = `eldermuscle_meals_${today}`
    const stored = localStorage.getItem(key)
    if (stored) setMeals(JSON.parse(stored))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleMealLogged(_protein: number) {
    setShowUpload(false)
    loadTodayMeals()
  }

  const consumed = meals.reduce((sum, m) => sum + Number(m.total_protein_g), 0)
  const target = profile?.dailyProteinTarget ?? 60
  const percentage = Math.min(Math.round((consumed / target) * 100), 100)
  const remaining = Math.max(target - consumed, 0)

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '좋은 저녁이에요'

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white px-6 py-5">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <p className="text-lg opacity-80">{greeting}! 👋</p>
            <h1 className="text-2xl font-bold">{profile?.name ?? '사용자'}님</h1>
          </div>
          <Link href="/report">
            <Button variant="secondary" className="text-base rounded-xl">리포트</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-6 space-y-6">
        {/* Protein Progress */}
        <Card className="border-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">오늘 단백질 섭취</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-5xl font-bold text-green-600">{Math.round(consumed * 10) / 10}</span>
                <span className="text-2xl text-gray-500">g</span>
              </div>
              <div className="text-right">
                <p className="text-lg text-gray-500">목표</p>
                <p className="text-3xl font-bold text-gray-700">{target}g</p>
              </div>
            </div>

            <div className="space-y-2">
              <Progress value={percentage} className="h-6 rounded-full" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-gray-700">{percentage}% 달성</span>
                {remaining > 0 ? (
                  <span className="text-orange-600 font-semibold">{Math.round(remaining * 10) / 10}g 더 필요</span>
                ) : (
                  <span className="text-green-600 font-semibold">목표 달성! 🎉</span>
                )}
              </div>
            </div>

            {profile && (
              <div className={`text-sm px-3 py-2 rounded-lg ${getStageColor(profile.sarcopeniaStage)} bg-gray-100`}>
                {getStageLabelKo(profile.sarcopeniaStage)} · SMI {profile.smi} kg/m²
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nudge message */}
        {percentage < 60 && meals.length > 0 && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5">
            <p className="text-xl font-semibold text-orange-800">
              💪 단백질이 아직 부족해요!
            </p>
            <p className="text-lg text-orange-700 mt-1">
              두부 1모(300g)에 단백질 약 24g이 들어있어요.
            </p>
          </div>
        )}

        {/* Meal Log */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">오늘의 식사 기록</h2>

          {meals.length === 0 && !showUpload && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-xl">아직 기록된 식사가 없어요</p>
              <p className="text-lg mt-1">첫 번째 식사를 기록해 보세요!</p>
            </div>
          )}

          <div className="space-y-3">
            {meals.map((meal, i) => {
              const time = new Date(meal.logged_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
              const foodNames = meal.food_items?.slice(0, 3).map(f => f.name).join(', ') || '식사'
              return (
                <Card key={i} className="border">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold">{foodNames}</p>
                        <p className="text-base text-gray-500">{time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">+{meal.total_protein_g}g</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {showUpload ? (
            <div className="mt-4">
              <MealPhotoUpload onMealLogged={handleMealLogged} />
              <Button
                variant="ghost"
                className="w-full mt-3 text-lg text-gray-500"
                onClick={() => setShowUpload(false)}
              >
                취소
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full text-xl py-6 mt-4 bg-green-600 hover:bg-green-700 rounded-2xl"
              onClick={() => setShowUpload(true)}
            >
              📸 식사 사진 기록하기
            </Button>
          )}
        </div>

        {/* Quick tips */}
        {percentage < 50 && (
          <Card className="bg-blue-50 border-blue-200 border-2">
            <CardContent className="pt-5">
              <h3 className="text-xl font-bold text-blue-900 mb-3">💡 단백질 풍부한 음식</h3>
              <ul className="space-y-2 text-lg text-blue-800">
                {[
                  '계란 2개 → 13g',
                  '닭가슴살 100g → 31g',
                  '두부 150g → 12g',
                  '된장찌개 1그릇 → 12g',
                  '삼겹살 100g → 28g',
                ].map((tip) => (
                  <li key={tip} className="flex items-center gap-2">
                    <span>•</span> {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
