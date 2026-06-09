import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { put, list } from "@vercel/blob";
import type { SiteConfig } from "./types";
import defaultConfig from "../../data/site-config.json";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const BLOB_PATHNAME = "mauricio/site-config.json";

function isBlobEnabled(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function blobAuth() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) return { token };

  const storeId = process.env.BLOB_STORE_ID;
  if (storeId) return { storeId };

  return {};
}

async function readFromBlob(): Promise<SiteConfig | null> {
  if (!isBlobEnabled()) return null;

  try {
    const { blobs } = await list({ prefix: "mauricio/", ...blobAuth() });
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME);
    if (!blob) return null;

    const response = await fetch(`${blob.url}?v=${blob.uploadedAt}`, { cache: "no-store" });
    if (!response.ok) return null;

    return (await response.json()) as SiteConfig;
  } catch (error) {
    console.error("Falha ao ler config do Blob:", error);
    return null;
  }
}

async function readFromDisk(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(CONFIG_PATH, "utf-8");
    return JSON.parse(raw) as SiteConfig;
  } catch {
    return defaultConfig as SiteConfig;
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  noStore();
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  return readFromDisk();
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const content = `${JSON.stringify(config, null, 2)}\n`;

  if (isBlobEnabled()) {
    try {
      await put(BLOB_PATHNAME, content, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: "application/json",
        cacheControlMaxAge: 60,
        ...blobAuth(),
      });

      const saved = await readFromBlob();
      if (!saved || JSON.stringify(saved) !== JSON.stringify(config)) {
        throw new Error("O Blob não confirmou a gravação. Tente salvar novamente.");
      }
      return;
    } catch (error) {
      console.error("Falha ao gravar config no Blob:", error);
      throw new Error(
        error instanceof Error
          ? `Erro ao gravar no Blob: ${error.message}`
          : "Erro ao gravar no Blob."
      );
    }
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Blob não ligado ao deploy. Na Vercel: Storage → mauricio-blob → Projects → confirme o projeto mauricio e faça Redeploy."
    );
  }

  await fs.writeFile(CONFIG_PATH, content, "utf-8");
}

export function getThemeCSSVars(theme: SiteConfig["theme"]): Record<string, string> {
  return {
    "--color-primary": theme.primary,
    "--color-secondary": theme.secondary,
    "--color-accent": theme.accent,
    "--color-text": theme.text,
    "--color-text-light": theme.textLight,
    "--color-background": theme.background,
    "--color-hero-start": theme.heroGradientStart,
    "--color-hero-end": theme.heroGradientEnd,
    "--color-footer": theme.footerBg,
    "--font-heading": theme.fontHeading,
    "--font-body": theme.fontBody,
  };
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
