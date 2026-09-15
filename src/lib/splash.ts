export const SPLASH_COMPLETE_EVENT = "mauricio:splash-complete";

export function emitSplashComplete() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SPLASH_COMPLETE_EVENT));
}
