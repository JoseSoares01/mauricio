"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import SocialIcons from "@/components/SocialIcons";
import HeroPropostasSlide from "@/components/HeroPropostasSlide";
import { getImageFocusStyles } from "@/lib/image-focus";
import type { ImageFocus, PropostaItem, SiteConfig } from "@/lib/types";

interface HeroCarouselProps {
  siteTitle: string;
  heroLogo: string;
  heroLogoFocus?: ImageFocus;
  heroPhoto: string;
  heroPhotoFocus?: ImageFocus;
  social: SiteConfig["social"];
  propostas: PropostaItem[];
  propostaImages: Record<string, string | null>;
}

const SLIDE_MS = 6500;
const TRANSITION_MS = 900;
const DESKTOP_MQ = "(min-width: 768px)";

const MAPA_SLIDE = {
  id: "mapa",
  src: "/uploads/hero-slide-mapa.png",
  alt: "Mapa de atuação do Maurício",
  href: "/mapa-de-atuacao",
} as const;

function HomeHeroSlide({
  siteTitle,
  heroLogo,
  heroLogoFocus,
  heroPhoto,
  heroPhotoFocus,
}: Omit<HeroCarouselProps, "social" | "propostas" | "propostaImages">) {
  return (
    <>
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
      <div className="hero-photo-fade">
        <Image
          src={heroPhoto}
          alt={siteTitle}
          width={609}
          height={887}
          className="hero-photo-fade-img"
          style={getImageFocusStyles(heroPhotoFocus, "contain")}
          priority
          unoptimized
        />
      </div>
      <span className="hero-photo-page-fade" aria-hidden />
    </>
  );
}

/**
 * Desktop: carrossel automático (Maurício → Propostas → Mapa).
 * Mobile: hero estático como antes (só logo + foto).
 */
export default function HeroCarousel({
  siteTitle,
  heroLogo,
  heroLogoFocus,
  heroPhoto,
  heroPhotoFocus,
  social,
  propostas,
  propostaImages,
}: HeroCarouselProps) {
  const total = 3;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const apply = () => {
      setIsDesktop(mq.matches);
      if (!mq.matches) setIndex(0);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    if (!isDesktop || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [goNext, paused, isDesktop]);

  const homeProps = {
    siteTitle,
    heroLogo,
    heroLogoFocus,
    heroPhoto,
    heroPhotoFocus,
  };

  return (
    <section
      className={`hero-carousel ${isDesktop ? "hero-carousel--desktop" : "hero-carousel--mobile"}`}
      style={{
        background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
      }}
      onMouseEnter={() => isDesktop && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Destaque inicial"
    >
      {isDesktop ? (
        <div
          className="hero-carousel-track"
          style={{
            transform: `translate3d(-${index * 100}%, 0, 0)`,
            transitionDuration: `${TRANSITION_MS}ms`,
          }}
        >
          <div className="hero-carousel-slide hero-carousel-slide--home" aria-hidden={index !== 0}>
            <HomeHeroSlide {...homeProps} />
          </div>

          <div
            className="hero-carousel-slide hero-carousel-slide--promo hero-carousel-slide--propostas"
            aria-hidden={index !== 1}
          >
            <HeroPropostasSlide propostas={propostas} propostaImages={propostaImages} />
          </div>

          <div
            className="hero-carousel-slide hero-carousel-slide--promo"
            aria-hidden={index !== 2}
          >
            <Link
              href={MAPA_SLIDE.href}
              className="hero-carousel-promo-link"
              aria-label={MAPA_SLIDE.alt}
            >
              <Image
                src={MAPA_SLIDE.src}
                alt={MAPA_SLIDE.alt}
                fill
                className="object-contain md:object-cover object-center"
                sizes="100vw"
                unoptimized
                priority={false}
              />
              <span className="hero-promo-fade-edge" aria-hidden />
            </Link>
          </div>
        </div>
      ) : (
        <div className="hero-carousel-slide hero-carousel-slide--home hero-carousel-slide--static">
          <HomeHeroSlide {...homeProps} />
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 z-20 social-bar-wrap">
        <div className="flex justify-center">
          <SocialIcons social={social} />
        </div>
        <div className="flag-bar w-full shrink-0" aria-hidden />
      </div>
    </section>
  );
}
