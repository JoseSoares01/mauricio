"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import SocialIcons from "@/components/SocialIcons";
import {
  HeroShowcaseAgenda,
  HeroShowcaseMapa,
  HeroShowcaseNoticias,
  HeroShowcasePropostas,
  type HeroMapStatsPreview,
  type HeroMapVisitPreview,
} from "@/components/HeroShowcaseSlides";
import { getImageFocusStyles } from "@/lib/image-focus";
import { SPLASH_COMPLETE_EVENT } from "@/lib/splash";
import type { AgendaEvent, ImageFocus, NewsItem, PropostaItem, SiteConfig } from "@/lib/types";

interface HeroCarouselProps {
  siteTitle: string;
  heroLogo: string;
  heroLogoFocus?: ImageFocus;
  heroPhoto: string;
  heroPhotoFocus?: ImageFocus;
  social: SiteConfig["social"];
  propostas: PropostaItem[];
  propostaImages: Record<string, string | null>;
  news: NewsItem[];
  agenda: AgendaEvent[];
  mapVisits: HeroMapVisitPreview[];
  mapStats: HeroMapStatsPreview;
}

const SLIDE_MS = 6500;
const TRANSITION_MS = 900;
const DESKTOP_MQ = "(min-width: 768px)";
const TOTAL_SLIDES = 5;

function HomeHeroSlide({
  siteTitle,
  heroLogo,
  heroLogoFocus,
  heroPhoto,
  heroPhotoFocus,
}: Pick<
  HeroCarouselProps,
  "siteTitle" | "heroLogo" | "heroLogoFocus" | "heroPhoto" | "heroPhotoFocus"
>) {
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
 * Desktop: carrossel automático (Maurício → showcases).
 * Mobile: hero estático como antes (só logo + foto).
 * Após a splash, o desktop começa sempre no slide do Maurício.
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
  news,
  agenda,
  mapVisits,
  mapStats,
}: HeroCarouselProps) {
  const total = TOTAL_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [autoplayReady, setAutoplayReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const apply = () => {
      setIsDesktop(mq.matches);
      if (!mq.matches) {
        setIndex(0);
        setAutoplayReady(false);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    let cancelled = false;
    let settled = false;

    const markReady = () => {
      if (cancelled || settled) return;
      settled = true;
      setIndex(0);
      setAutoplayReady(true);
    };

    const onSplashComplete = () => markReady();
    window.addEventListener(SPLASH_COMPLETE_EVENT, onSplashComplete);

    const checkId = window.setTimeout(() => {
      const splashOn =
        document.documentElement.classList.contains("splash-lock") ||
        !!document.querySelector(".splash-intro");
      if (!splashOn) markReady();
    }, 120);

    const safetyId = window.setTimeout(markReady, 12000);

    return () => {
      cancelled = true;
      window.removeEventListener(SPLASH_COMPLETE_EVENT, onSplashComplete);
      window.clearTimeout(checkId);
      window.clearTimeout(safetyId);
    };
  }, [isDesktop]);

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total]
  );

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isDesktop || !autoplayReady || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(goNext, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [goNext, paused, isDesktop, autoplayReady]);

  const homeProps = {
    siteTitle,
    heroLogo,
    heroLogoFocus,
    heroPhoto,
    heroPhotoFocus,
  };

  const slideLabels = [
    "Início",
    "Propostas",
    "Mapa de Atuação",
    "Notícias",
    "Agenda",
  ];

  return (
    <section
      className={`hero-carousel ${isDesktop ? "hero-carousel--desktop" : "hero-carousel--mobile"}`}
      style={{
        background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
      }}
      onMouseEnter={() => isDesktop && setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Destaque inicial"
      aria-roledescription="carrossel"
    >
      {isDesktop ? (
        <>
          <div
            className="hero-carousel-track"
            style={{
              transform: `translate3d(-${index * 100}%, 0, 0)`,
              transitionDuration: autoplayReady ? `${TRANSITION_MS}ms` : "0ms",
            }}
          >
            <div className="hero-carousel-slide hero-carousel-slide--home" aria-hidden={index !== 0}>
              <HomeHeroSlide {...homeProps} />
            </div>

            <div
              className="hero-carousel-slide hero-carousel-slide--promo hero-carousel-slide--showcase"
              aria-hidden={index !== 1}
            >
              <HeroShowcasePropostas propostas={propostas} propostaImages={propostaImages} />
            </div>

            <div
              className="hero-carousel-slide hero-carousel-slide--promo hero-carousel-slide--showcase"
              aria-hidden={index !== 2}
            >
              <HeroShowcaseMapa visits={mapVisits} stats={mapStats} />
            </div>

            <div
              className="hero-carousel-slide hero-carousel-slide--promo hero-carousel-slide--showcase"
              aria-hidden={index !== 3}
            >
              <HeroShowcaseNoticias news={news} />
            </div>

            <div
              className="hero-carousel-slide hero-carousel-slide--promo hero-carousel-slide--showcase"
              aria-hidden={index !== 4}
            >
              <HeroShowcaseAgenda agenda={agenda} />
            </div>
          </div>

          <div className="hero-carousel-nav">
            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={goPrev}
              aria-label="Slide anterior"
            >
              ‹
            </button>
            <div className="hero-carousel-dots" role="tablist" aria-label="Slides do destaque">
              {slideLabels.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  role="tab"
                  aria-selected={index === i}
                  aria-label={label}
                  className={`hero-carousel-dot${index === i ? " is-active" : ""}`}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
            <button
              type="button"
              className="hero-carousel-arrow"
              onClick={goNext}
              aria-label="Próximo slide"
            >
              ›
            </button>
          </div>
        </>
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
