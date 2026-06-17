"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LocateFixed, Minus, Plus } from "lucide-react";
import {
  ACTION_MAP_IMAGE_ASPECT,
  formatActionDate,
  resolveVisitCanvasPosition,
} from "@/lib/action-map";
import {
  MAP_MUNICIPALITY_LABELS,
  getVisibleMunicipalityLabels,
} from "@/lib/action-map-municipalities";
import type { ActionVisit } from "@/lib/types";

const MIN_ZOOM = 1;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.2;

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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(
    null
  );

  const plottedVisits = useMemo(
    () =>
      visits.map((visit) => ({
        visit,
        point: resolveVisitCanvasPosition(visit),
      })),
    [visits]
  );
  const journeyVisitId = journeyActive ? chronologyVisits[journeyIndex]?.id : null;
  const visibleLabels = useMemo(
    () => getVisibleMunicipalityLabels(MAP_MUNICIPALITY_LABELS, zoom),
    [zoom]
  );

  const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

  const handleZoom = useCallback((delta: number) => {
    setZoom((current) => clampZoom(Number((current + delta).toFixed(2))));
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (zoom <= 1) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div className="action-map-stage relative h-full min-h-[min(72vh,820px)] w-full overflow-hidden">
      <div className="action-map-topo absolute inset-0" aria-hidden />

      <div className="relative flex h-full w-full items-center justify-center px-2 py-3 sm:px-4 sm:py-5">
        <div
          className="relative w-full max-w-[min(100%,1180px)] touch-none"
          style={{ aspectRatio: ACTION_MAP_IMAGE_ASPECT }}
          onWheel={(event) => {
            event.preventDefault();
            handleZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
          }}
        >
          <div
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
              transition: dragRef.current ? "none" : "transform 0.25s ease",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => {
              if (popupVisit) onMapBackgroundClick();
            }}
            role="presentation"
          >
            <div className="relative h-full w-full">
              <Image
                src={mapImage}
                alt="Mapa institucional do Piauí"
                fill
                className="pointer-events-none object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)]"
                sizes="(max-width: 1024px) 100vw, 75vw"
                priority
                unoptimized
              />

              {visibleLabels.map((label) => (
                <span
                  key={label.name}
                  className="pointer-events-none absolute z-[1] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-semibold text-[10px] text-slate-800 sm:text-[11px] md:text-xs"
                  style={{
                    left: `${label.x}%`,
                    top: `${label.y}%`,
                    fontFamily: "var(--font-heading)",
                    textShadow:
                      "0 0 6px #fff, 0 0 10px #fff, 0 1px 2px rgba(255,255,255,0.95)",
                  }}
                >
                  {label.name}
                </span>
              ))}

              {plottedVisits.map(({ visit, point }) => {
                const isSelected = selectedVisitId === visit.id || journeyVisitId === visit.id;
                const isHovered = popupVisit?.id === visit.id;
                return (
                  <button
                    key={visit.id}
                    type="button"
                    className="group absolute z-10"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      transform: "translate(-50%, calc(-100% + 4px))",
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPopupVisit(visit);
                      onSelectVisit(visit);
                    }}
                    aria-label={`Ver ação em ${visit.city}`}
                  >
                    <span className="relative flex h-9 w-9 items-center justify-center md:h-10 md:w-10">
                      {(isSelected || isHovered) && (
                        <motion.span
                          className="absolute inset-0 rounded-full bg-[#e11d48]/25"
                          animate={{ scale: [1, 1.55, 1], opacity: [0.55, 0.12, 0.55] }}
                          transition={{ duration: 1.6, repeat: Infinity }}
                        />
                      )}
                      <span
                        className="relative text-2xl leading-none transition-transform duration-200 group-hover:scale-125 md:text-[28px]"
                        style={{
                          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.25))",
                          transform: isSelected ? "scale(1.15)" : undefined,
                        }}
                        aria-hidden
                      >
                        📍
                      </span>
                    </span>

                    <span className="pointer-events-none absolute left-1/2 top-0 z-20 hidden -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-xl border border-slate-200/80 bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg backdrop-blur group-hover:block">
                      {visit.city}
                    </span>
                  </button>
                );
              })}

              <AnimatePresence>
                {popupVisit && !journeyActive && !showHeatmap && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    className="absolute z-30 w-[min(260px,calc(100vw-2.5rem))] -translate-x-1/2 rounded-[20px] border border-slate-200/80 bg-white/95 p-4 text-slate-900 shadow-2xl backdrop-blur"
                    style={{
                      left: `${resolveVisitCanvasPosition(popupVisit).x}%`,
                      top: `calc(${resolveVisitCanvasPosition(popupVisit).y}% - 64px)`,
                    }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => onMapBackgroundClick()}
                      aria-label="Fechar"
                    >
                      ×
                    </button>
                    <p className="pr-8 text-[11px] font-semibold uppercase tracking-wide text-[#0071B7]">
                      {popupVisit.city}
                    </p>
                    <p className="mt-1 text-sm font-bold leading-snug">{popupVisit.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatActionDate(popupVisit.date)}</p>
                    <p className="mt-2 line-clamp-2 text-xs text-slate-600">{popupVisit.excerpt}</p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl bg-[#0071B7] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#005f9a]"
                      onClick={() => onSelectVisit(popupVisit)}
                    >
                      Ver detalhes
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => handleZoom(ZOOM_STEP)}
          className="action-map-zoom-btn"
          aria-label="Aumentar zoom"
        >
          <Plus size={16} />
        </button>
        <button
          type="button"
          onClick={() => handleZoom(-ZOOM_STEP)}
          className="action-map-zoom-btn"
          aria-label="Diminuir zoom"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={resetView}
          className="action-map-zoom-btn"
          aria-label="Centralizar mapa"
        >
          <LocateFixed size={16} />
        </button>
      </div>

      {!showHeatmap && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-[14px] border border-slate-200/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-md backdrop-blur">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <span aria-hidden>📍</span>
            Ação realizada
          </span>
        </div>
      )}
    </div>
  );
}
