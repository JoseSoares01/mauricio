"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  folder?: string;
}

export default function ImageUploader({ label, value, onChange, token, folder = "uploads" }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      <div className="flex items-start gap-4">
        {value && (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0">
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex-1">
          <input
            type="text"
            className="admin-input mb-2"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="URL da imagem ou faça upload"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="admin-btn flex items-center gap-2 text-sm"
          >
            <Upload size={16} />
            {uploading ? "Enviando..." : "Upload de Imagem"}
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
