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
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          showHeatmap
            ? "bg-[#129547] text-white"
            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Flame size={16} />
        {showHeatmap ? "Ocultar heatmap" : "Regiões atendidas"}
      </button>

      {journeyActive ? (
        <button
          type="button"
          onClick={onStopJourney}
          className="inline-flex items-center gap-2 rounded-full bg-[#0071B7] px-4 py-2 text-sm font-medium text-white"
        >
          <Route size={16} />
          Parar trajetória
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartJourney}
          className="inline-flex items-center gap-2 rounded-full border border-[#0071B7] bg-white px-4 py-2 text-sm font-medium text-[#0071B7] hover:bg-blue-50"
        >
          <Route size={16} />
          Ver trajetória do deputado
        </button>
      )}

      <button
        type="button"
        onClick={onExportCsv}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <Download size={16} />
        Exportar CSV
      </button>
    </div>
  );
}
