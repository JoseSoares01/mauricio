"use client";

import { useEffect, useState } from "react";
import FocusedImage from "@/components/FocusedImage";
import type { HomeBannerSlide } from "@/lib/home-banners";

const SLIDE_MS = 5500;
const TRANSITION_MS = 900;

interface HomeBannerCarouselProps {
  slides: HomeBannerSlide[];
}

export default function HomeBannerCarousel({ slides }: HomeBannerCarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;
  const hasMultiple = total > 1;

  useEffect(() => {
    if (!hasMultiple || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, SLIDE_MS);

    return () => window.clearInterval(id);
  }, [hasMultiple, paused, total]);

  if (!total) return null;

  const activeSlide = slides[index];

  return (
    <section
      className="home-banner-carousel"
      aria-label="Destaques em imagens"
      aria-roledescription="carrossel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="home-banner-carousel-stage">
        <div className="home-banner-carousel-backdrop" aria-hidden="true">
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className={`home-banner-carousel-backdrop-slide${
                slideIndex === index ? " is-active" : ""
              }`}
              style={{ backgroundImage: `url("${slide.src}")` }}
            />
          ))}
        </div>
        <div className="home-banner-carousel-overlay" aria-hidden="true" />

        <div className="home-banner-carousel-viewport">
          <div
            className="home-banner-carousel-track"
            style={{
              width: `${total * 100}%`,
              transform: `translate3d(-${(index * 100) / total}%, 0, 0)`,
              transitionDuration: hasMultiple ? `${TRANSITION_MS}ms` : "0ms",
            }}
            aria-live="polite"
          >
            {slides.map((slide, slideIndex) => (
              <article
                key={slide.id}
                className="home-banner-carousel-slide"
                style={{ width: `${100 / total}%` }}
                aria-hidden={slideIndex !== index}
              >
                <FocusedImage
                  src={slide.src}
                  alt={slide.alt}
                  width={512}
                  height={1024}
                  focus={slide.focus}
                  className="home-banner-carousel-image"
                  sizes="(min-width: 768px) 576px, 100vw"
                  unoptimized
                  priority={slideIndex === 0}
                />
              </article>
            ))}
          </div>
        </div>
      </div>

      {hasMultiple && (
        <div className="home-banner-carousel-dots" role="tablist" aria-label="Slides do carrossel">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              className={`home-banner-carousel-dot${dotIndex === index ? " is-active" : ""}`}
              aria-label={`Ir para imagem ${dotIndex + 1}: ${activeSlide.alt}`}
              aria-selected={dotIndex === index}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
