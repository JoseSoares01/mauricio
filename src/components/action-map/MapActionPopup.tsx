"use client";

import Image from "next/image";
import { formatActionDate } from "@/lib/action-map";

export interface MapPopupData {
  title: string;
  category: string;
  description: string;
  date: string;
  image?: string;
  cityLabel?: string;
  onDetails?: () => void;
}

export default function MapActionPopup({
  data,
  onClose,
}: {
  data: MapPopupData;
  onClose?: () => void;
}) {
  return (
    <div className="p-1 min-w-[240px] max-w-[280px]">
      {data.image && (
        <div className="relative mb-2 h-28 w-full overflow-hidden rounded-lg">
          <Image
            src={data.image}
            alt={data.title}
            fill
            className="object-cover"
            sizes="280px"
            unoptimized
          />
        </div>
      )}
      {data.cityLabel && (
        <p className="text-xs font-semibold uppercase text-[#0071B7]">{data.cityLabel}</p>
      )}
      <span className="inline-block mt-1 rounded px-2 py-0.5 text-[10px] font-medium bg-[#FAEE05] text-[#6E8B3D]">
        {data.category}
      </span>
      <p className="text-sm font-bold text-gray-900 mt-1.5 leading-snug">{data.title}</p>
      <p className="text-xs text-gray-500 mt-1">{formatActionDate(data.date)}</p>
      {data.description && (
        <p className="mt-2 line-clamp-3 text-xs text-gray-700 leading-relaxed">{data.description}</p>
      )}
      {data.onDetails && (
        <button
          type="button"
          className="mt-3 w-full rounded-lg bg-[#0071B7] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
          onClick={data.onDetails}
        >
          Ver detalhes
        </button>
      )}
      {onClose && (
        <button
          type="button"
          className="mt-2 w-full text-xs text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          Fechar
        </button>
      )}
    </div>
  );
}
