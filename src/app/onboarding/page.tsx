'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import BottomNav from '@/components/BottomNav'
import { analyzeSarcopenia, getStageLabelKo } from '@/lib/sarcopenia'

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
    localStorage.setItem('eldermuscle_profile', JSON.stringify({
      ...form, ...inBodyData,
      smi: res.smi,
      sarcopeniaStage: res.stage,
      dailyProteinTarget: res.dailyProteinTarget,
    }))
    setLoading(false)
    setStep('result')
  }

  if (step === 'result' && result) {
    const cfg = {
      sarcopenia: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', msg: 'Immediate action recommended. Include a protein-rich food in every meal to slow muscle loss.' },
      'at-risk': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', msg: 'You\'re in the at-risk zone, but consistent protein intake can reverse this. Let\'s track it together.' },
      normal: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', msg: 'Your muscle mass is healthy. Keep up the good work with daily protein goals.' },
    }[result.stage]

    return (
      <main className="min-h-screen bg-gray-50 px-5 py-8 pb-28">
        <div className="max-w-md mx-auto space-y-5">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Your Results</h1>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-50">
              <p className="text-sm text-gray-400">Diagnosis</p>
              <p className={`text-2xl font-bold mt-1 ${cfg.color}`}>{getStageLabelKo(result.stage)}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {[
                { label: 'SMI (Skeletal Muscle Index)', value: `${result.smi} kg/m²` },
                { label: 'Daily Protein Target', value: `${result.dailyProteinTarget}g`, highlight: true },
                { label: 'Per kg of body weight', value: `${result.proteinPerKg}g/kg` },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="px-6 py-4 flex justify-between items-center">
                  <span className="text-base text-gray-500">{label}</span>
                  <span className={`text-lg font-bold ${highlight ? cfg.color : 'text-gray-900'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-2xl px-5 py-4 border ${cfg.bg} ${cfg.border}`}>
            <p className="text-base text-gray-700 leading-relaxed">{cfg.msg}</p>
          </div>

          <button
            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-lg font-semibold rounded-2xl py-4 transition-colors"
            onClick={() => router.push('/dashboard')}
          >
            Start Tracking →
          </button>
        </div>
        <BottomNav />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-8 pb-28">
      <div className="max-w-md mx-auto">
        <div className="mb-8">
          <button onClick={() => router.push('/')} className="text-sm text-gray-400 mb-4 flex items-center gap-1">
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">InBody Data Entry</h1>
          <p className="text-base text-gray-500 mt-1">Enter values from your InBody scan report</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Basic Info</p>

            <div>
              <Label htmlFor="name" className="text-base font-medium text-gray-700 mb-1.5 block">Name</Label>
              <Input id="name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required className="h-12 text-base rounded-xl border-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age" className="text-base font-medium text-gray-700 mb-1.5 block">Age</Label>
                <Input id="age" name="age" type="number" placeholder="70" value={form.age} onChange={handleChange} required min={50} max={100} className="h-12 text-base rounded-xl border-gray-200" />
              </div>
              <div>
                <Label htmlFor="gender" className="text-base font-medium text-gray-700 mb-1.5 block">Sex</Label>
                <select
                  id="gender" name="gender" value={form.gender} onChange={handleChange}
                  className="w-full h-12 text-base border border-gray-200 bg-white rounded-xl px-3 text-gray-900"
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="weight" className="text-base font-medium text-gray-700 mb-1.5 block">Weight (kg)</Label>
                <Input id="weight" name="weight" type="number" placeholder="60" step="0.1" value={form.weight} onChange={handleChange} required className="h-12 text-base rounded-xl border-gray-200" />
              </div>
              <div>
                <Label htmlFor="height" className="text-base font-medium text-gray-700 mb-1.5 block">Height (cm)</Label>
                <Input id="height" name="height" type="number" placeholder="160" step="0.1" value={form.height} onChange={handleChange} required className="h-12 text-base rounded-xl border-gray-200" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">InBody Values</p>

            <div>
              <Label htmlFor="skeletalMuscleMass" className="text-base font-medium text-gray-700 mb-1.5 block">
                Skeletal Muscle Mass (kg)
              </Label>
              <Input
                id="skeletalMuscleMass" name="skeletalMuscleMass" type="number"
                placeholder="22.5" step="0.1"
                value={form.skeletalMuscleMass} onChange={handleChange} required
                className="h-12 text-base rounded-xl border-gray-200"
              />
              <p className="text-sm text-gray-400 mt-1.5">Found under &quot;Skeletal Muscle Mass&quot; on your InBody report</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caregiver (Optional)</p>
            <div>
              <Label htmlFor="caregiverEmail" className="text-base font-medium text-gray-700 mb-1.5 block">Caregiver Email</Label>
              <Input id="caregiverEmail" name="caregiverEmail" type="email" placeholder="family@example.com" value={form.caregiverEmail} onChange={handleChange} className="h-12 text-base rounded-xl border-gray-200" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-lg font-semibold rounded-2xl py-4 transition-colors"
          >
            {loading ? 'Analyzing...' : 'Analyze'}
          </button>
        </form>
      </div>
      <BottomNav />
    </main>
  )
}
