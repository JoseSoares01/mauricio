"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FocusedImage from "@/components/FocusedImage";
import type { AboutGalleryItem } from "@/lib/types";

interface AboutGalleryProps {
  items: AboutGalleryItem[];
  eyebrow?: string;
  title?: string;
}

function getCardStyle(offset: number): CSSProperties {
  const distance = Math.abs(offset);
  if (distance > 2) {
    return {
      opacity: 0,
      pointerEvents: "none",
      transform: "translateX(0) scale(0.5) rotateY(0deg)",
      zIndex: 0,
    };
  }

  const translateX = offset * (offset === 0 ? 0 : offset > 0 ? 240 : -240);
  const scale = distance === 0 ? 1 : distance === 1 ? 0.84 : 0.72;
  const rotateY = offset * -32;
  const zIndex = 20 - distance;

  return {
    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity: distance === 0 ? 1 : distance === 1 ? 0.82 : 0.55,
    filter: distance === 0 ? "none" : `brightness(${0.92 - distance * 0.12})`,
  };
}

export default function AboutGallery({ items, eyebrow, title }: AboutGalleryProps) {
  const [active, setActive] = useState(0);
  const count = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (!count) return;
      setActive((index + count) % count);
    },
    [count]
  );

  const goPrev = useCallback(() => goTo(active - 1), [active, goTo]);
  const goNext = useCallback(() => goTo(active + 1), [active, goTo]);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!count) return null;

  return (
    <section className="about-gallery" aria-label={title || "Galeria"}>
      {(eyebrow?.trim() || title?.trim()) && (
        <div className="container-site about-gallery-header">
          {eyebrow?.trim() && <p className="about-gallery-eyebrow">{eyebrow}</p>}
          {title?.trim() && <h2 className="about-gallery-title">{title}</h2>}
        </div>
      )}

      <div className="about-gallery-stage">
        <button
          type="button"
          className="about-gallery-nav about-gallery-nav--prev"
          onClick={goPrev}
          aria-label="Card anterior"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="about-gallery-coverflow" aria-live="polite">
          {items.map((item, index) => {
            const offset = index - active;
            return (
              <article
                key={item.id}
                className={`about-gallery-card ${offset === 0 ? "is-active" : ""}`}
                style={getCardStyle(offset)}
                onClick={() => offset !== 0 && goTo(index)}
                aria-hidden={offset !== 0}
              >
                {item.image ? (
                  <FocusedImage
                    src={item.image}
                    alt={item.title}
                    fill
                    focus={item}
                    className="object-cover"
                    sizes="(max-width: 768px) 72vw, 320px"
                    unoptimized
                  />
                ) : (
                  <div className="about-gallery-fallback" />
                )}
                <div className="about-gallery-overlay" />
                <div className="about-gallery-content">
                  {item.tag && <span className="about-gallery-tag">{item.tag}</span>}
                  <h3>{item.title}</h3>
                  {item.text && <p>{item.text}</p>}
                </div>
              </article>
            );
          })}
        </div>

        <button
          type="button"
          className="about-gallery-nav about-gallery-nav--next"
          onClick={goNext}
          aria-label="Próximo card"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </section>
  );
}
