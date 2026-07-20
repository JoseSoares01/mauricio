"use client";

import { useEffect } from "react";

const IS_MOBILE_MQ = "(max-width: 767px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";
const NUDGE_PX = 72;
const START_DELAY_MS = 900;
const DOWN_DURATION_MS = 700;
const HOLD_MS = 280;
const UP_DURATION_MS = 650;
const REPEAT_GAP_MS = 900;
const CYCLES = 2;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * No mobile, dá um “empurrão” suave de scroll (desce e sobe)
 * para sugerir que há mais conteúdo abaixo do hero.
 */
export default function MobileScrollNudge() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia(IS_MOBILE_MQ).matches) return;
    if (window.matchMedia(REDUCED_MOTION_MQ).matches) return;
    if (window.scrollY > 8) return;

    let cancelled = false;
    let rafId = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const cancel = () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = setTimeout(() => resolve(), ms);
        timers.push(id);
      });

    const animateScroll = (toY: number, durationMs: number) =>
      new Promise<void>((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }
        const fromY = window.scrollY;
        const delta = toY - fromY;
        if (Math.abs(delta) < 1) {
          resolve();
          return;
        }
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) {
            resolve();
            return;
          }
          const progress = Math.min((now - start) / durationMs, 1);
          window.scrollTo(0, fromY + delta * easeInOut(progress));
          if (progress < 1) {
            rafId = requestAnimationFrame(tick);
          } else {
            resolve();
          }
        };
        rafId = requestAnimationFrame(tick);
      });

    const onUserInteract = () => cancel();

    window.addEventListener("wheel", onUserInteract, { passive: true });
    window.addEventListener("touchstart", onUserInteract, { passive: true });
    window.addEventListener("pointerdown", onUserInteract, { passive: true });

    (async () => {
      await wait(START_DELAY_MS);
      if (cancelled || window.scrollY > 8) return;

      for (let i = 0; i < CYCLES; i++) {
        if (cancelled) return;
        const origin = window.scrollY;
        await animateScroll(origin + NUDGE_PX, DOWN_DURATION_MS);
        if (cancelled) return;
        await wait(HOLD_MS);
        if (cancelled) return;
        await animateScroll(origin, UP_DURATION_MS);
        if (cancelled || i === CYCLES - 1) return;
        await wait(REPEAT_GAP_MS);
      }
    })();

    return () => {
      cancel();
      window.removeEventListener("wheel", onUserInteract);
      window.removeEventListener("touchstart", onUserInteract);
      window.removeEventListener("pointerdown", onUserInteract);
    };
  }, []);

  return null;
}
