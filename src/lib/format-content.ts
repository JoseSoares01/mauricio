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

export function prepareNewsContent(content: string): string {
  const trimmed = content.trim();
  if (!trimmed) return "";

  if (isHtmlContent(trimmed)) {
    return htmlToPlainText(trimmed);
  }

  return trimmed;
}
