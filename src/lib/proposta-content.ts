export type PropostaBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; text: string }
  | { type: "link"; title: string; url: string };

const URL_REGEX = /https?:\/\/[^\s)\]]+/g;

const HEADING_PATTERN =
  /(PROJETO DE LEI|PROPOSTA DE EMENDA|PEC|DECRETO|PL N|LEI DE|INSTITUI O|INSTITUI A|PROGRAMA|PACOTE)/i;

function cleanUrl(url: string): string {
  return url.replace(/[.,;)]+$/g, "");
}

function stripUrls(text: string): string {
  return text.replace(URL_REGEX, "").replace(/\s*[-–—]\s*$/g, "").trim();
}

function shorten(text: string, max = 100): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

function isListLine(text: string): boolean {
  return /^[IVX]+\s*[-–—]\s/.test(text) || /^[•◦-]\s/.test(text) || /^\d+(\.\d+)?\s*[-–—]\s/.test(text);
}

function isHeadingLine(text: string): boolean {
  const withoutUrl = stripUrls(text);
  if (!withoutUrl) return false;
  if (HEADING_PATTERN.test(withoutUrl)) return true;
  return withoutUrl.length <= 120 && /\([^)]+\)/.test(withoutUrl);
}

export function parsePropostaDescription(description: string): {
  intro: string;
  blocks: PropostaBlock[];
  links: { title: string; url: string }[];
} {
  const lines = description
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks: PropostaBlock[] = [];
  const links: { title: string; url: string }[] = [];
  const seenUrls = new Set<string>();

  for (const line of lines) {
    const urls = [...line.matchAll(URL_REGEX)].map((m) => cleanUrl(m[0]));
    const textWithoutUrls = stripUrls(line);

    for (const url of urls) {
      if (seenUrls.has(url)) continue;
      seenUrls.add(url);
      const title = textWithoutUrls ? shorten(textWithoutUrls, 120) : "Ver documento";
      links.push({ title, url });
    }

    if (!textWithoutUrls) continue;

    if (isHeadingLine(line)) {
      blocks.push({ type: "heading", text: textWithoutUrls });
    } else if (isListLine(textWithoutUrls)) {
      blocks.push({ type: "list", text: textWithoutUrls });
    } else if (urls.length === 0 || textWithoutUrls.length > 160) {
      blocks.push({ type: "paragraph", text: textWithoutUrls });
    }
  }

  const introBlock = blocks.find((b) => b.type === "paragraph");
  const intro = introBlock?.type === "paragraph" ? introBlock.text : stripUrls(lines[0] || "");

  return { intro, blocks, links };
}

export function getPropostaExpandableBlocks(description: string): PropostaBlock[] {
  const parsed = parsePropostaDescription(description);
  const detailBlocks = parsed.blocks.filter(
    (block, blockIndex) =>
      !(
        blockIndex === 0 &&
        block.type === "paragraph" &&
        block.text === parsed.intro
      )
  );

  if (detailBlocks.length > 0) return detailBlocks;
  if (parsed.intro) return [{ type: "paragraph", text: parsed.intro }];
  return [];
}

export function mergePropostaLinks(
  parsed: { title: string; url: string }[],
  extra?: { link?: string; documents?: { title: string; url: string }[] }
): { title: string; url: string }[] {
  const seen = new Set<string>();
  const result: { title: string; url: string }[] = [];

  const add = (title: string, url?: string) => {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) return;
    seen.add(trimmed);
    result.push({ title: title.trim() || "Documento", url: trimmed });
  };

  for (const item of parsed) add(item.title, item.url);
  if (extra?.link) add("Saiba mais", extra.link);
  for (const doc of extra?.documents || []) add(doc.title || "Documento", doc.url);

  return result;
}
