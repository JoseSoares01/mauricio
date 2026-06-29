"use client";

import { useState } from "react";
import type { SiteConfig, MenuItem, NewsItem, VideoItem, AgendaEvent, InstagramPost } from "@/lib/types";
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
import RichTextEditor from "./RichTextEditor";
import NewsImagePositionEditor from "./NewsImagePositionEditor";
import {
  Palette, Image, Menu, FileText, Video, Calendar, Share2, Settings, Save, LogOut, ExternalLink, Plus, Trash2, MapPin,
} from "lucide-react";
import ActionMapAdmin from "./ActionMapAdmin";

interface AdminDashboardProps {
  config: SiteConfig;
  token: string;
  onSave: (config: SiteConfig) => Promise<{ ok: boolean; error?: string }>;
  onLogout: () => void;
}

type Tab = "theme" | "images" | "menu" | "content" | "news" | "videos" | "agenda" | "actionMap" | "social" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "theme", label: "Cores & Tema", icon: <Palette size={18} /> },
  { id: "images", label: "Imagens", icon: <Image size={18} /> },
  { id: "menu", label: "Menus", icon: <Menu size={18} /> },
  { id: "content", label: "Conteúdo", icon: <FileText size={18} /> },
  { id: "news", label: "Notícias", icon: <FileText size={18} /> },
  { id: "videos", label: "Vídeos", icon: <Video size={18} /> },
  { id: "agenda", label: "Agenda", icon: <Calendar size={18} /> },
  { id: "actionMap", label: "Mapa de Atuação", icon: <MapPin size={18} /> },
  { id: "social", label: "Redes Sociais", icon: <Share2 size={18} /> },
  { id: "settings", label: "Configurações", icon: <Settings size={18} /> },
];

export default function AdminDashboard({ config: initialConfig, token, onSave, onLogout }: AdminDashboardProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [tab, setTab] = useState<Tab>("theme");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const update = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await onSave(config);
    setMessage(result.ok ? "Salvo com sucesso!" : result.error || "Erro ao salvar");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
      <div className="flex-1">
        <label className="admin-label mb-0">{label}</label>
        <input type="text" className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#0071B7] text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Control System</h1>
            <p className="text-sm text-white/70">Mauricío Soares - Painel Admin</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{message}</span>
            )}
            <a href="/" target="_blank" className="flex items-center gap-1 text-sm hover:underline">
              <ExternalLink size={16} /> Ver site
            </a>
            <button onClick={handleSave} disabled={saving} className="bg-[#FDCE27] text-[#0071B7] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:opacity-90">
              <Save size={16} /> {saving ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={onLogout} className="text-white/80 hover:text-white">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
        <nav className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-2 sticky top-24">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.id ? "bg-[#0071B7] text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {tab === "theme" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-6">Cores & Tema</h2>
              <div className="grid md:grid-cols-2 gap-6">
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
              <div className="mt-6 p-4 rounded-lg border" style={{ background: `radial-gradient(at top center, ${config.theme.heroGradientStart}, ${config.theme.heroGradientEnd})` }}>
                <p style={{ color: config.theme.primary, fontSize: 24, fontWeight: "bold" }}>Pré-visualização</p>
                <p style={{ color: config.theme.text }}>Texto de exemplo com as cores selecionadas</p>
                <button style={{ background: config.theme.accent, color: config.theme.primary, padding: "8px 16px", borderRadius: 4, border: "none", marginTop: 8 }}>
                  Botão de exemplo
                </button>
              </div>
            </div>
          )}

          {tab === "images" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-6">Gerenciar Imagens</h2>
              <p className="text-sm text-gray-500 mb-6">Faça upload de novas imagens para substituir as atuais do site.</p>
              <div className="space-y-6">
                <ImageUploader label="Logo Hero — fundo claro (página inicial)" value={config.images.heroLogo} onChange={(v) => update("images", { ...config.images, heroLogo: v })} token={token} />
                <ImageUploader label="Logo Fundo Azul (seções azuis)" value={config.images.logoBlue} onChange={(v) => update("images", { ...config.images, logoBlue: v, aboutPhoto: v })} token={token} />
                <ImageUploader label="Logo do Menu (topo)" value={config.images.headerLogo || ""} onChange={(v) => update("images", { ...config.images, headerLogo: v })} token={token} />
                <ImageUploader label="Foto Hero (Principal)" value={config.images.heroPhoto} onChange={(v) => update("images", { ...config.images, heroPhoto: v })} token={token} />
                <ImageUploader label="Fundo Seção Sobre" value={config.images.aboutBg} onChange={(v) => update("images", { ...config.images, aboutBg: v })} token={token} />
                <ImageUploader label="Fundo Seção Ação" value={config.images.senadoBg} onChange={(v) => update("images", { ...config.images, senadoBg: v })} token={token} />
                <ImageUploader label="Banner (esquerda)" value={config.images.banner} onChange={(v) => update("images", { ...config.images, banner: v })} token={token} />
                <ImageUploader label="Banner (direita)" value={config.images.bannerSecondary || ""} onChange={(v) => update("images", { ...config.images, bannerSecondary: v })} token={token} />
                <ImageUploader label="Favicon" value={config.images.favicon} onChange={(v) => update("images", { ...config.images, favicon: v })} token={token} />
              </div>
            </div>
          )}

          {tab === "menu" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-6">Menus de Navegação</h2>
              {config.menu.map((item, i) => (
                <div key={i} className="flex gap-3 mb-3 items-end">
                  <div className="flex-1">
                    <label className="admin-label">Label</label>
                    <input className="admin-input" value={item.label} onChange={(e) => {
                      const menu = [...config.menu];
                      menu[i] = { ...menu[i], label: e.target.value };
                      update("menu", menu);
                    }} />
                  </div>
                  <div className="flex-1">
                    <label className="admin-label">Link</label>
                    <input className="admin-input" value={item.href} onChange={(e) => {
                      const menu = [...config.menu];
                      menu[i] = { ...menu[i], href: e.target.value };
                      update("menu", menu);
                    }} />
                  </div>
                  <button onClick={() => update("menu", config.menu.filter((_, j) => j !== i))} className="admin-btn admin-btn-danger p-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button onClick={() => update("menu", [...config.menu, { label: "Novo", href: "/" }])} className="admin-btn flex items-center gap-2 mt-4">
                <Plus size={16} /> Adicionar Menu
              </button>
            </div>
          )}

          {tab === "content" && (
            <div className="space-y-6">
              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Informações do Site</h2>
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

              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Rodapé</h2>
                <p className="text-sm text-gray-500 mb-4">
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

              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Hero (Página Inicial)</h2>
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

              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Sobre</h2>
                <div className="space-y-4">
                  <div>
                    <label className="admin-label">Texto Curto (Home)</label>
                    <textarea className="admin-input min-h-[100px]" value={config.about.shortText} onChange={(e) => update("about", { ...config.about, shortText: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Texto Completo (Página Sobre)</label>
                    <textarea className="admin-input min-h-[200px]" value={config.about.fullText} onChange={(e) => update("about", { ...config.about, fullText: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Seção Ação / Senado</h2>
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

              <div className="admin-card">
                <h2 className="text-xl font-bold mb-4">Contato</h2>
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
            </div>
          )}

          {tab === "news" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-2">Notícias</h2>
              <p className="text-sm text-gray-500 mb-6">
                Use o editor para negrito, listas e links. Quebras de linha e URLs são formatadas automaticamente no site.
              </p>
              {config.news.map((item, i) => (
                <div key={item.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-sm text-gray-500">Notícia #{i + 1}</span>
                    <button onClick={() => update("news", config.news.filter((n) => n.id !== item.id))} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="admin-label">Título</label>
                      <input className="admin-input" value={item.title} onChange={(e) => {
                        const news = [...config.news];
                        news[i] = { ...news[i], title: e.target.value };
                        update("news", news);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Data</label>
                      <input type="date" className="admin-input" value={item.date} onChange={(e) => {
                        const news = [...config.news];
                        news[i] = { ...news[i], date: e.target.value };
                        update("news", news);
                      }} />
                    </div>
                    <div>
                      <label className="admin-label">Categoria</label>
                      <input className="admin-input" value={item.category} onChange={(e) => {
                        const news = [...config.news];
                        news[i] = { ...news[i], category: e.target.value };
                        update("news", news);
                      }} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="admin-label">Resumo</label>
                      <textarea className="admin-input" value={item.excerpt} onChange={(e) => {
                        const news = [...config.news];
                        news[i] = { ...news[i], excerpt: e.target.value };
                        update("news", news);
                      }} />
                    </div>
                    <div className="md:col-span-2">
                      <ImageUploader label="Imagem" value={item.image} onChange={(v) => {
                        const news = [...config.news];
                        news[i] = { ...news[i], image: v };
                        update("news", news);
                      }} token={token} />
                    </div>
                    {item.image && (
                      <div className="md:col-span-2">
                        <NewsImagePositionEditor
                          image={item.image}
                          focusX={item.imageFocusX}
                          focusY={item.imageFocusY}
                          onChange={(focus) => {
                            const news = [...config.news];
                            news[i] = { ...news[i], ...focus };
                            update("news", news);
                          }}
                        />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <RichTextEditor
                        label="Conteúdo Completo"
                        value={item.content}
                        onChange={(content) => {
                          const news = [...config.news];
                          news[i] = { ...news[i], content };
                          update("news", news);
                        }}
                        minHeight={280}
                        hint="Após títulos em negrito ou H2, as linhas seguintes viram lista com • automaticamente. Use os botões • ◦ ❖ ➢ ➔ para outros estilos."
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => update("news", [{
                id: String(Date.now()),
                title: "Nova Notícia",
                excerpt: "",
                date: new Date().toISOString().split("T")[0],
                category: "Geral",
                image: "/uploads/banner.jpg",
                content: "",
              }, ...config.news])} className="admin-btn flex items-center gap-2">
                <Plus size={16} /> Adicionar Notícia
              </button>
            </div>
          )}

          {tab === "videos" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-2">Vídeos do Feed Principal</h2>
              <p className="text-sm text-gray-500 mb-6">
                Cole o ID ou qualquer link do YouTube. O visitante será direcionado ao clicar no vídeo ou no título.
              </p>
              {config.videos.map((video, i) => (
                <div key={video.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-sm text-gray-500">Vídeo #{i + 1}</span>
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
              <h2 className="text-xl font-bold mb-2">Agenda de Eventos</h2>
              <p className="text-sm text-gray-500 mb-6">Gerencie os eventos visíveis na página de Agenda.</p>
              {config.agenda.map((event, i) => (
                <div key={event.id} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-3">
                    <span className="font-semibold text-sm text-gray-500">Evento #{i + 1}</span>
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

          {tab === "social" && (
            <div className="admin-card">
              <h2 className="text-xl font-bold mb-6">Redes Sociais</h2>
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
                <h3 className="font-bold mb-4">Posts do Instagram (reserva manual)</h3>
                {config.instagram.posts.map((post, i) => (
                  <div key={post.id} className="border rounded-lg p-3 mb-3 flex gap-3 items-start">
                    <div className="flex-1 space-y-2">
                      <ImageUploader label="" value={post.image} onChange={(v) => {
                        const posts = [...config.instagram.posts];
                        posts[i] = { ...posts[i], image: v };
                        update("instagram", { ...config.instagram, posts });
                      }} token={token} />
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
              <h2 className="text-xl font-bold mb-6">Configurações</h2>
              <div>
                <label className="admin-label">Senha do Admin</label>
                <input type="password" className="admin-input max-w-sm" value={config.admin.password} onChange={(e) => update("admin", { password: e.target.value })} />
                <p className="text-xs text-gray-500 mt-1">Altere a senha de acesso ao painel admin</p>
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Como editar o site</h3>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li><strong>Cores & Tema:</strong> Altere as cores primárias, secundárias e de destaque</li>
                  <li><strong>Imagens:</strong> Faça upload para substituir fotos do site</li>
                  <li><strong>Menus:</strong> Adicione, remova ou edite itens do menu</li>
                  <li><strong>Conteúdo:</strong> Edite textos, hero e informações de contato</li>
                  <li><strong>Notícias:</strong> Gerencie as notícias do site</li>
                  <li><strong>Vídeos:</strong> Upload de vídeos para o feed principal</li>
                  <li><strong>Agenda:</strong> Gerencie eventos da semana e mês</li>
                  <li>Clique em <strong>Salvar</strong> após cada alteração</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
