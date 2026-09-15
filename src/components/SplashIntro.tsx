"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { emitSplashComplete } from "@/lib/splash";

/**
 * Timeline única (proporcional) — 2200 e M sincronizados.
 *
 * 0%–14%   1.º "2"   ⎤
 * 14%–28%  2.º "2"   ⎥ um pouco mais rápido
 * 28%–42%  1.º "0"   ⎥
 * 42%–55%  2.º "0"   ⎦
 * ~52%     M surge minúsculo e inicia UM crescimento contínuo (ease-in)
 * 52%–100% M expande sem keyframes intermediários; acelera só no fim
 * ~66%–88% 2200 funde-se enquanto o M ainda está moderado → grande
 */
const TOTAL_MS = 8600;

const DIGITS = [
  { src: "/uploads/splash/digit-2.png", key: "2a", appearAt: 0.0, readyAt: 0.14 },
  { src: "/uploads/splash/digit-2.png", key: "2b", appearAt: 0.14, readyAt: 0.28 },
  { src: "/uploads/splash/digit-0.png", key: "0a", appearAt: 0.28, readyAt: 0.42 },
  { src: "/uploads/splash/digit-0.png", key: "0b", appearAt: 0.42, readyAt: 0.55 },
] as const;

const EASE_SOFT = [0.25, 0.1, 0.25, 1] as const;
/** Um único ease-in contínuo: começa lento (M pequeno com 2200) e acelera no fim. */
const EASE_M_GROW = [0.7, 0.0, 0.85, 0.35] as const;

const M_START = 0.52;
const M_GROW_SPAN = 1 - M_START;

export default function SplashIntro() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const startedRef = useRef(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (typeof window === "undefined") return;
    if (startedRef.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      startedRef.current = true;
      emitSplashComplete();
      return;
    }

    startedRef.current = true;
    finishedRef.current = false;
    setVisible(true);
    document.documentElement.classList.add("splash-lock");

    return () => {
      document.documentElement.classList.remove("splash-lock");
    };
  }, [pathname]);

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    document.documentElement.classList.remove("splash-lock");
    setVisible(false);
    emitSplashComplete();
  };

  useEffect(() => {
    if (!visible) return;
    const id = window.setTimeout(finish, TOTAL_MS);
    return () => window.clearTimeout(id);
  }, [visible]);

  const duration = TOTAL_MS / 1000;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="splash-intro"
          role="presentation"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 1, 0.45, 0] }}
          transition={{
            duration,
            times: [0, 0.86, 0.91, 0.96, 1],
            ease: "easeInOut",
          }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: EASE_SOFT } }}
        >
          <motion.div
            className="splash-intro-gradient"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE_SOFT }}
          />
          <div className="splash-intro-vignette" />

          <div className="splash-intro-stage">
            {/*
              Scale do M = UM único tween contínuo (sem keyframes intermediários).
              Ease-in forte: permanece pequeno enquanto o 2200 está visível,
              acelera suavemente só no final para cobrir a tela.
            */}
            <motion.div
              className="splash-intro-m-wrap"
              initial={{ opacity: 0, scale: 0.08 }}
              animate={{ opacity: 1, scale: 42 }}
              transition={{
                opacity: {
                  delay: duration * M_START,
                  duration: 0.55,
                  ease: "linear",
                },
                scale: {
                  delay: duration * M_START,
                  duration: duration * M_GROW_SPAN,
                  ease: EASE_M_GROW,
                  type: "tween",
                },
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/uploads/splash/logo-m.png"
                alt=""
                className="splash-intro-m"
                draggable={false}
              />
            </motion.div>

            <div className="splash-intro-digits">
              {DIGITS.map((digit) => (
                <motion.img
                  key={digit.key}
                  src={digit.src}
                  alt=""
                  className="splash-intro-digit"
                  draggable={false}
                  initial={{ opacity: 0, scale: 0.78, y: 14 }}
                  animate={{
                    opacity: [0, 0, 1, 1, 0.55, 0],
                    scale: [0.78, 0.78, 1.02, 1, 1.04, 1.1],
                    y: [14, 14, -2, 0, 0, 0],
                  }}
                  transition={{
                    duration,
                    times: [
                      0,
                      digit.appearAt,
                      digit.readyAt,
                      0.66,
                      0.76,
                      0.86,
                    ],
                    ease: EASE_SOFT,
                  }}
                />
              ))}
            </div>
          </div>

          <motion.div
            className="splash-intro-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.12, 0.32, 0] }}
            transition={{
              duration,
              times: [0, 0.84, 0.9, 0.95, 1],
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
