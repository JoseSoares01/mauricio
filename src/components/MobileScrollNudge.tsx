"use client";

import { useEffect, useState } from "react";

const IS_MOBILE_MQ = "(max-width: 767px)";
const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";
const NUDGE_PX = 56;
const START_DELAY_MS = 700;
const DOWN_DURATION_MS = 700;
const HOLD_MS = 220;
const UP_DURATION_MS = 650;
const REPEAT_GAP_MS = 800;
const CYCLES = 2;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/**
 * No mobile: círculo oco que sobe/desce + leve nudge de scroll,
 * sugerindo que há mais conteúdo abaixo do hero.
 */
export default function MobileScrollNudge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isMobile = window.matchMedia(IS_MOBILE_MQ).matches;
    const reduceMotion = window.matchMedia(REDUCED_MOTION_MQ).matches;
    if (!isMobile) return;

    setVisible(window.scrollY <= 24);

    let cancelled = false;
    let rafId = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const hide = () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      setVisible(false);
    };

    const onScroll = () => {
      if (window.scrollY > 24) hide();
    };

    const onUserInteract = () => {
      // Toque/scroll do usuário encerra o nudge da página, mas o círculo
      // só some quando a página já saiu do topo.
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      if (window.scrollY > 24) setVisible(false);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onUserInteract, { passive: true });
    window.addEventListener("touchstart", onUserInteract, { passive: true });
    window.addEventListener("pointerdown", onUserInteract, { passive: true });

    if (!reduceMotion && window.scrollY <= 8) {
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
    }

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      timers.forEach(clearTimeout);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onUserInteract);
      window.removeEventListener("touchstart", onUserInteract);
      window.removeEventListener("pointerdown", onUserInteract);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="mobile-scroll-hint md:hidden"
      aria-hidden="true"
      onClick={() => {
        window.scrollBy({ top: Math.min(window.innerHeight * 0.7, 520), behavior: "smooth" });
        setVisible(false);
      }}
    >
      <span className="mobile-scroll-hint-circle" />
    </div>
  );
}
