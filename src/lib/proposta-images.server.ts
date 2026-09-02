import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";
import {
  encodePropostaAssetPath,
  getPropostaFilename,
  getPropostaImageKeywords,
  listPropostaImageMap,
} from "@/lib/proposta-images";

const PROPOSTAS_DIR = path.join(process.cwd(), "public/uploads/propostas");
const MIN_IMAGE_BYTES = 50_000;
const MIN_IMAGE_HEIGHT = 120;

function normalizeForCompare(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "");
}

function getPropostaFiles(): string[] {
  if (!fs.existsSync(PROPOSTAS_DIR)) return [];
  return fs
    .readdirSync(PROPOSTAS_DIR)
    .filter((entry) => entry.toLowerCase().endsWith(".png"));
}

function resolveFilenameOnDisk(filename: string): string | null {
  const target = normalizeForCompare(filename.replace(/\.png$/i, ""));
  const match = getPropostaFiles().find(
    (entry) =>
      normalizeForCompare(entry.replace(/\.png$/i, "")) === target ||
      normalizeForCompare(entry) === normalizeForCompare(filename)
  );
  return match ?? null;
}

function resolveByKeywords(title: string): string | null {
  const keywords = getPropostaImageKeywords(title);
  if (!keywords?.length) return null;

  return (
    getPropostaFiles().find((entry) => {
      const normalized = normalizeForCompare(entry);
      return keywords.every((keyword) => normalized.includes(keyword));
    }) ?? null
  );
}

function resolveByTitleScan(title: string): string | null {
  const normalizedTitle = normalizeForCompare(title);
  const candidates = getPropostaFiles().filter((entry) => {
    const normalizedFile = normalizeForCompare(entry.replace(/\.png$/i, ""));
    return (
      normalizedTitle.includes(normalizedFile) ||
      normalizedFile.includes(normalizedTitle.slice(0, 12))
    );
  });

  return candidates[0] ?? null;
}

function resolveAnyFilename(title: string): string | null {
  const mapped = getPropostaFilename(title);
  if (mapped) {
    const onDisk = resolveFilenameOnDisk(mapped);
    if (onDisk) return onDisk;
  }

  const byKeywords = resolveByKeywords(title);
  if (byKeywords) return byKeywords;

  for (const filename of Object.values(listPropostaImageMap())) {
    const onDisk = resolveFilenameOnDisk(filename);
    if (
      onDisk &&
      normalizeForCompare(title).includes(
        normalizeForCompare(filename.replace(/\.png$/i, "")).slice(0, 8)
      )
    ) {
      return onDisk;
    }
  }

  return resolveByTitleScan(title);
}

function isImageFileValid(filename: string): boolean {
  try {
    const fullPath = path.join(PROPOSTAS_DIR, filename);
    if (!fs.existsSync(fullPath)) return false;

    const stat = fs.statSync(fullPath);
    if (stat.size < MIN_IMAGE_BYTES) return false;

    const png = PNG.sync.read(fs.readFileSync(fullPath));
    return png.height >= MIN_IMAGE_HEIGHT && png.width >= MIN_IMAGE_HEIGHT;
  } catch {
    return false;
  }
}

export function resolvePropostaImage(title: string): string | null {
  const onDisk = resolveAnyFilename(title);
  if (!onDisk || !isImageFileValid(onDisk)) return null;
  return encodePropostaAssetPath(onDisk);
}

export function resolvePropostaImages(
  items: { id: string; title: string }[]
): Record<string, string | null> {
  return Object.fromEntries(
    items.map((item) => [item.id, resolvePropostaImage(item.title)])
  );
}
