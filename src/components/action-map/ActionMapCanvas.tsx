"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import Map, {
  Layer,
  NavigationControl,
  Popup,
  Source,
  type MapMouseEvent,
  type MapRef,
} from "react-map-gl/mapbox";
import type { GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import {
  ACTION_MAP_COLORS,
  PIAUI_VIEW,
  formatActionDate,
  visitsToGeoJSON,
} from "@/lib/action-map";
import type { ActionVisit } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

const CLUSTER_LAYER_ID = "action-clusters";
const POINT_LAYER_ID = "action-unclustered-point";

function routesToGeoJSON(visits: ActionVisit[]) {
  return {
    type: "FeatureCollection" as const,
    features: visits
      .filter((visit) => visit.status === "agendada" && (visit.routePoints?.length || 0) >= 2)
      .map((visit) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: visit.routePoints!.map((point) => [point.longitude, point.latitude]),
        },
        properties: { visitId: visit.id },
      })),
  };
}

interface ActionMapCanvasProps {
  visits: ActionVisit[];
  selectedVisitId: string | null;
  popupVisit: ActionVisit | null;
  focusVisit: ActionVisit | null;
  onSelectVisit: (visit: ActionVisit) => void;
  onPopupVisit: (visit: ActionVisit | null) => void;
}

export default function ActionMapCanvas({
  visits,
  selectedVisitId,
  popupVisit,
  focusVisit,
  onSelectVisit,
  onPopupVisit,
}: ActionMapCanvasProps) {
  const mapRef = useRef<MapRef>(null);
  const geojson = useMemo(() => visitsToGeoJSON(visits), [visits]);
  const routesGeojson = useMemo(() => routesToGeoJSON(visits), [visits]);

  useEffect(() => {
    if (!focusVisit) return;
    mapRef.current?.flyTo({
      center: [focusVisit.longitude, focusVisit.latitude],
      zoom: 9.5,
      pitch: 50,
      bearing: -15,
      duration: 1200,
      essential: true,
    });
  }, [focusVisit]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) {
        onPopupVisit(null);
        return;
      }

      const map = mapRef.current?.getMap();
      if (!map) return;

      if (feature.properties?.cluster_id != null) {
        const clusterId = feature.properties.cluster_id as number;
        const source = map.getSource("action-visits") as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error || zoom == null) return;
          map.easeTo({ center: [event.lngLat.lng, event.lngLat.lat], zoom, duration: 500 });
        });
        return;
      }

      const visit = visits.find((item) => item.id === feature.properties?.visitId);
      if (visit) {
        onPopupVisit(visit);
        onSelectVisit(visit);
      }
    },
    [onPopupVisit, onSelectVisit, visits]
  );

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <div>
          <p className="font-semibold text-gray-800">Mapa indisponível</p>
          <p className="mt-2 text-sm text-gray-600">
            Configure a variável <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code> na Vercel para ativar o
            mapa interativo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-xl md:rounded-2xl">
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={PIAUI_VIEW}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={[CLUSTER_LAYER_ID, POINT_LAYER_ID]}
        onClick={handleMapClick}
        attributionControl={false}
        reuseMaps
      >
        <NavigationControl position="top-right" visualizePitch />

        <Source
          id="action-visits"
          type="geojson"
          data={geojson}
          cluster
          clusterMaxZoom={12}
          clusterRadius={50}
        >
          <Layer
            id={CLUSTER_LAYER_ID}
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": ACTION_MAP_COLORS.cluster,
              "circle-radius": ["step", ["get", "point_count"], 18, 8, 24, 20, 30],
              "circle-opacity": 0.9,
            }}
          />
          <Layer
            id="action-cluster-count"
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": "{point_count_abbreviated}",
              "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
              "text-size": 12,
            }}
            paint={{ "text-color": "#ffffff" }}
          />
          <Layer
            id={POINT_LAYER_ID}
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": [
                "match",
                ["get", "status"],
                "agendada",
                ACTION_MAP_COLORS.agendada,
                ACTION_MAP_COLORS.realizada,
              ],
              "circle-radius": [
                "case",
                ["==", ["get", "visitId"], selectedVisitId || ""],
                13,
                10,
              ],
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>

        {routesGeojson.features.length > 0 && (
          <Source id="action-routes" type="geojson" data={routesGeojson}>
            <Layer
              id="action-routes"
              type="line"
              paint={{
                "line-color": ACTION_MAP_COLORS.agendada,
                "line-width": 3,
                "line-opacity": 0.75,
                "line-dasharray": [2, 2],
              }}
            />
          </Source>
        )}

        {popupVisit && (
          <Popup
            longitude={popupVisit.longitude}
            latitude={popupVisit.latitude}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => onPopupVisit(null)}
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

      <div className="pointer-events-none absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs shadow-md backdrop-blur">
        <span className="mr-3 inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACTION_MAP_COLORS.realizada }} />
          Realizada
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: ACTION_MAP_COLORS.agendada }} />
          Agendada
        </span>
      </div>
    </div>
  );
}
