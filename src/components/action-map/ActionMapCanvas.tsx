"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  ACTION_MAP_COLORS,
  ACTION_MAP_IMAGE_ASPECT,
  formatActionDate,
  resolveVisitCanvasPosition,
} from "@/lib/action-map";
import type { ActionVisit } from "@/lib/types";

interface ActionMapCanvasProps {
  visits: ActionVisit[];
  mapImage: string;
  selectedVisitId: string | null;
  popupVisit: ActionVisit | null;
  focusVisit: ActionVisit | null;
  showHeatmap: boolean;
  journeyActive: boolean;
  journeyIndex: number;
  chronologyVisits: ActionVisit[];
  onSelectVisit: (visit: ActionVisit) => void;
  onPopupVisit: (visit: ActionVisit | null) => void;
  onMapBackgroundClick: () => void;
}

export default function ActionMapCanvas({
  visits,
  mapImage,
  selectedVisitId,
  popupVisit,
  focusVisit: _focusVisit,
  showHeatmap,
  journeyActive,
  journeyIndex,
  chronologyVisits,
  onSelectVisit,
  onPopupVisit,
  onMapBackgroundClick,
}: ActionMapCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const plottedVisits = useMemo(
    () =>
      visits.map((visit) => ({
        visit,
        point: resolveVisitCanvasPosition(visit),
      })),
    [visits]
  );
  const journeyVisitId = journeyActive ? chronologyVisits[journeyIndex]?.id : null;

  return (
    <div
      ref={wrapRef}
      className="relative flex h-full min-h-[min(86vh,960px)] w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-white md:rounded-2xl"
    >
      <div
        className="relative mx-auto h-full w-full max-h-full max-w-full cursor-default bg-white"
        style={{
          aspectRatio: ACTION_MAP_IMAGE_ASPECT,
          width: "auto",
          height: "100%",
        }}
        onClick={() => {
          if (popupVisit) onMapBackgroundClick();
        }}
        role="presentation"
      >
        <Image
          src={mapImage}
          alt="Mapa institucional do Piauí"
          fill
          className="pointer-events-none object-contain"
          sizes="(max-width: 768px) 100vw, 85vw"
          priority
          unoptimized
        />

        {plottedVisits.map(({ visit, point }) => {
          const isSelected = selectedVisitId === visit.id || journeyVisitId === visit.id;
          const isFuture = visit.status === "agendada";
          return (
            <button
              key={visit.id}
              type="button"
              className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center p-0 leading-none"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
              onClick={(event) => {
                event.stopPropagation();
                onPopupVisit(visit);
                onSelectVisit(visit);
              }}
              aria-label={`Ver ação em ${visit.city}`}
            >
              {isSelected && (
                <motion.span
                  className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0071B7]/20"
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.1, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                />
              )}
              {isFuture ? (
                <span
                  className="relative block rounded-full border-2 border-white shadow-[0_1px_4px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-125"
                  style={{
                    width: isSelected ? 14 : 12,
                    height: isSelected ? 14 : 12,
                    backgroundColor: ACTION_MAP_COLORS.agendada,
                    transform: isSelected ? "scale(1.15)" : undefined,
                  }}
                  aria-hidden
                />
              ) : (
                <span
                  className="relative block select-none text-[22px] leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform group-hover:scale-110 md:text-2xl"
                  style={{ transform: isSelected ? "scale(1.2)" : undefined }}
                  aria-hidden
                >
                  📍
                </span>
              )}
            </button>
          );
        })}

        {popupVisit && !journeyActive && !showHeatmap && (
          <div
            className="absolute z-20 w-[240px] -translate-x-1/2 rounded-xl border border-gray-200 bg-white p-3 text-gray-900 shadow-2xl"
            style={{
              left: `${resolveVisitCanvasPosition(popupVisit).x}%`,
              top: `calc(${resolveVisitCanvasPosition(popupVisit).y}% - 56px)`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => onMapBackgroundClick()}
              aria-label="Fechar"
            >
              ×
            </button>
            <p className="pr-6 text-xs font-semibold uppercase text-[#0071B7]">{popupVisit.city}</p>
            <p className="mt-1 text-sm font-bold">{popupVisit.title}</p>
            <p className="mt-1 text-xs text-gray-600">{formatActionDate(popupVisit.date)}</p>
            <p className="mt-2 line-clamp-2 text-xs text-gray-500">{popupVisit.excerpt}</p>
            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-[#0071B7] px-3 py-2 text-xs font-semibold text-white"
              onClick={() => onSelectVisit(popupVisit)}
            >
              Ver detalhes
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 text-xs text-gray-700 shadow-md backdrop-blur">
          {showHeatmap ? (
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-8 rounded-full bg-gradient-to-r from-green-200 to-green-700" />
              Maior concentração de ações realizadas
            </span>
          ) : (
            <>
              <span className="mr-3 inline-flex items-center gap-1">
                <span aria-hidden>📍</span>
                Realizada
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: ACTION_MAP_COLORS.agendada }}
                  aria-hidden
                />
                Agendada
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
