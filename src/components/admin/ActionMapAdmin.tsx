"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { ActionMapConfig, ActionVisit, NewsItem, TeresinaVisit } from "@/lib/types";
import {
  getActionVisitSharePath,
  getIndicatorEntries,
  indicatorEntriesToRecord,
  slugifyActionVisit,
} from "@/lib/action-map";
import ImageUploader from "./ImageUploader";
import FileUploader from "./FileUploader";
import RichTextEditor from "./RichTextEditor";

interface ActionMapAdminProps {
  actionMap: ActionMapConfig;
  news: NewsItem[];
  token: string;
  onChange: (actionMap: ActionMapConfig) => void;
}

type AdminScope = "piaui" | "teresina";

const CATEGORY_SUGGESTIONS = [
  "Saúde",
  "Educação",
  "Infraestrutura",
  "Desenvolvimento",
  "Agronegócio",
  "Segurança",
  "Turismo",
  "Comércio",
  "Agricultura Urbana",
  "Geral",
];

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs leading-relaxed text-gray-500">{children}</p>;
}

function AdminSection({
  title,
  description,
  children,
  defaultOpen = true,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        onClick={() => setOpen((value) => !value)}
      >
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
        {open ? <ChevronUp size={18} className="shrink-0 text-gray-400" /> : <ChevronDown size={18} className="shrink-0 text-gray-400" />}
      </button>
      {open && <div className="border-t border-gray-100 px-4 py-4">{children}</div>}
    </div>
  );
}

function createEmptyVisit(order: number): ActionVisit {
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
    displayOrder: order,
    active: true,
  };
}

function createEmptyTeresinaVisit(): TeresinaVisit {
  const date = new Date().toISOString().slice(0, 10);
  const neighborhood = "Centro";
  const title = "Nova ação no bairro";

  return {
    id: `t-${Date.now()}`,
    slug: neighborhood
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    neighborhood,
    latitude: -5.0892,
    longitude: -42.8019,
    date,
    title,
    excerpt: "",
    content: "",
    category: "Geral",
    image: "",
    gallery: [],
    active: true,
  };
}

async function geocodePlace(query: string, token: string) {
  const response = await fetch(`/api/geocode?city=${encodeURIComponent(query)}`, {
    headers: { "x-admin-token": token },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Não foi possível localizar no mapa.");
  }
  return data as { latitude: number; longitude: number; placeName: string };
}

export default function ActionMapAdmin({ actionMap, news, token, onChange }: ActionMapAdminProps) {
  const [scope, setScope] = useState<AdminScope>("piaui");
  const [expandedId, setExpandedId] = useState<string | null>(actionMap.visits[0]?.id || null);
  const [geocodeLoadingId, setGeocodeLoadingId] = useState<string | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);

  const categoryOptions = useMemo(() => {
    const fromData = new Set<string>([
      ...actionMap.visits.map((visit) => visit.category),
      ...(actionMap.teresinaVisits || []).map((visit) => visit.category),
      ...CATEGORY_SUGGESTIONS,
    ]);
    return [...fromData].filter(Boolean).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [actionMap.visits, actionMap.teresinaVisits]);

  const updateVisit = (index: number, patch: Partial<ActionVisit>, autoSlug = false) => {
    const visits = [...actionMap.visits];
    const current = visits[index];
    const next = { ...current, ...patch };

    if (autoSlug || (patch.city || patch.title || patch.date)) {
      next.slug = slugifyActionVisit({
        city: next.city,
        title: next.title,
        date: next.date,
      });
    }

    visits[index] = next;
    onChange({ ...actionMap, visits });
  };

  const updateTeresinaVisit = (index: number, patch: Partial<TeresinaVisit>) => {
    const teresinaVisits = [...(actionMap.teresinaVisits || [])];
    teresinaVisits[index] = { ...teresinaVisits[index], ...patch };
    onChange({ ...actionMap, teresinaVisits });
  };

  const handleGeocodePiaui = async (index: number) => {
    const visit = actionMap.visits[index];
    setGeocodeLoadingId(visit.id);
    setGeocodeError(null);
    try {
      const result = await geocodePlace(`${visit.city}, Piauí`, token);
      updateVisit(index, { latitude: result.latitude, longitude: result.longitude });
    } catch (error) {
      setGeocodeError(error instanceof Error ? error.message : "Erro ao localizar cidade.");
    } finally {
      setGeocodeLoadingId(null);
    }
  };

  const handleGeocodeTeresina = async (index: number) => {
    const visit = actionMap.teresinaVisits![index];
    setGeocodeLoadingId(visit.id);
    setGeocodeError(null);
    try {
      const result = await geocodePlace(`${visit.neighborhood}, Teresina, Piauí`, token);
      updateTeresinaVisit(index, { latitude: result.latitude, longitude: result.longitude });
    } catch (error) {
      setGeocodeError(error instanceof Error ? error.message : "Erro ao localizar bairro.");
    } finally {
      setGeocodeLoadingId(null);
    }
  };

  const addGalleryImage = (index: number, url: string) => {
    if (!url) return;
    const visits = [...actionMap.visits];
    visits[index] = { ...visits[index], gallery: [...visits[index].gallery, url] };
    onChange({ ...actionMap, visits });
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
    next[indicatorIndex] = { ...next[indicatorIndex], [field]: value };
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

  const updateTeresinaIndicator = (
    index: number,
    indicatorIndex: number,
    field: "label" | "value",
    value: string
  ) => {
    const visit = actionMap.teresinaVisits![index];
    const entries = getIndicatorEntries(visit.indicators);
    const next = [...entries];
    next[indicatorIndex] = { ...next[indicatorIndex], [field]: value };
    updateTeresinaVisit(index, { indicators: indicatorEntriesToRecord(next) });
  };

  return (
    <div className="admin-card">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold">Mapa de Atuação</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cadastre as ações que aparecem no mapa público. Preencha os campos principais, localize a
            cidade ou bairro no mapa e use as seções avançadas apenas quando precisar de mais detalhes.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={actionMap.enabled}
            onChange={(e) => onChange({ ...actionMap, enabled: e.target.checked })}
          />
          Mapa ativo no site
        </label>
      </div>

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setScope("piaui")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            scope === "piaui"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Ações no Piauí
        </button>
        <button
          type="button"
          onClick={() => setScope("teresina")}
          className={`border-b-2 px-4 py-2 text-sm font-semibold transition ${
            scope === "teresina"
              ? "border-[var(--color-primary)] text-[var(--color-primary)]"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          Ações em Teresina
        </button>
      </div>

      {geocodeError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {geocodeError}
        </div>
      )}

      {scope === "piaui" ? (
        <>
          {actionMap.visits.map((visit, index) => {
            const isOpen = expandedId === visit.id;
            const sharePath = getActionVisitSharePath(visit.slug);

            return (
              <div key={visit.id} className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => setExpandedId(isOpen ? null : visit.id)}
                >
                  <div>
                    <p className="font-bold text-gray-900">{visit.title || "Nova ação"}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {visit.city} · {visit.date} · {visit.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label
                      className="inline-flex items-center gap-2 text-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={visit.active}
                        onChange={(e) => updateVisit(index, { active: e.target.checked })}
                      />
                      Ativa
                    </label>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={(event) => {
                        event.stopPropagation();
                        onChange({
                          ...actionMap,
                          visits: actionMap.visits.filter((item) => item.id !== visit.id),
                        });
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-gray-200 bg-white px-4 py-4">
                    <AdminSection
                      title="1. Informações principais"
                      description="Dados que identificam a ação no mapa e nos filtros."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="admin-label">Título</label>
                          <input
                            className="admin-input"
                            value={visit.title}
                            onChange={(e) => updateVisit(index, { title: e.target.value }, true)}
                            placeholder="Ex.: Visita à rede municipal de saúde"
                          />
                          <FieldHint>Nome da ação como o visitante verá no mapa e no painel lateral.</FieldHint>
                        </div>

                        <div>
                          <label className="admin-label">Cidade</label>
                          <input
                            className="admin-input"
                            value={visit.city}
                            onChange={(e) => updateVisit(index, { city: e.target.value }, true)}
                            placeholder="Ex.: Teresina"
                            list={`cities-${visit.id}`}
                          />
                          <FieldHint>Município do Piauí onde a ação aconteceu.</FieldHint>
                        </div>

                        <div>
                          <label className="admin-label">Data</label>
                          <input
                            type="date"
                            className="admin-input"
                            value={visit.date}
                            onChange={(e) => updateVisit(index, { date: e.target.value }, true)}
                          />
                        </div>

                        <div>
                          <label className="admin-label">Categoria</label>
                          <input
                            className="admin-input"
                            value={visit.category}
                            onChange={(e) => updateVisit(index, { category: e.target.value })}
                            list={`categories-${visit.id}`}
                            placeholder="Ex.: Saúde"
                          />
                          <datalist id={`categories-${visit.id}`}>
                            {categoryOptions.map((category) => (
                              <option key={category} value={category} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="admin-label">Ordem de exibição</label>
                          <input
                            type="number"
                            className="admin-input"
                            value={visit.displayOrder}
                            onChange={(e) => updateVisit(index, { displayOrder: Number(e.target.value) })}
                          />
                          <FieldHint>Número menor aparece primeiro nas listagens.</FieldHint>
                        </div>

                        <div className="md:col-span-2">
                          <div className="flex items-end justify-between gap-3">
                            <div className="flex-1">
                              <label className="admin-label">Slug (URL de compartilhamento)</label>
                              <input
                                className="admin-input"
                                value={visit.slug}
                                onChange={(e) => updateVisit(index, { slug: e.target.value })}
                              />
                            </div>
                            <button
                              type="button"
                              className="admin-btn flex items-center gap-2 whitespace-nowrap"
                              onClick={() => updateVisit(index, {}, true)}
                            >
                              <RefreshCw size={14} />
                              Gerar slug
                            </button>
                          </div>
                          <FieldHint>
                            Link público: <code>/mapa-de-atuacao?acao={visit.slug || "slug-da-acao"}</code>
                          </FieldHint>
                        </div>
                      </div>
                    </AdminSection>

                    <AdminSection
                      title="2. Textos da ação"
                      description="Resumo curto para o popup e descrição completa para o painel de detalhes."
                    >
                      <div className="space-y-4">
                        <div>
                          <label className="admin-label">Resumo (popup)</label>
                          <textarea
                            className="admin-input min-h-[96px]"
                            value={visit.excerpt}
                            onChange={(e) => updateVisit(index, { excerpt: e.target.value })}
                            placeholder="Frase curta que aparece ao clicar no pin do mapa."
                          />
                          <FieldHint>{visit.excerpt.length}/220 caracteres recomendados.</FieldHint>
                        </div>
                        <RichTextEditor
                          label="Descrição completa"
                          value={visit.content}
                          onChange={(value) => updateVisit(index, { content: value })}
                        />
                      </div>
                    </AdminSection>

                    <AdminSection
                      title="3. Vínculos e compartilhamento"
                      description="Conecte a ação a notícias e links externos."
                    >
                      <div className="grid gap-4 md:grid-cols-2">
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
                        <div>
                          <label className="admin-label">Link relacionado</label>
                          <input
                            className="admin-input"
                            value={visit.relatedLink || ""}
                            onChange={(e) => updateVisit(index, { relatedLink: e.target.value })}
                            placeholder="https://"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <a
                            href={sharePath}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                          >
                            <ExternalLink size={14} />
                            Pré-visualizar link compartilhável
                          </a>
                        </div>
                      </div>
                    </AdminSection>

                    <AdminSection
                      title="4. Localização no mapa"
                      description="O pin é posicionado automaticamente pela cidade usando o Mapbox."
                    >
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[220px] flex-1">
                          <label className="admin-label">Coordenadas</label>
                          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            Lat {visit.latitude.toFixed(4)}, Lng {visit.longitude.toFixed(4)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="admin-btn flex items-center gap-2"
                          onClick={() => handleGeocodePiaui(index)}
                          disabled={geocodeLoadingId === visit.id}
                        >
                          {geocodeLoadingId === visit.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <MapPin size={16} />
                          )}
                          Localizar cidade no mapa
                        </button>
                      </div>
                      <FieldHint>
                        Clique após preencher a cidade. O sistema encontra automaticamente a posição correta no
                        mapa do Piauí.
                      </FieldHint>
                    </AdminSection>

                    <AdminSection
                      title="5. Mídia"
                      description="Imagem principal, galeria e vídeo opcional."
                      defaultOpen={false}
                    >
                      <div className="space-y-4">
                        <ImageUploader
                          label="Imagem principal"
                          value={visit.image}
                          onChange={(url) => updateVisit(index, { image: url })}
                          token={token}
                        />
                        <div>
                          <h4 className="admin-label">Galeria de imagens</h4>
                          <div className="mb-3 grid gap-3 sm:grid-cols-2">
                            {visit.gallery.map((src, galleryIndex) => (
                              <div key={`${src}-${galleryIndex}`} className="flex items-center gap-2">
                                <input className="admin-input" value={src} readOnly />
                                <button
                                  type="button"
                                  className="shrink-0 text-red-500"
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
                        <div>
                          <label className="admin-label">URL do vídeo (YouTube ou arquivo)</label>
                          <input
                            className="admin-input"
                            value={visit.videoUrl || ""}
                            onChange={(e) => updateVisit(index, { videoUrl: e.target.value })}
                            placeholder="https://youtube.com/watch?v=... ou /uploads/video.mp4"
                          />
                        </div>
                      </div>
                    </AdminSection>

                    <AdminSection
                      title="6. Complementos"
                      description="Indicadores, emendas, projetos e documentos PDF."
                      defaultOpen={false}
                    >
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
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

                        <div>
                          <h4 className="admin-label">Indicadores do município</h4>
                          <FieldHint>Ex.: unidades visitadas, famílias beneficiadas, investimento.</FieldHint>
                          {getIndicatorEntries(visit.municipalityIndicators).map((entry, indicatorIndex) => (
                            <div key={`${visit.id}-ind-${indicatorIndex}`} className="mt-3 grid gap-3 md:grid-cols-2">
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
                                  className="shrink-0 text-red-500"
                                  onClick={() => removeIndicator(index, indicatorIndex)}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => addIndicator(index)} className="admin-btn mt-3 text-sm">
                            Adicionar indicador
                          </button>
                        </div>

                        <div>
                          <h4 className="admin-label">Documentos (PDF)</h4>
                          {(visit.documents || []).map((doc, docIndex) => (
                            <div key={`${visit.id}-doc-${docIndex}`} className="mt-3 grid gap-3 rounded-lg border p-3 md:grid-cols-2">
                              <div>
                                <label className="admin-label">Título</label>
                                <input
                                  className="admin-input"
                                  value={doc.title}
                                  onChange={(e) => updateDocument(index, docIndex, "title", e.target.value)}
                                />
                              </div>
                              <FileUploader
                                label="Arquivo"
                                value={doc.url}
                                onChange={(url) => updateDocument(index, docIndex, "url", url)}
                                token={token}
                                folder="uploads/docs"
                              />
                              <div className="md:col-span-2 flex justify-end">
                                <button
                                  type="button"
                                  className="text-sm text-red-500"
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
                          <button type="button" onClick={() => addDocument(index)} className="admin-btn mt-3 text-sm">
                            Adicionar documento
                          </button>
                        </div>
                      </div>
                    </AdminSection>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const visit = createEmptyVisit(actionMap.visits.length + 1);
              onChange({ ...actionMap, visits: [...actionMap.visits, visit] });
              setExpandedId(visit.id);
            }}
            className="admin-btn flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar ação no Piauí
          </button>
        </>
      ) : (
        <>
          {(actionMap.teresinaVisits || []).map((visit, index) => {
            const isOpen = expandedId === visit.id;

            return (
              <div key={visit.id} className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
                  onClick={() => setExpandedId(isOpen ? null : visit.id)}
                >
                  <div>
                    <p className="font-bold text-gray-900">{visit.title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {visit.neighborhood} · {visit.date} · {visit.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label
                      className="inline-flex items-center gap-2 text-sm"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={visit.active}
                        onChange={(e) => updateTeresinaVisit(index, { active: e.target.checked })}
                      />
                      Ativa
                    </label>
                    <button
                      type="button"
                      className="text-red-500"
                      onClick={(event) => {
                        event.stopPropagation();
                        onChange({
                          ...actionMap,
                          teresinaVisits: (actionMap.teresinaVisits || []).filter((item) => item.id !== visit.id),
                        });
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="space-y-4 border-t border-gray-200 bg-white px-4 py-4">
                    <AdminSection title="1. Informações principais">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="admin-label">Título</label>
                          <input
                            className="admin-input"
                            value={visit.title}
                            onChange={(e) => updateTeresinaVisit(index, { title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Bairro</label>
                          <input
                            className="admin-input"
                            value={visit.neighborhood}
                            onChange={(e) => updateTeresinaVisit(index, { neighborhood: e.target.value })}
                            placeholder="Ex.: Mocambinho"
                          />
                        </div>
                        <div>
                          <label className="admin-label">Data</label>
                          <input
                            type="date"
                            className="admin-input"
                            value={visit.date}
                            onChange={(e) => updateTeresinaVisit(index, { date: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="admin-label">Categoria</label>
                          <input
                            className="admin-input"
                            value={visit.category}
                            onChange={(e) => updateTeresinaVisit(index, { category: e.target.value })}
                            list={`teresina-categories-${visit.id}`}
                          />
                          <datalist id={`teresina-categories-${visit.id}`}>
                            {categoryOptions.map((category) => (
                              <option key={category} value={category} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </AdminSection>

                    <AdminSection title="2. Textos da ação">
                      <div className="space-y-4">
                        <div>
                          <label className="admin-label">Resumo (popup)</label>
                          <textarea
                            className="admin-input min-h-[96px]"
                            value={visit.excerpt}
                            onChange={(e) => updateTeresinaVisit(index, { excerpt: e.target.value })}
                          />
                        </div>
                        <RichTextEditor
                          label="Descrição completa"
                          value={visit.content}
                          onChange={(value) => updateTeresinaVisit(index, { content: value })}
                        />
                      </div>
                    </AdminSection>

                    <AdminSection title="3. Localização no mapa de Teresina">
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[220px] flex-1">
                          <label className="admin-label">Coordenadas</label>
                          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                            Lat {visit.latitude.toFixed(4)}, Lng {visit.longitude.toFixed(4)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="admin-btn flex items-center gap-2"
                          onClick={() => handleGeocodeTeresina(index)}
                          disabled={geocodeLoadingId === visit.id}
                        >
                          {geocodeLoadingId === visit.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <MapPin size={16} />
                          )}
                          Localizar bairro no mapa
                        </button>
                      </div>
                    </AdminSection>

                    <AdminSection title="4. Mídia e indicadores" defaultOpen={false}>
                      <div className="space-y-4">
                        <ImageUploader
                          label="Imagem principal"
                          value={visit.image}
                          onChange={(url) => updateTeresinaVisit(index, { image: url })}
                          token={token}
                        />
                        <div>
                          <label className="admin-label">Referência de projeto</label>
                          <input
                            className="admin-input"
                            value={visit.projectRef || ""}
                            onChange={(e) => updateTeresinaVisit(index, { projectRef: e.target.value })}
                          />
                        </div>
                        <div>
                          <h4 className="admin-label">Indicadores do bairro</h4>
                          {getIndicatorEntries(visit.indicators).map((entry, indicatorIndex) => (
                            <div key={`${visit.id}-t-ind-${indicatorIndex}`} className="mt-3 grid gap-3 md:grid-cols-2">
                              <input
                                className="admin-input"
                                value={entry.label}
                                onChange={(e) =>
                                  updateTeresinaIndicator(index, indicatorIndex, "label", e.target.value)
                                }
                                placeholder="Nome do indicador"
                              />
                              <input
                                className="admin-input"
                                value={entry.value}
                                onChange={(e) =>
                                  updateTeresinaIndicator(index, indicatorIndex, "value", e.target.value)
                                }
                                placeholder="Valor"
                              />
                            </div>
                          ))}
                          <button
                            type="button"
                            className="admin-btn mt-3 text-sm"
                            onClick={() => {
                              const entries = getIndicatorEntries(visit.indicators);
                              updateTeresinaVisit(index, {
                                indicators: indicatorEntriesToRecord([...entries, { label: "", value: "" }]),
                              });
                            }}
                          >
                            Adicionar indicador
                          </button>
                        </div>
                      </div>
                    </AdminSection>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const visit = createEmptyTeresinaVisit();
              onChange({
                ...actionMap,
                teresinaVisits: [...(actionMap.teresinaVisits || []), visit],
              });
              setExpandedId(visit.id);
            }}
            className="admin-btn flex items-center gap-2"
          >
            <Plus size={16} />
            Adicionar ação em Teresina
          </button>
        </>
      )}
    </div>
  );
}
