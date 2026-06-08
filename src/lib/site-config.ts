import { promises as fs } from "fs";
import path from "path";
import type { SiteConfig } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");

export async function getSiteConfig(): Promise<SiteConfig> {
  const raw = await fs.readFile(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as SiteConfig;
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  await fs.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
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
