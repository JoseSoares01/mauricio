"use client";

import { useState } from "react";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import type { ActionMapConfig, ActionVisit, NewsItem } from "@/lib/types";
import { slugifyActionVisit, getIndicatorEntries, indicatorEntriesToRecord } from "@/lib/action-map";
import ImageUploader from "./ImageUploader";
import FileUploader from "./FileUploader";
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
  const [geocodingIndex, setGeocodingIndex] = useState<number | null>(null);
  const [geocodeMessage, setGeocodeMessage] = useState("");

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

  const geocodeCity = async (index: number) => {
    const visit = actionMap.visits[index];
    if (!visit.city.trim()) {
      setGeocodeMessage("Informe o nome da cidade antes de buscar coordenadas.");
      return;
    }

    setGeocodingIndex(index);
    setGeocodeMessage("");
    try {
      const params = new URLSearchParams({ city: visit.city.trim() });
      const response = await fetch(`/api/geocode?${params}`, {
        headers: { "x-admin-token": token },
      });
      const data = await response.json();
      if (!response.ok) {
        setGeocodeMessage(data.error || "Não foi possível localizar a cidade.");
        return;
      }
      updateVisit(index, { latitude: data.latitude, longitude: data.longitude });
      setGeocodeMessage(`Coordenadas atualizadas: ${data.placeName}`);
    } catch {
      setGeocodeMessage("Erro ao buscar coordenadas.");
    } finally {
      setGeocodingIndex(null);
    }
  };

  const updateIndicator = (
    index: number,
    indicatorIndex: number,
    field: "label" | "value",
    value: string
  ) => {
    const visit = actionMap.visits[index];
    const entries = getIndicatorEntries(visit.municipalityIndicators);
    const next = [...entries];
    next[indicatorIndex] = {
      ...next[indicatorIndex],
      [field]: value,
    };
    updateVisit(index, { municipalityIndicators: indicatorEntriesToRecord(next) });
  };

  const addIndicator = (index: number) => {
    const visit = actionMap.visits[index];
    const entries = getIndicatorEntries(visit.municipalityIndicators);
    updateVisit(index, {
      municipalityIndicators: indicatorEntriesToRecord([...entries, { label: "", value: "" }]),
    });
  };

  const removeIndicator = (index: number, indicatorIndex: number) => {
    const visit = actionMap.visits[index];
    const entries = getIndicatorEntries(visit.municipalityIndicators).filter(
      (_, i) => i !== indicatorIndex
    );
    updateVisit(index, {
      municipalityIndicators: entries.length ? indicatorEntriesToRecord(entries) : undefined,
    });
  };

  const updateDocument = (
    index: number,
    docIndex: number,
    field: "title" | "url",
    value: string
  ) => {
    const visit = actionMap.visits[index];
    const documents = [...(visit.documents || [])];
    documents[docIndex] = { ...documents[docIndex], [field]: value };
    updateVisit(index, { documents });
  };

  const addDocument = (index: number) => {
    const visit = actionMap.visits[index];
    updateVisit(index, {
      documents: [...(visit.documents || []), { title: "Documento", url: "" }],
    });
  };

  const updateRoutePoint = (
    index: number,
    pointIndex: number,
    field: "latitude" | "longitude",
    value: number
  ) => {
    const visit = actionMap.visits[index];
    const routePoints = [...(visit.routePoints || [])];
    routePoints[pointIndex] = { ...routePoints[pointIndex], [field]: value };
    updateVisit(index, { routePoints });
  };

  const addRoutePoint = (index: number) => {
    const visit = actionMap.visits[index];
    updateVisit(index, {
      routePoints: [
        ...(visit.routePoints || []),
        { latitude: visit.latitude, longitude: visit.longitude },
      ],
    });
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

      {geocodeMessage && (
        <p className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-[#0071B7]">{geocodeMessage}</p>
      )}

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
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => geocodeCity(index)}
                disabled={geocodingIndex === index}
                className="admin-btn inline-flex items-center gap-2"
              >
                {geocodingIndex === index ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MapPin size={16} />
                )}
                Buscar coordenadas pela cidade (Mapbox)
              </button>
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

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <h4 className="font-semibold text-gray-800 mb-3">Vídeo e documentos</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="admin-label">URL do vídeo (YouTube ou arquivo)</label>
                  <input
                    className="admin-input"
                    value={visit.videoUrl || ""}
                    onChange={(e) => updateVisit(index, { videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... ou /uploads/video.mp4"
                  />
                </div>
                <div>
                  <label className="admin-label">Referência de emenda</label>
                  <input
                    className="admin-input"
                    value={visit.emendaRef || ""}
                    onChange={(e) => updateVisit(index, { emendaRef: e.target.value })}
                    placeholder="Ex.: Emenda nº 123/2026"
                  />
                </div>
                <div>
                  <label className="admin-label">Referência de projeto</label>
                  <input
                    className="admin-input"
                    value={visit.projectRef || ""}
                    onChange={(e) => updateVisit(index, { projectRef: e.target.value })}
                    placeholder="Ex.: Projeto de lei 456/2026"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <h5 className="admin-label">Documentos (PDF)</h5>
                {(visit.documents || []).map((doc, docIndex) => (
                  <div key={`${visit.id}-doc-${docIndex}`} className="grid md:grid-cols-2 gap-3 rounded-lg border p-3 bg-white">
                    <div>
                      <label className="admin-label">Título</label>
                      <input
                        className="admin-input"
                        value={doc.title}
                        onChange={(e) => updateDocument(index, docIndex, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <FileUploader
                        label="Arquivo"
                        value={doc.url}
                        onChange={(url) => updateDocument(index, docIndex, "url", url)}
                        token={token}
                        folder="uploads/docs"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        className="text-red-500 text-sm"
                        onClick={() => {
                          const documents = (visit.documents || []).filter((_, i) => i !== docIndex);
                          updateVisit(index, { documents: documents.length ? documents : undefined });
                        }}
                      >
                        Remover documento
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addDocument(index)} className="admin-btn text-sm">
                  Adicionar documento
                </button>
              </div>
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Indicadores do município</h4>
              <p className="text-xs text-gray-500 mb-3">
                Métricas exibidas no painel de detalhes da ação (ex.: unidades visitadas, investimento).
              </p>
              {getIndicatorEntries(visit.municipalityIndicators).map((entry, indicatorIndex) => (
                <div key={`${visit.id}-ind-${indicatorIndex}`} className="grid md:grid-cols-2 gap-3 mb-3">
                  <input
                    className="admin-input"
                    value={entry.label}
                    onChange={(e) => updateIndicator(index, indicatorIndex, "label", e.target.value)}
                    placeholder="Nome do indicador"
                  />
                  <div className="flex gap-2">
                    <input
                      className="admin-input flex-1"
                      value={entry.value}
                      onChange={(e) => updateIndicator(index, indicatorIndex, "value", e.target.value)}
                      placeholder="Valor"
                    />
                    <button
                      type="button"
                      className="text-red-500 shrink-0"
                      onClick={() => removeIndicator(index, indicatorIndex)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addIndicator(index)} className="admin-btn text-sm">
                Adicionar indicador
              </button>
            </div>

            {visit.status === "agendada" && (
              <div className="md:col-span-2 border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Rota prevista (pontos intermediários)</h4>
                <p className="text-xs text-gray-500 mb-3">
                  Define a linha tracejada no mapa. O pin da cidade é o destino; adicione pontos de passagem.
                </p>
                {(visit.routePoints || []).map((point, pointIndex) => (
                  <div key={`${visit.id}-route-${pointIndex}`} className="grid md:grid-cols-3 gap-3 mb-3 items-end">
                    <div>
                      <label className="admin-label">Latitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        className="admin-input"
                        value={point.latitude}
                        onChange={(e) =>
                          updateRoutePoint(index, pointIndex, "latitude", Number(e.target.value))
                        }
                      />
                    </div>
                    <div>
                      <label className="admin-label">Longitude</label>
                      <input
                        type="number"
                        step="0.0001"
                        className="admin-input"
                        value={point.longitude}
                        onChange={(e) =>
                          updateRoutePoint(index, pointIndex, "longitude", Number(e.target.value))
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-500 text-sm mb-2"
                      onClick={() => {
                        const routePoints = (visit.routePoints || []).filter((_, i) => i !== pointIndex);
                        updateVisit(index, {
                          routePoints: routePoints.length ? routePoints : undefined,
                        });
                      }}
                    >
                      Remover ponto
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => addRoutePoint(index)} className="admin-btn text-sm">
                  Adicionar ponto na rota
                </button>
              </div>
            )}
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
