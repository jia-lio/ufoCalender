"use client";

interface TimeTagProps {
  time: string; // HH:mm
}

export default function TimeTag({ time }: TimeTagProps) {
  const hour = time.split(":")[0];
  return (
    <span
      className="inline-block px-1.5 py-0.5 text-[10px] font-medium rounded"
      style={{
        backgroundColor: "var(--primary)",
        color: "#fff",
        fontFamily: "JetBrains Mono, monospace",
      }}
    >
      {hour}시
    </span>
  );
}
