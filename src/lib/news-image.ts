import type { NewsItem } from "./types";
import {
  clampImageFocusAxis,
  DEFAULT_IMAGE_FOCUS,
  getImageObjectPosition,
  normalizeImageFocus,
} from "./image-focus";

export const DEFAULT_NEWS_IMAGE_FOCUS = { x: DEFAULT_IMAGE_FOCUS.x, y: DEFAULT_IMAGE_FOCUS.y };

export function getNewsImageFocus(item: Pick<NewsItem, "imageFocusX" | "imageFocusY" | "imageZoom">) {
  return normalizeImageFocus(item);
}

export function getNewsImageObjectPosition(
  item: Pick<NewsItem, "imageFocusX" | "imageFocusY" | "imageZoom">
): string {
  return getImageObjectPosition(item);
}

export function clampNewsImageFocus(value: number): number {
  return clampImageFocusAxis(value);
}
