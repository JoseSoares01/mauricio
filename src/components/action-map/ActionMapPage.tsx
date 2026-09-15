"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import type { ActionVisit, NewsItem, TeresinaVisit } from "@/lib/types";
import TeresinaMapSection from "./TeresinaMapSection";
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
  teresinaVisits: TeresinaVisit[];
  news: NewsItem[];
  siteTitle: string;
  mapImage: string;
}

export default function ActionMapPage({
  visits,
  teresinaVisits = [],
  news,
  siteTitle,
  mapImage,
}: ActionMapPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"piaui" | "teresina">("piaui");
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
      setSidebarOpen(true);
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
    <div className="action-map-page min-h-screen" data-reveal-skip>
      <div className="action-map-shell">
        <div className="action-map-shell-inner">
          <div className="action-map-hero-row">
            <div>
              <p className="action-map-hero-label">Monitoramento territorial</p>
              <h1 className="action-map-hero-title">Mapa de Atuação</h1>
              <div className="action-map-hero-rule" aria-hidden="true" />
              <p className="action-map-hero-desc">
                Acompanhe as ações e visitas de {siteTitle} pelo estado do Piauí.
              </p>
            </div>
            {activeTab === "piaui" && (
              <button
                type="button"
                className="action-map-icon-btn lg:hidden"
                onClick={() => setMobilePanelOpen((value) => !value)}
                aria-label="Abrir painel"
              >
                <PanelRightOpen size={18} />
              </button>
            )}
          </div>

          <div className="action-map-tabs" role="tablist" aria-label="Abrangência do mapa">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "piaui"}
              onClick={() => setActiveTab("piaui")}
              className={`action-map-tab${activeTab === "piaui" ? " is-active" : ""}`}
            >
              Atuação no Piauí
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "teresina"}
              onClick={() => {
                setActiveTab("teresina");
                closeVisit();
                stopJourney();
              }}
              className={`action-map-tab${activeTab === "teresina" ? " is-active" : ""}`}
            >
              Atuação em Teresina
            </button>
          </div>
        </div>
      </div>

      {activeTab === "piaui" ? (
        <>
          <div className="action-map-tools-wrap">
            <div className="action-map-tools-bar">
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
                <div className="mt-1">
                  <ActionMapJourneyBar
                    visit={chronologyVisits[journeyIndex] || null}
                    index={journeyIndex}
                    total={chronologyVisits.length}
                  />
                </div>
              )}
            </div>
          </div>

          <section className="action-map-stage-section">
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
        </>
      ) : (
        <section className="action-map-stage-section">
          <TeresinaMapSection visits={teresinaVisits} isActive={activeTab === "teresina"} />
        </section>
      )}

      {activeTab === "piaui" && mobilePanelOpen && !selectedVisit && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            aria-label="Fechar painel"
            onClick={() => setMobilePanelOpen(false)}
          />
          <aside className="action-map-mobile-drawer fixed inset-y-0 right-0 z-50 w-[min(100%,360px)] overflow-hidden shadow-2xl lg:hidden">
            <div className="action-map-mobile-drawer-head">
              <p className="action-map-mobile-drawer-title">Ações no mapa</p>
              <button
                type="button"
                className="action-map-icon-btn"
                onClick={() => setMobilePanelOpen(false)}
                aria-label="Fechar"
              >
                <PanelRightClose size={16} />
              </button>
            </div>
            <div className="h-[calc(100%-56px)] overflow-y-auto">{sidebarContent}</div>
          </aside>
        </>
      )}

      {activeTab === "piaui" && (
        <ActionMapBottomSheet visit={selectedVisit} news={news} onClose={closeVisit} />
      )}
    </div>
  );
}
