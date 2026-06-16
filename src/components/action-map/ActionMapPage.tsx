"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
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
} from "@/lib/action-map";
import ActionMapStats from "./ActionMapStats";
import ActionMapFilters from "./ActionMapFilters";
import ActionMapTimeline from "./ActionMapTimeline";
import ActionMapDetailPanel from "./ActionMapDetailPanel";
import ActionMapBottomSheet from "./ActionMapBottomSheet";

const ActionMapCanvas = dynamic(() => import("./ActionMapCanvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-600">
      Carregando mapa...
    </div>
  ),
});

interface ActionMapPageProps {
  visits: ActionVisit[];
  news: NewsItem[];
  siteTitle: string;
}

export default function ActionMapPage({ visits, news, siteTitle }: ActionMapPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(EMPTY_ACTION_MAP_FILTERS);
  const [selectedVisit, setSelectedVisit] = useState<ActionVisit | null>(null);
  const [popupVisit, setPopupVisit] = useState<ActionVisit | null>(null);
  const [focusVisit, setFocusVisit] = useState<ActionVisit | null>(null);

  const filteredVisits = useMemo(
    () => filterActionVisits(visits, filters),
    [visits, filters]
  );

  const stats = useMemo(() => computeActionMapStats(filteredVisits), [filteredVisits]);
  const years = useMemo(() => getActionMapYears(visits), [visits]);
  const cities = useMemo(() => getActionMapCities(visits), [visits]);
  const categories = useMemo(() => getActionMapCategories(visits), [visits]);

  const openVisit = useCallback(
    (visit: ActionVisit, updateUrl = true) => {
      setSelectedVisit(visit);
      setPopupVisit(visit);
      setFocusVisit(visit);
      if (updateUrl) {
        router.replace(getActionVisitSharePath(visit.slug), { scroll: false });
      }
    },
    [router]
  );

  const closeVisit = useCallback(() => {
    setSelectedVisit(null);
    setPopupVisit(null);
    setFocusVisit(null);
    router.replace("/mapa-de-atuacao", { scroll: false });
  }, [router]);

  useEffect(() => {
    const slug = searchParams.get("visita");
    if (!slug) return;
    const visit = findVisitBySlug(visits, slug);
    if (visit) openVisit(visit, false);
  }, [searchParams, visits, openVisit]);

  useEffect(() => {
    if (selectedVisit && !filteredVisits.some((visit) => visit.id === selectedVisit.id)) {
      closeVisit();
    }
  }, [filteredVisits, selectedVisit, closeVisit]);

  return (
    <div className="action-map-page">
      <section
        className="border-b border-black/5 bg-white px-4 pb-6 pt-28 md:px-6 md:pt-32"
        style={{
          background:
            "radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)",
        }}
      >
        <div className="container-site space-y-4">
          <div>
            <h1 className="section-title text-left">Mapa de Atuação</h1>
            <p className="mt-2 max-w-3xl text-sm text-gray-700 md:text-base">
              Acompanhe as ações, visitas e agendas de {siteTitle} pelo estado do Piauí.
            </p>
          </div>
          <ActionMapStats stats={stats} />
          <ActionMapTimeline
            years={years}
            selectedYear={filters.year}
            onSelect={(year) => setFilters((current) => ({ ...current, year }))}
          />
          <ActionMapFilters
            filters={filters}
            years={years}
            cities={cities}
            categories={categories}
            onChange={setFilters}
          />
        </div>
      </section>

      <section className="container-site py-4 md:py-6">
        <div className="action-map-layout">
          <div className="action-map-canvas-wrap">
            <ActionMapCanvas
              visits={filteredVisits}
              selectedVisitId={selectedVisit?.id || null}
              popupVisit={popupVisit}
              focusVisit={focusVisit}
              onSelectVisit={openVisit}
              onPopupVisit={setPopupVisit}
            />
          </div>

          <aside className="action-map-sidebar hidden md:flex">
            {selectedVisit ? (
              <ActionMapDetailPanel visit={selectedVisit} news={news} onClose={closeVisit} />
            ) : (
              <div className="flex h-full flex-col justify-center rounded-l-2xl border border-dashed border-gray-200 bg-white p-8 text-center text-gray-600">
                <p className="text-lg font-semibold text-gray-800">Selecione uma ação no mapa</p>
                <p className="mt-2 text-sm">
                  Clique em um pin para ver detalhes, galeria e links relacionados.
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <ActionMapBottomSheet
        visit={selectedVisit}
        news={news}
        onClose={closeVisit}
      />
    </div>
  );
}
