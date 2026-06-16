"use client";

import { ACTION_MAP_COLORS } from "@/lib/action-map";
import type { CityActionRanking } from "@/lib/action-map";

interface ActionMapHeatmapPanelProps {
  ranking: CityActionRanking[];
  totalRealizadas: number;
}

export default function ActionMapHeatmapPanel({ ranking, totalRealizadas }: ActionMapHeatmapPanelProps) {
  if (ranking.length === 0) {
    return (
      <div className="flex h-full flex-col justify-center rounded-l-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-600">
        <p className="text-lg font-semibold text-gray-800">Nenhuma ação realizada</p>
        <p className="mt-2 text-sm">Ajuste os filtros ou aguarde novas visitas registradas.</p>
      </div>
    );
  }

  const maxCount = ranking[0]?.count || 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-l-2xl border border-gray-100 bg-white shadow-xl">
      <div className="border-b border-gray-100 px-4 py-4">
        <h2 className="text-lg font-bold text-gray-900">Regiões atendidas</h2>
        <p className="mt-1 text-sm text-gray-600">
          {totalRealizadas} ação{totalRealizadas === 1 ? "" : "ões"} realizada
          {totalRealizadas === 1 ? "" : "s"} em {ranking.length} cidade
          {ranking.length === 1 ? "" : "s"}.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="space-y-3">
          {ranking.map((entry, index) => {
            const width = Math.max(12, Math.round((entry.realizadas / maxCount) * 100));
            return (
              <li key={entry.city} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {index + 1}. {entry.city}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-600">
                      {entry.realizadas} realizada{entry.realizadas === 1 ? "" : "s"}
                      {entry.agendadas > 0 &&
                        ` · ${entry.agendadas} agendada${entry.agendadas === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: ACTION_MAP_COLORS.realizada }}
                  >
                    {entry.realizadas}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${width}%`,
                      backgroundColor: ACTION_MAP_COLORS.realizada,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
