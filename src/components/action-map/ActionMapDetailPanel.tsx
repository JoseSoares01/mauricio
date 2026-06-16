"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Share2, X, ExternalLink, MapPin, Calendar } from "lucide-react";
import FormattedContent from "@/components/FormattedContent";
import {
  ACTION_MAP_COLORS,
  formatActionDate,
  getActionVisitSharePath,
  getRelatedNews,
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
  const statusColor =
    visit.status === "agendada" ? ACTION_MAP_COLORS.agendada : ACTION_MAP_COLORS.realizada;

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
            {statusLabel(visit.status)}
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
