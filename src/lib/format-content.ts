import DOMPurify from "isomorphic-dompurify";

const HTML_TAG_RE = /<\/?[a-z][\s\S]*?>/i;

export function isHtmlContent(content: string): boolean {
  return HTML_TAG_RE.test(content);
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "h2",
      "h3",
      "h4",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ADD_ATTR: ["target", "rel"],
  });
}

export function plainTextToHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const withLinks = escaped.replace(
    /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]}"'])/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return withLinks
    .split(/\n\n+/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

export function prepareNewsContent(content: string): { type: "html" | "markdown"; value: string } {
  const trimmed = content.trim();
  if (!trimmed) return { type: "markdown", value: "" };

  if (isHtmlContent(trimmed)) {
    return { type: "html", value: sanitizeHtml(trimmed) };
  }

  return { type: "markdown", value: trimmed };
}
