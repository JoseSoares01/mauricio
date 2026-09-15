"use client";

import { useMemo, useState } from "react";
import { PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import dynamic from "next/dynamic";
import type { TeresinaVisit } from "@/lib/types";
import {
  TERESINA_ZONES,
  buildTeresinaNeighborhoodSummaries,
  buildTeresinaZoneSummaries,
  filterTeresinaNeighborhoods,
  type TeresinaZoneFilter,
} from "@/lib/teresina-zones";
import TeresinaMapDetailPanel from "./TeresinaMapDetailPanel";
import TeresinaMapBottomSheet from "./TeresinaMapBottomSheet";

const TeresinaMapCanvas = dynamic(() => import("./TeresinaMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[min(72vh,820px)] items-center justify-center text-sm text-slate-500">
      Carregando mapa de Teresina...
    </div>
  ),
});

interface TeresinaMapSectionProps {
  visits: TeresinaVisit[];
  isActive?: boolean;
}

function TeresinaSidebarList({
  visits,
  stats,
  selectedVisitId,
  selectedNeighborhood,
  onSelectNeighborhood,
  onSelectZone,
}: {
  visits: TeresinaVisit[];
  stats: { totalVisits: number; bairrosCount: number; categoriesCount: number };
  selectedVisitId: string | null;
  selectedNeighborhood: string | null;
  onSelectNeighborhood: (neighborhood: string) => void;
  onSelectZone: (zone: TeresinaZoneFilter) => void;
}) {
  const [zone, setZone] = useState<TeresinaZoneFilter>("");
  const [query, setQuery] = useState("");

  const neighborhoods = useMemo(() => buildTeresinaNeighborhoodSummaries(visits), [visits]);
  const zoneSummaries = useMemo(() => buildTeresinaZoneSummaries(neighborhoods), [neighborhoods]);
  const filteredNeighborhoods = useMemo(
    () => filterTeresinaNeighborhoods(neighborhoods, zone, query),
    [neighborhoods, zone, query]
  );

  const showZoneOverview = !zone && !query.trim();

  const handleZoneChange = (next: TeresinaZoneFilter) => {
    setZone(next);
    onSelectZone(next);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4 bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
          Atuação em Teresina
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {stats.totalVisits} ações em {stats.bairrosCount} bairros
        </p>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-slate-200/70 bg-white p-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ações</p>
            <p className="text-sm font-extrabold text-[#0071B7]">{stats.totalVisits}</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white p-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Bairros</p>
            <p className="text-sm font-extrabold text-[#129547]">{stats.bairrosCount}</p>
          </div>
          <div className="rounded-xl border border-slate-200/70 bg-white p-2 text-center">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Áreas</p>
            <p className="text-sm font-extrabold text-amber-500">{stats.categoriesCount}</p>
          </div>
        </div>

        <label className="mt-3 block">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Zona
          </span>
          <select
            value={zone}
            onChange={(event) => handleZoneChange(event.target.value as TeresinaZoneFilter)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-[#0071B7]/40 focus:ring-2 focus:ring-[#0071B7]/15"
          >
            <option value="">Todas</option>
            {TERESINA_ZONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="relative mt-2 block">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={15}
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar bairro ou ação..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-[#0071B7]/40 focus:ring-2 focus:ring-[#0071B7]/15"
          />
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {visits.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Nenhuma atuação cadastrada em Teresina.
          </p>
        ) : showZoneOverview ? (
          <div className="space-y-2">
            <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Resumo por zona
            </p>
            {zoneSummaries.map((item) => (
              <button
                key={item.zone}
                type="button"
                onClick={() => handleZoneChange(item.zone)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-white px-3 py-3 text-left transition hover:border-slate-200 hover:shadow-sm"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{item.zone}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {item.neighborhoodCount} bairro
                    {item.neighborhoodCount === 1 ? "" : "s"} com ações
                  </p>
                </div>
                <span className="text-base font-extrabold text-[#0071B7]">{item.actionCount}</span>
              </button>
            ))}
          </div>
        ) : filteredNeighborhoods.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            Nenhum bairro encontrado com esses filtros.
          </p>
        ) : (
          <div className="space-y-1">
            <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Bairros com ações
              {zone ? ` · ${zone}` : ""}
            </p>
            {filteredNeighborhoods.map((item) => {
              const isSelected = selectedNeighborhood === item.neighborhood;
              const hasSelectedVisit = item.visits.some((visit) => visit.id === selectedVisitId);
              return (
                <button
                  key={item.neighborhood}
                  type="button"
                  onClick={() => onSelectNeighborhood(item.neighborhood)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                    isSelected || hasSelectedVisit
                      ? "border-[#0071B7] bg-[#0071B7]/5 shadow-sm"
                      : "border-transparent hover:border-slate-100 hover:bg-white"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.neighborhood}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{item.zone}</p>
                  </div>
                  <span className="ml-3 shrink-0 text-sm font-extrabold tabular-nums text-[#129547]">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeresinaMapSection({ visits, isActive = true }: TeresinaMapSectionProps) {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
  const [detailVisit, setDetailVisit] = useState<TeresinaVisit | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const stats = useMemo(() => {
    const categories = new Set(visits.map((v) => v.category));
    return {
      totalVisits: visits.length,
      bairrosCount: new Set(visits.map((v) => v.neighborhood)).size,
      categoriesCount: categories.size,
    };
  }, [visits]);

  const neighborhoods = useMemo(() => buildTeresinaNeighborhoodSummaries(visits), [visits]);

  const handleSelectVisit = (visit: TeresinaVisit) => {
    setSelectedVisitId(visit.id);
    setSelectedNeighborhood(visit.neighborhood);
    setMobilePanelOpen(false);
  };

  const handleSelectNeighborhood = (neighborhood: string) => {
    const summary = neighborhoods.find((item) => item.neighborhood === neighborhood);
    if (!summary) return;
    setSelectedNeighborhood(neighborhood);
    setSelectedVisitId(summary.latestVisit.id);
    setMobilePanelOpen(false);
  };

  const handleSelectZone = (_zone: TeresinaZoneFilter) => {
    setSelectedNeighborhood(null);
  };

  const handleOpenDetails = (visit: TeresinaVisit) => {
    setSelectedVisitId(visit.id);
    setSelectedNeighborhood(visit.neighborhood);
    setDetailVisit(visit);
    setSidebarOpen(true);
    setMobilePanelOpen(false);
  };

  const handleCloseDetails = () => {
    setDetailVisit(null);
  };

  const sidebarContent = detailVisit ? (
    <TeresinaMapDetailPanel visit={detailVisit} onClose={handleCloseDetails} />
  ) : (
    <TeresinaSidebarList
      visits={visits}
      stats={stats}
      selectedVisitId={selectedVisitId}
      selectedNeighborhood={selectedNeighborhood}
      onSelectNeighborhood={handleSelectNeighborhood}
      onSelectZone={handleSelectZone}
    />
  );

  return (
    <>
      <div className="action-map-layout">
        <div className="action-map-canvas-wrap relative">
          <button
            type="button"
            className="action-map-icon-btn absolute right-3 top-3 z-20 lg:hidden"
            onClick={() => setMobilePanelOpen(true)}
            aria-label="Abrir lista de ações"
          >
            <PanelRightOpen size={18} />
          </button>

          <TeresinaMapCanvas
            visits={visits}
            selectedVisitId={selectedVisitId}
            onSelectVisit={handleSelectVisit}
            onOpenDetails={handleOpenDetails}
            onCloseVisit={() => {
              setSelectedVisitId(null);
              setSelectedNeighborhood(null);
              setDetailVisit(null);
            }}
            isActive={isActive}
            focusVisitId={selectedVisitId}
          />
        </div>

        <aside
          className={`action-map-sidebar hidden lg:flex ${sidebarOpen ? "" : "action-map-sidebar--collapsed"}`}
        >
          <button
            type="button"
            className="action-map-sidebar-toggle"
            onClick={() => setSidebarOpen((value) => !value)}
            aria-label={sidebarOpen ? "Recolher painel" : "Expandir painel"}
          >
            {sidebarOpen ? <PanelRightClose size={16} /> : <PanelRightOpen size={16} />}
          </button>
          {sidebarOpen && <div className="min-h-0 flex-1 overflow-hidden">{sidebarContent}</div>}
        </aside>
      </div>

      {mobilePanelOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Fechar painel"
            onClick={() => setMobilePanelOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-[min(100%,360px)] overflow-hidden bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">Ações em Teresina</p>
              <button
                type="button"
                className="action-map-icon-btn"
                onClick={() => setMobilePanelOpen(false)}
                aria-label="Fechar"
              >
                <PanelRightClose size={16} />
              </button>
            </div>
            <div className="h-[calc(100%-52px)] overflow-y-auto">{sidebarContent}</div>
          </aside>
        </>
      )}

      <TeresinaMapBottomSheet visit={detailVisit} onClose={handleCloseDetails} />
    </>
  );
}
