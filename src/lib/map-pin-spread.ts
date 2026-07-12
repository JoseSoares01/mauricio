const EARTH_RADIUS_M = 6378137;

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

/** Espalha pins com a mesma coordenada para visualização (determinístico por id). */
export function spreadVisitCoordinates<T extends { id: string; latitude: number; longitude: number }>(
  visits: T[]
): Map<string, { latitude: number; longitude: number }> {
  const groups = new Map<string, T[]>();

  for (const visit of visits) {
    const key = `${visit.latitude.toFixed(5)}|${visit.longitude.toFixed(5)}`;
    const list = groups.get(key) ?? [];
    list.push(visit);
    groups.set(key, list);
  }

  const result = new Map<string, { latitude: number; longitude: number }>();

  for (const group of groups.values()) {
    if (group.length === 1) {
      const visit = group[0];
      result.set(visit.id, { latitude: visit.latitude, longitude: visit.longitude });
      continue;
    }

    const sorted = [...group].sort((a, b) => a.id.localeCompare(b.id));
    const ringRadius = Math.min(40 + sorted.length * 12, 220);

    sorted.forEach((visit, index) => {
      const hash = hashId(visit.id);
      const angle = (index / sorted.length) * 2 * Math.PI + ((hash % 360) * Math.PI) / 180;
      const distanceM = ringRadius * (0.55 + (hash % 45) / 100);
      result.set(visit.id, offsetCoordinate(visit.latitude, visit.longitude, angle, distanceM));
    });
  }

  return result;
}

export function getVisitDisplayCoordinate<T extends { id: string; latitude: number; longitude: number }>(
  visit: T,
  spreadMap: Map<string, { latitude: number; longitude: number }>
): { latitude: number; longitude: number } {
  return spreadMap.get(visit.id) ?? { latitude: visit.latitude, longitude: visit.longitude };
}
