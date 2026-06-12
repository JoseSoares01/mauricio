const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/i;

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
      .replace(/<li[^>]*>/gi, "\n- ")
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
    /^[-*]\s/.test(trimmed) ||
    /^#{1,6}\s/.test(trimmed) ||
    /^https?:\/\//.test(trimmed) ||
    /^\[.+\]\(.+\)/.test(trimmed)
  );
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
      result.push(line);
      continue;
    }

    if (afterListHeader) {
      result.push(`- ${trimmed}`);
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

export function prepareNewsContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  const base = isHtmlContent(trimmed) ? htmlToPlainText(trimmed) : trimmed;
  return normalizeNewsMarkdown(base);
}
