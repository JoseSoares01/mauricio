"use client";

interface ActionMapTimelineProps {
  years: string[];
  selectedYear: string;
  onSelect: (year: string) => void;
}

export default function ActionMapTimeline({ years, selectedYear, onSelect }: ActionMapTimelineProps) {
  if (!years.length) return null;

  return (
    <div className="action-map-timeline">
      <span className="action-map-timeline-label">Linha do tempo</span>
      <button
        type="button"
        onClick={() => onSelect("")}
        className={`action-map-chip${!selectedYear ? " is-active" : ""}`}
      >
        Todos
      </button>
      {years.map((year) => (
        <button
          key={year}
          type="button"
          onClick={() => onSelect(year)}
          className={`action-map-chip${selectedYear === year ? " is-active" : ""}`}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
