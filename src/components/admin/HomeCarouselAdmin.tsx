"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { HomeCarouselSlide } from "@/lib/types";
import { MAX_HOME_CAROUSEL_SLIDES } from "@/lib/home-banners";
import ImageUploader from "./ImageUploader";

interface HomeCarouselAdminProps {
  slides: HomeCarouselSlide[];
  fallbackImage: string;
  token: string;
  onChange: (slides: HomeCarouselSlide[]) => void;
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function HomeCarouselAdmin({
  slides,
  fallbackImage,
  token,
  onChange,
}: HomeCarouselAdminProps) {
  const updateSlide = (index: number, patch: Partial<HomeCarouselSlide>) => {
    const next = [...slides];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/40">
      <div className="admin-page-head mb-4">
        <h3 className="text-lg font-semibold text-slate-800 m-0">Carrossel da Home</h3>
        <p className="text-sm text-slate-500 m-0 mt-1">
          Fotos que aparecem no carrossel da página inicial. Adicione, troque ou reordene os slides.
          Máximo de {MAX_HOME_CAROUSEL_SLIDES} imagens.
        </p>
      </div>

      {slides.length === 0 && (
        <p className="text-sm text-slate-500 mb-4">
          Nenhum slide ainda. Clique em &quot;Adicionar slide&quot; para começar.
        </p>
      )}

      {slides.map((item, i) => (
        <div key={item.id} className="admin-item-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-600 m-0">Slide {i + 1}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="admin-btn admin-btn-secondary p-1.5"
                onClick={() => onChange(moveItem(slides, i, i - 1))}
                aria-label="Mover para cima"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary p-1.5"
                onClick={() => onChange(moveItem(slides, i, i + 1))}
                aria-label="Mover para baixo"
              >
                <ChevronDown size={16} />
              </button>
              <button
                type="button"
                className="text-red-500 p-1.5"
                onClick={() => onChange(slides.filter((slide) => slide.id !== item.id))}
                aria-label="Remover slide"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <ImageUploader
            label="Foto do slide"
            value={item.image}
            token={token}
            focus={{ x: item.imageFocusX, y: item.imageFocusY, zoom: item.imageZoom }}
            onChange={(image) => updateSlide(i, { image })}
            onFocusChange={(focus) =>
              updateSlide(i, {
                imageFocusX: focus.x,
                imageFocusY: focus.y,
                imageZoom: focus.zoom,
              })
            }
            focusPreviewAspect="wide"
          />

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="admin-label">Tag (opcional)</label>
              <input
                className="admin-input"
                value={item.tag || ""}
                onChange={(e) => updateSlide(i, { tag: e.target.value })}
                placeholder="Ex.: Trajetória"
              />
            </div>
            <div>
              <label className="admin-label">Título (opcional)</label>
              <input
                className="admin-input"
                value={item.title || ""}
                onChange={(e) => updateSlide(i, { title: e.target.value })}
                placeholder="Título do slide"
              />
            </div>
          </div>
          <div>
            <label className="admin-label">Descrição (opcional)</label>
            <textarea
              className="admin-input min-h-[72px]"
              value={item.text || ""}
              onChange={(e) => updateSlide(i, { text: e.target.value })}
              placeholder="Texto curto exibido no carrossel"
            />
          </div>
        </div>
      ))}

      {slides.length < MAX_HOME_CAROUSEL_SLIDES && (
        <button
          type="button"
          className="admin-btn flex items-center gap-2 mt-2"
          onClick={() =>
            onChange([
              ...slides,
              {
                id: String(Date.now()),
                image: fallbackImage,
                tag: "",
                title: `Slide ${slides.length + 1}`,
                text: "",
              },
            ])
          }
        >
          <Plus size={16} /> Adicionar slide
        </button>
      )}
    </div>
  );
}
