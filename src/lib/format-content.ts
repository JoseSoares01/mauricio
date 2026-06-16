const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/i;

export const CUSTOM_BULLETS = ["•", "◦", "❖", "➢", "➔"] as const;
export type CustomBullet = (typeof CUSTOM_BULLETS)[number];

const CUSTOM_BULLET_SET = new Set<string>(CUSTOM_BULLETS);
const BULLET_LINE_RE = /^([•◦❖➢➔])\s+(.+)$/;
const STANDARD_BULLET_LINE_RE = /^[-*+]\s+(.+)$/;

export type ContentBlock =
  | { type: "markdown"; text: string }
  | { type: "list"; bullet: CustomBullet; items: string[] };

export function isHtmlContent(content: string): boolean {
  return HTML_TAG_RE.test(content);
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

export function htmlToPlainText(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h[1-6]>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "\n• ")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

function isListHeaderLine(line: string): boolean {
  const trimmed = line.trim();
  if (/^#{1,6}\s/.test(trimmed)) return true;

  const boldMatch = trimmed.match(/^\*\*(.+)\*\*:?\s*$/);
  if (!boldMatch) return false;

  const inner = boldMatch[1].trim();
  if (/lista|candidatos|mulheres|homens/i.test(inner)) return true;
  if (inner === inner.toUpperCase() && /[A-ZÀ-Ú]{3,}/.test(inner)) return true;

  return false;
}

function isAlreadyFormattedLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return (
    BULLET_LINE_RE.test(trimmed) ||
    STANDARD_BULLET_LINE_RE.test(trimmed) ||
    /^#{1,6}\s/.test(trimmed) ||
    /^https?:\/\//.test(trimmed) ||
    /^\[.+\]\(.+\)/.test(trimmed)
  );
}

export function repairMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const next = lines[i + 1]?.trim() ?? "";

    if (
      (/^#{1,6}\s+\*\*/.test(trimmed) || /^\*\*/.test(trimmed)) &&
      !trimmed.endsWith("**") &&
      next === "**"
    ) {
      result.push(`${trimmed}**`);
      i += 1;
      continue;
    }

    if (trimmed === "**" && result.length > 0) {
      const previous = result[result.length - 1].trimEnd();
      if (/^#{1,6}\s+\*\*[^*]+$/.test(previous) || /^\*\*[^*]+$/.test(previous)) {
        result[result.length - 1] = `${previous}**`;
        continue;
      }
    }

    result.push(line);
  }

  return result.join("\n");
}

export function normalizeNewsMarkdown(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let afterListHeader = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      afterListHeader = false;
      result.push(line);
      continue;
    }

    if (isListHeaderLine(trimmed)) {
      afterListHeader = true;
      result.push(line);
      continue;
    }

    if (isAlreadyFormattedLine(trimmed)) {
      afterListHeader = false;
      result.push(line);
      continue;
    }

    if (afterListHeader) {
      result.push(`• ${trimmed}`);
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

function toPreparedContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const base = isHtmlContent(trimmed) ? htmlToPlainText(trimmed) : trimmed;
  return repairMarkdown(normalizeNewsMarkdown(base));
}

export function prepareNewsContent(content: string): string {
  return toPreparedContent(content);
}

function standardBulletToCustom(marker: string): CustomBullet {
  if (marker === "*") return "◦";
  if (marker === "+") return "❖";
  return "•";
}

function parseBulletLine(line: string): { bullet: CustomBullet; item: string } | null {
  const trimmed = line.trim();
  const customMatch = trimmed.match(BULLET_LINE_RE);
  if (customMatch) {
    return { bullet: customMatch[1] as CustomBullet, item: customMatch[2] };
  }

  const standardMatch = trimmed.match(STANDARD_BULLET_LINE_RE);
  if (standardMatch) {
    const marker = trimmed[0];
    return { bullet: standardBulletToCustom(marker), item: standardMatch[1] };
  }

  return null;
}

export function parseContentBlocks(content: string): ContentBlock[] {
  const prepared = toPreparedContent(content);
  if (!prepared) return [];

  const lines = prepared.split("\n");
  const blocks: ContentBlock[] = [];
  const markdownBuffer: string[] = [];
  let currentList: { bullet: CustomBullet; items: string[] } | null = null;

  const flushMarkdown = () => {
    const text = markdownBuffer.join("\n").trim();
    markdownBuffer.length = 0;
    if (text) blocks.push({ type: "markdown", text });
  };

  const flushList = () => {
    if (!currentList) return;
    blocks.push({ type: "list", bullet: currentList.bullet, items: currentList.items });
    currentList = null;
  };

  for (const line of lines) {
    const bulletLine = parseBulletLine(line);

    if (bulletLine) {
      flushMarkdown();
      if (currentList && currentList.bullet === bulletLine.bullet) {
        currentList.items.push(bulletLine.item);
      } else {
        flushList();
        currentList = { bullet: bulletLine.bullet, items: [bulletLine.item] };
      }
      continue;
    }

    flushList();
    markdownBuffer.push(line);
  }

  flushList();
  flushMarkdown();
  return blocks;
}

export function isCustomBullet(value: string): value is CustomBullet {
  return CUSTOM_BULLET_SET.has(value);
}
