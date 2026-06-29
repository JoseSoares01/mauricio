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
  return bucket[id] ?? 0;
}

export async function incrementView(type: ViewType, id: string): Promise<number> {
  const views = await getViews();
  const bucket = type === "news" ? views.news : views.videos;
  const next = (bucket[id] ?? 0) + 1;
  bucket[id] = next;
  await writeViews(views);
  return next;
}
