"use client";

import { useMemo, useState } from "react";
import { MapPin, Search, Sparkles } from "lucide-react";
import type { ActionMapStats } from "@/lib/action-map";
import { formatActionDate } from "@/lib/action-map";
import type { ActionVisit } from "@/lib/types";

interface ActionMapSidebarProps {
  stats: ActionMapStats;
  visits: ActionVisit[];
  totalMunicipalities?: number;
  onSelectVisit: (visit: ActionVisit) => void;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 100 - (value / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 32" className="h-8 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default function ActionMapSidebar({
  stats,
  visits,
  totalMunicipalities = 224,
  onSelectVisit,
}: ActionMapSidebarProps) {
  const [query, setQuery] = useState("");

  const recentVisits = useMemo(() => {
    const sorted = [...visits].sort((a, b) => b.date.localeCompare(a.date) || a.displayOrder - b.displayOrder);
    if (!query.trim()) return sorted.slice(0, 5);
    const q = query.trim().toLowerCase();
    return sorted.filter(
      (visit) =>
        visit.city.toLowerCase().includes(q) ||
        visit.title.toLowerCase().includes(q) ||
        visit.category.toLowerCase().includes(q)
    );
  }, [visits, query]);

  const coverage = Math.min(
    100,
    Math.round((stats.citiesVisited / Math.max(totalMunicipalities, 1)) * 100)
  );

  const trend = useMemo(() => {
    const byYear = new Map<string, number>();
    for (const visit of visits) {
      const year = visit.date.slice(0, 4);
      byYear.set(year, (byYear.get(year) || 0) + 1);
    }
    const years = [...byYear.keys()].sort();
    return years.length ? years.map((year) => byYear.get(year) || 0) : [2, 3, 4, stats.actionsCompleted];
  }, [visits, stats.actionsCompleted]);

  return (
    <div className="flex h-full flex-col gap-4 overflow-hidden p-4 lg:p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Piauí</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-heading)" }}>
          Ações no mapa
        </h2>
      </div>

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cidade..."
          className="w-full rounded-[14px] border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-[#0071B7]/40 focus:ring-2 focus:ring-[#0071B7]/15"
        />
      </label>

      <div className="grid grid-cols-1 gap-3">
        <div className="action-map-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.actionsCompleted}</p>
              <p className="text-xs font-medium text-slate-500">Ações ativas</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
              +{Math.max(1, stats.actionsCompleted)}
            </span>
          </div>
          <Sparkline values={trend} color="#129547" />
        </div>

        <div className="action-map-card">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.citiesVisited}</p>
              <p className="text-xs font-medium text-slate-500">Municípios atendidos</p>
            </div>
            <MapPin size={18} className="text-[#0071B7]" />
          </div>
          <Sparkline values={[stats.citiesVisited, stats.citiesVisited + 1, stats.citiesVisited]} color="#0071B7" />
        </div>

        <div className="action-map-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">{coverage}%</p>
              <p className="text-xs font-medium text-slate-500">Cobertura estadual</p>
            </div>
            <Sparkles size={18} className="text-amber-500" />
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0071B7] to-[#129547] transition-all"
              style={{ width: `${coverage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-900">Últimas ações</h3>
        </div>
        <ul className="max-h-[280px] overflow-y-auto p-2">
          {recentVisits.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-slate-500">Nenhuma ação encontrada.</li>
          ) : (
            recentVisits.map((visit) => (
              <li key={visit.id}>
                <button
                  type="button"
                  onClick={() => onSelectVisit(visit)}
                  className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                >
                  <p className="text-sm font-semibold text-slate-900">{visit.city}</p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-600">{visit.title}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{formatActionDate(visit.date)}</p>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="action-map-card !p-3">
        <p className="text-xs font-semibold text-slate-800">Como usar</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
          Clique nos pins para ver detalhes, use os filtros acima e amplie o mapa para visualizar todos os
          municípios.
        </p>
      </div>
    </div>
  );
}
