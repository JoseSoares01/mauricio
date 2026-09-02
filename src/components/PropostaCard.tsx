import Image from "next/image";
import { ExternalLink, FileText } from "lucide-react";
import type { PropostaItem } from "@/lib/types";
import { mergePropostaLinks, parsePropostaDescription, getPropostaExpandableBlocks, type PropostaBlock } from "@/lib/proposta-content";
import { getPropostaCardTheme } from "@/lib/proposta-images";
import { resolvePropostaImage } from "@/lib/proposta-images.server";

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

function shortenIntro(text: string, max = 140) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
}

export default function PropostaCard({
  item,
  index = 0,
}: {
  item: PropostaItem;
  index?: number;
}) {
  const parsed = parsePropostaDescription(item.description);
  const links = mergePropostaLinks(parsed.links, {
    link: item.link,
    documents: item.documents,
  });

  const detailBlocks = getPropostaExpandableBlocks(item.description);
  const hasDetails = detailBlocks.length > 0;
  const imageSrc = resolvePropostaImage(item.title);
  const theme = getPropostaCardTheme(index);
  const bannerIntro = parsed.intro ? shortenIntro(parsed.intro) : "";

  return (
    <article className={`proposta-card proposta-card--${theme}`}>
      <div
        className={`proposta-card-banner${imageSrc ? "" : " proposta-card-banner--text-only"}`}
      >
        <span className="proposta-card-blob proposta-card-blob--1" aria-hidden />
        <span className="proposta-card-blob proposta-card-blob--2" aria-hidden />

        <div className="proposta-card-banner-inner">
          <div className="proposta-card-banner-text">
            <h2 className="proposta-card-title">{item.title}</h2>
            {bannerIntro && <p className="proposta-card-intro">{bannerIntro}</p>}
          </div>

          {imageSrc ? (
            <div className="proposta-card-visual">
              <Image
                src={imageSrc}
                alt=""
                width={400}
                height={400}
                className="proposta-card-image"
                sizes="(min-width: 768px) 200px, 140px"
                unoptimized
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="proposta-card-content">
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
                  <FileText size={15} aria-hidden="true" className="shrink-0" />
                  <span className="proposta-doc-link-text">{doc.title}</span>
                  <ExternalLink size={12} aria-hidden="true" className="shrink-0 opacity-60" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {hasDetails && (
          <details className="proposta-details">
            <summary className="proposta-details-summary">Ver texto completo</summary>
            <BlockList blocks={detailBlocks} />
          </details>
        )}
      </div>
    </article>
  );
}
