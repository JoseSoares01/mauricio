"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ActionVisit, NewsItem } from "@/lib/types";
import {
  EMPTY_ACTION_MAP_FILTERS,
  computeActionMapStats,
  filterActionVisits,
  findVisitBySlug,
  getActionMapCategories,
  getActionMapCities,
  getActionMapYears,
  getActionVisitSharePath,
  getCityActionRanking,
  sortVisitsChronologically,
  visitsToCsv,
} from "@/lib/action-map";
import ActionMapToolbar from "./ActionMapToolbar";
import ActionMapDetailPanel from "./ActionMapDetailPanel";
import ActionMapBottomSheet from "./ActionMapBottomSheet";
import ActionMapJourneyBar from "./ActionMapJourneyBar";
import ActionMapHeatmapPanel from "./ActionMapHeatmapPanel";
import ActionMapSidebar from "./ActionMapSidebar";

const JOURNEY_STEP_MS = 4200;

const ActionMapCanvas = dynamic(
  () => import("./ActionMapCanvas").catch(() => import("./ActionMapCanvasError")),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-500">
        Carregando mapa...
      </div>
    ),
  }
);

interface ActionMapPageProps {
  visits: ActionVisit[];
  news: NewsItem[];
  siteTitle: string;
  mapImage: string;
}

export default function ActionMapPage({ visits, news, siteTitle, mapImage }: ActionMapPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(EMPTY_ACTION_MAP_FILTERS);
  const [selectedVisit, setSelectedVisit] = useState<ActionVisit | null>(null);
  const [popupVisit, setPopupVisit] = useState<ActionVisit | null>(null);
  const [focusVisit, setFocusVisit] = useState<ActionVisit | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyIndex, setJourneyIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const filteredVisits = useMemo(
    () => filterActionVisits(visits, filters),
    [visits, filters]
  );

  const chronologyVisits = useMemo(
    () => sortVisitsChronologically(filteredVisits),
    [filteredVisits]
  );

  const stats = useMemo(() => computeActionMapStats(filteredVisits), [filteredVisits]);
  const cityRanking = useMemo(() => getCityActionRanking(filteredVisits), [filteredVisits]);
  const years = useMemo(() => getActionMapYears(visits), [visits]);
  const cities = useMemo(() => getActionMapCities(visits), [visits]);
  const categories = useMemo(() => getActionMapCategories(visits), [visits]);

  const openVisit = useCallback(
    (visit: ActionVisit, updateUrl = true) => {
      setSelectedVisit(visit);
      setPopupVisit(journeyActive ? null : visit);
      setFocusVisit(visit);
      if (updateUrl && !journeyActive) {
        router.replace(getActionVisitSharePath(visit.slug), { scroll: false });
      }
    },
    [journeyActive, router]
  );

  const closeVisit = useCallback(() => {
    setSelectedVisit(null);
    setPopupVisit(null);
    setFocusVisit(null);
    if (!journeyActive) {
      router.replace("/mapa-de-atuacao", { scroll: false });
    }
  }, [journeyActive, router]);

  const stopJourney = useCallback(() => {
    setJourneyActive(false);
    setJourneyIndex(0);
    setPopupVisit(null);
  }, []);

  const startJourney = useCallback(() => {
    if (chronologyVisits.length === 0) return;
    setShowHeatmap(false);
    setJourneyIndex(0);
    setJourneyActive(true);
  }, [chronologyVisits]);

  const handleExportCsv = useCallback(() => {
    const csv = visitsToCsv(filteredVisits);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mapa-de-atuacao.csv";
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredVisits]);

  useEffect(() => {
    const slug = searchParams.get("acao") || searchParams.get("visita");
    if (!slug || journeyActive) return;
    const visit = findVisitBySlug(visits, slug);
    if (visit) openVisit(visit, false);
  }, [searchParams, visits, openVisit, journeyActive]);

  useEffect(() => {
    if (selectedVisit && !filteredVisits.some((visit) => visit.id === selectedVisit.id)) {
      closeVisit();
      stopJourney();
    }
  }, [filteredVisits, selectedVisit, closeVisit, stopJourney]);

  useEffect(() => {
    if (!journeyActive || chronologyVisits.length === 0) return;

    const current = chronologyVisits[journeyIndex];
    if (current) {
      setSelectedVisit(current);
      setFocusVisit(current);
      setPopupVisit(null);
    }

    const timer = window.setTimeout(() => {
      if (journeyIndex < chronologyVisits.length - 1) {
        setJourneyIndex((value) => value + 1);
      } else {
        setJourneyActive(false);
      }
    }, JOURNEY_STEP_MS);

    return () => window.clearTimeout(timer);
  }, [journeyActive, journeyIndex, chronologyVisits]);

  const sidebarContent = selectedVisit ? (
    <ActionMapDetailPanel visit={selectedVisit} news={news} onClose={closeVisit} />
  ) : showHeatmap ? (
    <ActionMapHeatmapPanel ranking={cityRanking} totalRealizadas={stats.actionsCompleted} />
  ) : (
    <ActionMapSidebar stats={stats} visits={filteredVisits} onSelectVisit={openVisit} />
  );

  return (
    <div className="action-map-page min-h-screen">
      <div className="action-map-shell border-b border-slate-200/70 px-4 pb-4 pt-28 md:px-6 md:pt-32">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                Monitoramento territorial
              </p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl" style={{ fontFamily: "var(--font-heading)" }}>
                Mapa de Atuação
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Acompanhe as ações e visitas de {siteTitle} pelo estado do Piauí.
              </p>
            </div>
            <button
              type="button"
              className="action-map-icon-btn lg:hidden"
              onClick={() => setMobilePanelOpen((value) => !value)}
              aria-label="Abrir painel"
            >
              <PanelRightOpen size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-white/90 p-3 shadow-sm backdrop-blur md:p-4">
            <ActionMapToolbar
              filters={filters}
              years={years}
              cities={cities}
              categories={categories}
              selectedYear={filters.year}
              showHeatmap={showHeatmap}
              journeyActive={journeyActive}
              onChangeFilters={setFilters}
              onSelectYear={(year) => setFilters((current) => ({ ...current, year }))}
              onToggleHeatmap={() => {
                setShowHeatmap((value) => !value);
                stopJourney();
              }}
              onStartJourney={startJourney}
              onStopJourney={stopJourney}
              onExportCsv={handleExportCsv}
            />
            {journeyActive && (
              <div className="mt-3">
                <ActionMapJourneyBar
                  visit={chronologyVisits[journeyIndex] || null}
                  index={journeyIndex}
                  total={chronologyVisits.length}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1600px] px-0 md:px-6 md:pb-8">
        <div className="action-map-layout">
          <div className="action-map-canvas-wrap">
            <ActionMapCanvas
              visits={filteredVisits}
              mapImage={mapImage}
              selectedVisitId={selectedVisit?.id || null}
              popupVisit={popupVisit}
              focusVisit={focusVisit}
              showHeatmap={showHeatmap}
              journeyActive={journeyActive}
              journeyIndex={journeyIndex}
              chronologyVisits={chronologyVisits}
              onSelectVisit={openVisit}
              onPopupVisit={setPopupVisit}
              onMapBackgroundClick={closeVisit}
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
      </section>

      {mobilePanelOpen && !selectedVisit && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Fechar painel"
            onClick={() => setMobilePanelOpen(false)}
          />
          <aside className="fixed inset-y-0 right-0 z-50 w-[min(100%,360px)] overflow-hidden bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">Painel do mapa</p>
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

      <ActionMapBottomSheet visit={selectedVisit} news={news} onClose={closeVisit} />
    </div>
  );
}
