"use client";

import type { CalendarDay } from "@/types";
import TimeTag from "./TimeTag";

interface CalendarCellProps {
  day: CalendarDay;
  isToday: boolean;
  onClick: () => void;
}

export default function CalendarCell({ day, isToday, onClick }: CalendarCellProps) {
  const dayOfWeek = day.date.getDay();
  const hasFigures = day.figures.length > 0;

  // 고유 시간대 추출
  const uniqueTimes = [...new Set(day.figures.map((f) => f.time))].sort();

  let bgColor = "var(--card)";
  if (isToday) bgColor = "var(--today)";
  else if (dayOfWeek === 0) bgColor = "var(--sunday)";
  else if (dayOfWeek === 6) bgColor = "var(--saturday)";

  return (
    <button
      onClick={hasFigures ? onClick : undefined}
      disabled={!hasFigures}
      className="relative p-1.5 border rounded-lg text-left min-h-[80px] transition-all duration-150"
      style={{
        backgroundColor: bgColor,
        borderColor: isToday ? "var(--primary)" : "var(--border)",
        opacity: day.isCurrentMonth ? 1 : 0.4,
        cursor: hasFigures ? "pointer" : "default",
      }}
    >
      <span
        className="text-sm font-medium block mb-1"
        style={{
          fontFamily: "JetBrains Mono, monospace",
          color: day.isCurrentMonth ? "var(--text)" : "var(--muted)",
        }}
      >
        {day.date.getDate()}
      </span>
      {day.isCurrentMonth && uniqueTimes.length > 0 && (
        <div className="flex flex-wrap gap-0.5">
          {uniqueTimes.map((time) => (
            <TimeTag key={time} time={time} />
          ))}
        </div>
      )}
    </button>
  );
}
