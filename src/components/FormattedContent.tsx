"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { parseContentBlocks, type CustomBullet } from "@/lib/format-content";

interface FormattedContentProps {
  content: string;
  className?: string;
}

const BULLET_CLASS: Record<CustomBullet, string> = {
  "•": "news-list-disc",
  "◦": "news-list-circle",
  "❖": "news-list-diamond",
  "➢": "news-list-arrow",
  "➔": "news-list-arrow-long",
};

const markdownComponents = {
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  p: ({ children }: { children?: ReactNode }) => <>{children}</>,
};

function InlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {text}
    </ReactMarkdown>
  );
}

export default function FormattedContent({ content, className = "" }: FormattedContentProps) {
  const blocks = parseContentBlocks(content);

  if (!blocks.length) return null;

  return (
    <div className={`formatted-content ${className}`}>
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul key={`list-${index}`} className={`news-list ${BULLET_CLASS[block.bullet]}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`item-${itemIndex}`}>
                  <InlineMarkdown text={item} />
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ReactMarkdown
            key={`md-${index}`}
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={markdownComponents}
          >
            {block.text}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
