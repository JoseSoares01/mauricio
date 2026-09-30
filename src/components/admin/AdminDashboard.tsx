"use client";

import { useState } from "react";
import type { SiteConfig, MenuItem, VideoItem, AgendaEvent, InstagramPost, ImageFocus, SiteImageFocusKey } from "@/lib/types";
import {
  getVideoHref,
  getYoutubeInputValue,
  isDirectVideoFile,
  mergeDirectVideoFile,
  mergeYoutubeInput,
  resolveYoutubeId,
} from "@/lib/video";
import ImageUploader from "./ImageUploader";
import VideoUploader from "./VideoUploader";
import AdminLivePreview from "./AdminLivePreview";
import HomeCarouselAdmin from "./HomeCarouselAdmin";
import {
  Palette, Image, Menu, FileText, Video, Calendar, Share2, Settings, Save, LogOut, ExternalLink, Plus, Trash2, MapPin, User, MessageCircle, Search,
} from "lucide-react";
import ActionMapAdmin from "./ActionMapAdmin";
import NewsAdmin from "./NewsAdmin";
import PropostasAdmin from "./PropostasAdmin";
import SobreAdmin from "./SobreAdmin";
import WhatsappGroupAdmin from "./WhatsappGroupAdmin";
import { defaultWhatsappGroupConfig } from "@/lib/whatsapp-group";
import { normalizeHomeCarousel } from "@/lib/home-banners";

interface AdminDashboardProps {
  config: SiteConfig;
  token: string;
  onSave: (config: SiteConfig) => Promise<{ ok: boolean; error?: string }>;
  onLogout: () => void;
}

type Tab = "theme" | "images" | "menu" | "content" | "sobre" | "news" | "propostas" | "videos" | "agenda" | "actionMap" | "grupo" | "social" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "theme", label: "Cores & Tema", icon: <Palette size={20} /> },
  { id: "images", label: "Imagens", icon: <Image size={20} /> },
  { id: "menu", label: "Menus", icon: <Menu size={20} /> },
  { id: "content", label: "Conteúdo", icon: <FileText size={20} /> },
  { id: "sobre", label: "Sobre", icon: <User size={20} /> },
  { id: "news", label: "Notícias", icon: <FileText size={20} /> },
  { id: "propostas", label: "Propostas", icon: <FileText size={20} /> },
  { id: "videos", label: "Vídeos", icon: <Video size={20} /> },
  { id: "agenda", label: "Agenda", icon: <Calendar size={20} /> },
  { id: "actionMap", label: "Mapa de Atuação", icon: <MapPin size={20} /> },
  { id: "grupo", label: "Grupo WhatsApp", icon: <MessageCircle size={20} /> },
  { id: "social", label: "Redes Sociais", icon: <Share2 size={20} /> },
  { id: "settings", label: "Configurações", icon: <Settings size={20} /> },
];

export default function AdminDashboard({ config: initialConfig, token, onSave, onLogout }: AdminDashboardProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [tab, setTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [navSearch, setNavSearch] = useState("");

  const activeTab = TABS.find((item) => item.id === tab);
  const filteredTabs = TABS.filter((item) =>
    item.label.toLowerCase().includes(navSearch.trim().toLowerCase())
  );

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const updateSiteImageFocus = (key: SiteImageFocusKey, focus: ImageFocus) => {
    update("images", {
      ...config.images,
      focus: { ...(config.images.focus ?? {}), [key]: focus },
    });
  };

  const renderSiteImageUploader = (
    key: SiteImageFocusKey,
    label: string,
    value: string,
    onUrlChange: (url: string) => void,
    options?: { focusObjectFit?: "cover" | "contain"; focusPreviewAspect?: "square" | "wide" | "tall" }
  ) => (
    <ImageUploader
      label={label}
      value={value}
      onChange={onUrlChange}
      token={token}
      focus={config.images.focus?.[key]}
      onFocusChange={(focus) => updateSiteImageFocus(key, focus)}
      focusObjectFit={options?.focusObjectFit ?? "cover"}
      focusPreviewAspect={options?.focusPreviewAspect ?? "wide"}
    />
  );

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(config);
    setMessage(result.ok ? "Salvo com sucesso!" : result.error || "Erro ao salvar");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="admin-color-card">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} />
      <div className="flex-1 min-w-0">
        <label className="admin-label mb-1">{label}</label>
        <input type="text" className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <div className="admin-brand-mark" aria-hidden>MS</div>
            <div>
              <h1>Control System</h1>
              <p className="admin-breadcrumb">
                Admin / {activeTab?.label || "Painel"}
              </p>
            </div>
          </div>
          <div className="admin-header-actions">
            {message && <span className="admin-toast">{message}</span>}
            <a href="/" target="_blank" className="admin-btn admin-btn-secondary inline-flex items-center gap-2 text-sm">
              <ExternalLink size={16} /> <span>Ver site</span>
            </a>
            <button onClick={handleSave} disabled={saving} className="admin-btn admin-btn-save inline-flex items-center gap-2">
              <Save size={16} /> {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            <button onClick={onLogout} className="admin-btn admin-btn-ghost p-2" aria-label="Sair">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            {config.images.heroPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.images.heroPhoto} alt="" className="admin-avatar" />
            ) : (
              <div className="admin-avatar" aria-hidden />
            )}
            <div>
              <strong>{config.site.title || "Maurício Soares"}</strong>
              <span>Painel de gestão</span>
            </div>
          </div>
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="search"
              className="admin-nav-search !pl-9"
              placeholder="Buscar secção..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              aria-label="Buscar secção do painel"
            />
          </div>
          <nav className="admin-nav" aria-label="Secções do admin">
            {filteredTabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`admin-nav-item${tab === t.id ? " is-active" : ""}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
            {filteredTabs.length === 0 && (
              <p className="text-xs text-slate-500 px-2 py-3">Nenhuma secção encontrada.</p>
            )}
          </nav>
        </aside>

        <div className="admin-main">
          {tab === "theme" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Cores & Tema</h2>
                <p>Defina a identidade visual do site. Cada cor fica isolada num cartão para edição rápida.</p>
              </div>
              <div className="admin-color-grid">
                <ColorInput label="Cor Primária (Azul)" value={config.theme.primary} onChange={(v) => update("theme", { ...config.theme, primary: v })} />
                <ColorInput label="Cor Secundária (Verde)" value={config.theme.secondary} onChange={(v) => update("theme", { ...config.theme, secondary: v })} />
                <ColorInput label="Cor de Destaque (Amarelo)" value={config.theme.accent} onChange={(v) => update("theme", { ...config.theme, accent: v })} />
                <ColorInput label="Cor do Texto" value={config.theme.text} onChange={(v) => update("theme", { ...config.theme, text: v })} />
                <ColorInput label="Cor do Texto Claro" value={config.theme.textLight} onChange={(v) => update("theme", { ...config.theme, textLight: v })} />
                <ColorInput label="Cor de Fundo" value={config.theme.background} onChange={(v) => update("theme", { ...config.theme, background: v })} />
                <ColorInput label="Gradiente Hero (Início)" value={config.theme.heroGradientStart} onChange={(v) => update("theme", { ...config.theme, heroGradientStart: v })} />
                <ColorInput label="Gradiente Hero (Fim)" value={config.theme.heroGradientEnd} onChange={(v) => update("theme", { ...config.theme, heroGradientEnd: v })} />
                <ColorInput label="Cor do Rodapé" value={config.theme.footerBg} onChange={(v) => update("theme", { ...config.theme, footerBg: v })} />
              </div>
              <div
                className="admin-theme-preview"
                style={{ background: `radial-gradient(at top center, ${config.theme.heroGradientStart}, ${config.theme.heroGradientEnd})` }}
              >
                <div className="admin-theme-preview-nav" style={{ color: config.theme.primary }}>
                  <span>Navbar</span>
                  <span style={{ color: config.theme.textLight }}>Menu</span>
                </div>
                <div className="admin-theme-preview-body">
                  <p style={{ color: config.theme.primary, fontSize: 24, fontWeight: 600, margin: 0 }}>Pré-visualização</p>
                  <p style={{ color: config.theme.text, margin: "0.5rem 0 0" }}>Texto de exemplo com as cores selecionadas</p>
                  <div className="admin-theme-preview-card">
                    <p style={{ color: config.theme.text, margin: 0, fontSize: 14 }}>Card de exemplo</p>
                  </div>
                  <button
                    type="button"
                    style={{
                      background: config.theme.accent,
                      color: config.theme.primary,
                      padding: "10px 18px",
                      borderRadius: 14,
                      border: "none",
                      marginTop: 12,
                      fontWeight: 600,
                    }}
                  >
                    Botão de exemplo
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "images" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Gerenciar Imagens</h2>
                <p>Logos, fotos fixas e o carrossel da Home. Use &quot;Ajustar imagem&quot; quando precisar de zoom e enquadramento.</p>
              </div>
              <div className="admin-image-grid">
                {renderSiteImageUploader(
                  "heroLogo",
                  "Logo Hero — fundo claro (página inicial)",
                  config.images.heroLogo,
                  (v) => update("images", { ...config.images, heroLogo: v }),
                  { focusObjectFit: "contain", focusPreviewAspect: "wide" }
                )}
                {renderSiteImageUploader(
                  "logoBlue",
                  "Logo Fundo Azul (seções azuis)",
                  config.images.logoBlue,
                  (v) => update("images", { ...config.images, logoBlue: v, aboutPhoto: v }),
                  { focusObjectFit: "contain", focusPreviewAspect: "wide" }
                )}
                {renderSiteImageUploader(
                  "headerLogo",
                  "Logo do Menu (topo)",
                  config.images.headerLogo || "",
                  (v) => update("images", { ...config.images, headerLogo: v }),
                  { focusObjectFit: "contain", focusPreviewAspect: "wide" }
                )}
                {renderSiteImageUploader(
                  "heroPhoto",
                  "Foto Hero (Principal)",
                  config.images.heroPhoto,
                  (v) => update("images", { ...config.images, heroPhoto: v }),
                  { focusObjectFit: "contain", focusPreviewAspect: "tall" }
                )}
                {renderSiteImageUploader(
                  "aboutBg",
                  "Fundo Seção Sobre",
                  config.images.aboutBg,
                  (v) => update("images", { ...config.images, aboutBg: v })
                )}
                {renderSiteImageUploader(
                  "senadoBg",
                  "Fundo Seção Ação",
                  config.images.senadoBg,
                  (v) => update("images", { ...config.images, senadoBg: v })
                )}
                {renderSiteImageUploader(
                  "banner",
                  "Banner legado (esquerda) — preferir Carrossel da Home abaixo",
                  config.images.banner,
                  (v) => update("images", { ...config.images, banner: v })
                )}
                {renderSiteImageUploader(
                  "bannerSecondary",
                  "Banner legado (direita) — preferir Carrossel da Home abaixo",
                  config.images.bannerSecondary || "",
                  (v) => update("images", { ...config.images, bannerSecondary: v })
                )}
                {renderSiteImageUploader(
                  "favicon",
                  "Favicon",
                  config.images.favicon,
                  (v) => update("images", { ...config.images, favicon: v }),
                  { focusPreviewAspect: "square" }
                )}
              </div>

              <HomeCarouselAdmin
                slides={normalizeHomeCarousel(config.homeCarousel, config)}
                fallbackImage={config.images.banner || config.images.heroPhoto || config.images.aboutBg}
                token={token}
                onChange={(slides) => update("homeCarousel", slides)}
              />

              <AdminLivePreview
                theme={config.theme}
                images={config.images}
                siteTitle={config.site.title}
                menuLabels={config.menu.map((item) => item.label)}
              />
            </div>
          )}

          {tab === "menu" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Menus de Navegação</h2>
                <p>Cada item do menu aparece numa linha limpa e fácil de editar.</p>
              </div>
              {config.menu.map((item, i) => (
                <div key={i} className="admin-menu-row">
                  <div>
                    <label className="admin-label">Label</label>
                    <input className="admin-input" value={item.label} onChange={(e) => {
                      const menu = [...config.menu];
                      menu[i] = { ...menu[i], label: e.target.value };
                      update("menu", menu);
                    }} />
                  </div>
                  <div>
                    <label className="admin-label">Link</label>
                    <input className="admin-input" value={item.href} onChange={(e) => {
                      const menu = [...config.menu];
                      menu[i] = { ...menu[i], href: e.target.value };
                      update("menu", menu);
                    }} />
                  </div>
                  <button onClick={() => update("menu", config.menu.filter((_, j) => j !== i))} className="admin-btn admin-btn-danger p-3" aria-label="Remover item">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => update("menu", [...config.menu, { label: "Novo", href: "/" }])} className="admin-btn flex items-center gap-2 mt-2">
                <Plus size={16} /> Adicionar Menu
              </button>
            </div>
          )}

          {tab === "content" && (
            <div>
              <div className="admin-page-head mb-4">
                <h2>Conteúdo</h2>
                <p>Abra apenas a secção que precisa editar — o restante fica recolhido.</p>
              </div>

              <details className="admin-accordion" open>
                <summary>Informações do Site</summary>
                <div className="admin-accordion-body">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Título do Site</label>
                      <input className="admin-input" value={config.site.title} onChange={(e) => update("site", { ...config.site, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Subtítulo</label>
                      <input className="admin-input" value={config.site.subtitle} onChange={(e) => update("site", { ...config.site, subtitle: e.target.value })} />
                    </div>
                  </div>
                </div>
              </details>

              <details className="admin-accordion">
                <summary>Rodapé</summary>
                <div className="admin-accordion-body">
                  <p className="text-sm text-slate-500 mb-4">
                    O logo do rodapé usa a imagem &quot;Logo Fundo Azul&quot; na aba Imagens.
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="admin-label">Direitos reservados (copyright)</label>
                      <input className="admin-input" value={config.site.copyright} onChange={(e) => update("site", { ...config.site, copyright: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="admin-label">Endereço no rodapé</label>
                      <input className="admin-input" value={config.contact.address} onChange={(e) => update("contact", { ...config.contact, address: e.target.value })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="admin-label">Telefone(s) no rodapé</label>
                      <input className="admin-input" value={config.contact.phone} onChange={(e) => update("contact", { ...config.contact, phone: e.target.value })} placeholder="Ex: (86) 99999-0000 / (86) 3333-0000" />
                    </div>
                  </div>
                </div>
              </details>

              <details className="admin-accordion">
                <summary>Hero (Página Inicial)</summary>
                <div className="admin-accordion-body">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="admin-label">Linha 1 (ex: CANDIDATO)</label>
                      <input className="admin-input" value={config.hero.titleLine1} onChange={(e) => update("hero", { ...config.hero, titleLine1: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Linha 2 (ex: MAURÍCIO)</label>
                      <input className="admin-input" value={config.hero.titleLine2} onChange={(e) => update("hero", { ...config.hero, titleLine2: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Linha 3 (ex: SOARES)</label>
                      <input className="admin-input" value={config.hero.titleLine3} onChange={(e) => update("hero", { ...config.hero, titleLine3: e.target.value })} />
                    </div>
                  </div>
                </div>
              </details>

              <details className="admin-accordion">
                <summary>Sobre</summary>
                <div className="admin-accordion-body">
                  <p className="text-sm text-slate-600">
                    A página Sobre (cabeçalho, introdução, galeria e linha do tempo) agora é editada na aba{" "}
                    <strong>Sobre</strong> do menu lateral.
                  </p>
                </div>
              </details>

              <details className="admin-accordion">
                <summary>Seção Ação / Senado</summary>
                <div className="admin-accordion-body">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Título</label>
                      <input className="admin-input" value={config.senado.title} onChange={(e) => update("senado", { ...config.senado, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Botão Acessar</label>
                      <input className="admin-input" value={config.senado.buttonAccess} onChange={(e) => update("senado", { ...config.senado, buttonAccess: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">URL Acessar</label>
                      <input className="admin-input" value={config.senado.accessUrl} onChange={(e) => update("senado", { ...config.senado, accessUrl: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Botão Proposições</label>
                      <input className="admin-input" value={config.senado.buttonProposicoes} onChange={(e) => update("senado", { ...config.senado, buttonProposicoes: e.target.value })} />
                    </div>
                  </div>
                </div>
              </details>

              <details className="admin-accordion">
                <summary>Contato</summary>
                <div className="admin-accordion-body">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="admin-label">Título</label>
                      <input className="admin-input" value={config.contact.title} onChange={(e) => update("contact", { ...config.contact, title: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">E-mail</label>
                      <input className="admin-input" value={config.contact.email} onChange={(e) => update("contact", { ...config.contact, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Telefone</label>
                      <input className="admin-input" value={config.contact.phone} onChange={(e) => update("contact", { ...config.contact, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="admin-label">Endereço</label>
                      <input className="admin-input" value={config.contact.address} onChange={(e) => update("contact", { ...config.contact, address: e.target.value })} />
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {tab === "sobre" && (
            <SobreAdmin
              about={config.about}
              fallbackIntroImage={config.images.heroPhotoOriginal || config.images.heroPhoto}
              token={token}
              onChange={(about) => update("about", about)}
            />
          )}

          {tab === "news" && (
            <NewsAdmin
              news={config.news}
              token={token}
              onChange={(news) => update("news", news)}
            />
          )}

          {tab === "propostas" && (
            <PropostasAdmin
              propostas={config.propostas}
              token={token}
              onChange={(propostas) => update("propostas", propostas)}
            />
          )}

          {tab === "videos" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Vídeos do Feed Principal</h2>
                <p>Cole o ID ou qualquer link do YouTube. O visitante será direcionado ao clicar no vídeo ou no título.</p>
              </div>
              {config.videos.map((video, i) => (
                <div key={video.id} className="admin-item-card">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-sm text-slate-500">Vídeo #{i + 1}</span>
                    <button onClick={() => update("videos", config.videos.filter((v) => v.id !== video.id))} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="admin-label">Título</label>
                      <input className="admin-input" value={video.title} onChange={(e) => {
                        const videos = [...config.videos];
                        videos[i] = { ...videos[i], title: e.target.value };
                        update("videos", videos);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">YouTube — ID ou link</label>
                      <input
                        className="admin-input"
                        value={getYoutubeInputValue(video)}
                        onChange={(e) => {
                          const videos = [...config.videos];
                          videos[i] = mergeYoutubeInput(videos[i], e.target.value);
                          update("videos", videos);
                        }}
                        placeholder="Rc7-_B72EUU ou https://youtube.com/watch?v=..."
                      />
                      {resolveYoutubeId(video) && (
                        <p className="text-xs text-green-700 mt-1 break-all">
                          Clique no site abre: {getVideoHref(video)}
                        </p>
                      )}
                    </div>
                    <VideoUploader
                      label="Upload de vídeo (.mp4) — opcional, substitui YouTube"
                      value={video.videoFile && isDirectVideoFile(video.videoFile) ? video.videoFile : ""}
                      onChange={(v) => {
                        const videos = [...config.videos];
                        videos[i] = mergeDirectVideoFile(videos[i], v);
                        update("videos", videos);
                      }}
                      token={token}
                    />
                  </div>
                </div>
              ))}
              <button onClick={() => update("videos", [{
                id: String(Date.now()),
                title: "Novo Vídeo",
                youtubeId: "",
                thumbnail: "",
              }, ...config.videos])} className="admin-btn flex items-center gap-2">
                <Plus size={16} /> Adicionar Vídeo
              </button>
            </div>
          )}

          {tab === "agenda" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Agenda de Eventos</h2>
                <p>Gerencie os eventos visíveis na página de Agenda.</p>
              </div>
              {config.agenda.map((event, i) => (
                <div key={event.id} className="admin-item-card">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-sm text-slate-500">Evento #{i + 1}</span>
                    <button onClick={() => update("agenda", config.agenda.filter((e) => e.id !== event.id))} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="admin-label">Título</label>
                      <input className="admin-input" value={event.title} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], title: e.target.value };
                        update("agenda", agenda);
                      }} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="admin-label">Descrição</label>
                      <textarea className="admin-input" value={event.description} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], description: e.target.value };
                        update("agenda", agenda);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Data</label>
                      <input type="date" className="admin-input" value={event.date} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], date: e.target.value };
                        update("agenda", agenda);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Horário</label>
                      <input type="time" className="admin-input" value={event.time} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], time: e.target.value };
                        update("agenda", agenda);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Local</label>
                      <input className="admin-input" value={event.location} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], location: e.target.value };
                        update("agenda", agenda);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Tipo</label>
                      <select className="admin-input" value={event.type} onChange={(e) => {
                        const agenda = [...config.agenda];
                        agenda[i] = { ...agenda[i], type: e.target.value };
                        update("agenda", agenda);
                      }}>
                        <option value="reuniao">Reunião</option>
                        <option value="visita">Visita</option>
                        <option value="evento">Evento</option>
                        <option value="debate">Debate</option>
                        <option value="caminhada">Caminhada</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => update("agenda", [...config.agenda, {
                id: String(Date.now()),
                title: "Novo Evento",
                description: "",
                date: new Date().toISOString().split("T")[0],
                time: "09:00",
                location: "",
                type: "evento",
              }])} className="admin-btn flex items-center gap-2">
                <Plus size={16} /> Adicionar Evento
              </button>
            </div>
          )}

          {tab === "actionMap" && (
            <ActionMapAdmin
              actionMap={config.actionMap}
              news={config.news}
              token={token}
              onChange={(actionMap) => update("actionMap", actionMap)}
            />
          )}

          {tab === "grupo" && (
            <WhatsappGroupAdmin
              value={config.whatsappGroup ?? defaultWhatsappGroupConfig(config.images)}
              token={token}
              onChange={(whatsappGroup) => update("whatsappGroup", whatsappGroup)}
            />
          )}

          {tab === "social" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Redes Sociais</h2>
                <p>Links oficiais e posts de reserva do Instagram.</p>
              </div>
              <div className="space-y-4">
                {(["instagram", "facebook", "twitter", "youtube", "tiktok"] as const).map((key) => (
                  <div key={key}>
                    <label className="admin-label capitalize">{key}</label>
                    <input className="admin-input" value={config.social[key]} onChange={(e) => update("social", { ...config.social, [key]: e.target.value })} />
                  </div>
                ))}
              </div>
              
              <div className="mt-6">
                <label className="admin-label">Username do Instagram (sem @)</label>
                <input
                  className="admin-input max-w-sm"
                  value={config.instagram.username}
                  onChange={(e) => update("instagram", { ...config.instagram, username: e.target.value })}
                />
              </div>
              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-slate-700">Posts do Instagram (reserva manual)</h3>
                {config.instagram.posts.map((post, i) => (
                  <div key={post.id} className="admin-item-card flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <ImageUploader
                        label=""
                        value={post.image}
                        onChange={(v) => {
                          const posts = [...config.instagram.posts];
                          posts[i] = { ...posts[i], image: v };
                          update("instagram", { ...config.instagram, posts });
                        }}
                        token={token}
                        focus={{
                          x: post.imageFocusX,
                          y: post.imageFocusY,
                          zoom: post.imageZoom,
                        }}
                        onFocusChange={(focus) => {
                          const posts = [...config.instagram.posts];
                          posts[i] = {
                            ...posts[i],
                            imageFocusX: focus.x,
                            imageFocusY: focus.y,
                            imageZoom: focus.zoom,
                          };
                          update("instagram", { ...config.instagram, posts });
                        }}
                        focusPreviewAspect="square"
                      />
                      <input className="admin-input" value={post.caption} placeholder="Legenda" onChange={(e) => {
                        const posts = [...config.instagram.posts];
                        posts[i] = { ...posts[i], caption: e.target.value };
                        update("instagram", { ...config.instagram, posts });
                      }} />
                    </div>
                    <button onClick={() => update("instagram", { ...config.instagram, posts: config.instagram.posts.filter((p) => p.id !== post.id) })} className="text-red-500 mt-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => update("instagram", { ...config.instagram, posts: [...config.instagram.posts, { id: String(Date.now()), image: "/uploads/banner.jpg", caption: "" }] })} className="admin-btn flex items-center gap-2 mt-2">
                  <Plus size={16} /> Adicionar Post
                </button>
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="admin-card">
              <div className="admin-page-head">
                <h2>Configurações</h2>
                <p>Acesso ao painel e guia rápido de utilização.</p>
              </div>
              <div>
                <label className="admin-label">Senha do Admin</label>
                <input type="password" className="admin-input max-w-sm" value={config.admin.password} onChange={(e) => update("admin", { password: e.target.value })} />
                <p className="text-xs text-slate-500 mt-1">Altere a senha de acesso ao painel admin</p>
              </div>
              <div className="mt-8 p-4 rounded-2xl admin-glass-panel">
                <h3 className="font-semibold mb-2 text-slate-800">Como editar o site</h3>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li><strong>Cores & Tema:</strong> Altere as cores primárias, secundárias e de destaque</li>
                  <li><strong>Imagens:</strong> Faça upload para substituir fotos do site</li>
                  <li><strong>Menus:</strong> Adicione, remova ou edite itens do menu</li>
                  <li><strong>Conteúdo:</strong> Edite textos, hero e informações de contato</li>
                  <li><strong>Notícias:</strong> Gerencie as notícias do site</li>
                  <li><strong>Vídeos:</strong> Upload de vídeos para o feed principal</li>
                  <li><strong>Agenda:</strong> Gerencie eventos da semana e mês</li>
                  <li>Clique em <strong>Salvar alterações</strong> após cada alteração</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
