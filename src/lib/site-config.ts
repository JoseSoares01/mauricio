import { promises as fs } from "fs";
import path from "path";
import { cache } from "react";
import { revalidateTag, unstable_cache } from "next/cache";
import { put, list } from "@vercel/blob";
import type { SiteConfig } from "./types";
import defaultConfig from "../../data/site-config.json";
import { blobAuth, isBlobEnabled } from "./blob-storage";
import { isGithubStorageEnabled, readTextFileFromGitHub, writeFileToGitHub } from "./github-storage";
import { deleteRemovedUploadsFromGitHub } from "./upload-cleanup";
import { normalizeNewsMarkdown, repairMarkdown } from "./format-content";
import { clampImageFocusAxis, clampImageZoom, DEFAULT_IMAGE_FOCUS, normalizeImageFocus } from "./image-focus";
import { normalizeAboutSection } from "./about-page";
import { normalizeVideos } from "./video";
import { normalizeActionMap } from "./action-map";
import { normalizeWhatsappGroup } from "./whatsapp-group";

const CONFIG_PATH = path.join(process.cwd(), "data", "site-config.json");
const BLOB_PATHNAME = "mauricio/site-config.json";
const SITE_CONFIG_CACHE_TAG = "site-config";
const SITE_CONFIG_REVALIDATE_SECONDS = 30;

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
    return defaultConfig as unknown as SiteConfig;
  }
}

async function readFromGitHub(): Promise<SiteConfig | null> {
  if (!isGithubStorageEnabled()) return null;
  try {
    const raw = await readTextFileFromGitHub("data/site-config.json");
    if (!raw) return null;
    return JSON.parse(raw) as SiteConfig;
  } catch (error) {
    console.error("Falha ao ler config do GitHub:", error);
    return null;
  }
}

const DEFAULT_ADMIN_PASSWORD = "mauricio2026";

const DEFAULT_ABOUT = (defaultConfig as unknown as SiteConfig).about;

function applyConfigNormalization(config: SiteConfig): SiteConfig {
  return {
    ...config,
    admin: {
      password: config.admin?.password || DEFAULT_ADMIN_PASSWORD,
    },
    videos: normalizeVideos(config.videos),
    news: config.news.map((item) => ({
      ...item,
      content: repairMarkdown(normalizeNewsMarkdown(item.content)),
      imageFocusX: clampImageFocusAxis(item.imageFocusX ?? DEFAULT_IMAGE_FOCUS.x),
      imageFocusY: clampImageFocusAxis(item.imageFocusY ?? DEFAULT_IMAGE_FOCUS.y),
      imageZoom: clampImageZoom(item.imageZoom ?? DEFAULT_IMAGE_FOCUS.zoom),
    })),
    instagram: {
      ...config.instagram,
      posts: (config.instagram?.posts ?? []).map((post) => ({
        ...post,
        imageFocusX: clampImageFocusAxis(post.imageFocusX ?? DEFAULT_IMAGE_FOCUS.x),
        imageFocusY: clampImageFocusAxis(post.imageFocusY ?? DEFAULT_IMAGE_FOCUS.y),
        imageZoom: clampImageZoom(post.imageZoom ?? DEFAULT_IMAGE_FOCUS.zoom),
      })),
    },
    images: {
      ...config.images,
      focus: Object.fromEntries(
        Object.entries(config.images?.focus ?? {}).map(([key, value]) => [
          key,
          normalizeImageFocus(value),
        ])
      ),
    },
    about: normalizeAboutSection(config.about, config.images, DEFAULT_ABOUT),
    actionMap: normalizeActionMap(config.actionMap),
    whatsappGroup: normalizeWhatsappGroup(config.whatsappGroup, config.images),
    propostas: config.propostas ?? (defaultConfig as unknown as SiteConfig).propostas ?? [],
  };
}

async function loadSiteConfigFromStorage(): Promise<SiteConfig> {
  const fromGitHub = await readFromGitHub();
  if (fromGitHub) return fromGitHub;
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  return readFromDisk();
}

const getCachedNormalizedSiteConfig = unstable_cache(
  async () => applyConfigNormalization(await loadSiteConfigFromStorage()),
  ["site-config-v1"],
  {
    revalidate: SITE_CONFIG_REVALIDATE_SECONDS,
    tags: [SITE_CONFIG_CACHE_TAG],
  }
);

/** Leitura fresca (admin / gravação). Evita cache stale no painel. */
export async function getSiteConfigFresh(): Promise<SiteConfig> {
  return applyConfigNormalization(await loadSiteConfigFromStorage());
}

/**
 * Config pública com cache curto (30s) + dedupe no mesmo request.
 * Invalidada automaticamente ao salvar no admin.
 */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  return getCachedNormalizedSiteConfig();
});

export function invalidateSiteConfigCache(): void {
  revalidateTag(SITE_CONFIG_CACHE_TAG);
}

export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const previousConfig = isGithubStorageEnabled() ? await getSiteConfigFresh() : null;
  const normalized = applyConfigNormalization(config);
  const content = `${JSON.stringify(normalized, null, 2)}\n`;

  if (isGithubStorageEnabled()) {
    await writeFileToGitHub({
      filePath: "data/site-config.json",
      content,
      message: "Atualiza configuração do site pelo painel admin",
    });
    if (previousConfig) {
      await deleteRemovedUploadsFromGitHub(previousConfig, normalized);
    }
    invalidateSiteConfigCache();
    return;
  }

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
      if (!saved || JSON.stringify(saved) !== JSON.stringify(normalized)) {
        throw new Error("O Blob não confirmou a gravação. Tente salvar novamente.");
      }
      invalidateSiteConfigCache();
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
  invalidateSiteConfigCache();
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

/** Retorna a URL só se houver imagem configurada (evita fallback indevido no front). */
export function getConfiguredImageUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}
