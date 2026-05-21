'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

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
        food_items: [{ name: '음식', name_en: 'Food', protein_g: 10, confidence: 'low', portion: '1인분' }],
        total_protein_g: 10,
        notes: '분석에 실패했습니다. 보수적으로 10g으로 기록됩니다.',
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
      onMealLogged(result.total_protein_g)
      setDone(true)
    } catch {
      // Save locally for demo
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _profile = JSON.parse(localStorage.getItem('eldermuscle_profile') || '{}')
      const today = new Date().toISOString().split('T')[0]
      const key = `eldermuscle_meals_${today}`
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      existing.push({ ...result, logged_at: new Date().toISOString() })
      localStorage.setItem(key, JSON.stringify(existing))
      onMealLogged(result.total_protein_g)
      setDone(true)
    } finally {
      setSaving(false)
    }
  }

  const confidenceColor = (c: string) =>
    c === 'high' ? 'bg-green-100 text-green-800' : c === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-2xl font-bold text-green-700">기록 완료!</p>
        <p className="text-xl text-gray-600 mt-1">단백질 {result?.total_protein_g}g 추가됨</p>
        <Button
          variant="outline"
          className="mt-5 text-lg py-4 px-6 rounded-xl"
          onClick={() => { setPreview(null); setResult(null); setDone(false) }}
        >
          다른 식사 추가
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview && (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-4 border-dashed border-green-300 rounded-2xl py-12 flex flex-col items-center gap-3 bg-green-50 active:bg-green-100 transition-colors"
        >
          <span className="text-5xl">📸</span>
          <span className="text-2xl font-semibold text-green-700">식사 사진 찍기</span>
          <span className="text-lg text-gray-500">또는 갤러리에서 선택</span>
        </button>
      )}

      {preview && (
        <div className="space-y-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Meal" className="w-full rounded-2xl object-cover max-h-64" />
            {analyzing && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-4xl mb-2">🔍</div>
                  <p className="text-xl font-semibold">분석 중...</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <Card className="border-2 border-green-200">
              <CardContent className="pt-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">총 단백질</span>
                  <span className="text-3xl font-bold text-green-600">{result.total_protein_g}g</span>
                </div>
                <div className="divide-y">
                  {result.food_items.map((item, i) => (
                    <div key={i} className="py-3 flex justify-between items-start">
                      <div>
                        <p className="text-lg font-semibold">{item.name}</p>
                        <p className="text-base text-gray-500">{item.portion}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{item.protein_g}g</p>
                        <span className={`text-sm px-2 py-0.5 rounded-full ${confidenceColor(item.confidence)}`}>
                          {item.confidence === 'high' ? '확실' : item.confidence === 'medium' ? '보통' : '추정'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {result.notes && (
                  <p className="text-base text-gray-500 italic">{result.notes}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 text-lg py-5 bg-green-600 hover:bg-green-700 rounded-xl"
                    onClick={saveMeal}
                    disabled={saving}
                  >
                    {saving ? '저장 중...' : '기록하기'}
                  </Button>
                  <Button
                    variant="outline"
                    className="text-lg py-5 px-4 rounded-xl"
                    onClick={() => fileRef.current?.click()}
                  >
                    다시 찍기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
