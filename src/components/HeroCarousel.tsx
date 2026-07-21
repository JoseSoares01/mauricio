"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SocialIcons from "@/components/SocialIcons";
import { getImageFocusStyles } from "@/lib/image-focus";
import type { ImageFocus, SiteConfig } from "@/lib/types";

interface HeroCarouselProps {
  siteTitle: string;
  heroLogo: string;
  heroLogoFocus?: ImageFocus;
  heroPhoto: string;
  heroPhotoFocus?: ImageFocus;
  social: SiteConfig["social"];
}

const SLIDE_MS = 6500;
const TRANSITION_MS = 900;

const PROMO_SLIDES = [
  {
    id: "propostas",
    src: "/uploads/hero-slide-propostas.png",
    alt: "Conheça as propostas do Maurício Soares",
    href: "/propostas",
  },
  {
    id: "mapa",
    src: "/uploads/hero-slide-mapa.png",
    alt: "Mapa de atuação do Maurício",
    href: "/mapa-de-atuacao",
  },
] as const;

export default function HeroCarousel({
  siteTitle,
  heroLogo,
  heroLogoFocus,
  heroPhoto,
  heroPhotoFocus,
  social,
}: HeroCarouselProps) {
  const total = 1 + PROMO_SLIDES.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [goNext, paused]);

  return (
    <section
      className="hero-carousel"
      style={{
        background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
      aria-roledescription="carrossel"
      aria-label="Destaques iniciais"
    >
      <div
        className="hero-carousel-track"
        style={{
          transform: `translate3d(-${index * 100}%, 0, 0)`,
          transitionDuration: `${TRANSITION_MS}ms`,
        }}
      >
        {/* Slide 1 — Maurício + logo */}
        <div className="hero-carousel-slide hero-carousel-slide--home" aria-hidden={index !== 0}>
          <div className="container-site relative pt-24 z-10 h-full">
            <div className="flex justify-center pt-4 md:justify-start md:items-center md:min-h-[calc(98vh-6rem)] md:max-w-[50%]">
              <Image
                src={heroLogo}
                alt={`${siteTitle} - Deputado Federal`}
                width={700}
                height={400}
                className="w-full max-w-[88%] sm:max-w-[82%] md:max-w-[80%] object-contain"
                style={getImageFocusStyles(heroLogoFocus, "contain")}
                priority
                unoptimized
              />
            </div>
          </div>
          <Image
            src={heroPhoto}
            alt={siteTitle}
            width={609}
            height={887}
            className="absolute bottom-0 left-1/2 z-[1] h-[min(54vh,480px)] sm:h-[min(58vh,520px)] w-auto max-w-[95%] -translate-x-1/2 object-contain object-bottom pointer-events-none md:left-auto md:right-[6vw] lg:right-[10vw] md:translate-x-0 md:h-[min(96vh,920px)] md:max-w-none"
            style={getImageFocusStyles(heroPhotoFocus, "contain")}
            priority
            unoptimized
          />
        </div>

        {/* Slides promocionais */}
        {PROMO_SLIDES.map((slide) => (
          <div
            key={slide.id}
            className="hero-carousel-slide hero-carousel-slide--promo"
            aria-hidden={index === 0 ? true : undefined}
          >
            <Link href={slide.href} className="hero-carousel-promo-link" aria-label={slide.alt}>
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                className="object-contain md:object-cover object-center"
                sizes="100vw"
                unoptimized
                priority={false}
              />
            </Link>
          </div>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 social-bar-wrap">
        <div className="flex justify-center">
          <SocialIcons social={social} />
        </div>
        <div className="flag-bar w-full shrink-0" aria-hidden />
      </div>
    </section>
  );
}
