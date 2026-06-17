"use client";

import { Clock3 } from "lucide-react";

interface ActionMapTimelineProps {
  years: string[];
  selectedYear: string;
  onSelect: (year: string) => void;
}

export default function ActionMapTimeline({ years, selectedYear, onSelect }: ActionMapTimelineProps) {
  if (!years.length) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Clock3 size={14} />
        Linha do tempo
      </span>
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
          !selectedYear
            ? "bg-[#0071B7] text-white shadow-sm"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        }`}
      >
        Todos
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onSelect(year)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
            selectedYear === year
              ? "bg-[#0071B7] text-white shadow-sm"
              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
