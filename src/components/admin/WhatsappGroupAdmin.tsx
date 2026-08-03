"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2, Download } from "lucide-react";
import type { WhatsappGroupConfig, WhatsappGroupCity } from "@/lib/whatsapp-group";
import type { GrupoLead } from "@/lib/grupo-leads";
import ImageUploader from "./ImageUploader";

interface WhatsappGroupAdminProps {
  value: WhatsappGroupConfig;
  token: string;
  onChange: (value: WhatsappGroupConfig) => void;
}

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return phone;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("pt-BR");
}

function escapeCsvCell(value: string) {
  const text = value.replace(/"/g, '""');
  return `"${text}"`;
}

function downloadLeadsExcel(leads: GrupoLead[]) {
  const header = ["Data", "Nome", "WhatsApp", "Cidade"];
  const rows = leads.map((lead) => [
    formatDate(lead.createdAt),
    lead.name,
    formatPhone(lead.phone),
    lead.city,
  ]);

  const lines = [header, ...rows]
    .map((cols) => cols.map((c) => escapeCsvCell(String(c))).join(";"))
    .join("\r\n");

  // BOM para o Excel abrir acentos corretamente
  const blob = new Blob(["\uFEFF" + lines], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `leads-grupo-${stamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WhatsappGroupAdmin({
  value,
  token,
  onChange,
}: WhatsappGroupAdminProps) {
  const [leads, setLeads] = useState<GrupoLead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [loadingLeads, setLoadingLeads] = useState(false);

  const update = (patch: Partial<WhatsappGroupConfig>) => {
    onChange({ ...value, ...patch });
  };

  const updateCity = (index: number, patch: Partial<WhatsappGroupCity>) => {
    const cities = [...value.cities];
    cities[index] = { ...cities[index], ...patch };
    update({ cities });
  };

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/admin/grupo-leads", {
        headers: { "x-admin-token": token },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Falha ao carregar leads");
      const data = (await res.json()) as { leads: GrupoLead[]; total: number };
      setLeads(data.leads || []);
      setLeadsTotal(data.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLeads(false);
    }
  }, [token]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  return (
    <div className="space-y-6">
      <div className="admin-card">
        <h2 className="text-xl font-bold mb-2">Grupo WhatsApp</h2>
        <p className="text-sm text-gray-500 mb-6">
          Página pública em <code>/grupo</code>. Coleta nome, WhatsApp e cidade e
          redireciona para o link do grupo. Os leads ficam em{" "}
          <code>data/grupo-leads.json</code>.
        </p>

        <label className="flex items-center gap-2 mb-6 text-sm font-medium">
          <input
            type="checkbox"
            checked={value.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
          />
          Página ativa
        </label>

        <div className="space-y-4">
          <div>
            <label className="admin-label">Link padrão do grupo (WhatsApp)</label>
            <input
              type="url"
              className="admin-input"
              placeholder="https://chat.whatsapp.com/..."
              value={value.defaultGroupUrl}
              onChange={(e) => update({ defaultGroupUrl: e.target.value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              Obrigatório. Usado quando a cidade não tem link próprio.
            </p>
          </div>

          <div>
            <label className="admin-label">E-mail para notificar leads (opcional)</label>
            <input
              type="email"
              className="admin-input"
              value={value.notifyEmail || ""}
              onChange={(e) => update({ notifyEmail: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <ImageUploader
              label="Foto do perfil (círculo)"
              value={value.profileImage}
              onChange={(url) => update({ profileImage: url })}
              token={token}
              focusObjectFit="cover"
              focusPreviewAspect="square"
            />
            <ImageUploader
              label="Foto desktop (lado direito)"
              value={value.desktopHeroImage}
              onChange={(url) => update({ desktopHeroImage: url })}
              token={token}
              focusObjectFit="cover"
              focusPreviewAspect="tall"
            />
          </div>

          <div>
            <label className="admin-label">Nome exibido</label>
            <input
              className="admin-input"
              value={value.displayName}
              onChange={(e) => update({ displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Linha de cargo</label>
            <input
              className="admin-input"
              value={value.roleLine}
              onChange={(e) => update({ roleLine: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className="admin-label">Título (antes)</label>
              <input
                className="admin-input"
                value={value.headlineBefore}
                onChange={(e) => update({ headlineBefore: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Destaque (amarelo)</label>
              <input
                className="admin-input"
                value={value.headlineHighlight}
                onChange={(e) => update({ headlineHighlight: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Título (depois)</label>
              <input
                className="admin-input"
                value={value.headlineAfter}
                onChange={(e) => update({ headlineAfter: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="admin-label">Subtítulo</label>
            <textarea
              className="admin-input min-h-[80px]"
              value={value.subtitle}
              onChange={(e) => update({ subtitle: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Texto do botão</label>
            <input
              className="admin-input"
              value={value.ctaLabel}
              onChange={(e) => update({ ctaLabel: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Nota rodapé</label>
            <textarea
              className="admin-input min-h-[70px]"
              value={value.footerNote}
              onChange={(e) => update({ footerNote: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="admin-label">URL Política de Privacidade</label>
              <input
                className="admin-input"
                value={value.privacyUrl}
                onChange={(e) => update({ privacyUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Texto do link</label>
              <input
                className="admin-input"
                value={value.privacyLabel}
                onChange={(e) => update({ privacyLabel: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="font-semibold text-gray-800 mb-2">Cidades e links por cidade</h3>
        <p className="text-sm text-gray-500 mb-4">
          Opcional: se preencher o link da cidade, ele prevalece sobre o link padrão.
        </p>
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {value.cities.map((city, i) => (
            <div
              key={`${city.name}-${i}`}
              className="border rounded-lg p-3 grid md:grid-cols-[1fr_1.4fr_auto] gap-2 items-end"
            >
              <div>
                <label className="admin-label">Cidade</label>
                <input
                  className="admin-input"
                  value={city.name}
                  onChange={(e) => updateCity(i, { name: e.target.value })}
                />
              </div>
              <div>
                <label className="admin-label">Link WhatsApp (opcional)</label>
                <input
                  className="admin-input"
                  placeholder="https://chat.whatsapp.com/..."
                  value={city.groupUrl || ""}
                  onChange={(e) => updateCity(i, { groupUrl: e.target.value })}
                />
              </div>
              <button
                type="button"
                className="admin-btn-danger p-2 rounded-lg"
                onClick={() =>
                  update({ cities: value.cities.filter((_, idx) => idx !== i) })
                }
                aria-label="Remover cidade"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn flex items-center gap-2 mt-4"
          onClick={() =>
            update({ cities: [...value.cities, { name: "", groupUrl: "" }] })
          }
        >
          <Plus size={16} /> Adicionar cidade
        </button>
      </div>

      <div className="admin-card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-semibold text-gray-800">Leads salvos</h3>
            <p className="text-sm text-gray-500">
              {leadsTotal} cadastro{leadsTotal === 1 ? "" : "s"} em{" "}
              <code>data/grupo-leads.json</code>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="admin-btn flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              onClick={() => downloadLeadsExcel(leads)}
              disabled={leads.length === 0}
            >
              <Download size={16} />
              Baixar Excel
            </button>
            <button
              type="button"
              className="admin-btn-secondary flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
              onClick={() => void loadLeads()}
              disabled={loadingLeads}
            >
              <RefreshCw size={16} className={loadingLeads ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>
        </div>

        {leads.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum lead ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-3 font-medium">Data</th>
                  <th className="py-2 pr-3 font-medium">Nome</th>
                  <th className="py-2 pr-3 font-medium">WhatsApp</th>
                  <th className="py-2 font-medium">Cidade</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3 whitespace-nowrap">{formatDate(lead.createdAt)}</td>
                    <td className="py-2 pr-3">{lead.name}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatPhone(lead.phone)}</td>
                    <td className="py-2">{lead.city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
