"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ActionMapConfig, ActionVisit, NewsItem } from "@/lib/types";
import { slugifyActionVisit } from "@/lib/action-map";
import ImageUploader from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";

interface ActionMapAdminProps {
  actionMap: ActionMapConfig;
  news: NewsItem[];
  token: string;
  onChange: (actionMap: ActionMapConfig) => void;
}

function createEmptyVisit(): ActionVisit {
  const date = new Date().toISOString().slice(0, 10);
  const title = "Nova ação";
  const city = "Teresina";
  return {
    id: String(Date.now()),
    slug: slugifyActionVisit({ city, title, date }),
    city,
    latitude: -5.0892,
    longitude: -42.8019,
    date,
    title,
    excerpt: "",
    content: "",
    category: "Geral",
    status: "realizada",
    image: "",
    gallery: [],
    relatedLink: "",
    relatedNewsId: "",
    displayOrder: 1,
    active: true,
  };
}

export default function ActionMapAdmin({ actionMap, news, token, onChange }: ActionMapAdminProps) {
  const updateVisit = (index: number, patch: Partial<ActionVisit>) => {
    const visits = [...actionMap.visits];
    const current = visits[index];
    const next = { ...current, ...patch };
    if (patch.city || patch.title || patch.date) {
      next.slug = slugifyActionVisit({
        city: next.city,
        title: next.title,
        date: next.date,
      });
    }
    visits[index] = next;
    onChange({ ...actionMap, visits });
  };

  const addGalleryImage = (index: number, url: string) => {
    if (!url) return;
    const visits = [...actionMap.visits];
    visits[index] = { ...visits[index], gallery: [...visits[index].gallery, url] };
    onChange({ ...actionMap, visits });
  };

  return (
    <div className="admin-card">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold">Mapa de Atuação</h2>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie visitas realizadas e agendas futuras exibidas no mapa público.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={actionMap.enabled}
            onChange={(e) => onChange({ ...actionMap, enabled: e.target.checked })}
          />
          Mapa ativo no site
        </label>
      </div>

      {actionMap.visits.map((visit, index) => (
        <div key={visit.id} className="border rounded-xl p-4 mb-6 bg-gray-50">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="font-bold">{visit.title || "Nova visita"}</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visit.active}
                  onChange={(e) => updateVisit(index, { active: e.target.checked })}
                />
                Ativa
              </label>
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...actionMap,
                    visits: actionMap.visits.filter((item) => item.id !== visit.id),
                  })
                }
                className="text-red-500"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Título</label>
              <input
                className="admin-input"
                value={visit.title}
                onChange={(e) => updateVisit(index, { title: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Slug (URL de compartilhamento)</label>
              <input
                className="admin-input"
                value={visit.slug}
                onChange={(e) => updateVisit(index, { slug: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Cidade</label>
              <input
                className="admin-input"
                value={visit.city}
                onChange={(e) => updateVisit(index, { city: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Data</label>
              <input
                type="date"
                className="admin-input"
                value={visit.date}
                onChange={(e) => updateVisit(index, { date: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Latitude</label>
              <input
                type="number"
                step="0.0001"
                className="admin-input"
                value={visit.latitude}
                onChange={(e) => updateVisit(index, { latitude: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="admin-label">Longitude</label>
              <input
                type="number"
                step="0.0001"
                className="admin-input"
                value={visit.longitude}
                onChange={(e) => updateVisit(index, { longitude: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="admin-label">Categoria</label>
              <input
                className="admin-input"
                value={visit.category}
                onChange={(e) => updateVisit(index, { category: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select
                className="admin-input"
                value={visit.status}
                onChange={(e) =>
                  updateVisit(index, { status: e.target.value as ActionVisit["status"] })
                }
              >
                <option value="realizada">Realizada</option>
                <option value="agendada">Agendada</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Ordem de exibição</label>
              <input
                type="number"
                className="admin-input"
                value={visit.displayOrder}
                onChange={(e) => updateVisit(index, { displayOrder: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="admin-label">Notícia relacionada</label>
              <select
                className="admin-input"
                value={visit.relatedNewsId || ""}
                onChange={(e) => updateVisit(index, { relatedNewsId: e.target.value })}
              >
                <option value="">Nenhuma</option>
                {news.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Link relacionado</label>
              <input
                className="admin-input"
                value={visit.relatedLink || ""}
                onChange={(e) => updateVisit(index, { relatedLink: e.target.value })}
                placeholder="https://"
              />
            </div>
            <div className="md:col-span-2">
              <label className="admin-label">Resumo (popup)</label>
              <textarea
                className="admin-input min-h-[80px]"
                value={visit.excerpt}
                onChange={(e) => updateVisit(index, { excerpt: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Descrição completa"
                value={visit.content}
                onChange={(value) => updateVisit(index, { content: value })}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                label="Imagem principal"
                value={visit.image}
                onChange={(url) => updateVisit(index, { image: url })}
                token={token}
              />
            </div>
            <div className="md:col-span-2">
              <h4 className="admin-label">Galeria de imagens</h4>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                {visit.gallery.map((src, galleryIndex) => (
                  <div key={`${src}-${galleryIndex}`} className="flex gap-2 items-center">
                    <input className="admin-input" value={src} readOnly />
                    <button
                      type="button"
                      className="text-red-500 shrink-0"
                      onClick={() => {
                        const gallery = visit.gallery.filter((_, i) => i !== galleryIndex);
                        updateVisit(index, { gallery });
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <ImageUploader
                label="Adicionar imagem à galeria"
                value=""
                onChange={(url) => addGalleryImage(index, url)}
                token={token}
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          onChange({
            ...actionMap,
            visits: [...actionMap.visits, createEmptyVisit()],
          })
        }
        className="admin-btn flex items-center gap-2"
      >
        <Plus size={16} />
        Adicionar visita
      </button>
    </div>
  );
}
