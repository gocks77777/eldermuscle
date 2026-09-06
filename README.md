# ElderMuscle — 노인 근감소증 예방 단백질 관리 앱

인바디 수치로 근감소증 단계를 판정하고, 식사 사진으로 단백질 섭취를 추적하는 앱입니다. Google Gemini 기반. 해커톤 출품작(Google Cloud · Splunk Observability 트랙).

## 만든 것

- 인바디 입력(나이·성별·체중·신장·골격근량) → SMI 계산 → AWGS 2019 기준으로 정상 / 위험 / 근감소증 판정
- 식사 사진 업로드 → Gemini 1.5 Flash가 음식 식별 → 단백질 추정
- 체중 기반 일일 단백질 목표와 진행률 대시보드
- 영양 상담 에이전트: Gemini 1.5 Pro function calling으로 인바디 분석 함수를 호출
- 주간 리포트 이메일 (Resend)
- Splunk HEC로 운영 이벤트 전송 (식사 분석, 프로필 저장, 에이전트 호출)
- 데모 모드: API 키 없이도 mock 데이터로 전체 흐름이 돕니다

## 구조

```
src/app/
  page.tsx · onboarding/ · dashboard/ · report/
  api/  analyze-meal · agent · log-meal · save-profile · send-report
src/lib/   sarcopenia(판정 로직) · mongodb · splunk
src/components/  MealPhotoUpload · BottomNav
Dockerfile       Cloud Run 배포용
```

Next.js 15 App Router, Tailwind, Gemini 1.5 Flash/Pro, MongoDB Atlas, Resend.

## 실행

```bash
npm install
cp .env.example .env.local   # GOOGLE_API_KEY, MONGODB_URI, RESEND_API_KEY (비우면 데모 모드)
npm run dev
```

```bash
docker build -t eldermuscle . && docker run -p 3000:3000 -e GOOGLE_API_KEY=... eldermuscle
```

자세한 데이터 흐름은 [`architecture_diagram.md`](architecture_diagram.md)에 있습니다.
