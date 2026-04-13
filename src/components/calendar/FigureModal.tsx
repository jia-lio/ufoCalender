"use client";

import type { Figure } from "@/types";
import Modal from "../ui/Modal";
import Image from "next/image";

interface FigureModalProps {
  open: boolean;
  onClose: () => void;
  figure: Figure | null;
}

export default function FigureModal({ open, onClose, figure }: FigureModalProps) {
  if (!figure) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col items-center gap-4 pt-2">
        <div className="relative w-full aspect-[3/4] max-w-[600px] rounded-xl overflow-hidden bg-gray-100">
          <Image
            src={figure.imageUrl}
            alt={figure.nameKo}
            fill
            className="object-contain"
            sizes="600px"
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-medium">{figure.nameJa}</p>
          <p className="text-base" style={{ color: "var(--text)" }}>
            {figure.nameKo}
          </p>
          <p className="text-sm" style={{ color: "var(--text-sub)" }}>
            {figure.nameEn}
          </p>
        </div>
      </div>
    </Modal>
  );
}
