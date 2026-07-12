import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import type { AcaoProcessed } from "./acoes-types";
import { normalizeActionVisit, normalizeTeresinaVisit, slugifyActionVisit } from "./action-map";
import type { ActionVisit, TeresinaVisit } from "./types";
import defaultProcessed from "../../data/acoes-processed.json";

const PROCESSED_PATH = path.join(process.cwd(), "data", "acoes-processed.json");
const SOURCE_PATH = path.join(process.cwd(), "scripts", "acoes.json");

function excerptFromDescription(text: string, max = 220): string {
  const clean = text.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function toActionVisit(record: AcaoProcessed, index: number): ActionVisit {
  const slug =
    record.slug?.trim() ||
    slugifyActionVisit({ city: record.cidade, title: record.titulo, date: record.data });

  return normalizeActionVisit(
    {
      id: record.id,
      slug,
      city: record.cidade,
      latitude: record.latitude!,
      longitude: record.longitude!,
      date: record.data,
      title: record.titulo,
      excerpt: excerptFromDescription(record.descricao),
      content: record.descricao,
      category: record.categoria,
      status: "realizada",
      image: record.imagem || "",
      gallery: record.imagem ? [record.imagem] : [],
      displayOrder: index + 1,
      active: record.status === "publicado",
    },
    index
  );
}

function toTeresinaVisit(record: AcaoProcessed, index: number): TeresinaVisit {
  const neighborhood = record.bairro?.trim() || "Teresina";
  const slug =
    record.slug?.trim() ||
    slugifyActionVisit({ city: neighborhood, title: record.titulo, date: record.data });

  return normalizeTeresinaVisit(
    {
      id: record.id,
      slug,
      neighborhood,
      latitude: record.latitude,
      longitude: record.longitude,
      date: record.data,
      title: record.titulo,
      excerpt: excerptFromDescription(record.descricao),
      content: record.descricao,
      category: record.categoria,
      image: record.imagem || "",
      gallery: record.imagem ? [record.imagem] : [],
      active: record.status === "publicado",
    },
    index
  );
}

async function readProcessedFromDisk(): Promise<AcaoProcessed[]> {
  try {
    const raw = await fs.readFile(PROCESSED_PATH, "utf-8");
    return JSON.parse(raw) as AcaoProcessed[];
  } catch {
    return defaultProcessed as AcaoProcessed[];
  }
}

export async function getAcoesRecords(): Promise<AcaoProcessed[]> {
  noStore();
  return readProcessedFromDisk();
}

export async function getAcoesMapVisits(): Promise<{
  visits: ActionVisit[];
  teresinaVisits: TeresinaVisit[];
}> {
  const records = (await getAcoesRecords()).filter(
    (r) => r.status === "publicado" && r.latitude != null && r.longitude != null
  );

  const piauiRecords = records.filter((r) => r.tipoMapa === "piaui");
  const teresinaRecords = records.filter((r) => r.tipoMapa === "teresina");

  return {
    visits: piauiRecords.map(toActionVisit),
    teresinaVisits: teresinaRecords.map(toTeresinaVisit),
  };
}

export { PROCESSED_PATH, SOURCE_PATH };
