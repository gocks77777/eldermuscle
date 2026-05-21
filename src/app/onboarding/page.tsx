'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeSarcopenia, getStageLabelKo, getStageColor } from '@/lib/sarcopenia'

type Step = 'form' | 'result'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof analyzeSarcopenia> | null>(null)

  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: 'female' as 'male' | 'female',
    weight: '',
    height: '',
    skeletalMuscleMass: '',
    caregiverEmail: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const inBodyData = {
      age: Number(form.age),
      gender: form.gender,
      weight: Number(form.weight),
      height: Number(form.height),
      skeletalMuscleMass: Number(form.skeletalMuscleMass),
    }

    const res = analyzeSarcopenia(inBodyData)
    setResult(res)

    // Save to localStorage for demo (will use Supabase when auth is set up)
    localStorage.setItem('eldermuscle_profile', JSON.stringify({
      ...form,
      ...inBodyData,
      smi: res.smi,
      sarcopeniaStage: res.stage,
      dailyProteinTarget: res.dailyProteinTarget,
    }))

    setLoading(false)
    setStep('result')
  }

  if (step === 'result' && result) {
    const stageColor = getStageColor(result.stage)
    const stageLabel = getStageLabelKo(result.stage)
    const stageDesc = result.stage === 'sarcopenia'
      ? '근감소증이 있으시네요. 지금 바로 단백질 섭취를 늘려야 합니다!'
      : result.stage === 'at-risk'
      ? '근감소증 위험군입니다. 지금부터 관리하면 충분히 좋아질 수 있어요!'
      : '근육 상태가 양호합니다. 꾸준히 유지하세요!'

    return (
      <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">
              {result.stage === 'sarcopenia' ? '⚠️' : result.stage === 'at-risk' ? '🟡' : '✅'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">분석 결과</h1>
          </div>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {form.name}님의 근육 상태
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-xl text-gray-600">SMI (근육 지수)</span>
                <span className="text-2xl font-bold">{result.smi} kg/m²</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-xl text-gray-600">진단</span>
                <span className={`text-2xl font-bold ${stageColor}`}>{stageLabel}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b">
                <span className="text-xl text-gray-600">권장 단백질</span>
                <span className="text-2xl font-bold text-green-700">{result.dailyProteinTarget}g/일</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-xl text-gray-600">체중 1kg당</span>
                <span className="text-xl font-semibold">{result.proteinPerKg}g</span>
              </div>
            </CardContent>
          </Card>

          <div className={`p-5 rounded-2xl ${result.stage === 'sarcopenia' ? 'bg-red-50' : result.stage === 'at-risk' ? 'bg-orange-50' : 'bg-green-50'}`}>
            <p className="text-xl text-gray-800">{stageDesc}</p>
          </div>

          <Button
            size="lg"
            className="w-full text-xl py-6 bg-green-600 hover:bg-green-700 rounded-2xl"
            onClick={() => router.push('/dashboard')}
          >
            식단 관리 시작하기 →
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 py-10">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">InBody 정보 입력</h1>
          <p className="text-xl text-gray-600">InBody 검사 결과지를 보고 입력해 주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xl font-semibold">이름</Label>
            <Input
              id="name"
              name="name"
              placeholder="홍길동"
              value={form.name}
              onChange={handleChange}
              required
              className="text-xl py-4 h-14 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xl font-semibold">나이</Label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="70"
                value={form.age}
                onChange={handleChange}
                required
                min={50}
                max={100}
                className="text-xl py-4 h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="text-xl font-semibold">성별</Label>
              <select
                id="gender"
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full h-14 text-xl border border-input bg-background rounded-xl px-3"
              >
                <option value="female">여성</option>
                <option value="male">남성</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-xl font-semibold">체중 (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                placeholder="60"
                value={form.weight}
                onChange={handleChange}
                required
                step="0.1"
                className="text-xl py-4 h-14 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-xl font-semibold">키 (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                placeholder="160"
                value={form.height}
                onChange={handleChange}
                required
                step="0.1"
                className="text-xl py-4 h-14 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skeletalMuscleMass" className="text-xl font-semibold">
              골격근량 (kg)
              <span className="text-base text-gray-500 ml-2">InBody 검사지에 있어요</span>
            </Label>
            <Input
              id="skeletalMuscleMass"
              name="skeletalMuscleMass"
              type="number"
              placeholder="22.5"
              value={form.skeletalMuscleMass}
              onChange={handleChange}
              required
              step="0.1"
              className="text-xl py-4 h-14 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caregiverEmail" className="text-xl font-semibold">
              보호자 이메일 <span className="text-base text-gray-500">(선택)</span>
            </Label>
            <Input
              id="caregiverEmail"
              name="caregiverEmail"
              type="email"
              placeholder="family@example.com"
              value={form.caregiverEmail}
              onChange={handleChange}
              className="text-xl py-4 h-14 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full text-xl py-6 bg-green-600 hover:bg-green-700 rounded-2xl mt-4"
            disabled={loading}
          >
            {loading ? '분석 중...' : '분석하기 →'}
          </Button>
        </form>
      </div>
    </main>
  )
}
