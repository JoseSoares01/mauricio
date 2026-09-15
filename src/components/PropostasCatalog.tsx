"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { PropostaItem } from "@/lib/types";
import type { PropostaCardTheme } from "@/lib/proposta-images";
import {
  getPropostaExpandableBlocks,
  mergePropostaLinks,
  parsePropostaDescription,
  type PropostaBlock,
} from "@/lib/proposta-content";
import {
  getPropostaCategory,
  listPropostaCategories,
  type PropostaCategory,
} from "@/lib/proposta-category";

export interface PropostaCatalogItem {
  item: PropostaItem;
  index: number;
  imageSrc: string | null;
  theme: PropostaCardTheme;
}

function BlockList({ blocks }: { blocks: PropostaBlock[] }) {
  return (
    <div className="proposta-body">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h3 key={index} className="proposta-block-heading">
              {block.text}
            </h3>
          );
        }
        if (block.type === "list") {
          return (
            <p key={index} className="proposta-block-list">
              {block.text}
            </p>
          );
        }
        if (block.type === "paragraph") {
          return (
            <p key={index} className="proposta-block-text">
              {block.text}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

function shortenIntro(text: string, max = 150) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

function linkedCountLabel(count: number) {
  if (count <= 0) return null;
  if (count === 1) return "1 proposta vinculada";
  return `${count} propostas vinculadas`;
}

function CatalogCard({
  data,
}: {
  data: PropostaCatalogItem;
}) {
  const { item, imageSrc, theme } = data;
  const [expanded, setExpanded] = useState(false);
  const parsed = parsePropostaDescription(item.description);
  const links = mergePropostaLinks(parsed.links, {
    link: item.link,
    documents: item.documents,
  });
  const detailBlocks = getPropostaExpandableBlocks(item.description);
  const hasDetails = detailBlocks.length > 0 || links.length > 0;
  const category = getPropostaCategory(item.title);
  const summary = parsed.intro ? shortenIntro(parsed.intro) : "";
  const linkedLabel = linkedCountLabel(links.length);

  return (
    <article
      className={`proposta-card proposta-card--catalog proposta-card--${theme}${
        expanded ? " is-expanded" : ""
      }`}
    >
      <div className="proposta-card-top">
        {imageSrc ? (
          <div className="proposta-card-visual" aria-hidden>
            <Image
              src={imageSrc}
              alt=""
              width={480}
              height={480}
              className="proposta-card-image"
              sizes="(max-width: 767px) 92vw, (max-width: 1023px) 28vw, 180px"
              unoptimized
            />
          </div>
        ) : (
          <div className="proposta-card-visual proposta-card-visual--empty" aria-hidden />
        )}

        <div className="proposta-card-main">
          {category && <span className="proposta-card-category">{category}</span>}
          <h2 className="proposta-card-title">{item.title}</h2>
          {summary && <p className="proposta-card-intro">{summary}</p>}
          {linkedLabel && <p className="proposta-card-linked">{linkedLabel}</p>}
        </div>
      </div>

      <div className="proposta-card-footer">
        {hasDetails ? (
          <div className="proposta-details">
            <button
              type="button"
              className="proposta-details-summary"
              aria-expanded={expanded}
              aria-controls={`proposta-panel-${item.id}`}
              id={`proposta-toggle-${item.id}`}
              onClick={() => setExpanded((current) => !current)}
            >
              Ver proposta <span aria-hidden="true">→</span>
            </button>
            {expanded && (
              <div
                className="proposta-details-panel"
                id={`proposta-panel-${item.id}`}
                role="region"
                aria-labelledby={`proposta-toggle-${item.id}`}
              >
                {detailBlocks.length > 0 && <BlockList blocks={detailBlocks} />}
                {links.length > 0 && (
                  <ul className="proposta-docs-list">
                    {links.map((doc) => (
                      <li key={doc.url}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="proposta-doc-link"
                        >
                          <span className="proposta-doc-link-text">{doc.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="proposta-card-cta-muted">Sem detalhes adicionais</span>
        )}
      </div>
    </article>
  );
}

export default function PropostasCatalog({ items }: { items: PropostaCatalogItem[] }) {
  const categories = useMemo(
    () => listPropostaCategories(items.map((entry) => entry.item.title)),
    [items]
  );
  const [active, setActive] = useState<"Todas" | PropostaCategory>("Todas");

  const filtered = useMemo(() => {
    if (active === "Todas") return items;
    return items.filter((entry) => getPropostaCategory(entry.item.title) === active);
  }, [active, items]);

  return (
    <div className="propostas-catalog">
      <div className="propostas-filters" role="tablist" aria-label="Filtrar propostas">
        <button
          type="button"
          role="tab"
          aria-selected={active === "Todas"}
          className={`propostas-filter${active === "Todas" ? " is-active" : ""}`}
          onClick={() => setActive("Todas")}
        >
          Todas
        </button>
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            role="tab"
            aria-selected={active === category}
            className={`propostas-filter${active === category ? " is-active" : ""}`}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="propostas-grid propostas-grid--catalog">
        {filtered.map((entry) => (
          <CatalogCard key={entry.item.id} data={entry} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="propostas-empty">Nenhuma proposta nesta categoria.</p>
      )}
    </div>
  );
}
