import type { TeresinaVisit } from "./types";
import { isCentroNeighborhood, TERESINA_CENTRO_ANCHOR } from "./map-pin-spread";

export const TERESINA_ZONES = ["Norte", "Sul", "Leste", "Oeste", "Centro"] as const;

export type TeresinaZone = (typeof TERESINA_ZONES)[number];

export type TeresinaZoneFilter = "" | TeresinaZone;

export interface TeresinaNeighborhoodSummary {
  neighborhood: string;
  zone: TeresinaZone;
  count: number;
  latestVisit: TeresinaVisit;
  visits: TeresinaVisit[];
}

export interface TeresinaZoneSummary {
  zone: TeresinaZone;
  actionCount: number;
  neighborhoodCount: number;
}

function normalizeName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

/**
 * Zona a partir de dados já existentes no sistema:
 * - bairro "Centro" → Centro (regra já usada no projeto)
 * - demais bairros → quadrante geográfico pelas lat/lng das próprias ações
 *   em relação à âncora de Teresina já definida em map-pin-spread.
 */
export function resolveTeresinaZone(
  neighborhood: string,
  latitude: number,
  longitude: number
): TeresinaZone {
  if (isCentroNeighborhood(neighborhood)) return "Centro";

  const dLat = latitude - TERESINA_CENTRO_ANCHOR.latitude;
  const dLng = longitude - TERESINA_CENTRO_ANCHOR.longitude;

  if (Math.abs(dLat) >= Math.abs(dLng)) {
    return dLat < 0 ? "Sul" : "Norte";
  }
  return dLng < 0 ? "Oeste" : "Leste";
}

function neighborhoodAnchor(visits: TeresinaVisit[]): { latitude: number; longitude: number } {
  const sum = visits.reduce(
    (acc, visit) => {
      acc.latitude += visit.latitude;
      acc.longitude += visit.longitude;
      return acc;
    },
    { latitude: 0, longitude: 0 }
  );
  return {
    latitude: sum.latitude / visits.length,
    longitude: sum.longitude / visits.length,
  };
}

export function buildTeresinaNeighborhoodSummaries(
  visits: TeresinaVisit[]
): TeresinaNeighborhoodSummary[] {
  const groups = new Map<string, TeresinaVisit[]>();

  for (const visit of visits) {
    const key = visit.neighborhood.trim() || "Bairro";
    const list = groups.get(key) ?? [];
    list.push(visit);
    groups.set(key, list);
  }

  const summaries: TeresinaNeighborhoodSummary[] = [];

  for (const [neighborhood, group] of groups) {
    const sorted = [...group].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    const anchor = neighborhoodAnchor(sorted);
    const zone = resolveTeresinaZone(neighborhood, anchor.latitude, anchor.longitude);
    summaries.push({
      neighborhood,
      zone,
      count: sorted.length,
      latestVisit: sorted[0],
      visits: sorted,
    });
  }

  return summaries.sort(
    (a, b) => b.count - a.count || a.neighborhood.localeCompare(b.neighborhood, "pt-BR")
  );
}

export function buildTeresinaZoneSummaries(
  neighborhoods: TeresinaNeighborhoodSummary[]
): TeresinaZoneSummary[] {
  return TERESINA_ZONES.map((zone) => {
    const inZone = neighborhoods.filter((item) => item.zone === zone);
    return {
      zone,
      neighborhoodCount: inZone.length,
      actionCount: inZone.reduce((sum, item) => sum + item.count, 0),
    };
  }).filter((item) => item.actionCount > 0);
}

export function filterTeresinaNeighborhoods(
  neighborhoods: TeresinaNeighborhoodSummary[],
  zone: TeresinaZoneFilter,
  query: string
): TeresinaNeighborhoodSummary[] {
  const q = normalizeName(query);
  return neighborhoods.filter((item) => {
    if (zone && item.zone !== zone) return false;
    if (!q) return true;
    if (normalizeName(item.neighborhood).includes(q)) return true;
    return item.visits.some(
      (visit) =>
        normalizeName(visit.title).includes(q) ||
        normalizeName(visit.category).includes(q) ||
        normalizeName(visit.excerpt || "").includes(q)
    );
  });
}
