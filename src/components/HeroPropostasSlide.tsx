"use client";

import Link from "next/link";
import {
  Bird,
  Building2,
  Check,
  ExternalLink,
  FileText,
  ShieldCheck,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { PropostaItem } from "@/lib/types";
import { mergePropostaLinks, parsePropostaDescription } from "@/lib/proposta-content";

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

const COLUMN_ICONS: Record<string, LucideIcon> = {
  "1": ShieldCheck,
  "2": Bird,
  "3": Shield,
};

function pickIcon(item: PropostaItem, index: number): LucideIcon {
  if (COLUMN_ICONS[item.id]) return COLUMN_ICONS[item.id];
  const title = item.title.toLowerCase();
  if (title.includes("soberania")) return ShieldCheck;
  if (title.includes("aborto") || title.includes("comunismo")) return Bird;
  if (title.includes("segurança") || title.includes("policial")) return Shield;
  return [ShieldCheck, Bird, Shield][index % 3];
}

function shorten(text: string, max: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function ColumnCard({ item, index }: { item: PropostaItem; index: number }) {
  const parsed = parsePropostaDescription(item.description);
  const links = mergePropostaLinks(parsed.links, {
    link: item.link,
    documents: item.documents,
  }).slice(0, 5);
  const Icon = pickIcon(item, index);
  const summary = shorten(parsed.intro, index === 2 ? 220 : 140);

  return (
    <article className="hero-propostas-col">
      <div className="hero-propostas-col-head">
        <span className="hero-propostas-col-icon" aria-hidden>
          <Icon size={28} strokeWidth={1.75} />
        </span>
        <h3 className="hero-propostas-col-title">{item.title}</h3>
      </div>

      {summary && <p className="hero-propostas-col-text">{summary}</p>}

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
}

export default function HeroPropostasSlide({ propostas }: HeroPropostasSlideProps) {
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
            <ColumnCard key={item.id} item={item} index={index} />
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
