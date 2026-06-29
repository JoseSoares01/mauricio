"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import type { PropostaDocument, PropostaItem } from "@/lib/types";
import FileUploader from "./FileUploader";

interface PropostasAdminProps {
  propostas: PropostaItem[];
  token: string;
  onChange: (propostas: PropostaItem[]) => void;
}

interface PropostaAdminItemProps {
  item: PropostaItem;
  index: number;
  expanded: boolean;
  token: string;
  onToggle: () => void;
  onUpdate: (item: PropostaItem) => void;
  onDelete: () => void;
}

function PropostaAdminItem({
  item,
  index,
  expanded,
  token,
  onToggle,
  onUpdate,
  onDelete,
}: PropostaAdminItemProps) {
  const dragControls = useDragControls();

  const updateDocument = (docIndex: number, field: keyof PropostaDocument, value: string) => {
    const documents = [...(item.documents || [])];
    documents[docIndex] = { ...documents[docIndex], [field]: value };
    onUpdate({ ...item, documents });
  };

  const addDocument = () => {
    onUpdate({
      ...item,
      documents: [...(item.documents || []), { title: "Documento", url: "" }],
    });
  };

  const removeDocument = (docIndex: number) => {
    const documents = (item.documents || []).filter((_, i) => i !== docIndex);
    onUpdate({ ...item, documents: documents.length ? documents : undefined });
  };

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="border rounded-lg mb-3 bg-white overflow-hidden list-none"
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing shrink-0"
          aria-label="Arrastar para reordenar"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <GripVertical size={18} />
        </button>

        <button
          type="button"
          className="flex-1 flex items-center gap-3 text-left min-w-0"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="text-xs font-semibold text-gray-400 shrink-0">#{index + 1}</span>
          <p className="font-semibold text-sm text-gray-800 truncate flex-1">
            {item.title || "Sem título"}
          </p>
          <ChevronDown
            size={18}
            className={`text-gray-400 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="text-red-500 p-1 shrink-0 hover:bg-red-50 rounded"
          aria-label="Excluir proposta"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="border-t px-4 pb-4 pt-3 space-y-3">
          <div>
            <label className="admin-label">Título</label>
            <input
              className="admin-input"
              value={item.title}
              onChange={(e) => onUpdate({ ...item, title: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Descrição</label>
            <textarea
              className="admin-input min-h-[100px]"
              value={item.description}
              onChange={(e) => onUpdate({ ...item, description: e.target.value })}
            />
          </div>
          <div>
            <label className="admin-label">Link externo (opcional)</label>
            <input
              className="admin-input"
              value={item.link || ""}
              onChange={(e) => onUpdate({ ...item, link: e.target.value || undefined })}
              placeholder="https://..."
            />
          </div>

          <div>
            <h4 className="admin-label">Documentos (PDF)</h4>
            {(item.documents || []).map((doc, docIndex) => (
              <div key={`${item.id}-doc-${docIndex}`} className="mt-3 grid gap-3 rounded-lg border p-3 md:grid-cols-2">
                <div>
                  <label className="admin-label">Título do documento</label>
                  <input
                    className="admin-input"
                    value={doc.title}
                    onChange={(e) => updateDocument(docIndex, "title", e.target.value)}
                  />
                </div>
                <FileUploader
                  label="Arquivo"
                  value={doc.url}
                  onChange={(url) => updateDocument(docIndex, "url", url)}
                  token={token}
                  folder="uploads/docs"
                />
                <div className="md:col-span-2 flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-red-500"
                    onClick={() => removeDocument(docIndex)}
                  >
                    Remover documento
                  </button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addDocument} className="admin-btn mt-3 text-sm">
              Adicionar documento
            </button>
          </div>
        </div>
      )}
    </Reorder.Item>
  );
}

export default function PropostasAdmin({ propostas, token, onChange }: PropostasAdminProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const updateItem = (index: number, item: PropostaItem) => {
    const next = [...propostas];
    next[index] = item;
    onChange(next);
  };

  const deleteItem = (id: string) => {
    onChange(propostas.filter((p) => p.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const addProposta = () => {
    const newItem: PropostaItem = {
      id: String(Date.now()),
      title: "Nova Proposta",
      description: "",
    };
    onChange([...propostas, newItem]);
    setExpandedId(newItem.id);
  };

  return (
    <div className="admin-card">
      <h2 className="text-xl font-bold mb-2">Propostas</h2>
      <p className="text-sm text-gray-500 mb-6">
        Arraste para definir a ordem na página. Clique para editar título, descrição, link ou documentos.
      </p>

      <Reorder.Group axis="y" values={propostas} onReorder={onChange} className="m-0 p-0">
        {propostas.map((item, i) => (
          <PropostaAdminItem
            key={item.id}
            item={item}
            index={i}
            expanded={expandedId === item.id}
            token={token}
            onToggle={() => setExpandedId((id) => (id === item.id ? null : item.id))}
            onUpdate={(updated) => updateItem(i, updated)}
            onDelete={() => deleteItem(item.id)}
          />
        ))}
      </Reorder.Group>

      <button type="button" onClick={addProposta} className="admin-btn flex items-center gap-2 mt-4">
        <Plus size={16} /> Adicionar Proposta
      </button>
    </div>
  );
}
