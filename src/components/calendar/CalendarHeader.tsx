"use client";

interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

export default function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onPrev}
        className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        ← 이전달
      </button>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
          {year}년 {month + 1}월
        </h2>
        <button
          onClick={onToday}
          className="px-2 py-0.5 text-xs rounded-full border hover:bg-gray-50 transition-colors"
          style={{ borderColor: "var(--border)", color: "var(--text-sub)" }}
        >
          오늘
        </button>
      </div>
      <button
        onClick={onNext}
        className="px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
      >
        다음달 →
      </button>
    </div>
  );
}
