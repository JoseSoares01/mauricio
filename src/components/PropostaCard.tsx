import { ExternalLink, FileText } from "lucide-react";
import type { PropostaItem } from "@/lib/types";
import { mergePropostaLinks, parsePropostaDescription, type PropostaBlock } from "@/lib/proposta-content";

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

export default function PropostaCard({ item }: { item: PropostaItem }) {
  const parsed = parsePropostaDescription(item.description);
  const links = mergePropostaLinks(parsed.links, {
    link: item.link,
    documents: item.documents,
  });

  const detailBlocks = parsed.blocks.filter(
    (b, index) =>
      !(index === 0 && b.type === "paragraph" && b.text === parsed.intro)
  );
  const hasDetails = detailBlocks.length > 0;

  return (
    <article className="proposta-card">
      <h2 className="proposta-card-title">{item.title}</h2>

      {parsed.intro && <p className="proposta-card-intro">{parsed.intro}</p>}

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
    </article>
  );
}
