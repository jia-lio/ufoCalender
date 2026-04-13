"use client";

import type { CalendarDay } from "@/types";
import TimeTag from "../calendar/TimeTag";

interface MobileListViewProps {
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

export default function MobileListView({ days, onDayClick }: MobileListViewProps) {
  const daysWithFigures = days.filter(
    (d) => d.isCurrentMonth && d.figures.length > 0
  );

  if (daysWithFigures.length === 0) {
    return (
      <p className="text-center py-12 text-sm" style={{ color: "var(--text-sub)" }}>
        이번 달에 등록된 피규어가 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {daysWithFigures.map((day) => {
        const uniqueTimes = [...new Set(day.figures.map((f) => f.time))].sort();
        const d = day.date;
        return (
          <button
            key={d.toISOString()}
            onClick={() => onDayClick(day)}
            className="w-full text-left p-4 rounded-xl border transition-colors hover:bg-gray-50"
            style={{
              backgroundColor: "var(--card)",
              borderColor: "var(--border)",
            }}
          >
            <p className="text-sm font-semibold mb-2">
              {d.getMonth() + 1}월 {d.getDate()}일 ({DAY_NAMES[d.getDay()]})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {uniqueTimes.map((time) => (
                <TimeTag key={time} time={time} />
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
