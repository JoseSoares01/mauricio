"use client";

import Image from "next/image";
import Link from "next/link";
import type { AgendaEvent, NewsItem, PropostaItem } from "@/lib/types";

export interface HeroMapVisitPreview {
  id: string;
  city: string;
  title: string;
}

export interface HeroMapStatsPreview {
  citiesVisited: number;
  actionsCompleted: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ShowcaseShell({
  variant,
  title,
  description,
  href,
  children,
}: {
  variant: "propostas" | "mapa" | "noticias" | "agenda";
  title: string;
  description: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`hero-showcase hero-showcase--${variant}`}>
      <div className="hero-showcase-inner">
        <div className="hero-showcase-copy">
          <p className="hero-showcase-kicker">Explore o site</p>
          <h2 className="hero-showcase-title">{title}</h2>
          <p className="hero-showcase-desc">{description}</p>
          <Link href={href} className="hero-showcase-cta">
            EXPLORAR <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="hero-showcase-stage" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

export function HeroShowcasePropostas({
  propostas,
  propostaImages,
}: {
  propostas: PropostaItem[];
  propostaImages: Record<string, string | null>;
}) {
  const featured = propostas.slice(0, 4);

  return (
    <ShowcaseShell
      variant="propostas"
      title="Propostas"
      description="Compromissos claros para o Piauí — ideias organizadas, prioridade no povo e caminhos concretos de atuação."
      href="/propostas"
    >
      <ul className="hero-showcase-propostas-list">
        {featured.map((item, index) => {
          const imageSrc = propostaImages[item.id];
          return (
            <li
              key={item.id}
              className="hero-showcase-proposta-card"
              style={{ animationDelay: `${120 + index * 90}ms` }}
            >
              <span className="hero-showcase-proposta-index" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="hero-showcase-proposta-body">
                <h3 className="hero-showcase-proposta-title">{item.title}</h3>
              </div>
              {imageSrc ? (
                <div className="hero-showcase-proposta-media">
                  <Image
                    src={imageSrc}
                    alt=""
                    width={72}
                    height={72}
                    className="hero-showcase-proposta-img"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="hero-showcase-proposta-dot" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ul>
    </ShowcaseShell>
  );
}

const PIN_LAYOUT = [
  { x: 42, y: 28 },
  { x: 58, y: 38 },
  { x: 36, y: 52 },
  { x: 62, y: 58 },
  { x: 48, y: 70 },
  { x: 70, y: 44 },
  { x: 30, y: 40 },
  { x: 54, y: 22 },
] as const;

export function HeroShowcaseMapa({
  visits,
  stats,
}: {
  visits: HeroMapVisitPreview[];
  stats: HeroMapStatsPreview;
}) {
  const pins = visits.slice(0, 8);

  return (
    <ShowcaseShell
      variant="mapa"
      title="Mapa de Atuação"
      description="Presença no território: cidades visitadas, ações realizadas e o caminho da atuação pelo Piauí."
      href="/mapa-de-atuacao"
    >
      <div className="hero-showcase-mapa">
        <div className="hero-showcase-mapa-canvas">
          <svg
            className="hero-showcase-mapa-shape"
            viewBox="0 0 200 260"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M78 18c22-8 48-6 64 10 14 14 18 34 16 54 6 10 18 22 18 40 0 28-16 46-34 58-8 18-22 34-44 40-24 6-48-2-62-20-12-16-14-38-8-56-10-14-14-32-8-48 8-22 30-36 38-38z"
              fill="color-mix(in srgb, var(--color-primary) 12%, #fff)"
              stroke="color-mix(in srgb, var(--color-primary) 45%, transparent)"
              strokeWidth="2.5"
            />
            <path
              d="M86 48c16-4 34 0 44 12 8 10 10 24 6 36"
              stroke="color-mix(in srgb, var(--color-accent) 70%, var(--color-primary))"
              strokeWidth="1.5"
              strokeDasharray="4 5"
              opacity="0.7"
            />
          </svg>

          {pins.map((visit, index) => {
            const pos = PIN_LAYOUT[index % PIN_LAYOUT.length];
            return (
              <span
                key={visit.id}
                className="hero-showcase-mapa-pin"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  animationDelay: `${180 + index * 110}ms`,
                }}
                title={visit.city}
              >
                <span className="hero-showcase-mapa-pin-core" />
                <span className="hero-showcase-mapa-pin-pulse" />
              </span>
            );
          })}
        </div>

        <div className="hero-showcase-mapa-stats">
          <div className="hero-showcase-mapa-stat" style={{ animationDelay: "220ms" }}>
            <strong>{stats.citiesVisited}</strong>
            <span>Municípios</span>
          </div>
          <div className="hero-showcase-mapa-stat" style={{ animationDelay: "320ms" }}>
            <strong>{stats.actionsCompleted}</strong>
            <span>Ações</span>
          </div>
        </div>

        {pins[0] && (
          <p className="hero-showcase-mapa-caption" style={{ animationDelay: "400ms" }}>
            Em destaque: <em>{pins[0].city}</em>
            {pins[0].title ? ` — ${pins[0].title}` : ""}
          </p>
        )}
      </div>
    </ShowcaseShell>
  );
}

export function HeroShowcaseNoticias({ news }: { news: NewsItem[] }) {
  const [featured, ...rest] = news.slice(0, 4);

  return (
    <ShowcaseShell
      variant="noticias"
      title="Notícias"
      description="Acompanhe posicionamentos, ações e atualizações com leitura clara e presença editorial."
      href="/noticias"
    >
      <div className="hero-showcase-noticias">
        {featured && (
          <article className="hero-showcase-news-featured" style={{ animationDelay: "140ms" }}>
            <div className="hero-showcase-news-media">
              {featured.image ? (
                <Image
                  src={featured.image}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
            <div className="hero-showcase-news-body">
              {featured.category?.trim() && (
                <span className="hero-showcase-news-cat">{featured.category}</span>
              )}
              <h3 className="hero-showcase-news-title">{featured.title}</h3>
              {featured.excerpt && (
                <p className="hero-showcase-news-excerpt">{featured.excerpt}</p>
              )}
            </div>
          </article>
        )}

        {rest.length > 0 && (
          <ul className="hero-showcase-news-list">
            {rest.map((item, index) => (
              <li
                key={item.id}
                className="hero-showcase-news-row"
                style={{ animationDelay: `${260 + index * 90}ms` }}
              >
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ShowcaseShell>
  );
}

export function HeroShowcaseAgenda({ agenda }: { agenda: AgendaEvent[] }) {
  const events = agenda.slice(0, 4);

  return (
    <ShowcaseShell
      variant="agenda"
      title="Agenda"
      description="Compromissos, encontros e presença pública — a rotina de atuação organizada no tempo."
      href="/agenda"
    >
      <ul className="hero-showcase-agenda-list">
        {events.map((event, index) => {
          const date = new Date(`${event.date}T12:00:00`);
          const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
          const month = date
            .toLocaleDateString("pt-BR", { month: "short" })
            .replace(".", "");

          return (
            <li
              key={event.id}
              className="hero-showcase-agenda-item"
              style={{ animationDelay: `${140 + index * 95}ms` }}
            >
              <div className="hero-showcase-agenda-date" aria-hidden="true">
                <strong>{day}</strong>
                <span>{month}</span>
              </div>
              <div className="hero-showcase-agenda-body">
                <h3>{event.title}</h3>
                <p>
                  {[event.time, event.location].filter(Boolean).join(" · ") || event.type}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </ShowcaseShell>
  );
}
