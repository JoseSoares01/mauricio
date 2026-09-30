import type { HomeCarouselSlide, SiteConfig } from "./types";
import type { ImageFocusSource } from "./image-focus";

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

export const MAX_HOME_CAROUSEL_SLIDES = 12;

function configuredUrl(url?: string | null): string | null {
  const trimmed = url?.trim();
  return trimmed ? trimmed : null;
}

function shortenDescription(text: string | undefined, max = 140): string | undefined {
  if (!text?.trim()) return undefined;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  const slice = normalized.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${(lastSpace > 80 ? slice.slice(0, lastSpace) : slice).trim()}…`;
}

/** Monta slides a partir de banner + galeria + trajetória (legado). */
export function deriveHomeCarouselFromLegacy(config: SiteConfig): HomeCarouselSlide[] {
  const seen = new Set<string>();
  const slides: HomeCarouselSlide[] = [];

  const add = (
    rawSrc: string | undefined,
    meta?: {
      id?: string;
      title?: string;
      text?: string;
      tag?: string;
      imageFocusX?: number;
      imageFocusY?: number;
      imageZoom?: number;
    }
  ) => {
    if (!rawSrc?.trim() || slides.length >= MAX_HOME_CAROUSEL_SLIDES) return;
    const src = configuredUrl(rawSrc);
    if (!src || seen.has(src)) return;
    seen.add(src);
    slides.push({
      id: meta?.id || `hc-${slides.length + 1}`,
      image: rawSrc.trim(),
      title: meta?.title?.trim() || undefined,
      text: meta?.text?.trim() || undefined,
      tag: meta?.tag?.trim() || undefined,
      imageFocusX: meta?.imageFocusX,
      imageFocusY: meta?.imageFocusY,
      imageZoom: meta?.imageZoom,
    });
  };

  add(config.images.banner, { title: "Banner" });
  add(config.images.bannerSecondary, { title: "Banner" });

  for (const item of config.about?.gallery ?? []) {
    add(item.image, {
      id: item.id,
      title: item.title,
      text: item.text,
      tag: item.tag,
      imageFocusX: item.imageFocusX,
      imageFocusY: item.imageFocusY,
      imageZoom: item.imageZoom,
    });
  }

  for (const item of config.about?.timeline ?? []) {
    if (item.image) {
      add(item.image, {
        id: item.id,
        title: item.title,
        text: item.text,
        tag: item.year,
        imageFocusX: item.imageFocusX,
        imageFocusY: item.imageFocusY,
        imageZoom: item.imageZoom,
      });
    }
  }

  return slides;
}

export function normalizeHomeCarousel(
  slides: HomeCarouselSlide[] | undefined,
  config: SiteConfig
): HomeCarouselSlide[] {
  const source =
    Array.isArray(slides) && slides.length > 0
      ? slides
      : deriveHomeCarouselFromLegacy(config);

  return source
    .filter((slide) => Boolean(slide?.image?.trim()))
    .slice(0, MAX_HOME_CAROUSEL_SLIDES)
    .map((slide, index) => ({
      id: slide.id?.trim() || `hc-${index + 1}`,
      image: slide.image.trim(),
      title: slide.title?.trim() || undefined,
      text: slide.text?.trim() || undefined,
      tag: slide.tag?.trim() || undefined,
      imageFocusX: slide.imageFocusX,
      imageFocusY: slide.imageFocusY,
      imageZoom: slide.imageZoom,
    }));
}

export function getHomeBannerSlides(config: SiteConfig): HomeBannerSlide[] {
  const carousel = normalizeHomeCarousel(config.homeCarousel, config);
  const slides: HomeBannerSlide[] = [];
  const seen = new Set<string>();

  for (const item of carousel) {
    if (slides.length >= MAX_HOME_CAROUSEL_SLIDES) break;
    const src = configuredUrl(item.image);
    if (!src || seen.has(src)) continue;
    seen.add(src);
    slides.push({
      id: item.id || src,
      src,
      alt: item.title?.trim() || "Banner",
      title: item.title?.trim() || undefined,
      description: shortenDescription(item.text),
      tag: item.tag?.trim() || undefined,
      focus: {
        imageFocusX: item.imageFocusX,
        imageFocusY: item.imageFocusY,
        imageZoom: item.imageZoom,
      },
    });
  }

  return slides;
}
