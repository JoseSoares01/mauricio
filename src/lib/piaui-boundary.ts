import piauiBoundary from "@/data/piaui-boundary.json";
import type { Feature, FeatureCollection, Polygon, Position } from "geojson";

type Position2D = Position;

export const PIAUI_BOUNDARY_FEATURE = piauiBoundary.features[0] as Feature<Polygon>;

/** ViewBox do SVG decorativo do Piauí (proporção ≈ bbox real). */
export const PIAUI_SVG_WIDTH = 200;
export const PIAUI_SVG_HEIGHT = 290;
export const PIAUI_SVG_PADDING = 10;

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

function getPiauiSvgProjection(
  width = PIAUI_SVG_WIDTH,
  height = PIAUI_SVG_HEIGHT,
  padding = PIAUI_SVG_PADDING
) {
  const [[west, south], [east, north]] = getPiauiBBox(0);
  const geoW = east - west;
  const geoH = north - south;
  const availW = width - padding * 2;
  const availH = height - padding * 2;
  const scale = Math.min(availW / geoW, availH / geoH);
  const offsetX = padding + (availW - geoW * scale) / 2;
  const offsetY = padding + (availH - geoH * scale) / 2;

  const project = (lng: number, lat: number) => ({
    x: offsetX + (lng - west) * scale,
    y: offsetY + (north - lat) * scale,
  });

  return { project, west, south, east, north, scale, offsetX, offsetY };
}

/** Contorno SVG do estado do Piauí (path d=...). */
export function getPiauiSvgPath(
  width = PIAUI_SVG_WIDTH,
  height = PIAUI_SVG_HEIGHT,
  padding = PIAUI_SVG_PADDING
): string {
  const { project } = getPiauiSvgProjection(width, height, padding);
  const ring = getOuterRing();
  const parts: string[] = [];

  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    const { x, y } = project(lng, lat);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return `${parts.join(" ")} Z`;
}

/** Posição percentual (0–100) de lat/lng dentro do SVG do Piauí. */
export function projectPiauiLatLngToPercent(
  latitude: number,
  longitude: number,
  width = PIAUI_SVG_WIDTH,
  height = PIAUI_SVG_HEIGHT,
  padding = PIAUI_SVG_PADDING
): { x: number; y: number } {
  const { project } = getPiauiSvgProjection(width, height, padding);
  const { x, y } = project(longitude, latitude);
  return {
    x: Math.min(100, Math.max(0, (x / width) * 100)),
    y: Math.min(100, Math.max(0, (y / height) * 100)),
  };
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
