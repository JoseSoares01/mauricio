import { promises as fs } from "fs";
import path from "path";
import { put, list } from "@vercel/blob";
import type { SiteConfig } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const BLOB_PATHNAME = "mauricio/site-config.json";

async function readFromBlob(): Promise<SiteConfig | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return null;

  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, token });
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME) ?? blobs[0];
    if (!blob) return null;

    const response = await fetch(blob.url, { cache: "no-store" });
    if (!response.ok) return null;

    return (await response.json()) as SiteConfig;
  } catch {
    return null;
  }
}

async function readFromDisk(): Promise<SiteConfig> {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as SiteConfig;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  return readFromDisk();
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const content = `${JSON.stringify(config, null, 2)}\n`;
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    await put(BLOB_PATHNAME, content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      token,
    });
    return;
  }

  if (process.env.VERCEL === "1") {
    throw new Error(
      "Configure BLOB_READ_WRITE_TOKEN na Vercel (Storage → Blob) para salvar alterações online."
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
