"use client";

import { formatMes } from "@/lib/format";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  function prev() {
    const [y, m] = value.split("-").map(Number);
    const d = new Date(y, m - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  function next() {
    const [y, m] = value.split("-").map(Number);
    const d = new Date(y, m, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        aria-label="Mes anterior"
      >
        ◀
      </button>
      <span className="text-sm font-medium text-gray-200 min-w-[140px] text-center capitalize">
        {formatMes(value)}
      </span>
      <button
        onClick={next}
        className="p-1 text-gray-400 hover:text-white transition-colors"
        aria-label="Mes siguiente"
      >
        ▶
      </button>
    </div>
  );
}
