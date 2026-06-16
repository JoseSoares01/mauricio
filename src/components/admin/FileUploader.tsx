"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";

interface FileUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  token: string;
  folder?: string;
  accept?: string;
  hint?: string;
}

export default function FileUploader({
  label,
  value,
  onChange,
  token,
  folder = "uploads",
  accept = "application/pdf,.pdf",
  hint,
}: FileUploaderProps) {
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
      setError(data.error || "Falha no upload do arquivo");
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {value && (
        <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm">
          <FileText size={16} className="shrink-0 text-gray-500" />
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-0 flex-1 truncate text-[#0071B7] hover:underline"
          >
            {value.split("/").pop()}
          </a>
          <button type="button" onClick={() => onChange("")} className="text-red-500 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="admin-btn flex items-center gap-2"
      >
        <Upload size={16} />
        {uploading ? "Enviando..." : value ? "Substituir arquivo" : "Enviar arquivo"}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
