"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ActionMapStats } from "@/lib/action-map";
import { formatActionDate } from "@/lib/action-map";
import type { ActionVisit } from "@/lib/types";

interface ActionMapSidebarProps {
  stats: ActionMapStats;
  visits: ActionVisit[];
  totalMunicipalities?: number;
  onSelectVisit: (visit: ActionVisit) => void;
}

export default function ActionMapSidebar({
  stats,
  visits,
  totalMunicipalities = 224,
  onSelectVisit,
}: ActionMapSidebarProps) {
  const [query, setQuery] = useState("");

  const recentVisits = useMemo(() => {
    const sorted = [...visits].sort(
      (a, b) => b.date.localeCompare(a.date) || a.displayOrder - b.displayOrder
    );
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

  return (
    <div className="action-map-sidepanel">
      <div>
        <p className="action-map-kicker">Piauí</p>
        <h2 className="action-map-sidepanel-title">Ações no mapa</h2>
        <div className="action-map-accent-rule" aria-hidden="true" />
      </div>

      <label className="action-map-search">
        <Search className="action-map-search-icon" size={15} aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cidade..."
          className="action-map-search-input"
        />
      </label>

      <div className="action-map-metrics">
        <div className="action-map-metric">
          <p className="action-map-metric-value">{stats.actionsCompleted}</p>
          <p className="action-map-metric-label">Ações ativas</p>
        </div>
        <div className="action-map-metric">
          <p className="action-map-metric-value">{stats.citiesVisited}</p>
          <p className="action-map-metric-label">Municípios atendidos</p>
        </div>
        <div className="action-map-metric action-map-metric--coverage">
          <p className="action-map-metric-value">{coverage}%</p>
          <p className="action-map-metric-label">Cobertura estadual</p>
          <div className="action-map-metric-bar" aria-hidden="true">
            <span style={{ width: `${coverage}%` }} />
          </div>
        </div>
      </div>

      <div className="action-map-recent">
        <h3 className="action-map-recent-title">Últimas ações</h3>
        <ul className="action-map-recent-list">
          {recentVisits.length === 0 ? (
            <li className="action-map-recent-empty">Nenhuma ação encontrada.</li>
          ) : (
            recentVisits.map((visit) => (
              <li key={visit.id}>
                <button
                  type="button"
                  onClick={() => onSelectVisit(visit)}
                  className="action-map-recent-item"
                >
                  <span className="action-map-recent-city">{visit.city}</span>
                  <span className="action-map-recent-name">{visit.title}</span>
                  <span className="action-map-recent-date">
                    {formatActionDate(visit.date)}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <p className="action-map-hint">
        Clique nos pins para ver detalhes, use os filtros acima e amplie o mapa
        para visualizar todos os municípios.
      </p>
    </div>
  );
}
