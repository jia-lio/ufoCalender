"use client";

import { useEffect, useRef } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ open, onClose, children, title }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-xl animate-modal"
        style={{ backgroundColor: "var(--card)" }}
      >
        {title && (
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-xl leading-none hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-sub)" }}
            >
              ✕
            </button>
          </div>
        )}
        {!title && (
          <div className="flex justify-end px-5 pt-4">
            <button
              onClick={onClose}
              className="text-xl leading-none hover:opacity-70 transition-opacity"
              style={{ color: "var(--text-sub)" }}
            >
              ✕
            </button>
          </div>
        )}
        <div className="px-5 pb-5">{children}</div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-modal {
          animation: modalIn 180ms ease-out;
        }
      `}</style>
    </div>
  );
}
