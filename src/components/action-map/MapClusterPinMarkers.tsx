"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Marker, type MapRef } from "react-map-gl/mapbox";
import type { RefObject } from "react";
import { CLUSTER_SOURCE_ID } from "@/lib/map-cluster";
import { getVisitDisplayCoordinate } from "@/lib/map-pin-spread";
import ActionMapPinMarker from "./ActionMapPinMarker";

interface MapClusterPinMarkersProps<T extends { id: string; latitude: number; longitude: number }> {
  mapRef: RefObject<MapRef | null>;
  visits: T[];
  spreadCoords: Map<string, { latitude: number; longitude: number }>;
  selectedVisitId?: string | null;
  getLabel?: (visit: T, isSelected: boolean) => string | undefined;
  onVisitClick: (visit: T) => void;
}

export default function MapClusterPinMarkers<T extends { id: string; latitude: number; longitude: number }>({
  mapRef,
  visits,
  spreadCoords,
  selectedVisitId,
  getLabel,
  onVisitClick,
}: MapClusterPinMarkersProps<T>) {
  const [unclusteredIds, setUnclusteredIds] = useState<string[]>([]);
  const visitById = useMemo(() => new Map(visits.map((v) => [v.id, v])), [visits]);

  const refreshUnclustered = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map?.isSourceLoaded(CLUSTER_SOURCE_ID)) return;

    const features = map.querySourceFeatures(CLUSTER_SOURCE_ID, {
      filter: ["!", ["has", "point_count"]],
    });

    const seen = new Set<string>();
    for (const feature of features) {
      const visitId = feature.properties?.visitId as string | undefined;
      if (visitId) seen.add(visitId);
    }

    setUnclusteredIds((prev) => {
      const next = Array.from(seen).sort();
      if (prev.length === next.length && prev.every((id, i) => id === next[i])) return prev;
      return next;
    });
  }, [mapRef]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const handleUpdate = () => refreshUnclustered();
    map.on("moveend", handleUpdate);
    map.on("zoomend", handleUpdate);
    map.on("sourcedata", handleUpdate);
    handleUpdate();

    return () => {
      map.off("moveend", handleUpdate);
      map.off("zoomend", handleUpdate);
      map.off("sourcedata", handleUpdate);
    };
  }, [mapRef, refreshUnclustered, visits]);

  return (
    <>
      {unclusteredIds.map((id) => {
        const visit = visitById.get(id);
        if (!visit) return null;

        const coords = getVisitDisplayCoordinate(visit, spreadCoords);
        const isSelected = id === selectedVisitId;
        const label = getLabel?.(visit, isSelected);

        return (
          <Marker
            key={id}
            longitude={coords.longitude}
            latitude={coords.latitude}
            anchor="bottom"
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onVisitClick(visit);
              }}
              className="border-0 bg-transparent p-0"
            >
              <ActionMapPinMarker
                selected={isSelected}
                size={isSelected ? 48 : 42}
                label={label}
              />
            </button>
          </Marker>
        );
      })}
    </>
  );
}
