"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { AboutMetric } from "@/lib/types";

interface AboutPreviewSectionProps {
  logoBlue: string;
  aboutBg: string;
  shortText: string;
  metrics: AboutMetric[];
}

function formatMetricValue(value: number): string {
  return Math.round(value).toLocaleString("pt-BR");
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
      <span className="about-metric-icon" aria-hidden="true">{metric.icon}</span>
      <span className="about-metric-text">
        <strong>{formatMetricValue(value)}</strong> {metric.label}
      </span>
    </li>
  );
}

export default function AboutPreviewSection({
  logoBlue,
  aboutBg,
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
      style={{ backgroundColor: "var(--color-primary)" }}
      className="min-h-[660px]"
    >
      <div className="container-site grid md:grid-cols-2 items-center min-h-[660px]">
        <div className="py-12 md:pr-12">
          <Image
            src={logoBlue}
            alt="Logo"
            width={500}
            height={500}
            className="w-[75%] md:w-[65%] max-w-[340px] mb-6"
            unoptimized
          />
          <p className="text-white text-[17px] leading-relaxed mb-6 min-h-[5.5rem]">
            {typedText}
            {!typingDone && animate && <span className="about-typewriter-cursor" aria-hidden="true">|</span>}
          </p>

          <ul className="about-metrics-list mb-6">
            {metrics.map((metric, i) => (
              <AnimatedMetric
                key={metric.id}
                metric={metric}
                animate={animate}
                delayMs={i * 120}
              />
            ))}
          </ul>

          <Link href="/sobre" className="btn-primary">
            Saiba mais
          </Link>
        </div>
        <div
          className="min-h-[400px] md:min-h-[660px] bg-cover bg-center"
          style={{ backgroundImage: `url(${aboutBg})` }}
        />
      </div>
    </section>
  );
}
