import type { CSSProperties } from "react";
import type { ImageFocus } from "./types";

export const DEFAULT_IMAGE_FOCUS: Required<ImageFocus> = { x: 50, y: 50, zoom: 100 };

export const MIN_IMAGE_ZOOM = 100;
export const MAX_IMAGE_ZOOM = 200;

export type ImageFocusSource =
  | ImageFocus
  | {
      imageFocusX?: number;
      imageFocusY?: number;
      imageZoom?: number;
    };

export function clampImageFocusAxis(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function clampImageZoom(value: number): number {
  return Math.min(MAX_IMAGE_ZOOM, Math.max(MIN_IMAGE_ZOOM, Math.round(value)));
}

export function normalizeImageFocus(source?: ImageFocusSource | null): Required<ImageFocus> {
  if (!source) return { ...DEFAULT_IMAGE_FOCUS };

  const x =
    "x" in source && source.x !== undefined
      ? source.x
      : "imageFocusX" in source
        ? source.imageFocusX
        : DEFAULT_IMAGE_FOCUS.x;
  const y =
    "y" in source && source.y !== undefined
      ? source.y
      : "imageFocusY" in source
        ? source.imageFocusY
        : DEFAULT_IMAGE_FOCUS.y;
  const zoom =
    "zoom" in source && source.zoom !== undefined
      ? source.zoom
      : "imageZoom" in source
        ? source.imageZoom
        : DEFAULT_IMAGE_FOCUS.zoom;

  return {
    x: clampImageFocusAxis(x ?? DEFAULT_IMAGE_FOCUS.x),
    y: clampImageFocusAxis(y ?? DEFAULT_IMAGE_FOCUS.y),
    zoom: clampImageZoom(zoom ?? DEFAULT_IMAGE_FOCUS.zoom),
  };
}

export function getImageObjectPosition(source?: ImageFocusSource | null): string {
  const { x, y } = normalizeImageFocus(source);
  return `${x}% ${y}%`;
}

export function getImageFocusStyles(
  source?: ImageFocusSource | null,
  mode: "cover" | "contain" = "cover"
): CSSProperties {
  const { x, y, zoom } = normalizeImageFocus(source);
  const scale = zoom / 100;

  if (mode === "contain" && scale === 1) {
    return { objectPosition: `${x}% ${y}%` };
  }

  return {
    objectPosition: `${x}% ${y}%`,
    transform: scale === 1 ? undefined : `scale(${scale})`,
    transformOrigin: `${x}% ${y}%`,
  };
}

export function getBackgroundFocusStyles(
  url: string,
  source?: ImageFocusSource | null
): CSSProperties {
  const { x, y, zoom } = normalizeImageFocus(source);
  return {
    backgroundImage: `url(${url})`,
    backgroundPosition: `${x}% ${y}%`,
    backgroundSize: zoom === 100 ? "cover" : `${zoom}%`,
    backgroundRepeat: "no-repeat",
  };
}

export function toLegacyImageFocus(focus: ImageFocus): {
  imageFocusX: number;
  imageFocusY: number;
  imageZoom: number;
} {
  const normalized = normalizeImageFocus(focus);
  return {
    imageFocusX: normalized.x,
    imageFocusY: normalized.y,
    imageZoom: normalized.zoom,
  };
}

export function fromLegacyImageFocus(item: ImageFocusSource): ImageFocus {
  return normalizeImageFocus(item);
}
