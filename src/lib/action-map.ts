import type { ActionMapConfig, ActionVisit, NewsItem } from "./types";
import { extractYoutubeId, isDirectVideoFile } from "./video";
import { getPiauiBBox } from "./piaui-boundary";

export const ACTION_MAP_COLORS = {
  realizada: "#129547",
  agendada: "#0071B7",
  cluster: "#6E8B3D",
} as const;

export const DEFAULT_ACTION_MAP_IMAGE = "/uploads/piaui-3d-map.png";

/** Proporção da arte institucional (largura / altura). */
export const ACTION_MAP_IMAGE_ASPECT = 819 / 1024;

/** Limites do Piauí derivados do contorno oficial (IBGE). */
export const PIAUI_BOUNDS = getPiauiBBox(0.08);

export const PIAUI_VIEW = {
  longitude: -42.95,
  latitude: -7.0,
  zoom: 7.9,
  pitch: 48,
  bearing: -12,
};

export const DEFAULT_ACTION_MAP: ActionMapConfig = {
  enabled: true,
  mapImage: DEFAULT_ACTION_MAP_IMAGE,
  visits: [],
};

/** Posições calibradas sobre a arte 3D (819×1024) — alinhadas aos pontos brancos. */
const CITY_CANVAS_POSITIONS: Record<string, { x: number; y: number }> = {
  teresina: { x: 49.9, y: 48.8 },
  parnaiba: { x: 66.5, y: 17.5 },
  picos: { x: 88.5, y: 59.7 },
  floriano: { x: 37.8, y: 51.1 },
  piripiri: { x: 60.3, y: 30.4 },
  "campo maior": { x: 66.7, y: 42.7 },
  "sao raimundo nonato": { x: 31.1, y: 83.8 },
  oeiras: { x: 18.0, y: 60.0 },
  corrente: { x: 12.5, y: 83.4 },
  altos: { x: 45.5, y: 33.8 },
  barras: { x: 49.4, y: 22.3 },
  uniao: { x: 52.9, y: 22.5 },
  pedroii: { x: 75.9, y: 27.1 },
  "pedro ii": { x: 75.9, y: 27.1 },
  regeneracao: { x: 42.1, y: 42.3 },
  valenca: { x: 71.9, y: 45.0 },
  "valenca do piaui": { x: 71.9, y: 45.0 },
  fronteiras: { x: 83.0, y: 52.1 },
  paulistana: { x: 78.6, y: 60.4 },
  bomjesus: { x: 26.6, y: 71.2 },
  "bom jesus": { x: 26.6, y: 71.2 },
  guadalupe: { x: 5.7, y: 69.9 },
};

export function normalizeCityKey(city: string): string {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function latLngToCanvas(latitude?: number, longitude?: number): { x: number; y: number } | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const [[west, south], [east, north]] = PIAUI_BOUNDS;
  const x = ((longitude! - west) / (east - west)) * 100;
  const y = ((north - latitude!) / (north - south)) * 100;
  return { x: clampCoord(x, 0, 100, 50), y: clampCoord(y, 0, 100, 50) };
}

export function resolveVisitCanvasPosition(visit: ActionVisit): { x: number; y: number } {
  if (Number.isFinite(visit.mapX) && Number.isFinite(visit.mapY)) {
    return {
      x: clampCoord(visit.mapX!, 0, 100, 50),
      y: clampCoord(visit.mapY!, 0, 100, 50),
    };
  }

  const cityMatch = CITY_CANVAS_POSITIONS[normalizeCityKey(visit.city)];
  if (cityMatch) return cityMatch;

  const fromLatLng = latLngToCanvas(visit.latitude, visit.longitude);
  if (fromLatLng) return fromLatLng;

  return { x: 50, y: 50 };
}

export function slugifyActionVisit(parts: {
  city: string;
  title: string;
  date: string;
}): string {
  const raw = `${parts.city}-${parts.title}-${parts.date}`;
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeActionVisit(visit: ActionVisit, index: number): ActionVisit {
  const slug =
    visit.slug?.trim() ||
    slugifyActionVisit({ city: visit.city, title: visit.title, date: visit.date });

  const mapPosition = resolveVisitCanvasPosition(visit);

  return {
    ...visit,
    id: visit.id || String(Date.now() + index),
    slug,
    city: visit.city?.trim() || "Cidade",
    latitude: clampCoord(visit.latitude, -90, 90, PIAUI_VIEW.latitude),
    longitude: clampCoord(visit.longitude, -180, 180, PIAUI_VIEW.longitude),
    date: visit.date || new Date().toISOString().slice(0, 10),
    title: visit.title?.trim() || "Ação sem título",
    excerpt: visit.excerpt?.trim() || "",
    content: visit.content?.trim() || "",
    category: visit.category?.trim() || "Geral",
    status: "realizada",
    image: visit.image || "",
    gallery: Array.isArray(visit.gallery) ? visit.gallery.filter(Boolean) : [],
    relatedLink: visit.relatedLink?.trim() || "",
    relatedNewsId: visit.relatedNewsId?.trim() || "",
    displayOrder: Number.isFinite(visit.displayOrder) ? visit.displayOrder : index + 1,
    active: visit.active !== false,
    mapX: mapPosition.x,
    mapY: mapPosition.y,
    routePoints: visit.routePoints?.length
      ? visit.routePoints
          .map((point) => {
            if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
              return {
                x: clampCoord(point.x!, 0, 100, mapPosition.x),
                y: clampCoord(point.y!, 0, 100, mapPosition.y),
              };
            }
            const fromLatLng = latLngToCanvas(point.latitude, point.longitude);
            return fromLatLng ?? null;
          })
          .filter((point): point is { x: number; y: number } => Boolean(point))
      : undefined,
    videoUrl: visit.videoUrl?.trim() || undefined,
    documents: visit.documents?.length ? visit.documents : undefined,
    emendaRef: visit.emendaRef?.trim() || undefined,
    projectRef: visit.projectRef?.trim() || undefined,
    municipalityIndicators: visit.municipalityIndicators,
  };
}

export function normalizeActionMap(actionMap?: ActionMapConfig): ActionMapConfig {
  if (!actionMap) return { ...DEFAULT_ACTION_MAP };
  const visits = (actionMap.visits || []).map(normalizeActionVisit);
  visits.sort((a, b) => a.displayOrder - b.displayOrder || b.date.localeCompare(a.date));
  return {
    enabled: actionMap.enabled !== false,
    mapImage: actionMap.mapImage || DEFAULT_ACTION_MAP_IMAGE,
    visits,
  };
}

export function getActiveVisits(actionMap: ActionMapConfig): ActionVisit[] {
  return normalizeActionMap(actionMap).visits.filter((v) => v.active && v.status === "realizada");
}

export interface ActionMapFilters {
  year: string;
  city: string;
  category: string;
}

export const EMPTY_ACTION_MAP_FILTERS: ActionMapFilters = {
  year: "",
  city: "",
  category: "",
};

export function filterActionVisits(
  visits: ActionVisit[],
  filters: ActionMapFilters
): ActionVisit[] {
  return visits.filter((visit) => {
    if (filters.year && !visit.date.startsWith(filters.year)) return false;
    if (filters.city && visit.city !== filters.city) return false;
    if (filters.category && visit.category !== filters.category) return false;
    return true;
  });
}

export function getActionMapYears(visits: ActionVisit[]): string[] {
  return [...new Set(visits.map((v) => v.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
}

export function getActionMapCities(visits: ActionVisit[]): string[] {
  return [...new Set(visits.map((v) => v.city))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export function getActionMapCategories(visits: ActionVisit[]): string[] {
  return [...new Set(visits.map((v) => v.category))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export interface ActionMapStats {
  citiesVisited: number;
  actionsCompleted: number;
  totalRecords: number;
}

export function computeActionMapStats(visits: ActionVisit[]): ActionMapStats {
  return {
    citiesVisited: new Set(visits.map((v) => v.city)).size,
    actionsCompleted: visits.length,
    totalRecords: visits.length,
  };
}

export function visitsToGeoJSON(visits: ActionVisit[]): {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: Record<string, string>;
  }>;
} {
  return {
    type: "FeatureCollection",
    features: visits.map((visit) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [visit.longitude, visit.latitude],
      },
      properties: {
        visitId: visit.id,
        slug: visit.slug,
        status: visit.status,
        city: visit.city,
        title: visit.title,
        date: visit.date,
        category: visit.category,
      },
    })),
  };
}

export function findVisitBySlug(visits: ActionVisit[], slug: string): ActionVisit | undefined {
  const normalized = slug.trim().toLowerCase();
  return visits.find((v) => v.slug.toLowerCase() === normalized);
}

export function getActionVisitSharePath(slug: string): string {
  return `/mapa-de-atuacao?acao=${encodeURIComponent(slug)}`;
}

export function getRelatedNews(
  visit: ActionVisit,
  news: NewsItem[]
): NewsItem | undefined {
  if (!visit.relatedNewsId) return undefined;
  return news.find((item) => item.id === visit.relatedNewsId);
}

export function formatActionDate(dateStr: string): string {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function statusLabel(): string {
  return "Realizada";
}

export function sortVisitsChronologically(visits: ActionVisit[]): ActionVisit[] {
  return [...visits].sort((a, b) => {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;
    return a.displayOrder - b.displayOrder;
  });
}

export function citiesHeatmapToGeoJSON(visits: ActionVisit[]) {
  const byCity = new Map<string, { latitude: number; longitude: number; count: number }>();

  for (const visit of visits.filter((item) => item.status === "realizada")) {
    const current = byCity.get(visit.city);
    if (current) {
      current.count += 1;
    } else {
      byCity.set(visit.city, {
        latitude: visit.latitude,
        longitude: visit.longitude,
        count: 1,
      });
    }
  }

  return {
    type: "FeatureCollection" as const,
    features: Array.from(byCity.entries()).map(([city, entry]) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [entry.longitude, entry.latitude] as [number, number],
      },
      properties: {
        city,
        weight: entry.count,
      },
    })),
  };
}

export function journeyPathToGeoJSON(visits: ActionVisit[], endIndexInclusive: number) {
  const slice = visits.slice(0, endIndexInclusive + 1);
  if (slice.length < 2) {
    return { type: "FeatureCollection" as const, features: [] };
  }

  return {
    type: "FeatureCollection" as const,
    features: [
      {
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: slice.map((visit) => [visit.longitude, visit.latitude] as [number, number]),
        },
        properties: {},
      },
    ],
  };
}

export function visitsToCsv(visits: ActionVisit[]): string {
  const header = [
    "id",
    "slug",
    "cidade",
    "data",
    "titulo",
    "categoria",
    "status",
    "x",
    "y",
    "resumo",
  ];
  const rows = visits.map((visit) =>
    [
      visit.id,
      visit.slug,
      visit.city,
      visit.date,
      visit.title,
      visit.category,
      visit.status,
      visit.mapX ?? "",
      visit.mapY ?? "",
      visit.excerpt.replace(/"/g, '""'),
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export function getVisitRouteCanvasPoints(visit: ActionVisit): Array<{ x: number; y: number }> {
  const start = resolveVisitCanvasPosition(visit);
  const points = (visit.routePoints || [])
    .map((point) => {
      if (Number.isFinite(point.x) && Number.isFinite(point.y)) {
        return { x: clampCoord(point.x!, 0, 100, start.x), y: clampCoord(point.y!, 0, 100, start.y) };
      }
      const fromLatLng = latLngToCanvas(point.latitude, point.longitude);
      return fromLatLng;
    })
    .filter((point): point is { x: number; y: number } => Boolean(point));

  if (!points.length) return [];
  const hasStart = points[0].x === start.x && points[0].y === start.y;
  return hasStart ? points : [start, ...points];
}

export interface CityActionRanking {
  city: string;
  count: number;
  realizadas: number;
}

export function getCityActionRanking(visits: ActionVisit[]): CityActionRanking[] {
  const byCity = new Map<string, CityActionRanking>();

  for (const visit of visits) {
    const current = byCity.get(visit.city) || {
      city: visit.city,
      count: 0,
      realizadas: 0,
    };
    current.count += 1;
    current.realizadas += 1;
    byCity.set(visit.city, current);
  }

  return Array.from(byCity.values()).sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

export function getVisitVideoEmbed(videoUrl?: string): {
  type: "youtube" | "file";
  src: string;
} | null {
  const value = videoUrl?.trim();
  if (!value) return null;

  const youtubeId = extractYoutubeId(value);
  if (youtubeId) {
    return { type: "youtube", src: `https://www.youtube.com/embed/${youtubeId}` };
  }

  if (isDirectVideoFile(value)) {
    return { type: "file", src: value };
  }

  return null;
}

export function getIndicatorEntries(
  indicators?: Record<string, string | number>
): Array<{ label: string; value: string }> {
  if (!indicators) return [];
  return Object.entries(indicators)
    .filter(([label]) => label.trim())
    .map(([label, value]) => ({ label: label.trim(), value: String(value) }));
}

export function indicatorEntriesToRecord(
  entries: Array<{ label: string; value: string }>
): Record<string, string | number> | undefined {
  const record: Record<string, string | number> = {};
  for (const entry of entries) {
    if (!entry.label.trim()) continue;
    const trimmed = entry.value.trim();
    const asNumber = Number(trimmed);
    record[entry.label.trim()] =
      trimmed !== "" && Number.isFinite(asNumber) ? asNumber : entry.value;
  }
  return Object.keys(record).length ? record : undefined;
}

function clampCoord(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}
