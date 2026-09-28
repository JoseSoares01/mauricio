"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, SlidersHorizontal } from "lucide-react";
import ImagePositionEditor from "./ImagePositionEditor";
import { getImageFocusStyles } from "@/lib/image-focus";
import type { ImageFocus } from "@/lib/types";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  folder?: string;
  accept?: string;
  uploadLabel?: string;
  focus?: ImageFocus | null;
  onFocusChange?: (focus: ImageFocus) => void;
  enableFocusEditor?: boolean;
  focusPreviewLabel?: string;
  focusPreviewAspect?: "square" | "wide" | "tall";
  focusObjectFit?: "cover" | "contain";
}

export default function ImageUploader({
  label,
  value,
  onChange,
  token,
  folder = "uploads",
  accept = "image/*",
  uploadLabel = "Upload de Imagem",
  focus,
  onFocusChange,
  enableFocusEditor = true,
  focusPreviewLabel,
  focusPreviewAspect = "wide",
  focusObjectFit = "cover",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [focusOpen, setFocusOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const showFocusEditor = enableFocusEditor && Boolean(value) && Boolean(onFocusChange);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      onChange(data.url);
    } else {
      setError(data.error || "Falha no upload da imagem");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="admin-image-card">
      <label className="admin-label">{label}</label>
      <div className="admin-image-card-top">
        {value ? (
          <div className="admin-image-thumb">
            <Image
              src={value}
              alt={label}
              fill
              className={focusObjectFit === "contain" ? "object-contain" : "object-cover"}
              style={onFocusChange ? getImageFocusStyles(focus, focusObjectFit) : undefined}
              unoptimized
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
              aria-label="Remover imagem"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="admin-image-thumb" aria-hidden />
        )}
        <div className="admin-image-card-body">
          <input
            type="text"
            className="admin-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem ou faça upload"
          />
          <div className="admin-image-card-actions">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="admin-btn admin-btn-upload flex items-center gap-2 text-sm"
            >
              <Upload size={16} />
              {uploading ? "Enviando..." : uploadLabel}
            </button>
            <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>

      {showFocusEditor && onFocusChange && (
        <>
          <button
            type="button"
            className="admin-focus-toggle inline-flex items-center justify-center gap-2"
            onClick={() => setFocusOpen((open) => !open)}
          >
            <SlidersHorizontal size={14} />
            {focusOpen ? "Ocultar ajuste de imagem" : "Ajustar imagem"}
          </button>
          {focusOpen && (
            <div className="admin-focus-panel">
              <ImagePositionEditor
                image={value}
                focus={focus}
                onChange={onFocusChange}
                previewLabel={focusPreviewLabel || label || "Preview"}
                previewAspect={focusPreviewAspect}
                objectFit={focusObjectFit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
