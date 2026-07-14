"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import {
  clampImageFocusAxis,
  clampImageZoom,
  DEFAULT_IMAGE_FOCUS,
  getImageFocusStyles,
  MAX_IMAGE_ZOOM,
  MIN_IMAGE_ZOOM,
  normalizeImageFocus,
} from "@/lib/image-focus";
import type { ImageFocus } from "@/lib/types";

interface ImagePositionEditorProps {
  image: string;
  focus?: ImageFocus | null;
  onChange: (focus: ImageFocus) => void;
  previewLabel?: string;
  previewAspect?: "square" | "wide" | "tall";
  objectFit?: "cover" | "contain";
}

export default function ImagePositionEditor({
  image,
  focus,
  onChange,
  previewLabel = "Preview",
  previewAspect = "wide",
  objectFit = "cover",
}: ImagePositionEditorProps) {
  const normalized = normalizeImageFocus(focus ?? undefined);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const updateFocus = useCallback(
    (next: Partial<ImageFocus>) => {
      onChange({
        ...normalized,
        ...next,
        x: next.x !== undefined ? clampImageFocusAxis(next.x) : normalized.x,
        y: next.y !== undefined ? clampImageFocusAxis(next.y) : normalized.y,
        zoom: next.zoom !== undefined ? clampImageZoom(next.zoom) : normalized.zoom,
      });
    },
    [normalized, onChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    event.preventDefault();
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: normalized.x,
      originY: normalized.y,
    };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = previewRef.current?.getBoundingClientRect();
    const scale = rect ? 100 / Math.max(rect.width, rect.height) : 0.2;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    updateFocus({
      x: dragRef.current.originX - deltaX * scale,
      y: dragRef.current.originY - deltaY * scale,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!image) return null;

  const focusStyles = getImageFocusStyles(normalized, objectFit);
  const previewHeight =
    previewAspect === "square" ? "h-40" : previewAspect === "tall" ? "h-52" : "h-36";

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="admin-label mb-0">Enquadramento da imagem</p>
          <p className="text-xs text-gray-500 mt-1">
            Arraste, use os controles ou ajuste o zoom para posicionar a imagem.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary flex items-center gap-1 text-xs shrink-0"
          onClick={() => onChange({ ...DEFAULT_IMAGE_FOCUS })}
        >
          <RotateCcw size={14} />
          Resetar
        </button>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">{previewLabel}</p>
        <div
          ref={previewRef}
          className={`relative ${previewHeight} rounded-lg overflow-hidden border bg-white touch-none select-none ${
            dragging ? "cursor-grabbing ring-2 ring-[var(--color-primary)]" : "cursor-grab"
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <Image
            src={image}
            alt="Preview"
            fill
            className={`${objectFit === "contain" ? "object-contain" : "object-cover"} pointer-events-none`}
            style={focusStyles}
            draggable={false}
            unoptimized
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className="admin-label flex justify-between">
            <span>Horizontal</span>
            <span className="text-gray-400 font-normal">{normalized.x}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={normalized.x}
            onChange={(e) => updateFocus({ x: Number(e.target.value) })}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>Esquerda</span>
            <span>Direita</span>
          </div>
        </div>
        <div>
          <label className="admin-label flex justify-between">
            <span>Vertical</span>
            <span className="text-gray-400 font-normal">{normalized.y}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={normalized.y}
            onChange={(e) => updateFocus({ y: Number(e.target.value) })}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>Topo</span>
            <span>Base</span>
          </div>
        </div>
        <div>
          <label className="admin-label flex justify-between items-center">
            <span className="flex items-center gap-1">
              <ZoomOut size={14} />
              Zoom
              <ZoomIn size={14} />
            </span>
            <span className="text-gray-400 font-normal">{normalized.zoom}%</span>
          </label>
          <input
            type="range"
            min={MIN_IMAGE_ZOOM}
            max={MAX_IMAGE_ZOOM}
            value={normalized.zoom}
            onChange={(e) => updateFocus({ zoom: Number(e.target.value) })}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>Menor</span>
            <span>Maior</span>
          </div>
        </div>
      </div>
    </div>
  );
}
