"use client";

import { useState } from "react";
import type { Figure } from "@/types";
import Modal from "../ui/Modal";

interface DateModalProps {
  open: boolean;
  onClose: () => void;
  date: Date | null;
  figures: Figure[];
  onFigureClick: (figure: Figure) => void;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

type CategoryFilter = "전체" | "피규어" | "인형" | "기타";

const CATEGORY_FILTERS: CategoryFilter[] = ["전체", "피규어", "인형", "기타"];

function getCategoryFromName(nameKo: string): CategoryFilter {
  if (nameKo.startsWith("[피규어]")) return "피규어";
  if (nameKo.startsWith("[인형]")) return "인형";
  if (nameKo.startsWith("[기타]")) return "기타";
  return "기타";
}

export default function DateModal({
  open,
  onClose,
  date,
  figures,
  onFigureClick,
}: DateModalProps) {
  const [filter, setFilter] = useState<CategoryFilter>("전체");

  if (!date) return null;

  const sorted = [...figures].sort((a, b) => a.time.localeCompare(b.time));
  const filtered = filter === "전체"
    ? sorted
    : sorted.filter((f) => getCategoryFromName(f.nameKo) === filter);

  const title = `${date.getMonth() + 1}월 ${date.getDate()}일 (${DAY_NAMES[date.getDay()]})`;

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex gap-2 mb-3">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
            style={{
              backgroundColor: filter === cat ? "var(--primary)" : "var(--bg-sub)",
              color: filter === cat ? "#fff" : "var(--text-sub)",
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
        {filtered.map((figure) => (
          <button
            key={figure.id}
            onClick={() => onFigureClick(figure)}
            className="w-full flex items-center justify-between py-3 hover:bg-gray-50 transition-colors -mx-1 px-1 rounded"
          >
            <div className="flex items-center gap-3">
              <span
                className="text-sm font-medium"
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  color: "var(--primary)",
                }}
              >
                {figure.time}
              </span>
              <span className="text-sm">{figure.nameKo}</span>
            </div>
            <span style={{ color: "var(--muted)" }}>›</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center py-6 text-sm" style={{ color: "var(--text-sub)" }}>
          해당 카테고리에 등록된 항목이 없습니다.
        </p>
      )}
    </Modal>
  );
}
