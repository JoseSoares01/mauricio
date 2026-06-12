"use client";

import { useRef } from "react";
import { Bold, Italic, Link, List, Heading2 } from "lucide-react";

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

  const insertListItem = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);

    if (selected) {
      const formatted = selected
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return "";
          return /^[-*]\s/.test(trimmed) ? line : `- ${trimmed}`;
        })
        .filter(Boolean)
        .join("\n");

      onChange(before + formatted + after);
      return;
    }

    const lineStart = before.lastIndexOf("\n") + 1;
    const currentLine = before.slice(lineStart);
    const insertion = currentLine.trim() ? "\n- " : "- ";

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

    const label = selected && !selected.startsWith("http")
      ? selected
      : url.replace(/^https?:\/\//, "").slice(0, 48);

    const markdown = `[${label}](${url})`;
    onChange(value.slice(0, start) + markdown + value.slice(end));
  };

  const tools = [
    { icon: Bold, label: "Negrito", action: () => wrapSelection("**") },
    { icon: Italic, label: "Itálico", action: () => wrapSelection("_") },
    { icon: Heading2, label: "Subtítulo", action: () => wrapSelection("\n## ", "\n") },
    { icon: List, label: "Lista", action: insertListItem },
    { icon: Link, label: "Link", action: insertLink },
  ];

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-t-lg bg-gray-50">
        {tools.map(({ icon: Icon, label: toolLabel, action }) => (
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
      </div>
      <textarea
        ref={textareaRef}
        className="admin-input rounded-t-none font-mono text-sm leading-relaxed"
        style={{ minHeight }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite o texto da notícia. Enter cria nova linha. Linha em branco cria novo parágrafo. URLs viram links automaticamente."
      />
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
