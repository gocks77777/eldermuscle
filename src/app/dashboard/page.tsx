'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MealPhotoUpload from '@/components/MealPhotoUpload'
import BottomNav from '@/components/BottomNav'
import { getStageLabelKo } from '@/lib/sarcopenia'

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

  const stageConfig = {
    sarcopenia: { label: 'Sarcopenia', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
    'at-risk': { label: 'At-Risk', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    normal: { label: 'Normal', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  }
  const stage = profile?.sarcopeniaStage ? stageConfig[profile.sarcopeniaStage] : stageConfig.normal

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 11 ? 'Good morning' : hour < 17 ? 'Hello' : 'Good evening'
  const todayStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'short' })

  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-5 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">{todayStr}</p>
            <h1 className="text-lg font-bold text-gray-900">{greeting}, {profile?.name ?? 'there'}</h1>
          </div>
          <Link href="/report" className="text-sm font-medium text-gray-500 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg">
            Weekly Report
          </Link>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-5">

        {/* Protein card with ring */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <svg width="128" height="128" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="64" cy="64" r={radius} fill="none"
                  stroke={percentage >= 100 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 64 64)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
                <span className="text-xs text-gray-400">achieved</span>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Protein today</p>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-bold text-gray-900">{Math.round(consumed * 10) / 10}</span>
                <span className="text-lg text-gray-400">/ {target}g</span>
              </div>

              {remaining > 0 ? (
                <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                  <span className="text-sm text-gray-600 font-medium">{Math.round(remaining * 10) / 10}g remaining</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span className="text-sm text-emerald-700 font-medium">Goal reached!</span>
                </div>
              )}
            </div>
          </div>

          {profile && (
            <div className={`mt-4 flex items-center gap-2 px-3 py-2 rounded-xl ${stage.bg} border ${stage.border}`}>
              <span className={`text-sm font-semibold ${stage.color}`}>{getStageLabelKo(profile.sarcopeniaStage)}</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">SMI {profile.smi} kg/m²</span>
              <span className="text-sm text-gray-400">·</span>
              <span className="text-sm text-gray-500">Target {target}g/day</span>
            </div>
          )}
        </div>

        {/* Nudge */}
        {percentage < 50 && meals.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4">
            <p className="text-base font-semibold text-amber-900">Protein intake is low</p>
            <p className="text-sm text-amber-700 mt-1">
              Try adding 2 eggs (+13g) or 150g tofu (+12g) to your next meal.
            </p>
          </div>
        )}

        {/* Meal upload / log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Today&apos;s Meals</h2>
            {meals.length > 0 && !showUpload && (
              <span className="text-sm text-gray-400">{meals.length} logged</span>
            )}
          </div>

          {showUpload ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <MealPhotoUpload onMealLogged={handleMealLogged} />
              <button
                className="w-full mt-3 text-sm text-gray-400 py-2"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              {meals.length === 0 ? (
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-gray-300 transition-colors"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-600">Log your first meal</p>
                  <p className="text-sm text-gray-400">Take a photo to analyze protein</p>
                </button>
              ) : (
                <div className="space-y-2">
                  {meals.map((meal, i) => {
                    const time = new Date(meal.logged_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    const names = meal.food_items?.slice(0, 2).map(f => f.name).join(', ') || 'Meal'
                    const more = (meal.food_items?.length ?? 0) > 2 ? ` +${meal.food_items.length - 2} more` : ''
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center justify-between">
                        <div>
                          <p className="text-base font-medium text-gray-900">{names}{more}</p>
                          <p className="text-sm text-gray-400 mt-0.5">{time}</p>
                        </div>
                        <span className="text-xl font-bold text-emerald-600">+{meal.total_protein_g}g</span>
                      </div>
                    )
                  })}
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white text-base font-medium rounded-2xl py-4 mt-1 transition-colors"
                  >
                    + Add Meal
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Protein tips */}
        {percentage < 40 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">High-Protein Foods</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { food: 'Chicken breast 100g', g: '31g' },
                { food: 'Pork belly 100g', g: '28g' },
                { food: '2 eggs', g: '13g' },
                { food: 'Tofu 150g', g: '12g' },
              ].map(({ food, g }) => (
                <div key={food} className="bg-gray-50 rounded-xl px-3 py-2.5 flex justify-between items-center">
                  <span className="text-sm text-gray-600">{food}</span>
                  <span className="text-sm font-bold text-gray-900">{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
