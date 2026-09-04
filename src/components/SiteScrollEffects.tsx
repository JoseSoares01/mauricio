"use client";

import { useEffect } from "react";

const SKIP_SELECTOR = [
  "[data-reveal-skip]",
  ".mapboxgl-map",
  ".mapboxgl-canvas",
  ".mapboxgl-ctrl",
  ".admin-card",
  ".hamburger-btn",
  "header",
  "footer",
  ".flag-bar",
  ".social-bar-wrap",
  ".mobile-scroll-hint",
  "script",
  "style",
  "noscript",
].join(",");

const BLOCK_SELECTOR = [
  "main section",
  "main article",
  "main .news-card",
  "main .proposta-card",
  "main .video-grid > *",
  "main .instagram-grid > *",
  "main .about-gallery-card",
  "main .about-timeline-row",
  "main .about-intro-grid > *",
].join(",");

const TEXT_SELECTOR = [
  "main h1",
  "main h2",
  "main h3",
  "main .section-title",
  "main .about-timeline-title",
  "main .about-gallery-title",
  "main .about-hero-subtitle",
  "main .about-intro-text > p",
  "main .about-timeline-copy > p",
  "main .excerpt",
].join(",");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isAboveFold(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight * 0.88;
}

function shouldSkip(el: Element) {
  if (!(el instanceof HTMLElement)) return true;
  if (el.closest(SKIP_SELECTOR)) return true;
  if (el.dataset.revealReady === "1") return true;
  return false;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapWords(el: HTMLElement) {
  if (el.dataset.revealText) return;

  const hasRichChildren = el.querySelector(
    "a, button, input, textarea, strong, em, code, svg, img, ul, ol, li, span.reveal-word"
  );
  const text = el.textContent ?? "";

  if (hasRichChildren || !text.trim() || text.length > 380) {
    el.classList.add("reveal-block");
    el.dataset.revealText = "block";
    return;
  }

  const words = text.split(/(\s+)/);
  el.setAttribute("aria-label", text.trim());
  el.innerHTML = words
    .map((part) => {
      if (/^\s+$/.test(part)) return part;
      return `<span class="reveal-word">${escapeHtml(part)}</span>`;
    })
    .join("");
  el.dataset.revealText = "words";
  el.classList.add("reveal-text");
}

function prepareElement(el: HTMLElement, kind: "block" | "text") {
  if (el.dataset.revealReady === "1") return;
  if (kind === "text") wrapWords(el);
  else el.classList.add("reveal-block");
  el.dataset.revealReady = "1";
}

function reveal(el: HTMLElement, instant = false) {
  if (el.classList.contains("is-revealed")) return;

  if (instant) {
    el.classList.add("is-revealed", "reveal-instant");
  } else {
    el.classList.add("is-revealed");
  }

  if (el.dataset.revealText === "words") {
    const words = Array.from(el.querySelectorAll<HTMLElement>(".reveal-word"));
    words.forEach((word, index) => {
      word.style.transitionDelay = instant ? "0ms" : `${Math.min(index * 28, 420)}ms`;
      word.classList.add("is-shown");
    });
  }
}

/**
 * Efeitos globais de scroll: fade-in dos blocos e texto
 * que se forma palavra a palavra ao entrar na tela.
 */
export default function SiteScrollEffects() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (prefersReducedMotion()) return;

    const observed = new Set<Element>();
    let scanTimer = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          reveal(el);
          observer.unobserve(el);
          observed.delete(el);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -6% 0px",
      }
    );

    const scan = () => {
      const collect = (selector: string, kind: "block" | "text") => {
        document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
          if (shouldSkip(el) || observed.has(el)) return;

          // Acima da dobra: não esconde — evita página “vazia” na troca de menu.
          if (isAboveFold(el)) {
            el.dataset.revealReady = "1";
            return;
          }

          prepareElement(el, kind);
          observer.observe(el);
          observed.add(el);
        });
      };

      collect(BLOCK_SELECTOR, "block");
      collect(TEXT_SELECTOR, "text");
    };

    // Espera um frame para layout estabilizar (evita flash)
    requestAnimationFrame(() => {
      scan();
    });

    const mutation = new MutationObserver(() => {
      window.clearTimeout(scanTimer);
      scanTimer = window.setTimeout(scan, 100);
    });

    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.clearTimeout(scanTimer);
      observer.disconnect();
      mutation.disconnect();
    };
  }, []);

  return null;
}
