"use client";

import ImageUploader from "./ImageUploader";
import { AboutMetricIconDisplay } from "@/lib/about-metric-icon";

interface AboutMetricIconFieldProps {
  value: string;
  onChange: (icon: string) => void;
  token: string;
}

export default function AboutMetricIconField({ value, onChange, token }: AboutMetricIconFieldProps) {
  const isSvgCode = value.trim().startsWith("<svg");
  const isSvgUrl = value.startsWith("http") || (value.startsWith("/") && !value.includes(" "));

  return (
    <div className="space-y-2">
      <label className="admin-label">Ícone</label>
      <div className="flex items-center gap-3 flex-wrap">
        <input
          className="admin-input w-20 text-center text-xl"
          value={!isSvgCode && !isSvgUrl ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="📍"
          maxLength={4}
        />
        <span className="text-xs text-gray-400">emoji</span>
        {(isSvgCode || isSvgUrl) && value && (
          <div className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-2">
            <AboutMetricIconDisplay icon={value} />
            <button
              type="button"
              className="text-xs text-white underline"
              onClick={() => onChange("📍")}
            >
              Remover SVG
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <ImageUploader
          label="Upload SVG"
          value={isSvgUrl ? value : ""}
          onChange={onChange}
          token={token}
          folder="uploads/icons"
          accept="image/svg+xml,.svg"
          uploadLabel="Upload de SVG"
        />
        <div>
          <label className="admin-label">Ou cole o código SVG</label>
          <textarea
            className="admin-input min-h-[88px] font-mono text-xs"
            value={isSvgCode ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder='<svg viewBox="0 0 24 24">...</svg>'
          />
        </div>
      </div>
    </div>
  );
}
