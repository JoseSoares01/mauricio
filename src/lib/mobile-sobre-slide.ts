export const SOBRE_SLIDE_KEY = "sobre-slide-enter";
export const SOBRE_SLIDE_MS = 420;

export function canUseSobreSlide(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return true;
}
