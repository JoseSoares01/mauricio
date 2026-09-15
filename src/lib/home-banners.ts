import type { SiteConfig } from "./types";
import type { ImageFocusSource } from "./image-focus";
import { getConfiguredImageUrl } from "./site-config";

export interface HomeBannerSlide {
  id: string;
  src: string;
  alt: string;
  /** Título editorial opcional (galeria / trajetória) */
  title?: string;
  /** Descrição curta opcional */
  description?: string;
  /** Tag / eyebrow opcional */
  tag?: string;
  focus?: ImageFocusSource | null;
}

const MAX_SLIDES = 12;

function shortenDescription(text: string | undefined, max = 140): string | undefined {
  if (!text?.trim()) return undefined;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const slice = normalized.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

export function getHomeBannerSlides(config: SiteConfig): HomeBannerSlide[] {
  const seen = new Set<string>();
  const slides: HomeBannerSlide[] = [];

  const add = (
    rawSrc: string | undefined,
    alt: string,
    focus?: ImageFocusSource | null,
    meta?: { title?: string; description?: string; tag?: string }
  ) => {
    if (!rawSrc?.trim() || slides.length >= MAX_SLIDES) return;
    const src = getConfiguredImageUrl(rawSrc);
    if (!src || seen.has(src)) return;
    seen.add(src);
    slides.push({
      id: src,
      src,
      alt,
      title: meta?.title?.trim() || undefined,
      description: shortenDescription(meta?.description),
      tag: meta?.tag?.trim() || undefined,
      focus,
    });
  };

  add(config.images.banner, "Banner", config.images.focus?.banner);
  add(
    config.images.bannerSecondary,
    "Banner",
    config.images.focus?.bannerSecondary
  );

  for (const item of config.about?.gallery ?? []) {
    add(item.image, item.title || "Galeria", item, {
      title: item.title,
      description: item.text,
      tag: item.tag,
    });
  }

  for (const item of config.about?.timeline ?? []) {
    if (item.image) {
      add(item.image, item.title || "Trajetória", item, {
        title: item.title,
        description: item.text,
        tag: item.year,
      });
    }
  }

  return slides;
}
