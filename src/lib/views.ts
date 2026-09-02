import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { put, list } from "@vercel/blob";
import { blobAuth, isBlobEnabled } from "./blob-storage";
import { isGithubStorageEnabled, readTextFileFromGitHub, writeFileToGitHub } from "./github-storage";

export type ViewType = "news" | "video";

export interface ViewsData {
  news: Record<string, number>;
  videos: Record<string, number>;
}

const VIEWS_PATH = path.join(process.cwd(), "data", "views.json");
const BLOB_PATHNAME = "mauricio/views.json";

const EMPTY_VIEWS: ViewsData = { news: {}, videos: {} };

function normalizeViews(data: ViewsData): ViewsData {
  return {
    news: data.news ?? {},
    videos: data.videos ?? {},
  };
}

/** Offset estável por item — evita que todos mostrem o mesmo número. */
function stableOffset(id: string, spread: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash % spread;
}

/** Número base exibido por item (todos acima de 5.000, variando entre si). */
const VIEW_DISPLAY_SEED: Record<ViewType, Record<string, number>> = {
  news: {
    "1781279000001": 8_590,
    "1781279000002": 6_150,
    "1781279000003": 7_824,
    "1781277256294": 5_487,
    "1781279000004": 6_912,
    "1785847488866": 7_340,
  },
  video: {
    "1783424758866": 9_120,
    "6": 8_430,
    "5": 6_275,
    "4": 7_180,
    "3": 5_690,
    "2": 8_765,
    "1": 6_840,
  },
};

const VIEW_REAL_STEP = 4;

function toDisplayCount(type: ViewType, id: string, real: number): number {
  const seeded = VIEW_DISPLAY_SEED[type][id];
  const base =
    seeded ?? 5_200 + stableOffset(id, 3_800);
  return base + real * VIEW_REAL_STEP;
}

async function readFromBlob(): Promise<ViewsData | null> {
  if (!isBlobEnabled()) return null;

  try {
    const { blobs } = await list({ prefix: "mauricio/", ...blobAuth() });
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME);
    if (!blob) return null;

    const response = await fetch(`${blob.url}?v=${blob.uploadedAt}`, { cache: "no-store" });
    if (!response.ok) return null;

    return normalizeViews((await response.json()) as ViewsData);
  } catch (error) {
    console.error("Falha ao ler views do Blob:", error);
    return null;
  }
}

async function readFromGitHub(): Promise<ViewsData | null> {
  if (!isGithubStorageEnabled()) return null;
  try {
    const raw = await readTextFileFromGitHub("data/views.json");
    if (!raw) return null;
    return normalizeViews(JSON.parse(raw) as ViewsData);
  } catch (error) {
    console.error("Falha ao ler views do GitHub:", error);
    return null;
  }
}

async function readFromDisk(): Promise<ViewsData> {
  try {
    const raw = await fs.readFile(VIEWS_PATH, "utf-8");
    return normalizeViews(JSON.parse(raw) as ViewsData);
  } catch {
    return EMPTY_VIEWS;
  }
}

async function writeViews(data: ViewsData): Promise<void> {
  const normalized = normalizeViews(data);
  const content = `${JSON.stringify(normalized, null, 2)}\n`;

  if (isBlobEnabled()) {
    await put(BLOB_PATHNAME, content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
      ...blobAuth(),
    });
    return;
  }

  if (isGithubStorageEnabled()) {
    await writeFileToGitHub({
      filePath: "data/views.json",
      content,
      message: "Atualiza contador de visualizações",
    });
    return;
  }

  await fs.writeFile(VIEWS_PATH, content, "utf-8");
}

export async function getViews(): Promise<ViewsData> {
  noStore();
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  const fromGitHub = await readFromGitHub();
  if (fromGitHub) return fromGitHub;
  return readFromDisk();
}

export function getViewCount(views: ViewsData, type: ViewType, id: string): number {
  const bucket = type === "news" ? views.news : views.videos;
  const real = bucket[id] ?? 0;
  return toDisplayCount(type, id, real);
}

export async function incrementView(type: ViewType, id: string): Promise<number> {
  const views = await getViews();
  const bucket = type === "news" ? views.news : views.videos;
  const next = (bucket[id] ?? 0) + 1;
  bucket[id] = next;
  await writeViews(views);
  return toDisplayCount(type, id, next);
}
