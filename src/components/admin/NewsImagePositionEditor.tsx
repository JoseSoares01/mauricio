"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { RotateCcw } from "lucide-react";
import {
  clampNewsImageFocus,
  DEFAULT_NEWS_IMAGE_FOCUS,
  getNewsImageObjectPosition,
} from "@/lib/news-image";

interface NewsImagePositionEditorProps {
  image: string;
  focusX?: number;
  focusY?: number;
  onChange: (focus: { imageFocusX: number; imageFocusY: number }) => void;
}

export default function NewsImagePositionEditor({
  image,
  focusX,
  focusY,
  onChange,
}: NewsImagePositionEditorProps) {
  const x = focusX ?? DEFAULT_NEWS_IMAGE_FOCUS.x;
  const y = focusY ?? DEFAULT_NEWS_IMAGE_FOCUS.y;
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  const updateFocus = useCallback(
    (nextX: number, nextY: number) => {
      onChange({
        imageFocusX: clampNewsImageFocus(nextX),
        imageFocusY: clampNewsImageFocus(nextY),
      });
    },
    [onChange]
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startY: event.clientY, originX: x, originY: y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const rect = previewRef.current?.getBoundingClientRect();
    const scale = rect ? 100 / Math.max(rect.width, rect.height) : 0.2;
    const deltaX = event.clientX - dragRef.current.startX;
    const deltaY = event.clientY - dragRef.current.startY;
    updateFocus(
      dragRef.current.originX - deltaX * scale,
      dragRef.current.originY - deltaY * scale
    );
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  if (!image) return null;

  const objectPosition = getNewsImageObjectPosition({ imageFocusX: x, imageFocusY: y });

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="admin-label mb-0">Posição da imagem no preview</p>
          <p className="text-xs text-gray-500 mt-1">
            Arraste a imagem ou use os controles para ajustar o enquadramento.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn-secondary flex items-center gap-1 text-xs shrink-0"
          onClick={() => updateFocus(DEFAULT_NEWS_IMAGE_FOCUS.x, DEFAULT_NEWS_IMAGE_FOCUS.y)}
        >
          <RotateCcw size={14} />
          Centralizar
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Listagem de notícias</p>
          <div
            ref={previewRef}
            className={`relative h-40 rounded-lg overflow-hidden border bg-white touch-none select-none ${
              dragging ? "cursor-grabbing ring-2 ring-[var(--color-primary)]" : "cursor-grab"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <Image
              src={image}
              alt="Preview da listagem"
              fill
              className="object-cover pointer-events-none"
              style={{ objectPosition }}
              draggable={false}
              unoptimized
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Página da notícia</p>
          <div
            className={`relative h-40 rounded-lg overflow-hidden border bg-white touch-none select-none ${
              dragging ? "cursor-grabbing ring-2 ring-[var(--color-primary)]" : "cursor-grab"
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <Image
              src={image}
              alt="Preview da notícia"
              fill
              className="object-cover pointer-events-none"
              style={{ objectPosition }}
              draggable={false}
              unoptimized
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="admin-label flex justify-between">
            <span>Horizontal</span>
            <span className="text-gray-400 font-normal">{x}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={x}
            onChange={(e) => updateFocus(Number(e.target.value), y)}
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
            <span className="text-gray-400 font-normal">{y}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={y}
            onChange={(e) => updateFocus(x, Number(e.target.value))}
            className="w-full accent-[var(--color-primary)]"
          />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>Topo</span>
            <span>Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
