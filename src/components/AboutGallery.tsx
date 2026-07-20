"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FocusedImage from "@/components/FocusedImage";
import type { AboutGalleryItem } from "@/lib/types";

interface AboutGalleryProps {
  items: AboutGalleryItem[];
  eyebrow?: string;
  title?: string;
}

/** Desktop: 3 de cada lado + centro = 7. Mobile/tablet: 2 de cada lado. */
function useMaxSideCards() {
  const [maxSide, setMaxSide] = useState(2);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setMaxSide(mq.matches ? 3 : 2);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return maxSide;
}

function getCardStyle(offset: number, isDesktop: boolean): CSSProperties {
  const distance = Math.abs(offset);

  const step = isDesktop ? 172 : distance === 1 ? 210 : 175;
  const translateX = offset * step;

  const scaleTable = isDesktop ? [1, 0.88, 0.76, 0.64] : [1, 0.84, 0.72];
  const scale = scaleTable[Math.min(distance, scaleTable.length - 1)];
  const rotateY = isDesktop ? offset * -26 : offset * -30;
  const zIndex = 30 - distance;
  const opacity =
    distance === 0 ? 1 : distance === 1 ? 0.9 : distance === 2 ? 0.72 : 0.52;
  const brightness = distance === 0 ? 1 : Math.max(0.55, 1 - distance * 0.12);

  return {
    transform: `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
    zIndex,
    opacity,
    filter: distance === 0 ? "none" : `brightness(${brightness})`,
  };
}

export default function AboutGallery({ items, eyebrow, title }: AboutGalleryProps) {
  const [active, setActive] = useState(0);
  const maxSide = useMaxSideCards();
  const isDesktop = maxSide >= 3;
  const count = items.length;

  const goTo = useCallback(
    (index: number) => {
      if (!count) return;
      setActive(((index % count) + count) % count);
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

  /**
   * Janela virtual: sempre renderiza -maxSide..+maxSide
   * (até 7 no desktop), reaproveitando fotos em anel.
   */
  const slots = useMemo(() => {
    if (!count) return [];
    const list: { key: string; item: AboutGalleryItem; index: number; offset: number }[] = [];
    for (let offset = -maxSide; offset <= maxSide; offset++) {
      const index = ((active + offset) % count + count) % count;
      list.push({
        key: `slot-${offset}-${items[index].id}`,
        item: items[index],
        index,
        offset,
      });
    }
    return list;
  }, [items, active, count, maxSide]);

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
          {slots.map(({ key, item, index, offset }) => (
            <article
              key={key}
              className={`about-gallery-card ${offset === 0 ? "is-active" : ""}`}
              style={getCardStyle(offset, isDesktop)}
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
                  sizes="(max-width: 768px) 72vw, 280px"
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
          ))}
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
