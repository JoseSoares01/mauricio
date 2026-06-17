"use client";

import { Download, Flame, Route } from "lucide-react";

interface ActionMapControlsProps {
  showHeatmap: boolean;
  journeyActive: boolean;
  onToggleHeatmap: () => void;
  onStartJourney: () => void;
  onStopJourney: () => void;
  onExportCsv: () => void;
}

const btnBase =
  "inline-flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-sm font-semibold transition-all duration-200";

export default function ActionMapControls({
  showHeatmap,
  journeyActive,
  onToggleHeatmap,
  onStartJourney,
  onStopJourney,
  onExportCsv,
}: ActionMapControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onToggleHeatmap}
        className={`${btnBase} ${
          showHeatmap
            ? "bg-[#129547] text-white shadow-md shadow-emerald-500/20"
            : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <Flame size={16} />
        {showHeatmap ? "Ocultar heatmap" : "Regiões atendidas"}
      </button>

      {journeyActive ? (
        <button
          type="button"
          onClick={onStopJourney}
          className={`${btnBase} bg-[#0071B7] text-white shadow-md shadow-blue-500/20`}
        >
          <Route size={16} />
          Parar trajetória
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartJourney}
          className={`${btnBase} border border-[#0071B7]/30 bg-white text-[#0071B7] hover:bg-blue-50`}
        >
          <Route size={16} />
          Ver trajetória
        </button>
      )}

      <button
        type="button"
        onClick={onExportCsv}
        className={`${btnBase} border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50`}
      >
        <Download size={16} />
        Exportar CSV
      </button>
    </div>
  );
}
