"use client";

import { useRef } from "react";
import { Bold, Italic, Link, Heading2 } from "lucide-react";
import { CUSTOM_BULLETS, type CustomBullet } from "@/lib/format-content";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
  hint?: string;
}

export default function RichTextEditor({
  label,
  value,
  onChange,
  minHeight = 220,
  hint,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = (before: string, after = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const next =
      value.slice(0, start) + before + selected + after + value.slice(end);

    onChange(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + before.length + selected.length + after.length;
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
      if (!selected) textarea.setSelectionRange(cursor, cursor);
    });
  };

  const insertHeading2 = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEndIndex = value.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
    const line = value.slice(lineStart, lineEnd);
    const body = line.replace(/^#{1,6}\s+/, "").trim();
    const nextLine = body ? `## ${body}` : "## ";

    onChange(value.slice(0, lineStart) + nextLine + value.slice(lineEnd));

    requestAnimationFrame(() => {
      const pos = lineStart + nextLine.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  const insertListItem = (bullet: CustomBullet) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const bulletPrefix = `${bullet} `;
    const bulletPattern = /^([•◦❖➢➔]|-|\*|\+)\s/;

    if (selected) {
      const formatted = selected
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          return bulletPattern.test(trimmed)
            ? line.replace(bulletPattern, bulletPrefix)
            : `${bulletPrefix}${trimmed}`;
        })
        .filter(Boolean)
        .join("\n");

      onChange(before + formatted + after);
      return;
    }

    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);
    const insertion = currentLine.trim() ? `\n${bulletPrefix}` : bulletPrefix;

    onChange(before + insertion + after);

    requestAnimationFrame(() => {
      const pos = before.length + insertion.length;
      textarea.focus();
      textarea.setSelectionRange(pos, pos);
    });
  };

  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end).trim();
    const url = selected.startsWith("http") ? selected : window.prompt("Cole o link (URL):");
    if (!url) return;

    const linkLabel = selected && !selected.startsWith("http")
      ? selected
      : url.replace(/^https?:\/\//, "").slice(0, 48);

    const markdown = `[${linkLabel}](${url})`;
    onChange(value.slice(0, start) + markdown + value.slice(end));
  };

  const textTools = [
    { icon: Bold, label: "Negrito", action: () => wrapSelection("**") },
    { icon: Italic, label: "Itálico", action: () => wrapSelection("_") },
    { icon: Heading2, label: "Subtítulo (H2)", action: insertHeading2 },
    { icon: Link, label: "Link", action: insertLink },
  ];

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50">
        {textTools.map(({ icon: Icon, label: toolLabel, action }) => (
          <button
            key={toolLabel}
            type="button"
            onClick={action}
            className="p-2 rounded hover:bg-white border border-transparent hover:border-gray-200 text-gray-700"
            title={toolLabel}
            aria-label={toolLabel}
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="w-px h-6 bg-gray-200 self-center mx-1" aria-hidden />
        {CUSTOM_BULLETS.map((bullet) => (
          <button
            key={bullet}
            type="button"
            onClick={() => insertListItem(bullet)}
            className="min-w-[34px] px-2 py-1.5 rounded hover:bg-white border border-transparent hover:border-gray-200 text-gray-700 text-base leading-none"
            title={`Lista ${bullet}`}
            aria-label={`Lista ${bullet}`}
          >
            {bullet}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="admin-input rounded-t-none font-mono text-sm leading-relaxed"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o texto da notícia. Use os botões para negrito, subtítulo e listas (• ◦ ❖ ➢ ➔)."
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
