import type { SiteConfig } from "./types";
import type { ImageFocusSource } from "./image-focus";
import { getConfiguredImageUrl } from "./site-config";

export interface HomeBannerSlide {
  id: string;
  src: string;
  alt: string;
  focus?: ImageFocusSource | null;
}

const MAX_SLIDES = 12;

export function getHomeBannerSlides(config: SiteConfig): HomeBannerSlide[] {
  const seen = new Set<string>();
  const slides: HomeBannerSlide[] = [];

  const add = (
    rawSrc: string | undefined,
    alt: string,
    focus?: ImageFocusSource | null
  ) => {
    if (!rawSrc?.trim() || slides.length >= MAX_SLIDES) return;
    const src = getConfiguredImageUrl(rawSrc);
    if (!src || seen.has(src)) return;
    seen.add(src);
    slides.push({ id: src, src, alt, focus });
  };

  add(config.images.banner, "Banner", config.images.focus?.banner);
  add(
    config.images.bannerSecondary,
    "Banner",
    config.images.focus?.bannerSecondary
  );

  for (const item of config.about?.gallery ?? []) {
    add(item.image, item.title || "Galeria", item);
  }

  for (const item of config.about?.timeline ?? []) {
    if (item.image) add(item.image, item.title || "Trajetória", item);
  }

  return slides;
}
