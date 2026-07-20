"use client";

import FocusedImage from "@/components/FocusedImage";
import type { AboutGalleryItem } from "@/lib/types";

interface AboutGalleryProps {
  items: AboutGalleryItem[];
  eyebrow?: string;
  title?: string;
}

export default function AboutGallery({ items, eyebrow, title }: AboutGalleryProps) {
  if (!items.length) return null;

  return (
    <section className="about-gallery" aria-label={title || "Galeria"}>
      {(eyebrow?.trim() || title?.trim()) && (
        <div className="container-site about-gallery-header">
          {eyebrow?.trim() && <p className="about-gallery-eyebrow">{eyebrow}</p>}
          {title?.trim() && <h2 className="about-gallery-title">{title}</h2>}
        </div>
      )}
      <div className="about-gallery-track">
        {items.map((item) => (
          <article key={item.id} className="about-gallery-card">
            {item.image ? (
              <FocusedImage
                src={item.image}
                alt={item.title}
                fill
                focus={item}
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 360px"
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
    </section>
  );
}
