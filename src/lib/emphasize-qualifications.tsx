import type { ReactNode } from "react";

/** Qualificações com destaque tipográfico discreto (frases longas primeiro). */
const QUALIFICATION_PHRASES = [
  "Oficial R/2 do Exército Brasileiro",
  "Oficial R/2",
  "Servidor Público Federal",
  "Doutor em Melhoramento Genético",
  "Doutor em melhoramento genético",
  "Professor",
  "Biólogo",
] as const;

export function emphasizeQualifications(
  text: string,
  className = "about-intro-emphasis"
): ReactNode[] {
  if (!text) return [];

  type Match = { start: number; end: number; phrase: string };
  const matches: Match[] = [];
  const lower = text.toLowerCase();

  for (const phrase of QUALIFICATION_PHRASES) {
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
      <strong key={`q-${i}`} className={className}>
        {m.phrase}
      </strong>
    );
    cursor = m.end;
  });
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
