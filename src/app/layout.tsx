import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UFO캐처 피규어 캘린더",
  description: "크레인 게임 피규어 출현 일정 캘린더",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
