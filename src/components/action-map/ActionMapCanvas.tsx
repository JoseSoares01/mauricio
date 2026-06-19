"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Popup,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import {
  ACTION_MAP_COLORS,
  ACTION_MAP_PIN_SRC,
  PIAUI_BOUNDS,
  PIAUI_VIEW,
  citiesHeatmapToGeoJSON,
  formatActionDate,
  journeyPathToGeoJSON,
} from "@/lib/action-map";
import {
  createPiauiOutsideMaskGeoJSON,
  getPiauiBorderGeoJSON,
  getPiauiBBox,
} from "@/lib/piaui-boundary";
import type { ActionVisit } from "@/lib/types";
import ActionMapPinMarker from "./ActionMapPinMarker";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const PIAUI_MASK_COLOR = "#f6f8fb";

interface ActionMapCanvasProps {
  visits: ActionVisit[];
  mapImage?: string;
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
  selectedVisitId,
  popupVisit,
  focusVisit,
  showHeatmap,
  journeyActive,
  journeyIndex,
  chronologyVisits,
  onSelectVisit,
  onPopupVisit,
  onMapBackgroundClick,
}: ActionMapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const piauiMaskGeojson = useMemo(() => createPiauiOutsideMaskGeoJSON(), []);
  const piauiBorderGeojson = useMemo(() => getPiauiBorderGeoJSON(), []);
  const piauiFitBounds = useMemo(() => getPiauiBBox(0.04), []);
  const heatmapGeojson = useMemo(() => citiesHeatmapToGeoJSON(visits), [visits]);
  const journeyGeojson = useMemo(
    () => journeyPathToGeoJSON(chronologyVisits, journeyIndex),
    [chronologyVisits, journeyIndex]
  );

  const journeyVisit = journeyActive ? chronologyVisits[journeyIndex] : null;

  const fitPiauiBounds = useCallback(() => {
    mapRef.current?.fitBounds(piauiFitBounds, {
      padding: { top: 24, bottom: 24, left: 24, right: 24 },
      pitch: PIAUI_VIEW.pitch,
      bearing: PIAUI_VIEW.bearing,
      duration: 0,
    });
  }, [piauiFitBounds]);

  const handleMapLoad = useCallback(() => {
    fitPiauiBounds();
  }, [fitPiauiBounds]);

  useEffect(() => {
    if (!focusVisit) return;
    mapRef.current?.flyTo({
      center: [focusVisit.longitude, focusVisit.latitude],
      zoom: journeyActive ? 8.2 : 9.5,
      pitch: 50,
      bearing: journeyActive ? -20 : -15,
      duration: journeyActive ? 1800 : 1200,
      essential: true,
    });
  }, [focusVisit, journeyActive]);

  useEffect(() => {
    if (focusVisit) return;
    fitPiauiBounds();
  }, [focusVisit, fitPiauiBounds]);

  useEffect(() => {
    const timer = window.setTimeout(() => mapRef.current?.resize(), 120);
    return () => window.clearTimeout(timer);
  }, []);

  const handleMapClick = useCallback(() => {
    if (journeyActive || showHeatmap) return;
    if (popupVisit) onMapBackgroundClick();
    else onPopupVisit(null);
  }, [journeyActive, onMapBackgroundClick, onPopupVisit, popupVisit, showHeatmap]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="action-map-stage flex h-full min-h-[min(72vh,820px)] w-full items-center justify-center p-6">
        <div className="max-w-md rounded-[20px] border border-dashed border-slate-300 bg-white/90 p-6 text-center shadow-sm">
          <p className="font-semibold text-slate-800">Mapa indisponível</p>
          <p className="mt-2 text-sm text-slate-600">
            Configure a variável <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> para ativar o mapa
            interativo do Piauí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="action-map-stage relative h-full min-h-[min(72vh,820px)] w-full overflow-hidden">
      <div className="action-map-topo absolute inset-0" aria-hidden />

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={PIAUI_VIEW}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        maxBounds={PIAUI_BOUNDS}
        minZoom={7.15}
        maxZoom={12}
        dragRotate={false}
        touchPitch={false}
        interactiveLayerIds={[]}
        onClick={handleMapClick}
        onLoad={handleMapLoad}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="bottom-left" showCompass={false} />

        <Source id="piaui-mask" type="geojson" data={piauiMaskGeojson}>
          <Layer
            id="piaui-outside-mask"
            type="fill"
            paint={{
              "fill-color": PIAUI_MASK_COLOR,
              "fill-opacity": 1,
            }}
          />
        </Source>

        {showHeatmap && (
          <Source id="action-heatmap" type="geojson" data={heatmapGeojson}>
            <Layer
              id="action-heatmap-layer"
              type="heatmap"
              paint={{
                "heatmap-weight": ["get", "weight"],
                "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 9, 1.4],
                "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 6, 36, 9, 56],
                "heatmap-opacity": 0.75,
                "heatmap-color": [
                  "interpolate",
                  ["linear"],
                  ["heatmap-density"],
                  0,
                  "rgba(18, 149, 71, 0)",
                  0.25,
                  "rgba(18, 149, 71, 0.35)",
                  0.55,
                  "rgba(18, 149, 71, 0.62)",
                  1,
                  "rgba(18, 149, 71, 0.95)",
                ],
              }}
            />
            <Layer
              id="action-heatmap-cities"
              type="circle"
              paint={{
                "circle-color": ACTION_MAP_COLORS.realizada,
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["get", "weight"],
                  1,
                  14,
                  4,
                  28,
                ],
                "circle-opacity": 0.55,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
              }}
            />
            <Layer
              id="action-heatmap-labels"
              type="symbol"
              layout={{
                "text-field": ["concat", ["get", "city"], " (", ["to-string", ["get", "weight"]], ")"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 11,
                "text-offset": [0, 1.6],
                "text-anchor": "top",
              }}
              paint={{
                "text-color": "#1f2937",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
              }}
            />
          </Source>
        )}

        {!showHeatmap &&
          visits.map((visit) => {
            const isSelected = visit.id === selectedVisitId;
            const isJourneyCurrent = journeyActive && journeyVisit?.id === visit.id;
            if (isJourneyCurrent) return null;

            return (
              <Marker
                key={visit.id}
                longitude={visit.longitude}
                latitude={visit.latitude}
                anchor="bottom"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (journeyActive) return;
                    onPopupVisit(visit);
                    onSelectVisit(visit);
                  }}
                  className={`border-0 bg-transparent p-0 ${journeyActive ? "pointer-events-none opacity-45" : ""}`}
                >
                  <ActionMapPinMarker
                    selected={isSelected && !journeyActive}
                    size={isSelected ? 48 : 42}
                    label={isSelected && !journeyActive ? visit.city : undefined}
                  />
                </button>
              </Marker>
            );
          })}

        {journeyActive && journeyGeojson.features.length > 0 && (
          <Source id="action-journey-path" type="geojson" data={journeyGeojson}>
            <Layer
              id="action-journey-path-layer"
              type="line"
              paint={{
                "line-color": "#0071B7",
                "line-width": 4,
                "line-opacity": 0.85,
              }}
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
            />
          </Source>
        )}

        <Source id="piaui-border" type="geojson" data={piauiBorderGeojson}>
          <Layer
            id="piaui-border-line"
            type="line"
            paint={{
              "line-color": ACTION_MAP_COLORS.realizada,
              "line-width": 2.5,
              "line-opacity": 0.9,
            }}
          />
        </Source>

        {journeyVisit && (
          <Marker
            longitude={journeyVisit.longitude}
            latitude={journeyVisit.latitude}
            anchor="bottom"
            offset={[0, 0]}
          >
            <ActionMapPinMarker pulsing size={52} />
          </Marker>
        )}

        {popupVisit && !journeyActive && !showHeatmap && (
          <Popup
            longitude={popupVisit.longitude}
            latitude={popupVisit.latitude}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => onMapBackgroundClick()}
            className="action-map-popup"
            maxWidth="280px"
          >
            <div className="p-1">
              {popupVisit.image && (
                <div className="relative mb-2 h-28 w-full overflow-hidden rounded-lg">
                  <Image
                    src={popupVisit.image}
                    alt={popupVisit.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                    unoptimized
                  />
                </div>
              )}
              <p className="text-xs font-semibold uppercase text-[#0071B7]">{popupVisit.city}</p>
              <p className="text-sm font-bold text-gray-900">{popupVisit.title}</p>
              <p className="mt-1 text-xs text-gray-600">{formatActionDate(popupVisit.date)}</p>
              <p className="mt-2 line-clamp-2 text-xs text-gray-700">{popupVisit.excerpt}</p>
              <button
                type="button"
                className="mt-3 w-full rounded-lg bg-[#0071B7] px-3 py-2 text-xs font-semibold text-white"
                onClick={() => onSelectVisit(popupVisit)}
              >
                Ver detalhes
              </button>
            </div>
          </Popup>
        )}
      </Map>

      <div className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-[14px] border border-slate-200/70 bg-white/90 px-3 py-2 text-[11px] text-slate-600 shadow-md backdrop-blur">
        {showHeatmap ? (
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-8 rounded-full bg-gradient-to-r from-green-200 to-green-700" />
            Maior concentração de ações realizadas
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Image
              src={ACTION_MAP_PIN_SRC}
              alt=""
              width={18}
              height={18}
              className="drop-shadow-sm"
              unoptimized
            />
            Ação realizada
          </span>
        )}
      </div>
    </div>
  );
}
