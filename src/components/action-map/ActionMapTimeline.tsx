"use client";

interface ActionMapTimelineProps {
  years: string[];
  selectedYear: string;
  onSelect: (year: string) => void;
}

export default function ActionMapTimeline({ years, selectedYear, onSelect }: ActionMapTimelineProps) {
  if (!years.length) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-sm font-medium text-gray-600">Linha do tempo:</span>
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
          !selectedYear ? "bg-[#0071B7] text-white" : "bg-white text-gray-700 border border-gray-200"
        }`}
      >
        Todos
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onSelect(year)}
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors ${
            selectedYear === year
              ? "bg-[#0071B7] text-white"
              : "bg-white text-gray-700 border border-gray-200"
          }`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
