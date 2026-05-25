import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElderMuscle — AI Nutrition Agent for Sarcopenia Prevention",
  description: "AI-powered protein tracking for elderly users. Diagnose sarcopenia stage from InBody data and track daily nutrition with meal photo analysis.",
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
