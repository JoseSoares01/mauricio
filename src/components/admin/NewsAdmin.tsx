"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import type { NewsItem } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";
import NewsImagePositionEditor from "./NewsImagePositionEditor";

interface NewsAdminProps {
  news: NewsItem[];
  token: string;
  onChange: (news: NewsItem[]) => void;
}

function formatNewsDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

interface NewsAdminItemProps {
  item: NewsItem;
  index: number;
  expanded: boolean;
  token: string;
  onToggle: () => void;
  onUpdate: (item: NewsItem) => void;
  onDelete: () => void;
}

function NewsAdminItem({
  item,
  index,
  expanded,
  token,
  onToggle,
  onUpdate,
  onDelete,
}: NewsAdminItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="news-admin-item border rounded-lg mb-3 bg-white overflow-hidden list-none"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="news-admin-drag p-1 rounded hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastar para reordenar"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={18} />
        </button>

        <button
          type="button"
          className="flex-1 flex items-center gap-3 text-left min-w-0"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="text-xs font-semibold text-gray-400 shrink-0">#{index + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-gray-800 truncate">{item.title || "Sem título"}</p>
            <p className="text-xs text-gray-500 truncate">
              {formatNewsDate(item.date)} · {item.category || "Sem categoria"}
            </p>
          </div>
          <ChevronDown
            size={18}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 p-1 shrink-0 hover:bg-red-50 rounded"
          aria-label="Excluir notícia"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="admin-label">Título</label>
              <input
                className="admin-input"
                value={item.title}
                onChange={(e) => onUpdate({ ...item, title: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Data</label>
              <input
                type="date"
                className="admin-input"
                value={item.date}
                onChange={(e) => onUpdate({ ...item, date: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Categoria</label>
              <input
                className="admin-input"
                value={item.category}
                onChange={(e) => onUpdate({ ...item, category: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Resumo</label>
              <textarea
                className="admin-input"
                value={item.excerpt}
                onChange={(e) => onUpdate({ ...item, excerpt: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                label="Imagem"
                value={item.image}
                onChange={(v) => onUpdate({ ...item, image: v })}
                token={token}
              />
            </div>
            {item.image && (
              <div className="md:col-span-2">
                <NewsImagePositionEditor
                  image={item.image}
                  focusX={item.imageFocusX}
                  focusY={item.imageFocusY}
                  onChange={(focus) => onUpdate({ ...item, ...focus })}
                />
              </div>
            )}
            <div className="md:col-span-2">
              <RichTextEditor
                label="Conteúdo Completo"
                value={item.content}
                onChange={(content) => onUpdate({ ...item, content })}
                minHeight={280}
                hint="Após títulos em negrito ou H2, as linhas seguintes viram lista com • automaticamente. Use os botões • ◦ ❖ ➢ ➔ para outros estilos."
              />
            </div>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}

export default function NewsAdmin({ news, token, onChange }: NewsAdminProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateItem = (index: number, item: NewsItem) => {
    const next = [...news];
    next[index] = item;
    onChange(next);
  };

  const deleteItem = (id: string) => {
    onChange(news.filter((n) => n.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addNews = () => {
    const newItem: NewsItem = {
      id: String(Date.now()),
      title: "Nova Notícia",
      excerpt: "",
      date: new Date().toISOString().split("T")[0],
      category: "Geral",
      image: "/uploads/banner.jpg",
      content: "",
    };
    onChange([newItem, ...news]);
    setExpandedId(newItem.id);
  };

  return (
    <div className="admin-card">
      <h2 className="text-xl font-bold mb-2">Notícias</h2>
      <p className="text-sm text-gray-500 mb-6">
        Arraste pelo ícone <GripVertical size={14} className="inline -mt-0.5" /> para definir a ordem no site.
        Clique na notícia para editar.
      </p>

      <Reorder.Group axis="y" values={news} onReorder={onChange} className="m-0 p-0">
        {news.map((item, i) => (
          <NewsAdminItem
            key={item.id}
            item={item}
            index={i}
            expanded={expandedId === item.id}
            token={token}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onUpdate={(updated) => updateItem(i, updated)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </Reorder.Group>

      <button type="button" onClick={addNews} className="admin-btn flex items-center gap-2 mt-4">
        <Plus size={16} /> Adicionar Notícia
      </button>
    </div>
  );
}
