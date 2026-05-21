import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="text-7xl mb-6">💪</div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
          ElderMuscle
        </h1>
        <p className="text-2xl text-green-700 font-semibold mb-4">
          근감소증을 이기는 AI 영양 관리
        </p>
        <p className="text-xl text-gray-600 mb-3 max-w-md">
          근감소증(Sarcopenia)은 노화로 인해 근육이 줄어드는 질환입니다.
        </p>
        <p className="text-xl text-gray-700 font-medium mb-10 max-w-md">
          매일 단백질을 충분히 드시면 근육을 지킬 수 있습니다.
        </p>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/onboarding">
            <Button size="lg" className="w-full text-xl py-6 bg-green-600 hover:bg-green-700 rounded-2xl">
              시작하기 →
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="w-full text-xl py-6 rounded-2xl border-2">
              오늘의 식단 보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-lg mx-auto space-y-6">
          {[
            { icon: '🏥', title: 'InBody 분석', desc: '근감소증 단계를 정확히 진단해 일일 단백질 목표를 설정합니다.' },
            { icon: '📸', title: '식사 사진 분석', desc: 'AI가 사진을 보고 단백질 함량을 자동으로 계산합니다.' },
            { icon: '📊', title: '실시간 추적', desc: '하루 단백질 섭취량을 한눈에 확인합니다.' },
            { icon: '👨‍👩‍👧', title: '보호자 리포트', desc: '주간 건강 보고서를 가족에게 자동으로 전송합니다.' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4 p-5 bg-green-50 rounded-2xl">
              <span className="text-4xl">{f.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{f.title}</h3>
                <p className="text-lg text-gray-600 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-10 bg-gray-50 text-center">
        <p className="text-base text-gray-500">
          AWGS 2019 (아시아 근감소증 진단 기준) 기반 · Claude AI 탑재
        </p>
      </section>
    </main>
  )
}
