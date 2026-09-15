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
    <div className="action-map-controls">
      <button
        type="button"
        onClick={onToggleHeatmap}
        className={`action-map-control-btn${showHeatmap ? " is-active is-green" : ""}`}
      >
        <Flame size={15} aria-hidden />
        {showHeatmap ? "Ocultar heatmap" : "Regiões atendidas"}
      </button>

      {journeyActive ? (
        <button
          type="button"
          onClick={onStopJourney}
          className="action-map-control-btn is-active"
        >
          <Route size={15} aria-hidden />
          Parar trajetória
        </button>
      ) : (
        <button
          type="button"
          onClick={onStartJourney}
          className="action-map-control-btn is-outline"
        >
          <Route size={15} aria-hidden />
          Ver trajetória
        </button>
      )}

      <button type="button" onClick={onExportCsv} className="action-map-control-btn">
        <Download size={15} aria-hidden />
        Exportar CSV
      </button>
    </div>
  );
}
