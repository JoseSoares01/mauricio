"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

interface VideoUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
}

export default function VideoUploader({ label, value, onChange, token }: VideoUploaderProps) {
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
    formData.append("folder", "uploads/videos");

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { "x-admin-token": token },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) {
      onChange(data.url);
    } else {
      setError(data.error || "Falha no upload do vídeo");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      {value && (
        <video src={value} controls className="w-full max-w-xs rounded-lg mb-2" />
      )}
      <input
        type="text"
        className="admin-input mb-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="URL do vídeo ou faça upload"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="admin-btn flex items-center gap-2 text-sm"
      >
        <Upload size={16} />
        {uploading ? "Enviando vídeo..." : "Upload de Vídeo"}
      </button>
      <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleUpload} />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
