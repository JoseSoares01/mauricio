"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";
import { motion, AnimatePresence } from "framer-motion";
import { Info, MapPin } from "lucide-react";
import type { TeresinaVisit } from "@/lib/types";
import "mapbox-gl/dist/mapbox-gl.css";

interface TeresinaMapCanvasProps {
  visits: TeresinaVisit[];
  selectedVisitId: string | null;
  onSelectVisit: (visit: TeresinaVisit) => void;
  onCloseVisit: () => void;
  mobileView?: "list" | "map";
}

const TERESINA_CENTER = {
  latitude: -5.0892,
  longitude: -42.8019,
};

// Limites geográficos aproximados de Teresina para o mapeamento SVG
const MAP_BOUNDS = {
  minLat: -5.1650,
  maxLat: -5.0250,
  minLng: -42.8450,
  maxLng: -42.7350,
};

// Classe do Error Boundary para capturar falhas no Mapbox (como falha no WebGL)
class MapErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    console.error("Mapbox render error:", error);
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("MapErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function TeresinaMapCanvas({
  visits,
  selectedVisitId,
  onSelectVisit,
  onCloseVisit,
  mobileView,
}: TeresinaMapCanvasProps) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    ...TERESINA_CENTER,
    zoom: 12.2,
    pitch: 0,
    bearing: 0,
  });

  // Forçar redimensionamento do Mapbox ao alternar para aba "mapa" no mobile
  useEffect(() => {
    if (mobileView === "map" && mapRef.current) {
      const timer = setTimeout(() => {
        mapRef.current?.resize();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mobileView]);

  const selectedVisit = useMemo(
    () => visits.find((v) => v.id === selectedVisitId) || null,
    [visits, selectedVisitId]
  );

  // Mapeamento lat/lng para coordenadas percentuais SVG
  const plottedVisits = useMemo(() => {
    return visits.map((visit) => {
      const latRange = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
      const lngRange = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;
      // y vai de cima para baixo
      const y = ((MAP_BOUNDS.maxLat - visit.latitude) / latRange) * 100;
      const x = ((visit.longitude - MAP_BOUNDS.minLng) / lngRange) * 100;
      return {
        visit,
        x: Math.max(5, Math.min(95, x)),
        y: Math.max(5, Math.min(95, y)),
      };
    });
  }, [visits]);

  // Função para renderizar o fallback vetorial em SVG
  const renderSvgFallback = (isError = false) => {
    return (
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/60 shadow-inner">
        {/* Aviso instrutivo sobre o Token do Mapbox */}
        <div className="absolute left-4 top-4 z-20 flex max-w-sm gap-2.5 rounded-xl border border-blue-100 bg-white/95 p-3 shadow-md backdrop-blur">
          <Info className="h-5 w-5 shrink-0 text-blue-500" />
          <div className="text-xs text-slate-600">
            <p className="font-bold text-slate-800">
              {isError ? "Modo de Segurança (Mapa Vetorial)" : "Modo Local (Mapa Vetorial)"}
            </p>
            <p className="mt-0.5">
              {isError 
                ? "Erro ao inicializar o mapa Mapbox GL. Exibindo mapa vetorial alternativo."
                : "Configure a variável NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN para habilitar o mapa de satélite/ruas completo."}
            </p>
          </div>
        </div>

        {/* SVG Arte de Teresina - Rios Parnaíba e Poti */}
        <div className="absolute inset-0 z-0 select-none">
          <svg className="h-full w-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0071B7" stopOpacity="0.04" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100" height="100" fill="url(#bg-glow)" />

            {/* Rio Parnaíba (Margem esquerda - Oeste) */}
            <path
              d="M 10 100 C 12 80, 25 60, 23 45 C 21 30, 29 15, 32 0"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="animate-[dash_10s_linear_infinite]"
            />

            {/* Rio Poti (Atravessa a cidade de Leste/Sul para Norte e encontra o Parnaíba) */}
            <path
              d="M 100 75 C 75 80, 60 62, 52 50 C 44 38, 38 35, 30 25 C 27 20, 24 12, 28 0"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2.0"
              strokeLinecap="round"
            />

            {/* Grades sutis pontilhadas */}
            <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="25" y1="0" x2="25" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#e2e8f0" strokeDasharray="3 3" />
          </svg>

          {/* Rótulos de Zonas */}
          <div className="absolute left-[38%] top-[12%] text-[9px] font-bold tracking-widest text-slate-400">ZONA NORTE</div>
          <div className="absolute left-[65%] top-[35%] text-[9px] font-bold tracking-widest text-slate-400">ZONA LESTE</div>
          <div className="absolute left-[34%] top-[48%] text-[9px] font-bold tracking-widest text-slate-400">CENTRO</div>
          <div className="absolute left-[20%] top-[72%] text-[9px] font-bold tracking-widest text-slate-400">ZONA SUL</div>
          <div className="absolute left-[68%] top-[78%] text-[9px] font-bold tracking-widest text-slate-400">ZONA SUDESTE</div>
        </div>

        {/* Roteador de Pins no SVG */}
        <div className="absolute inset-0 z-10">
          {plottedVisits.map(({ visit, x, y }) => {
            const isSelected = visit.id === selectedVisitId;
            return (
              <div
                key={visit.id}
                className="absolute -translate-x-1/2 -translate-y-[calc(100%-4px)]"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectVisit(visit);
                  }}
                  className="group relative flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      scale: isSelected ? 1.15 : 1,
                      y: isSelected ? -4 : 0,
                    }}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-semibold shadow-md transition-all border ${
                      isSelected
                        ? "bg-[#e11d48] border-[#e11d48] text-white z-20"
                        : "bg-white/95 border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:scale-105 z-10"
                    }`}
                  >
                    <MapPin size={11} className={isSelected ? "text-white" : "text-[#e11d48]"} />
                    <span>{visit.neighborhood}</span>
                  </motion.div>
                  <div
                    className={`h-1.5 w-1.5 rotate-45 -mt-1 border-r border-b ${
                      isSelected
                        ? "bg-[#e11d48] border-[#e11d48]"
                        : "bg-white border-slate-200"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>

        {/* Popover / Popup flutuante para o Fallback */}
        <AnimatePresence>
          {selectedVisit && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-4 left-4 right-4 z-20 mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur sm:bottom-auto sm:left-auto sm:right-6 sm:top-20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  type="button"
                  onClick={onCloseVisit}
                  className="absolute right-0.5 top-0.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60"
                  aria-label="Fechar popup"
                >
                  &times;
                </button>
                <img
                  src={selectedVisit.image}
                  alt={selectedVisit.title}
                  className="h-32 w-full rounded-xl object-cover"
                />
                <div className="mt-2.5">
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                    {selectedVisit.category}
                  </span>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 leading-tight">
                    {selectedVisit.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                    {selectedVisit.excerpt}
                  </p>
                  {selectedVisit.indicators && (
                    <div className="mt-2.5 border-t border-slate-100 pt-2 grid grid-cols-2 gap-2">
                      {Object.entries(selectedVisit.indicators).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">{key}</p>
                          <p className="text-xs font-bold text-slate-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Se houver token do Mapbox, renderiza o mapa geográfico interativo real embrulhado no Error Boundary
  if (token) {
    return (
      <MapErrorBoundary fallback={renderSvgFallback(true)}>
        <div className="relative h-full w-full overflow-hidden rounded-2xl bg-slate-100 shadow-inner">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            mapboxAccessToken={token}
            mapStyle="mapbox://styles/mapbox/light-v11"
            style={{ width: "100%", height: "100%" }}
          >
            {visits.map((visit) => {
              const isSelected = visit.id === selectedVisitId;
              return (
                <Marker
                  key={visit.id}
                  latitude={visit.latitude}
                  longitude={visit.longitude}
                  anchor="bottom"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVisit(visit);
                    }}
                    className="group relative flex flex-col items-center"
                  >
                    <motion.div
                      animate={{
                        scale: isSelected ? 1.18 : 1,
                        y: isSelected ? -4 : 0,
                      }}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-colors border ${
                        isSelected
                          ? "bg-[#e11d48] border-[#e11d48] text-white z-20"
                          : "bg-white border-slate-200 text-slate-800 hover:bg-slate-50 z-10"
                      }`}
                    >
                      <MapPin size={12} className={isSelected ? "text-white" : "text-[#e11d48]"} />
                      <span>{visit.neighborhood}</span>
                    </motion.div>
                    <div
                      className={`h-2 w-2 rotate-45 -mt-1 border-r border-b shadow-sm ${
                        isSelected
                          ? "bg-[#e11d48] border-[#e11d48]"
                          : "bg-white border-slate-200"
                      }`}
                    />
                  </button>
                </Marker>
              );
            })}

            {selectedVisit && (
              <Popup
                latitude={selectedVisit.latitude}
                longitude={selectedVisit.longitude}
                anchor="top"
                offset={10}
                onClose={onCloseVisit}
                closeButton={false}
                className="z-30 w-72 rounded-2xl"
              >
                <div className="p-1.5" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={selectedVisit.image}
                    alt={selectedVisit.title}
                    className="h-28 w-full rounded-xl object-cover"
                  />
                  <div className="mt-2.5">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {selectedVisit.category}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-slate-900 leading-tight">
                      {selectedVisit.title}
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                      {selectedVisit.excerpt}
                    </p>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
        </div>
      </MapErrorBoundary>
    );
  }

  // Se o token Mapbox for ausente desde o início, renderiza o fallback SVG normal
  return renderSvgFallback(false);
}
