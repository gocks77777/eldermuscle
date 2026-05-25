import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">ElderMuscle</span>
        </div>
        <Link href="/onboarding" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Get Started →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          AWGS 2019 Clinical Criteria
        </div>

        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
          Fight Sarcopenia with<br />
          <span className="text-emerald-600">AI Protein Tracking</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-sm leading-relaxed">
          Diagnose your sarcopenia stage from InBody data.<br />
          Track daily protein with a single meal photo.
        </p>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/onboarding"
            className="w-full bg-gray-900 hover:bg-gray-800 text-white text-base font-semibold py-4 rounded-2xl transition-colors text-center"
          >
            Start InBody Analysis
          </Link>
          <Link
            href="/dashboard"
            className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 text-base font-medium py-4 rounded-2xl transition-colors text-center"
          >
            View Today&apos;s Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-4 mt-10 text-xs text-gray-400">
          <span>Powered by Claude AI</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>AWGS 2019</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full" />
          <span>Caregiver Reports</span>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-12">
        <div className="max-w-md mx-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5 text-center">Features</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                title: 'InBody Diagnosis',
                desc: 'Detects sarcopenia stage and sets your daily protein target',
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
                  </svg>
                ),
              },
              {
                title: 'Photo Analysis',
                desc: 'AI estimates protein content from a photo of your meal',
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                  </svg>
                ),
              },
              {
                title: 'Live Tracking',
                desc: 'See your daily protein goal progress at a glance',
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  </svg>
                ),
              },
              {
                title: 'Caregiver Report',
                desc: 'Weekly health summary emailed to your family automatically',
                icon: (
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="w-9 h-9 bg-white border border-gray-100 rounded-xl flex items-center justify-center shadow-sm">
                  {f.icon}
                </div>
                <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400">
          ElderMuscle · AWGS 2019 · Powered by Claude AI
        </p>
      </footer>
    </main>
  )
}
