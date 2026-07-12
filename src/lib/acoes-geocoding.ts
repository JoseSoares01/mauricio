import type { AcaoRecord } from "./acoes-types";

/** Centro geográfico de Teresina (fallback fixo). */
export const TERESINA_CENTRO = { latitude: -5.0892, longitude: -42.8019 };

const EARTH_RADIUS_M = 6378137;

export function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/** Deslocamento circular determinístico (50–250 m) a partir do id. */
export function applyCentroOffset(
  latitude: number,
  longitude: number,
  id: string
): { latitude: number; longitude: number } {
  const hash = hashId(id);
  const bearingRad = ((hash % 360) * Math.PI) / 180;
  const distanceM = 50 + (hash % 201);

  const latRad = (latitude * Math.PI) / 180;
  const dLat = ((distanceM * Math.cos(bearingRad)) / EARTH_RADIUS_M) * (180 / Math.PI);
  const dLng =
    ((distanceM * Math.sin(bearingRad)) / (EARTH_RADIUS_M * Math.cos(latRad))) * (180 / Math.PI);

  return {
    latitude: latitude + dLat,
    longitude: longitude + dLng,
  };
}

export function isCentroBairro(bairro: string | null | undefined): boolean {
  if (!bairro) return false;
  return bairro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "centro";
}

export function buildNominatimQuery(record: AcaoRecord): string {
  if (record.geocoding?.query?.trim()) return record.geocoding.query.trim();
  if (record.tipoMapa === "piaui") {
    return `${record.cidade}, PI, Brasil`;
  }
  return `${record.bairro || "Teresina"}, Teresina, PI, Brasil`;
}

export function shouldApplyCentroOffset(record: AcaoRecord): boolean {
  return record.tipoMapa === "teresina" && isCentroBairro(record.bairro);
}

export function resolveCoordinates(
  record: AcaoRecord,
  coords: { latitude: number; longitude: number }
): { latitude: number; longitude: number } {
  if (shouldApplyCentroOffset(record)) {
    return applyCentroOffset(coords.latitude, coords.longitude, record.id);
  }
  return coords;
}
