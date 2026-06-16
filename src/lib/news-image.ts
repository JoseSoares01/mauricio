import type { NewsItem } from "./types";

export const DEFAULT_NEWS_IMAGE_FOCUS = { x: 50, y: 50 };

export function getNewsImageFocus(item: Pick<NewsItem, "imageFocusX" | "imageFocusY">) {
  return {
    x: item.imageFocusX ?? DEFAULT_NEWS_IMAGE_FOCUS.x,
    y: item.imageFocusY ?? DEFAULT_NEWS_IMAGE_FOCUS.y,
  };
}

export function getNewsImageObjectPosition(item: Pick<NewsItem, "imageFocusX" | "imageFocusY">): string {
  const { x, y } = getNewsImageFocus(item);
  return `${x}% ${y}%`;
}

export function clampNewsImageFocus(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}
