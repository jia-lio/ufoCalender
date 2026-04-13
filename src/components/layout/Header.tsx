"use client";

export default function Header() {
  return (
    <header className="border-b" style={{ borderColor: "var(--border)" }}>
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
        <span className="text-2xl">🏗️</span>
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
          UFO캐처 피규어 캘린더
        </h1>
      </div>
    </header>
  );
}
