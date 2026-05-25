'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'

interface FoodItem {
  name: string
  name_en: string
  protein_g: number
  confidence: 'high' | 'medium' | 'low'
  portion: string
}

interface AnalysisResult {
  food_items: FoodItem[]
  total_protein_g: number
  notes: string
}

interface MealPhotoUploadProps {
  onMealLogged: (protein: number) => void
}

function saveToLocalStorage(result: AnalysisResult) {
  const today = new Date().toISOString().split('T')[0]
  const key = `eldermuscle_meals_${today}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({ ...result, logged_at: new Date().toISOString() })
  localStorage.setItem(key, JSON.stringify(existing))
}

export default function MealPhotoUpload({ onMealLogged }: MealPhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setDone(false)
    analyzePhoto(file)
  }

  async function analyzePhoto(file: File) {
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/analyze-meal', { method: 'POST', body: formData })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({
        food_items: [{ name: 'Food', name_en: 'Food', protein_g: 10, confidence: 'low', portion: '1 serving' }],
        total_protein_g: 10,
        notes: 'Analysis failed. Using conservative estimate.',
      })
    } finally {
      setAnalyzing(false)
    }
  }

  async function saveMeal() {
    if (!result) return
    setSaving(true)
    try {
      await fetch('/api/log-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mealType: 'meal',
          foodItems: result.food_items,
          totalProteinG: result.total_protein_g,
          notes: result.notes,
        }),
      })
    } catch { /* ignore */ }
    saveToLocalStorage(result)
    onMealLogged(result.total_protein_g)
    setDone(true)
    setSaving(false)
  }

  const confidenceBadge = (c: string) => ({
    high: { label: 'Accurate', cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    medium: { label: 'Estimated', cls: 'bg-amber-50 text-amber-700 border border-amber-200' },
    low: { label: 'Uncertain', cls: 'bg-slate-100 text-slate-500 border border-slate-200' },
  }[c] ?? { label: 'Estimated', cls: 'bg-slate-100 text-slate-500' })

  if (done) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gray-900">Saved</p>
        <p className="text-lg text-gray-500 mt-1"><span className="font-bold text-emerald-600">{result?.total_protein_g}g</span> protein added</p>
        <button
          className="mt-6 text-base text-gray-500 underline underline-offset-4"
          onClick={() => { setPreview(null); setResult(null); setDone(false) }}
        >
          Add another meal
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />

      {!preview && (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-2 bg-gray-50 hover:bg-gray-100 active:scale-[0.99] transition-all"
        >
          <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-1">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <span className="text-xl font-semibold text-gray-700">Take Meal Photo</span>
          <span className="text-base text-gray-400">Or choose from gallery</span>
        </button>
      )}

      {preview && (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-gray-100" style={{ aspectRatio: '4/3' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Meal" className="w-full h-full object-cover" />
            {analyzing && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" style={{ borderWidth: 3 }} />
                <p className="text-white text-lg font-medium">Analyzing your meal</p>
                <p className="text-white/60 text-sm">Calculating protein content...</p>
              </div>
            )}
          </div>

          {result && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-700">Analysis</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-emerald-600">{result.total_protein_g}</span>
                  <span className="text-base text-gray-400">g protein</span>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {result.food_items.map((item, i) => {
                  const badge = confidenceBadge(item.confidence)
                  return (
                    <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-400 mt-0.5">{item.portion}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
                        <span className="text-base font-bold text-gray-800 w-12 text-right">{item.protein_g}g</span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {result.notes && (
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                  <p className="text-sm text-gray-400 leading-relaxed">{result.notes}</p>
                </div>
              )}

              <div className="px-5 py-4 border-t border-gray-100 flex gap-2">
                <Button
                  className="flex-1 h-12 text-base bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                  onClick={saveMeal}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Meal'}
                </Button>
                <button
                  className="px-4 h-12 text-base text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50"
                  onClick={() => fileRef.current?.click()}
                >
                  Retake
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
