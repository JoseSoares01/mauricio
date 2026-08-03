import { promises as fs } from "fs";
import path from "path";
import { unstable_noStore as noStore } from "next/cache";
import { put, list } from "@vercel/blob";
import { blobAuth, isBlobEnabled } from "./blob-storage";
import { isGithubStorageEnabled, readTextFileFromGitHub, writeFileToGitHub } from "./github-storage";

export type GrupoLead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
};

const LEADS_PATH = path.join(process.cwd(), "data", "grupo-leads.json");
const BLOB_PATHNAME = "mauricio/grupo-leads.json";
const GITHUB_PATH = "data/grupo-leads.json";

function normalizeLeads(data: unknown): GrupoLead[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is GrupoLead => !!item && typeof item === "object")
    .map((item) => ({
      id: String(item.id || ""),
      name: String(item.name || ""),
      phone: String(item.phone || ""),
      city: String(item.city || ""),
      createdAt: String(item.createdAt || ""),
    }))
    .filter((item) => item.id && item.name && item.phone && item.city);
}

async function readFromBlob(): Promise<GrupoLead[] | null> {
  if (!isBlobEnabled()) return null;

  try {
    const { blobs } = await list({ prefix: "mauricio/", ...blobAuth() });
    const blob = blobs.find((item) => item.pathname === BLOB_PATHNAME);
    if (!blob) return null;

    const response = await fetch(`${blob.url}?v=${blob.uploadedAt}`, { cache: "no-store" });
    if (!response.ok) return null;

    return normalizeLeads(await response.json());
  } catch (error) {
    console.error("Falha ao ler leads do Blob:", error);
    return null;
  }
}

async function readFromGitHub(): Promise<GrupoLead[] | null> {
  if (!isGithubStorageEnabled()) return null;
  try {
    const raw = await readTextFileFromGitHub(GITHUB_PATH);
    if (!raw) return null;
    return normalizeLeads(JSON.parse(raw));
  } catch (error) {
    console.error("Falha ao ler leads do GitHub:", error);
    return null;
  }
}

async function readFromDisk(): Promise<GrupoLead[]> {
  try {
    const raw = await fs.readFile(LEADS_PATH, "utf-8");
    return normalizeLeads(JSON.parse(raw));
  } catch {
    return [];
  }
}

async function writeLeads(leads: GrupoLead[]): Promise<void> {
  const content = `${JSON.stringify(leads, null, 2)}\n`;

  if (isGithubStorageEnabled()) {
    await writeFileToGitHub({
      filePath: GITHUB_PATH,
      content,
      message: "Atualiza leads do grupo WhatsApp",
    });
    return;
  }

  if (isBlobEnabled()) {
    await put(BLOB_PATHNAME, content, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
      ...blobAuth(),
    });
    return;
  }

  await fs.writeFile(LEADS_PATH, content, "utf-8");
}

export async function getGrupoLeads(): Promise<GrupoLead[]> {
  noStore();
  const fromGitHub = await readFromGitHub();
  if (fromGitHub) return fromGitHub;
  const fromBlob = await readFromBlob();
  if (fromBlob) return fromBlob;
  return readFromDisk();
}

export async function appendGrupoLead(lead: GrupoLead): Promise<GrupoLead[]> {
  const leads = await getGrupoLeads();
  const next = [...leads, lead];
  await writeLeads(next);
  return next;
}
