"use client";

import { useState, useEffect, useCallback } from "react";
import { getFiguresByMonth } from "@/lib/firestore";
import type { Figure, CalendarDay } from "@/types";

function getCalendarDays(year: number, month: number, figures: Figure[]): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0=일요일

  const days: CalendarDay[] = [];

  // 이전 달 빈 칸
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      figures: [],
      isCurrentMonth: false,
    });
  }

  // 이번 달
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    const dayFigures = figures.filter((f) => {
      const fDate = f.date.toDate();
      return (
        fDate.getFullYear() === year &&
        fDate.getMonth() === month &&
        fDate.getDate() === d
      );
    });
    days.push({ date, figures: dayFigures, isCurrentMonth: true });
  }

  // 다음 달 빈 칸 (6주 채우기)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      figures: [],
      isCurrentMonth: false,
    });
  }

  return days;
}

export function useCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [figures, setFigures] = useState<Figure[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFiguresByMonth(year, month)
      .then(setFigures)
      .catch((err) => {
        console.error("Firestore fetch failed:", err);
      })
      .finally(() => setLoading(false));
  }, [year, month]);

  const days = getCalendarDays(year, month, figures);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const goToday = useCallback(() => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  }, []);

  return { year, month, days, figures, loading, prevMonth, nextMonth, goToday };
}
