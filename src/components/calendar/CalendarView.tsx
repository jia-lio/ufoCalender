"use client";

import { useState } from "react";
import { useCalendar } from "@/hooks/useCalendar";
import type { Figure, CalendarDay } from "@/types";
import CalendarHeader from "./CalendarHeader";
import CalendarCell from "./CalendarCell";
import DateModal from "./DateModal";
import FigureModal from "./FigureModal";
import MobileListView from "../mobile/MobileListView";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function CalendarView() {
  const { year, month, days, loading, prevMonth, nextMonth, goToday } = useCalendar();

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);

  const today = new Date();
  const isToday = (date: Date) =>
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day);
  };

  const handleFigureClick = (figure: Figure) => {
    setSelectedFigure(figure);
  };

  const handleDateModalClose = () => {
    setSelectedDay(null);
  };

  const handleFigureModalClose = () => {
    setSelectedFigure(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <CalendarHeader
        year={year}
        month={month}
        onPrev={prevMonth}
        onNext={nextMonth}
        onToday={goToday}
      />

      {/* 데스크탑 캘린더 그리드 */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((name, i) => (
            <div
              key={name}
              className="text-center text-xs font-medium py-2"
              style={{
                color: i === 0 ? "var(--primary)" : i === 6 ? "#3B82F6" : "var(--text-sub)",
              }}
            >
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <CalendarCell
              key={i}
              day={day}
              isToday={isToday(day.date)}
              onClick={() => handleDayClick(day)}
            />
          ))}
        </div>
      </div>

      {/* 모바일 목록 뷰 */}
      <div className="sm:hidden">
        <MobileListView days={days} onDayClick={handleDayClick} />
      </div>

      {/* 날짜 모달 */}
      <DateModal
        open={selectedDay !== null && selectedFigure === null}
        onClose={handleDateModalClose}
        date={selectedDay?.date ?? null}
        figures={selectedDay?.figures ?? []}
        onFigureClick={handleFigureClick}
      />

      {/* 상세 모달 */}
      <FigureModal
        open={selectedFigure !== null}
        onClose={handleFigureModalClose}
        figure={selectedFigure}
      />
    </div>
  );
}
