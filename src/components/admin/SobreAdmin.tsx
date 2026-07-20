"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import type { AboutGalleryItem, AboutTimelineItem, SiteConfig } from "@/lib/types";
import ImageUploader from "./ImageUploader";
import AboutMetricIconField from "./AboutMetricIconField";

interface SobreAdminProps {
  about: SiteConfig["about"];
  fallbackIntroImage: string;
  token: string;
  onChange: (about: SiteConfig["about"]) => void;
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function SobreAdmin({
  about,
  fallbackIntroImage,
  token,
  onChange,
}: SobreAdminProps) {
  const gallery = about.gallery ?? [];
  const timeline = about.timeline ?? [];
  const metrics = about.metrics ?? [];

  const update = (patch: Partial<SiteConfig["about"]>) => {
    onChange({ ...about, ...patch });
  };

  const updateGallery = (index: number, patch: Partial<AboutGalleryItem>) => {
    const next = [...gallery];
    next[index] = { ...next[index], ...patch };
    update({ gallery: next });
  };

  const updateTimeline = (index: number, patch: Partial<AboutTimelineItem>) => {
    const next = [...timeline];
    next[index] = { ...next[index], ...patch };
    update({ timeline: next });
  };

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <h2 className="text-xl font-bold mb-2">Página Sobre</h2>
        <p className="text-sm text-gray-500 mb-6">
          Edite todo o conteúdo de <code>/sobre</code>: cabeçalho, introdução, galeria horizontal e
          linha do tempo. Também controla o texto curto e os números da Home.
        </p>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Home (prévia Sobre)</h3>
          <div>
            <label className="admin-label">Texto curto (efeito digitação na Home)</label>
            <textarea
              className="admin-input min-h-[100px]"
              value={about.shortText}
              onChange={(e) => update({ shortText: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Números / métricas da Home</label>
            {metrics.map((metric, i) => (
              <div key={metric.id} className="border rounded-lg p-3 mb-3 space-y-3">
                <AboutMetricIconField
                  value={metric.icon}
                  token={token}
                  onChange={(icon) => {
                    const next = [...metrics];
                    next[i] = { ...next[i], icon };
                    update({ metrics: next });
                  }}
                />
                <div className="grid md:grid-cols-[120px_1fr_auto] gap-3 items-end">
                  <div>
                    <label className="admin-label">Número</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={metric.value}
                      onChange={(e) => {
                        const next = [...metrics];
                        next[i] = { ...next[i], value: Number(e.target.value) || 0 };
                        update({ metrics: next });
                      }}
                    />
                  </div>
                  <div>
                    <label className="admin-label">Descrição</label>
                    <input
                      className="admin-input"
                      value={metric.label}
                      onChange={(e) => {
                        const next = [...metrics];
                        next[i] = { ...next[i], label: e.target.value };
                        update({ metrics: next });
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-red-500 p-2"
                    onClick={() => update({ metrics: metrics.filter((m) => m.id !== metric.id) })}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="admin-btn flex items-center gap-2"
              onClick={() =>
                update({
                  metrics: [
                    ...metrics,
                    { id: String(Date.now()), icon: "📍", value: 0, label: "nova estatística" },
                  ],
                })
              }
            >
              <Plus size={16} /> Adicionar estatística
            </button>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="font-semibold text-gray-800 mb-4">1. Cabeçalho da página</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="admin-label">Rótulo superior</label>
            <input
              className="admin-input"
              value={about.pageEyebrow || ""}
              onChange={(e) => update({ pageEyebrow: e.target.value })}
              placeholder="Conheça"
            />
          </div>
          <div>
            <label className="admin-label">Título principal</label>
            <input
              className="admin-input"
              value={about.pageHeading || ""}
              onChange={(e) => update({ pageHeading: e.target.value })}
              placeholder="Deixe vazio para usar o nome do site"
            />
          </div>
          <div>
            <label className="admin-label">Subtítulo</label>
            <input
              className="admin-input"
              value={about.pageSubtitle || ""}
              onChange={(e) => update({ pageSubtitle: e.target.value })}
              placeholder="Sobre"
            />
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="font-semibold text-gray-800 mb-4">2. Introdução (foto + texto)</h3>
        <ImageUploader
          label="Foto da introdução"
          value={about.introImage || fallbackIntroImage}
          token={token}
          focus={{
            x: about.introImageFocusX,
            y: about.introImageFocusY,
            zoom: about.introImageZoom,
          }}
          onChange={(introImage) => update({ introImage })}
          onFocusChange={(focus) =>
            update({
              introImageFocusX: focus.x,
              introImageFocusY: focus.y,
              introImageZoom: focus.zoom,
            })
          }
          focusPreviewAspect="tall"
        />
        <div className="mt-4">
          <label className="admin-label">Texto da introdução</label>
          <p className="text-xs text-gray-500 mb-2">
            Separe parágrafos com uma linha em branco.
          </p>
          <textarea
            className="admin-input min-h-[160px]"
            value={about.introText || ""}
            onChange={(e) => update({ introText: e.target.value })}
          />
        </div>
        <div className="mt-4">
          <label className="admin-label">Texto completo (opcional / legado)</label>
          <textarea
            className="admin-input min-h-[120px]"
            value={about.fullText}
            onChange={(e) => update({ fullText: e.target.value })}
          />
        </div>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">3. Galeria horizontal</h3>
            <p className="text-sm text-gray-500">Cards com foto e texto em scroll lateral.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={about.showGallery !== false}
              onChange={(e) => update({ showGallery: e.target.checked })}
            />
            Exibir galeria
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="admin-label">Rótulo da galeria</label>
            <input
              className="admin-input"
              value={about.galleryEyebrow || ""}
              onChange={(e) => update({ galleryEyebrow: e.target.value })}
              placeholder="Opcional"
            />
          </div>
          <div>
            <label className="admin-label">Título da galeria</label>
            <input
              className="admin-input"
              value={about.galleryTitle || ""}
              onChange={(e) => update({ galleryTitle: e.target.value })}
              placeholder="Opcional"
            />
          </div>
        </div>

        {gallery.map((item, i) => (
          <div key={item.id} className="border rounded-lg p-3 mb-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-600">Card {i + 1}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="admin-btn-secondary p-1.5"
                  onClick={() => update({ gallery: moveItem(gallery, i, i - 1) })}
                  aria-label="Mover para cima"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary p-1.5"
                  onClick={() => update({ gallery: moveItem(gallery, i, i + 1) })}
                  aria-label="Mover para baixo"
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="text-red-500 p-1.5"
                  onClick={() => update({ gallery: gallery.filter((g) => g.id !== item.id) })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <ImageUploader
              label="Foto"
              value={item.image}
              token={token}
              focus={{ x: item.imageFocusX, y: item.imageFocusY, zoom: item.imageZoom }}
              onChange={(image) => updateGallery(i, { image })}
              onFocusChange={(focus) =>
                updateGallery(i, {
                  imageFocusX: focus.x,
                  imageFocusY: focus.y,
                  imageZoom: focus.zoom,
                })
              }
              focusPreviewAspect="tall"
            />
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Tag</label>
                <input
                  className="admin-input"
                  value={item.tag || ""}
                  onChange={(e) => updateGallery(i, { tag: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Título</label>
                <input
                  className="admin-input"
                  value={item.title}
                  onChange={(e) => updateGallery(i, { title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Texto</label>
              <textarea
                className="admin-input min-h-[80px]"
                value={item.text}
                onChange={(e) => updateGallery(i, { text: e.target.value })}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="admin-btn flex items-center gap-2"
          onClick={() =>
            update({
              gallery: [
                ...gallery,
                {
                  id: String(Date.now()),
                  image: fallbackIntroImage,
                  tag: "Novo",
                  title: "Novo card",
                  text: "",
                },
              ],
            })
          }
        >
          <Plus size={16} /> Adicionar card
        </button>
      </div>

      <div className="admin-card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-gray-800">4. Linha do tempo</h3>
            <p className="text-sm text-gray-500">Blocos alternados de texto e foto.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={about.showTimeline !== false}
              onChange={(e) => update({ showTimeline: e.target.checked })}
            />
            Exibir linha do tempo
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="admin-label">Rótulo</label>
            <input
              className="admin-input"
              value={about.timelineEyebrow || ""}
              onChange={(e) => update({ timelineEyebrow: e.target.value })}
              placeholder="Sobre"
            />
          </div>
          <div>
            <label className="admin-label">Título da seção</label>
            <input
              className="admin-input"
              value={about.timelineTitle || ""}
              onChange={(e) => update({ timelineTitle: e.target.value })}
              placeholder="A trajetória"
            />
          </div>
        </div>

        {timeline.map((item, i) => (
          <div key={item.id} className="border rounded-lg p-3 mb-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-600">Marco {i + 1}</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="admin-btn-secondary p-1.5"
                  onClick={() => update({ timeline: moveItem(timeline, i, i - 1) })}
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary p-1.5"
                  onClick={() => update({ timeline: moveItem(timeline, i, i + 1) })}
                >
                  <ChevronDown size={16} />
                </button>
                <button
                  type="button"
                  className="text-red-500 p-1.5"
                  onClick={() => update({ timeline: timeline.filter((t) => t.id !== item.id) })}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <ImageUploader
              label="Foto"
              value={item.image || ""}
              token={token}
              focus={{ x: item.imageFocusX, y: item.imageFocusY, zoom: item.imageZoom }}
              onChange={(image) => updateTimeline(i, { image })}
              onFocusChange={(focus) =>
                updateTimeline(i, {
                  imageFocusX: focus.x,
                  imageFocusY: focus.y,
                  imageZoom: focus.zoom,
                })
              }
            />
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="admin-label">Ano / etapa</label>
                <input
                  className="admin-input"
                  value={item.year || ""}
                  onChange={(e) => updateTimeline(i, { year: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Título</label>
                <input
                  className="admin-input"
                  value={item.title}
                  onChange={(e) => updateTimeline(i, { title: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="admin-label">Texto</label>
              <textarea
                className="admin-input min-h-[90px]"
                value={item.text}
                onChange={(e) => updateTimeline(i, { text: e.target.value })}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="admin-btn flex items-center gap-2"
          onClick={() =>
            update({
              timeline: [
                ...timeline,
                {
                  id: String(Date.now()),
                  image: fallbackIntroImage,
                  year: "",
                  title: "Novo marco",
                  text: "",
                },
              ],
            })
          }
        >
          <Plus size={16} /> Adicionar marco
        </button>
      </div>
    </div>
  );
}
