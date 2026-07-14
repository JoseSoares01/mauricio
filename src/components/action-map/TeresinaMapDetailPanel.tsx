"use client";

import { X, MapPin, Calendar } from "lucide-react";
import FormattedContent from "@/components/FormattedContent";
import FocusedImage from "@/components/FocusedImage";
import { ACTION_MAP_COLORS, formatActionDate, getIndicatorEntries, statusLabel } from "@/lib/action-map";
import type { TeresinaVisit } from "@/lib/types";

interface TeresinaMapDetailPanelProps {
  visit: TeresinaVisit;
  onClose?: () => void;
  compact?: boolean;
}

export default function TeresinaMapDetailPanel({
  visit,
  onClose,
  compact = false,
}: TeresinaMapDetailPanelProps) {
  const indicators = getIndicatorEntries(visit.indicators);
  const gallery = visit.gallery?.filter(Boolean) ?? (visit.image ? [visit.image] : []);

  return (
    <div className={`flex h-full flex-col bg-white ${compact ? "" : "md:rounded-l-2xl md:shadow-xl"}`}>
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: ACTION_MAP_COLORS.realizada }}
          >
            {statusLabel()}
          </span>
          <h2 className="mt-2 text-lg font-bold leading-snug text-gray-900 md:text-xl">{visit.title}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              {visit.neighborhood}, Teresina
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} />
              {formatActionDate(visit.date)}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">{visit.category}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
            aria-label="Fechar detalhes"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {visit.image && (
          <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-gray-100">
            <FocusedImage
              src={visit.image}
              alt={visit.title}
              fill
              focus={visit}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized
            />
          </div>
        )}

        {visit.excerpt && (
          <p className="mb-4 text-sm leading-relaxed text-gray-700 md:text-base">{visit.excerpt}</p>
        )}

        {visit.content && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <FormattedContent content={visit.content} />
          </div>
        )}

        {gallery.length > 1 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Galeria</h3>
            <div className="grid grid-cols-2 gap-2">
              {gallery.map((src, galleryIndex) => (
                <div key={`${src}-${galleryIndex}`} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <FocusedImage
                    src={src}
                    alt=""
                    fill
                    focus={visit.galleryFocus?.[galleryIndex]}
                    className="object-cover"
                    sizes="200px"
                    loading="lazy"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {indicators.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-800">Indicadores</h3>
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

        {visit.projectRef && (
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0071B7]">Referência</p>
            <p className="mt-1 text-sm text-gray-800">{visit.projectRef}</p>
          </div>
        )}
      </div>
    </div>
  );
}
