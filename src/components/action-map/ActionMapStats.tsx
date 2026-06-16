"use client";

import type { ActionMapStats as Stats } from "@/lib/action-map";

interface ActionMapStatsProps {
  stats: Stats;
}

const ITEMS: Array<{ key: keyof Stats; label: string }> = [
  { key: "citiesVisited", label: "Cidades visitadas" },
  { key: "actionsCompleted", label: "Ações realizadas" },
  { key: "upcomingAgendas", label: "Agendas futuras" },
  { key: "totalRecords", label: "Registros no mapa" },
];

export default function ActionMapStats({ stats }: ActionMapStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {ITEMS.map((item) => (
        <div
          key={item.key}
          className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            {stats[item.key]}
          </p>
          <p className="text-xs text-gray-600 md:text-sm">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
