import type { ActionMapConfig, ActionVisit, ActionVisitStatus, NewsItem } from "./types";
import { extractYoutubeId, isDirectVideoFile } from "./video";
import { getPiauiBBox } from "./piaui-boundary";

export const ACTION_MAP_COLORS = {
  realizada: "#129547",
  agendada: "#0071B7",
  cluster: "#6E8B3D",
} as const;

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
  visits: [],
};

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
    status: visit.status === "agendada" ? "agendada" : "realizada",
    image: visit.image || "",
    gallery: Array.isArray(visit.gallery) ? visit.gallery.filter(Boolean) : [],
    relatedLink: visit.relatedLink?.trim() || "",
    relatedNewsId: visit.relatedNewsId?.trim() || "",
    displayOrder: Number.isFinite(visit.displayOrder) ? visit.displayOrder : index + 1,
    active: visit.active !== false,
    routePoints: visit.routePoints?.length ? visit.routePoints : undefined,
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
    visits,
  };
}

export function getActiveVisits(actionMap: ActionMapConfig): ActionVisit[] {
  return normalizeActionMap(actionMap).visits.filter((v) => v.active);
}

export interface ActionMapFilters {
  year: string;
  city: string;
  category: string;
  status: "" | ActionVisitStatus;
}

export const EMPTY_ACTION_MAP_FILTERS: ActionMapFilters = {
  year: "",
  city: "",
  category: "",
  status: "",
};

export function filterActionVisits(
  visits: ActionVisit[],
  filters: ActionMapFilters
): ActionVisit[] {
  return visits.filter((visit) => {
    if (filters.year && !visit.date.startsWith(filters.year)) return false;
    if (filters.city && visit.city !== filters.city) return false;
    if (filters.category && visit.category !== filters.category) return false;
    if (filters.status && visit.status !== filters.status) return false;
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
  upcomingAgendas: number;
  totalRecords: number;
}

export function computeActionMapStats(visits: ActionVisit[]): ActionMapStats {
  const completed = visits.filter((v) => v.status === "realizada");
  const upcoming = visits.filter((v) => v.status === "agendada");
  return {
    citiesVisited: new Set(completed.map((v) => v.city)).size,
    actionsCompleted: completed.length,
    upcomingAgendas: upcoming.length,
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
  return `/mapa-de-atuacao?visita=${encodeURIComponent(slug)}`;
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

export function statusLabel(status: ActionVisitStatus): string {
  return status === "agendada" ? "Agendada" : "Realizada";
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
    "latitude",
    "longitude",
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
      visit.latitude,
      visit.longitude,
      visit.excerpt.replace(/"/g, '""'),
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );
  return [header.join(","), ...rows].join("\n");
}

export interface CityActionRanking {
  city: string;
  count: number;
  realizadas: number;
  agendadas: number;
}

export function getCityActionRanking(visits: ActionVisit[]): CityActionRanking[] {
  const byCity = new Map<string, CityActionRanking>();

  for (const visit of visits) {
    const current = byCity.get(visit.city) || {
      city: visit.city,
      count: 0,
      realizadas: 0,
      agendadas: 0,
    };
    current.count += 1;
    if (visit.status === "realizada") current.realizadas += 1;
    else current.agendadas += 1;
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
