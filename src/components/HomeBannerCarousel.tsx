"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import FocusedImage from "@/components/FocusedImage";
import type { HomeBannerSlide } from "@/lib/home-banners";

const SLIDE_MS = 5500;
const TRANSITION_MS = 800;
const SWIPE_THRESHOLD = 48;

interface HomeBannerCarouselProps {
  slides: HomeBannerSlide[];
}

function padIndex(n: number): string {
  return String(n).padStart(2, "0");
}

export default function HomeBannerCarousel({ slides }: HomeBannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const total = slides.length;
  const hasMultiple = total > 1;

  const goTo = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (!hasMultiple || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, [hasMultiple, paused, total]);

  useEffect(() => {
    if (!hasMultiple) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!paused) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasMultiple, paused, goPrev, goNext]);

  if (!total) return null;

  const activeSlide = slides[index];
  const progress = ((index + 1) / total) * 100;

  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    if (touchStartX.current == null || !hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goPrev();
    else goNext();
  };

  return (
    <section
      className="home-trajetoria"
      aria-label="Trajetória em movimento"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-site home-trajetoria-inner">
        <div className="home-trajetoria-copy">
          <p className="home-trajetoria-label">Minha trajetória em movimento</p>
          <h2 className="home-trajetoria-title">Uma história construída na prática.</h2>
          <div className="home-trajetoria-rule" aria-hidden="true" />
          <p className="home-trajetoria-intro">
            As fotografias desta seção registram momentos da trajetória profissional,
            acadêmica, militar, científica e de atuação social — presença, serviço e
            proximidade com diferentes realidades.
          </p>
          <Link href="/sobre" className="home-trajetoria-cta">
            <span>Conhecer a trajetória</span>
            <span className="home-trajetoria-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>

        <div className="home-trajetoria-media">
          <div
            className="home-trajetoria-stage relative w-full overflow-hidden"
            style={{ aspectRatio: "4 / 5", maxHeight: "min(72vh, 40rem)" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {slides.map((slide, slideIndex) => {
              const isActive = slideIndex === index;
              return (
                <article
                  key={slide.id}
                  className={`home-trajetoria-slide${isActive ? " is-active" : ""}`}
                  style={{ position: "absolute", inset: 0 }}
                  aria-hidden={!isActive}
                >
                  <FocusedImage
                    src={slide.src}
                    alt={slide.alt}
                    width={960}
                    height={1200}
                    focus={slide.focus}
                    className="home-trajetoria-image"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    unoptimized
                    priority={slideIndex === 0}
                    loading={slideIndex === 0 ? "eager" : "lazy"}
                  />
                </article>
              );
            })}
          </div>

          <div className="home-trajetoria-meta">
            <div className="home-trajetoria-meta-top">
              <p className="home-trajetoria-counter" aria-live="polite">
                <span className="home-trajetoria-counter-current">{padIndex(index + 1)}</span>
                <span className="home-trajetoria-counter-sep" aria-hidden="true">
                  /
                </span>
                <span className="home-trajetoria-counter-total">{padIndex(total)}</span>
              </p>

              {hasMultiple && (
                <div className="home-trajetoria-nav">
                  <button
                    type="button"
                    className="home-trajetoria-nav-btn"
                    onClick={goPrev}
                    aria-label="Fotografia anterior"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="home-trajetoria-nav-btn"
                    onClick={goNext}
                    aria-label="Próxima fotografia"
                  >
                    →
                  </button>
                </div>
              )}
            </div>

            {hasMultiple && (
              <div
                className="home-trajetoria-progress"
                role="progressbar"
                aria-valuemin={1}
                aria-valuemax={total}
                aria-valuenow={index + 1}
                aria-label="Progresso do carrossel"
              >
                <span
                  className="home-trajetoria-progress-bar"
                  style={{
                    width: `${progress}%`,
                    transitionDuration: `${TRANSITION_MS}ms`,
                  }}
                />
              </div>
            )}

            {(activeSlide.title || activeSlide.description || activeSlide.tag) && (
              <div className="home-trajetoria-caption">
                {activeSlide.tag && (
                  <p className="home-trajetoria-caption-tag">{activeSlide.tag}</p>
                )}
                {activeSlide.title && (
                  <h3 className="home-trajetoria-caption-title">{activeSlide.title}</h3>
                )}
                {activeSlide.description && (
                  <p className="home-trajetoria-caption-text">{activeSlide.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
