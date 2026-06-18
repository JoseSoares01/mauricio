"use client";

import { useMemo, useState } from "react";
import { Map as MapIcon, List, Calendar, Tag, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TeresinaVisit } from "@/lib/types";
import dynamic from "next/dynamic";
import { formatActionDate } from "@/lib/action-map";

const TeresinaMapCanvas = dynamic(
  () => import("./TeresinaMapCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center text-sm text-slate-[#0071B7] font-semibold">
        Carregando mapa de Teresina...
      </div>
    ),
  }
);

interface TeresinaMapSectionProps {
  visits: TeresinaVisit[];
}

export default function TeresinaMapSection({ visits }: TeresinaMapSectionProps) {
  console.log("=== DEBUG TERESINA VISITS ===", visits?.length, visits);
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId]
  );

  // Estatísticas rápidas de Teresina
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
    if (window.innerWidth < 1024) {
      setMobileView("map");
    }
  };

  return (
    <div className="relative flex flex-col lg:flex-row h-full min-h-[min(78vh,860px)] w-full gap-0 overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-lg backdrop-blur">
      
      {/* PAINEL DA ESQUERDA: LISTA DE BAIRROS (Oculto no mobile se mobileView === "map") */}
      <div
        className={`flex flex-col h-[650px] lg:h-auto lg:w-[40%] border-r border-slate-100 bg-white transition-opacity duration-300 ${
          mobileView === "map"
            ? "pointer-events-none opacity-0 absolute inset-0 lg:pointer-events-auto lg:opacity-100 lg:relative lg:flex"
            : "relative w-full lg:w-[40%] flex"
        }`}
      >
        {/* Cabeçalho da Lista e Stats */}
        <div className="border-b border-slate-100 p-4 sm:p-5 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800" style={{ fontFamily: "var(--font-heading)" }}>
            Atuação por Bairro ({stats.totalVisits})
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Veja as ações sociais e vistorias executadas em Teresina.
          </p>

          {/* Cards de Métricas */}
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-slate-200/70 bg-white p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ações</span>
              <p className="mt-0.5 text-base font-extrabold text-[#0071B7]">{stats.totalVisits}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bairros</span>
              <p className="mt-0.5 text-base font-extrabold text-[#129547]">{stats.bairrosCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200/70 bg-white p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Áreas</span>
              <p className="mt-0.5 text-base font-extrabold text-amber-500">{stats.categoriesCount}</p>
            </div>
          </div>
        </div>

        {/* Lista Rolável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
          {visits.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Nenhuma atuação cadastrada em Teresina.
            </div>
          ) : (
            visits.map((visit) => {
              const isSelected = visit.id === selectedVisitId;
              return (
                <div
                  key={visit.id}
                  onClick={() => handleSelectVisit(visit)}
                  className={`group cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 hover:shadow-md ${
                    isSelected
                      ? "border-[#0071B7] bg-[#0071B7]/5 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={visit.image}
                      alt={visit.title}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover border border-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                          {visit.neighborhood}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Calendar size={10} />
                          {formatActionDate(visit.date)}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-800 line-clamp-1 leading-tight group-hover:text-[#0071B7] transition-colors">
                        {visit.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {visit.excerpt}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* PAINEL DA DIREITA: MAPA (Oculto no mobile se mobileView === "list") */}
      <div
        className={`relative flex-1 min-h-[450px] lg:min-h-0 h-[650px] lg:h-auto transition-opacity duration-300 ${
          mobileView === "list"
            ? "pointer-events-none opacity-0 absolute inset-0 lg:pointer-events-auto lg:opacity-100 lg:relative lg:block"
            : "relative w-full lg:flex-1 block"
        }`}
      >
        <TeresinaMapCanvas
          visits={visits}
          selectedVisitId={selectedVisitId}
          onSelectVisit={(visit) => setSelectedVisitId(visit.id)}
          onCloseVisit={() => setSelectedVisitId(null)}
          mobileView={mobileView}
        />

        {/* Card deslizante inferior no celular quando uma visita é selecionada */}
        <AnimatePresence>
          {selectedVisit && mobileView === "map" && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 z-20 mx-auto rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xl backdrop-blur lg:hidden"
            >
              <div className="flex gap-3">
                <img
                  src={selectedVisit.image}
                  alt={selectedVisit.title}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                      {selectedVisit.neighborhood}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedVisitId(null)}
                      className="text-slate-400 hover:text-slate-600 text-sm font-bold px-1"
                    >
                      &times;
                    </button>
                  </div>
                  <h3 className="mt-1 text-xs font-bold text-slate-800 line-clamp-1">
                    {selectedVisit.title}
                  </h3>
                  <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-2">
                    {selectedVisit.excerpt}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* BOTAO FLUTUANTE MOBILE (Alternar lista / mapa) */}
      <button
        type="button"
        onClick={() => setMobileView((curr) => (curr === "list" ? "map" : "list"))}
        className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:scale-105 active:scale-95 transition lg:hidden"
      >
        {mobileView === "list" ? (
          <>
            <MapIcon size={16} />
            <span>Ver Mapa</span>
          </>
        ) : (
          <>
            <List size={16} />
            <span>Ver Lista</span>
          </>
        )}
      </button>
    </div>
  );
}
