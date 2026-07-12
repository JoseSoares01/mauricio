#!/usr/bin/env node
/**
 * Importa scripts/acoes.json, geocodifica via Nominatim (1 req/s),
 * aplica offset no bairro Centro (Teresina) e persiste em data/acoes-processed.json
 */
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCE = path.join(ROOT, "scripts", "acoes.json");
const OUTPUT = path.join(ROOT, "data", "acoes-processed.json");

const TERESINA_CENTRO = { latitude: -5.0892, longitude: -42.8019 };
const EARTH_RADIUS_M = 6378137;
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "mauricio-site/1.0 (mapa-de-atuacao; contact@maumau.br22@gmail.com)";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function hashId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function isCentroBairro(bairro) {
  if (!bairro) return false;
  return bairro.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase() === "centro";
}

function applyCentroOffset(latitude, longitude, id) {
  const hash = hashId(id);
  const bearingRad = ((hash % 360) * Math.PI) / 180;
  const distanceM = 50 + (hash % 201);
  const latRad = (latitude * Math.PI) / 180;
  const dLat = ((distanceM * Math.cos(bearingRad)) / EARTH_RADIUS_M) * (180 / Math.PI);
  const dLng =
    ((distanceM * Math.sin(bearingRad)) / (EARTH_RADIUS_M * Math.cos(latRad))) * (180 / Math.PI);
  return { latitude: latitude + dLat, longitude: longitude + dLng };
}

function buildQuery(record) {
  if (record.geocoding?.query?.trim()) return record.geocoding.query.trim();
  if (record.tipoMapa === "piaui") return `${record.cidade}, PI, Brasil`;
  return `${record.bairro || "Teresina"}, Teresina, PI, Brasil`;
}

async function nominatimSearch(query) {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "1",
    countrycodes: "br",
  });

  const response = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const results = await response.json();
  if (!results?.length) return null;

  return {
    latitude: parseFloat(results[0].lat),
    longitude: parseFloat(results[0].lon),
  };
}

async function geocodeWithCache(query, cache) {
  if (cache.has(query)) return cache.get(query);
  await sleep(1100);
  try {
    const result = await nominatimSearch(query);
    cache.set(query, result);
    return result;
  } catch (error) {
    console.error(`[geocode] Falha na consulta "${query}":`, error.message);
    cache.set(query, null);
    return null;
  }
}

function getFallbackCoords(record, cityFallbacks) {
  if (record.tipoMapa === "teresina") {
    return cityFallbacks.get("teresina") || TERESINA_CENTRO;
  }
  const cityKey = record.cidade
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
  return cityFallbacks.get(cityKey) || { latitude: -7.0, longitude: -42.95 };
}

function finalizeRecord(record, lat, lng) {
  const out = { ...record, latitude: lat, longitude: lng };
  if (record.tipoMapa === "teresina" && isCentroBairro(record.bairro)) {
    const offset = applyCentroOffset(lat, lng, record.id);
    out.latitude = offset.latitude;
    out.longitude = offset.longitude;
  }
  return out;
}

async function main() {
  const sourceRecords = JSON.parse(await readFile(SOURCE, "utf-8"));

  let existing = [];
  try {
    existing = JSON.parse(await readFile(OUTPUT, "utf-8"));
  } catch {
    /* primeiro import */
  }

  const existingById = new Map(existing.map((r) => [r.id, r]));
  const queryCache = new Map();
  const cityFallbacks = new Map();

  const centroResult = await geocodeWithCache("Centro, Teresina, PI, Brasil", queryCache);
  cityFallbacks.set("teresina", centroResult || TERESINA_CENTRO);

  let geocoded = 0;
  let skipped = 0;
  let failed = 0;

  const output = [];

  for (const record of sourceRecords) {
    const prev = existingById.get(record.id);

    if (prev?.geocoding?.resolved && prev.latitude != null && prev.longitude != null) {
      output.push(prev);
      skipped += 1;
      continue;
    }

    if (record.latitude != null && record.longitude != null) {
      const finalized = finalizeRecord(
        {
          ...record,
          geocoding: { ...record.geocoding, resolved: true, source: "manual" },
        },
        record.latitude,
        record.longitude
      );
      output.push(finalized);
      skipped += 1;
      continue;
    }

    const query = buildQuery(record);
    let coords = await geocodeWithCache(query, queryCache);
    let usedFallback = false;

    if (!coords) {
      console.error(`[geocode] ID ${record.id}: não encontrado — "${query}"`);
      coords = getFallbackCoords(record, cityFallbacks);
      usedFallback = true;
      failed += 1;
    } else {
      geocoded += 1;
      const cityKey = record.cidade
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();
      if (!cityFallbacks.has(cityKey)) {
        cityFallbacks.set(cityKey, coords);
      }
    }

    const centroBase = centroResult || TERESINA_CENTRO;
    const baseLat =
      record.tipoMapa === "teresina" && isCentroBairro(record.bairro)
        ? centroBase.latitude
        : coords.latitude;
    const baseLng =
      record.tipoMapa === "teresina" && isCentroBairro(record.bairro)
        ? centroBase.longitude
        : coords.longitude;

    const finalized = finalizeRecord(
      {
        ...record,
        geocoding: {
          query,
          resolved: true,
          source: usedFallback ? "fallback" : "OpenStreetMap Nominatim",
          ...(usedFallback
            ? { error: "Geocodificação falhou — coordenada de fallback aplicada", fallback: true }
            : {}),
        },
      },
      baseLat,
      baseLng
    );

    output.push(finalized);
  }

  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, "utf-8");

  console.log("\n✅ Importação concluída");
  console.log(`   Total: ${output.length}`);
  console.log(`   Geocodificados agora: ${geocoded}`);
  console.log(`   Já resolvidos (cache): ${skipped}`);
  console.log(`   Fallbacks: ${failed}`);
  console.log(`   Arquivo: data/acoes-processed.json\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
