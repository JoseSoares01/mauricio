"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Eye,
  ExternalLink,
  Lightbulb,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import { getImageFocusStyles } from "@/lib/image-focus";
import type { Images, Theme } from "@/lib/types";

type Device = "desktop" | "tablet" | "mobile";

interface AdminLivePreviewProps {
  theme: Theme;
  images: Images;
  siteTitle: string;
  menuLabels?: string[];
}

function HeroDraft({
  theme,
  images,
  siteTitle,
  menuLabels,
  compact,
}: {
  theme: Theme;
  images: Images;
  siteTitle: string;
  menuLabels: string[];
  compact?: boolean;
}) {
  const logo = images.heroLogo || images.headerLogo || images.logoBlue;
  const photo = images.heroPhoto;

  return (
    <div
      className={`admin-preview-hero${compact ? " is-compact" : ""}`}
      style={{
        background: `radial-gradient(at top center, ${theme.heroGradientStart} 0%, ${theme.heroGradientEnd} 100%)`,
      }}
    >
      <div className="admin-preview-hero-nav" style={{ color: theme.primary }}>
        <span className="admin-preview-hero-brand">{siteTitle || "Maurício Soares"}</span>
        {!compact && (
          <div className="admin-preview-hero-links" style={{ color: theme.textLight }}>
            {(menuLabels.length ? menuLabels : ["Home", "Sobre", "Notícias"]).slice(0, 4).map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        )}
      </div>

      <div className="admin-preview-hero-body">
        <div className="admin-preview-hero-copy">
          {logo ? (
            <div className="admin-preview-hero-logo">
              <Image
                src={logo}
                alt=""
                fill
                className="object-contain object-left"
                style={getImageFocusStyles(images.focus?.heroLogo ?? images.focus?.headerLogo, "contain")}
                unoptimized
              />
            </div>
          ) : (
            <p className="admin-preview-hero-title" style={{ color: theme.primary }}>
              {siteTitle || "Logo"}
            </p>
          )}
          <div className="admin-preview-hero-ctas">
            <span style={{ background: theme.accent, color: theme.primary }}>Explorar</span>
            <span style={{ borderColor: theme.primary, color: theme.primary }}>Ver propostas</span>
          </div>
        </div>

        {photo ? (
          <div className="admin-preview-hero-photo">
            <Image
              src={photo}
              alt=""
              fill
              className="object-contain object-bottom"
              style={getImageFocusStyles(images.focus?.heroPhoto, "contain")}
              unoptimized
            />
          </div>
        ) : (
          <div className="admin-preview-hero-photo is-empty" aria-hidden />
        )}
      </div>

      <div
        className="admin-preview-hero-flag"
        style={{
          background: `linear-gradient(to bottom, ${theme.secondary} 0%, ${theme.secondary} 50%, ${theme.accent} 50%, ${theme.accent} 100%)`,
        }}
        aria-hidden
      />
    </div>
  );
}

export default function AdminLivePreview({
  theme,
  images,
  siteTitle,
  menuLabels = [],
}: AdminLivePreviewProps) {
  const [device, setDevice] = useState<Device>("desktop");

  return (
    <section className="admin-live-preview" aria-label="Pré-visualização em tempo real">
      <div className="admin-live-preview-head">
        <div className="admin-live-preview-icon" aria-hidden>
          <Eye size={18} />
        </div>
        <div>
          <h3>Pré-visualização em tempo real</h3>
          <p>
            As imagens e cores desta sessão aparecem aqui imediatamente. O site público só atualiza
            depois de clicar em &quot;Salvar alterações&quot;.
          </p>
        </div>
      </div>

      <div className={`admin-live-preview-stage is-${device}`}>
        <div className="admin-preview-device admin-preview-device--desktop" aria-hidden={device === "mobile"}>
          <div className="admin-preview-chrome">
            <span /><span /><span />
            <em>mauricio.soares · desktop</em>
          </div>
          <div className="admin-preview-viewport admin-preview-viewport--desktop">
            <HeroDraft theme={theme} images={images} siteTitle={siteTitle} menuLabels={menuLabels} />
          </div>
        </div>

        <div className="admin-preview-device admin-preview-device--tablet" aria-hidden={device !== "tablet"}>
          <div className="admin-preview-viewport admin-preview-viewport--tablet">
            <HeroDraft theme={theme} images={images} siteTitle={siteTitle} menuLabels={menuLabels} compact />
          </div>
        </div>

        <div className="admin-preview-device admin-preview-device--mobile">
          <div className="admin-preview-notch" aria-hidden />
          <div className="admin-preview-viewport admin-preview-viewport--mobile">
            <HeroDraft theme={theme} images={images} siteTitle={siteTitle} menuLabels={menuLabels} compact />
          </div>
        </div>
      </div>

      <div className="admin-live-preview-footer">
        <div className="admin-live-preview-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary inline-flex items-center gap-2 text-sm">
            <ExternalLink size={15} />
            Abrir site em nova aba
          </a>
          <div className="admin-preview-device-toggle" role="group" aria-label="Dispositivo da prévia">
            <button
              type="button"
              className={device === "desktop" ? "is-active" : ""}
              onClick={() => setDevice("desktop")}
              aria-label="Desktop"
            >
              <Monitor size={16} />
            </button>
            <button
              type="button"
              className={device === "tablet" ? "is-active" : ""}
              onClick={() => setDevice("tablet")}
              aria-label="Tablet"
            >
              <Tablet size={16} />
            </button>
            <button
              type="button"
              className={device === "mobile" ? "is-active" : ""}
              onClick={() => setDevice("mobile")}
              aria-label="Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>
        </div>

        <aside className="admin-live-preview-tip">
          <Lightbulb size={16} aria-hidden />
          <p>
            <strong>Importante:</strong> Após fazer as alterações, clique em{" "}
            <em>Salvar alterações</em> no topo da página para confirmar as mudanças no site.
          </p>
        </aside>
      </div>
    </section>
  );
}
