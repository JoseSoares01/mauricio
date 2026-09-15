"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AboutMetric, ImageFocus } from "@/lib/types";
import { getImageFocusStyles } from "@/lib/image-focus";

interface AboutPreviewSectionProps {
  logoBlue: string;
  logoBlueFocus?: ImageFocus;
  aboutBg: string;
  aboutBgFocus?: ImageFocus;
  shortText: string;
  metrics: AboutMetric[];
}

/** Qualificações destacadas de forma discreta (ordem: frases mais longas primeiro). */
const EMPHASIS_PHRASES = [
  "Oficial R/2 do Exército Brasileiro",
  "Servidor Público Federal",
  "Doutor em melhoramento genético",
  "Professor",
  "Biólogo",
] as const;

function formatMetricValue(value: number): string {
  return Math.round(value).toLocaleString("pt-BR");
}

function renderEmphasizedText(text: string): ReactNode[] {
  if (!text) return [];

  type Match = { start: number; end: number; phrase: string };
  const matches: Match[] = [];
  const lower = text.toLowerCase();

  for (const phrase of EMPHASIS_PHRASES) {
    const needle = phrase.toLowerCase();
    let from = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      const end = idx + phrase.length;
      const overlaps = matches.some((m) => idx < m.end && end > m.start);
      if (!overlaps) matches.push({ start: idx, end, phrase: text.slice(idx, end) });
      from = end;
    }
  }

  matches.sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) nodes.push(text.slice(cursor, m.start));
    nodes.push(
      <strong key={`em-${i}`} className="about-home-emphasis">
        {m.phrase}
      </strong>
    );
    cursor = m.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

function AnimatedMetric({
  metric,
  animate,
  delayMs,
}: {
  metric: AboutMetric;
  animate: boolean;
  delayMs: number;
}) {
  const [value, setValue] = useState(0);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!animate || hasRunRef.current) return;
    hasRunRef.current = true;

    const duration = 1800;
    let frame = 0;
    let timer: ReturnType<typeof setTimeout>;

    const start = () => {
      const startTime = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(eased * metric.value);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    timer = setTimeout(start, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [animate, metric.value, delayMs]);

  return (
    <li className="about-metric-item">
      <span className="about-metric-value" aria-label={`${formatMetricValue(metric.value)} ${metric.label}`}>
        {formatMetricValue(value)}
      </span>
      <span className="about-metric-label">{metric.label}</span>
    </li>
  );
}

export default function AboutPreviewSection({
  logoBlue,
  logoBlueFocus,
  aboutBg,
  aboutBgFocus,
  shortText,
  metrics,
}: AboutPreviewSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimatedRef = useRef(false);
  const [animate, setAnimate] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          setAnimate(true);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!animate) return;

    const text = shortText.trim();
    if (!text) return;

    let index = 0;
    setTypedText("");
    setTypingDone(false);

    const interval = setInterval(() => {
      index += 1;
      setTypedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [animate, shortText]);

  return (
    <section
      ref={sectionRef}
      data-reveal-skip
      style={{ backgroundColor: "var(--color-primary)" }}
      className="about-home-section min-h-[660px] overflow-hidden"
    >
      <div className="container-site grid md:grid-cols-2 items-stretch min-h-[660px]">
        <div className="about-home-copy py-12 md:pr-12 flex flex-col justify-center">
          <Image
            src={logoBlue}
            alt="Logo"
            width={500}
            height={500}
            className="w-[75%] md:w-[65%] max-w-[340px] mb-7"
            style={getImageFocusStyles(logoBlueFocus, "contain")}
            unoptimized
          />
          <p className="about-home-lead">
            {renderEmphasizedText(typedText)}
            {!typingDone && animate && (
              <span className="about-typewriter-cursor" aria-hidden="true">
                |
              </span>
            )}
          </p>

          <ul className="about-metrics-list">
            {metrics.map((metric, i) => (
              <AnimatedMetric
                key={metric.id}
                metric={metric}
                animate={animate}
                delayMs={i * 120}
              />
            ))}
          </ul>

          <Link href="/mapa-de-atuacao" className="about-home-cta self-start">
            <span>Mapa de Atuação</span>
            <span className="about-home-cta-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
        <div
          className="about-home-photo min-h-[400px] md:min-h-[660px] h-full self-stretch"
          style={{
            backgroundImage: `url(${aboutBg})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
            backgroundPosition: `${aboutBgFocus?.x ?? 0}% 100%`,
          }}
          aria-hidden
        />
      </div>
    </section>
  );
}
