"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Share2, X, ExternalLink, MapPin, Calendar, FileText, Landmark } from "lucide-react";
import FormattedContent from "@/components/FormattedContent";
import {
  ACTION_MAP_COLORS,
  formatActionDate,
  getActionVisitSharePath,
  getIndicatorEntries,
  getRelatedNews,
  getVisitVideoEmbed,
  statusLabel,
} from "@/lib/action-map";
import type { ActionVisit, NewsItem } from "@/lib/types";

interface ActionMapDetailPanelProps {
  visit: ActionVisit;
  news: NewsItem[];
  onClose?: () => void;
  compact?: boolean;
}

export default function ActionMapDetailPanel({
  visit,
  news,
  onClose,
  compact = false,
}: ActionMapDetailPanelProps) {
  const [shareMessage, setShareMessage] = useState("");
  const relatedNews = getRelatedNews(visit, news);
  const videoEmbed = getVisitVideoEmbed(visit.videoUrl);
  const indicators = getIndicatorEntries(visit.municipalityIndicators);
  const statusColor = ACTION_MAP_COLORS.realizada;

  const handleShare = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${getActionVisitSharePath(visit.slug)}`
        : getActionVisitSharePath(visit.slug);

    try {
      if (navigator.share) {
        await navigator.share({
          title: visit.title,
          text: visit.excerpt,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage("Link copiado!");
      setTimeout(() => setShareMessage(""), 2500);
    } catch {
      setShareMessage("Não foi possível compartilhar.");
      setTimeout(() => setShareMessage(""), 2500);
    }
  };

  return (
    <div className={`flex h-full flex-col bg-white ${compact ? "" : "md:rounded-l-2xl md:shadow-xl"}`}>
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: statusColor }}
          >
            {statusLabel()}
          </span>
          <h2 className="mt-2 text-lg font-bold leading-snug text-gray-900 md:text-xl">{visit.title}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {visit.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} />
              {formatActionDate(visit.date)}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">{visit.category}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
            aria-label="Compartilhar ação"
          >
            <Share2 size={18} />
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 md:hidden"
              aria-label="Fechar detalhes"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {shareMessage && <p className="px-4 py-2 text-sm text-[#129547]">{shareMessage}</p>}

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {visit.image && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gray-100">
            <Image
              src={visit.image}
              alt={visit.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
          </div>
        )}

        {videoEmbed && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-black">
            {videoEmbed.type === "youtube" ? (
              <iframe
                src={videoEmbed.src}
                title={`Vídeo: ${visit.title}`}
                className="absolute inset-0 h-full w-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={videoEmbed.src} controls className="h-full w-full object-cover" />
            )}
          </div>
        )}

        <p className="mb-4 text-sm leading-relaxed text-gray-700 md:text-base">{visit.excerpt}</p>

        {visit.content && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <FormattedContent content={visit.content} />
          </div>
        )}

        {visit.gallery.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Galeria</h3>
            <div className="grid grid-cols-2 gap-2">
              {visit.gallery.map((src) => (
                <div key={src} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image src={src} alt="" fill className="object-cover" sizes="200px" loading="lazy" unoptimized />
                </div>
              ))}
            </div>
          </div>
        )}

        {indicators.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Indicadores em {visit.city}</h3>
            <div className="grid grid-cols-2 gap-2">
              {indicators.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-center"
                >
                  <p className="text-lg font-bold" style={{ color: ACTION_MAP_COLORS.realizada }}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-600">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(visit.emendaRef || visit.projectRef) && (
          <div className="mt-6 space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0071B7]">
              Referências legislativas
            </p>
            {visit.emendaRef && (
              <p className="inline-flex items-center gap-2 text-sm text-gray-800">
                <Landmark size={15} className="text-[#0071B7]" />
                {visit.emendaRef}
              </p>
            )}
            {visit.projectRef && (
              <p className="inline-flex items-center gap-2 text-sm text-gray-800">
                <Landmark size={15} className="text-[#0071B7]" />
                {visit.projectRef}
              </p>
            )}
          </div>
        )}

        {visit.documents && visit.documents.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Documentos</h3>
            <ul className="space-y-2">
              {visit.documents.map((doc) => (
                <li key={`${doc.title}-${doc.url}`}>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-[#0071B7] hover:bg-gray-50"
                  >
                    <FileText size={16} />
                    {doc.title || "Baixar documento"}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          {visit.relatedLink && (
            <a
              href={visit.relatedLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0071B7] hover:underline"
            >
              <ExternalLink size={16} />
              Link relacionado
            </a>
          )}
          {relatedNews && (
            <Link
              href={`/noticias/${relatedNews.id}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0071B7] hover:underline"
            >
              <ExternalLink size={16} />
              Ver notícia: {relatedNews.title}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
