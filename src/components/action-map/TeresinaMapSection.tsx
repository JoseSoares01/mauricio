"use client";

import { useMemo, useState } from "react";
import { Calendar, PanelRightClose, PanelRightOpen } from "lucide-react";
import dynamic from "next/dynamic";
import type { TeresinaVisit } from "@/lib/types";
import { formatActionDate } from "@/lib/action-map";
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
  onSelectVisit,
}: {
  visits: TeresinaVisit[];
  stats: { totalVisits: number; bairrosCount: number; categoriesCount: number };
  selectedVisitId: string | null;
  onSelectVisit: (visit: TeresinaVisit) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-100 p-4 bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
          Atuação em Teresina
        </h2>
        <p className="mt-1 text-xs text-slate-500">{stats.totalVisits} ações em {stats.bairrosCount} bairros</p>
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
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {visits.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">Nenhuma atuação cadastrada em Teresina.</p>
        ) : (
          visits.map((visit) => {
            const isSelected = visit.id === selectedVisitId;
            return (
              <button
                key={visit.id}
                type="button"
                onClick={() => onSelectVisit(visit)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-[#0071B7] bg-[#0071B7]/5 shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                }`}
              >
                <div className="flex gap-2.5">
                  {visit.image ? (
                    <img
                      src={visit.image}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-lg object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-lg bg-slate-100" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                        {visit.neighborhood}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <Calendar size={10} />
                        {formatActionDate(visit.date)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-bold text-slate-800 line-clamp-2 leading-snug">
                      {visit.title}
                    </p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function TeresinaMapSection({ visits, isActive = true }: TeresinaMapSectionProps) {
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [detailVisit, setDetailVisit] = useState<TeresinaVisit | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const stats = useMemo(() => {
    const categories = new Set(visits.map((v) => v.category));
    return {
      totalVisits: visits.length,
      bairrosCount: new Set(visits.map((v) => v.neighborhood)).size,
      categoriesCount: categories.size,
    };
  }, [visits]);

  const handleSelectVisit = (visit: TeresinaVisit) => {
    setSelectedVisitId(visit.id);
    setMobilePanelOpen(false);
  };

  const handleOpenDetails = (visit: TeresinaVisit) => {
    setSelectedVisitId(visit.id);
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
      onSelectVisit={handleSelectVisit}
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
              setDetailVisit(null);
            }}
            isActive={isActive}
            focusVisitId={selectedVisitId}
          />
        </div>

        <aside className={`action-map-sidebar hidden lg:flex ${sidebarOpen ? "" : "action-map-sidebar--collapsed"}`}>
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
