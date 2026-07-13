const EARTH_RADIUS_M = 6378137;

export interface SpreadableVisit {
  id: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
}

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function offsetCoordinate(
  latitude: number,
  longitude: number,
  bearingRad: number,
  distanceM: number
): { latitude: number; longitude: number } {
  const latRad = (latitude * Math.PI) / 180;
  const dLat = ((distanceM * Math.cos(bearingRad)) / EARTH_RADIUS_M) * (180 / Math.PI);
  const dLng =
    ((distanceM * Math.sin(bearingRad)) / (EARTH_RADIUS_M * Math.cos(latRad))) * (180 / Math.PI);
  return { latitude: latitude + dLat, longitude: longitude + dLng };
}

export function isCentroNeighborhood(name?: string): boolean {
  if (!name) return false;
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "centro";
}

/** Centro de Teresina — âncora fixa para espalhar todos os pins do bairro Centro. */
export const TERESINA_CENTRO_ANCHOR = { latitude: -5.0892, longitude: -42.8019 };

function spreadInRings<T extends SpreadableVisit>(
  visits: T[],
  anchor: { latitude: number; longitude: number },
  options: { pinsPerRing: number; ringStepM: number; baseRadiusM: number }
): Map<string, { latitude: number; longitude: number }> {
  const sorted = [...visits].sort((a, b) => a.id.localeCompare(b.id));
  const result = new Map<string, { latitude: number; longitude: number }>();

  sorted.forEach((visit, index) => {
    const ring = Math.floor(index / options.pinsPerRing);
    const posInRing = index % options.pinsPerRing;
    const countInRing = Math.min(options.pinsPerRing, sorted.length - ring * options.pinsPerRing);
    const hash = hashId(visit.id);
    const angle = (posInRing / countInRing) * 2 * Math.PI + ((hash % 360) * Math.PI) / 180;
    const distanceM = options.baseRadiusM + ring * options.ringStepM + (hash % 35);
    result.set(visit.id, offsetCoordinate(anchor.latitude, anchor.longitude, angle, distanceM));
  });

  return result;
}

/** Espalha pins com a mesma coordenada para visualização (determinístico por id). */
export function spreadVisitCoordinates<T extends SpreadableVisit>(
  visits: T[]
): Map<string, { latitude: number; longitude: number }> {
  const result = new Map<string, { latitude: number; longitude: number }>();

  const centroVisits = visits.filter((v) => isCentroNeighborhood(v.neighborhood));
  const otherVisits = visits.filter((v) => !isCentroNeighborhood(v.neighborhood));

  if (centroVisits.length > 0) {
    const centroSpread = spreadInRings(centroVisits, TERESINA_CENTRO_ANCHOR, {
      pinsPerRing: 8,
      ringStepM: 320,
      baseRadiusM: 280,
    });
    centroSpread.forEach((coords, id) => result.set(id, coords));
  }

  const groups = new Map<string, T[]>();
  for (const visit of otherVisits) {
    const key = `${visit.latitude.toFixed(5)}|${visit.longitude.toFixed(5)}`;
    const list = groups.get(key) ?? [];
    list.push(visit);
    groups.set(key, list);
  }

  for (const group of groups.values()) {
    if (group.length === 1) {
      const visit = group[0];
      result.set(visit.id, { latitude: visit.latitude, longitude: visit.longitude });
      continue;
    }

    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
    const ringRadius = Math.min(80 + sorted.length * 28, 520);

    sorted.forEach((visit, index) => {
      const hash = hashId(visit.id);
      const angle = (index / sorted.length) * 2 * Math.PI + ((hash % 360) * Math.PI) / 180;
      const distanceM = ringRadius * (0.65 + (hash % 35) / 100);
      result.set(visit.id, offsetCoordinate(visit.latitude, visit.longitude, angle, distanceM));
    });
  }

  return result;
}

export function getVisitDisplayCoordinate<T extends SpreadableVisit>(
  visit: T,
  spreadMap: Map<string, { latitude: number; longitude: number }>
): { latitude: number; longitude: number } {
  return spreadMap.get(visit.id) ?? { latitude: visit.latitude, longitude: visit.longitude };
}

/** Limites geográficos de Teresina para foco e maxBounds do mapa. */
export const TERESINA_MAP_BOUNDS: [[number, number], [number, number]] = [
  [-42.86, -5.17],
  [-42.72, -5.02],
];

export function getTeresinaFitBounds<T extends SpreadableVisit>(
  visits: T[],
  spreadMap: Map<string, { latitude: number; longitude: number }>,
  padding = 0.012
): [[number, number], [number, number]] {
  if (visits.length === 0) return TERESINA_MAP_BOUNDS;

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  for (const visit of visits) {
    const coords = getVisitDisplayCoordinate(visit, spreadMap);
    minLat = Math.min(minLat, coords.latitude);
    maxLat = Math.max(maxLat, coords.latitude);
    minLng = Math.min(minLng, coords.longitude);
    maxLng = Math.max(maxLng, coords.longitude);
  }

  return [
    [minLng - padding, minLat - padding],
    [maxLng + padding, maxLat + padding],
  ];
}
