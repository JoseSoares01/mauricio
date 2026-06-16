import piauiBoundary from "@/data/piaui-boundary.json";
import type { Feature, FeatureCollection, Polygon, Position } from "geojson";

type Position2D = Position;

export const PIAUI_BOUNDARY_FEATURE = piauiBoundary.features[0] as Feature<Polygon>;

const WORLD_RING: Position2D[] = [
  [-180, -90],
  [180, -90],
  [180, 90],
  [-180, 90],
  [-180, -90],
];

function getOuterRing(): Position2D[] {
  return PIAUI_BOUNDARY_FEATURE.geometry.coordinates[0];
}

export function getPiauiBBox(padding = 0): [[number, number], [number, number]] {
  const ring = getOuterRing();
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of ring) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return [
    [minLng - padding, minLat - padding],
    [maxLng + padding, maxLat + padding],
  ];
}

export function createPiauiOutsideMaskGeoJSON(): FeatureCollection<Polygon> {
  const ring = getOuterRing();
  const hole = [...ring].reverse();

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "Polygon" as const,
          coordinates: [WORLD_RING, hole],
        },
      },
    ],
  };
}

export function getPiauiBorderGeoJSON(): FeatureCollection<Polygon> {
  return {
    type: "FeatureCollection",
    features: [PIAUI_BOUNDARY_FEATURE],
  };
}
