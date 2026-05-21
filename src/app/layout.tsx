import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElderMuscle — 근감소증을 이기는 AI 영양 관리",
  description: "AI 기반 노인 단백질 섭취 관리 서비스. 근감소증(Sarcopenia) 예방을 도와드립니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
