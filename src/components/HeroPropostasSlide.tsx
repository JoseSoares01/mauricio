"use client";

import Link from "next/link";
import Image from "next/image";
import { Building2, Check, ExternalLink, FileText } from "lucide-react";
import type { PropostaItem } from "@/lib/types";
import { mergePropostaLinks, parsePropostaDescription } from "@/lib/proposta-content";
import { getPropostaCardTheme } from "@/lib/proposta-images";

const STATS = [
  {
    id: "acoes",
    value: "+150",
    label: "Ações já realizadas",
    Icon: Check,
  },
  {
    id: "municipios",
    value: "+25",
    label: "Municípios visitados",
    Icon: Building2,
  },
] as const;

function shorten(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function ColumnCard({
  item,
  index,
  imageSrc,
}: {
  item: PropostaItem;
  index: number;
  imageSrc: string | null;
}) {
  const parsed = parsePropostaDescription(item.description);
  const links = mergePropostaLinks(parsed.links, {
    link: item.link,
    documents: item.documents,
  }).slice(0, 5);
  const theme = getPropostaCardTheme(index);
  const summary = shorten(parsed.intro, index === 2 ? 220 : 140);

  return (
    <article className={`hero-propostas-col proposta-card--${theme}`}>
      <div className="hero-propostas-col-banner">
        <span className="proposta-card-blob proposta-card-blob--1" aria-hidden />
        <span className="proposta-card-blob proposta-card-blob--2" aria-hidden />
        <div className="hero-propostas-col-head">
          <div className="hero-propostas-col-head-text">
            <h3 className="hero-propostas-col-title">{item.title}</h3>
            {summary && <p className="hero-propostas-col-text">{summary}</p>}
          </div>
          {imageSrc ? (
            <div className="hero-propostas-col-visual">
              <Image
                src={imageSrc}
                alt=""
                width={200}
                height={200}
                className="hero-propostas-col-image"
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </div>

      {links.length > 0 && (
        <ul className="hero-propostas-docs">
          {links.map((doc) => (
            <li key={doc.url}>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-propostas-doc"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText size={14} aria-hidden className="shrink-0" />
                <span>{doc.title}</span>
                <ExternalLink size={12} aria-hidden className="shrink-0 opacity-55" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

interface HeroPropostasSlideProps {
  propostas: PropostaItem[];
  propostaImages: Record<string, string | null>;
}

export default function HeroPropostasSlide({
  propostas,
  propostaImages,
}: HeroPropostasSlideProps) {
  const featured = propostas.slice(0, 3);

  return (
    <div className="hero-propostas-slide">
      <div className="hero-propostas-inner">
        <p className="hero-propostas-intro">
          Conheça as principais propostas e compromissos para transformar o Piauí.
        </p>

        <div className="hero-propostas-stats">
          {STATS.map(({ id, value, label, Icon }) => (
            <div key={id} className="hero-propostas-stat">
              <span className="hero-propostas-stat-icon" aria-hidden>
                <Icon size={18} strokeWidth={2.5} />
              </span>
              <p className="hero-propostas-stat-text">
                <strong>{value}</strong> {label}
              </p>
            </div>
          ))}
        </div>

        <div className="hero-propostas-grid">
          {featured.map((item, index) => (
            <ColumnCard
              key={item.id}
              item={item}
              index={index}
              imageSrc={propostaImages[item.id] ?? null}
            />
          ))}
        </div>

        <div className="hero-propostas-footer">
          <Link href="/propostas" className="hero-propostas-cta">
            Ver todas as propostas
          </Link>
        </div>
      </div>
    </div>
  );
}
