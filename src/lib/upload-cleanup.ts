import path from "path";
import type { SiteConfig } from "./types";
import { deleteFileFromGitHub } from "./github-storage";

function normalizeToRepoUploadPath(value: string): string | null {
  if (!value) return null;

  if (value.startsWith("/uploads/")) {
    return `public${value}`;
  }

  const rawMatch = value.match(
    /raw\.githubusercontent\.com\/[^/]+\/[^/]+\/[^/]+\/(public\/uploads\/[^?#]+)/i
  );
  if (rawMatch) return rawMatch[1];

  return null;
}

function collectUploadPaths(value: unknown, paths: Set<string>): void {
  if (typeof value === "string") {
    const repoPath = normalizeToRepoUploadPath(value);
    if (repoPath) paths.add(repoPath);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectUploadPaths(item, paths);
    return;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectUploadPaths(item, paths);
  }
}

export function collectConfigUploadPaths(config: SiteConfig): Set<string> {
  const paths = new Set<string>();
  collectUploadPaths(config, paths);
  return paths;
}

export async function deleteRemovedUploadsFromGitHub(
  previousConfig: SiteConfig,
  nextConfig: SiteConfig
): Promise<void> {
  const previousPaths = collectConfigUploadPaths(previousConfig);
  const nextPaths = collectConfigUploadPaths(nextConfig);

  for (const filePath of previousPaths) {
    if (nextPaths.has(filePath)) continue;

    try {
      await deleteFileFromGitHub({
        filePath,
        message: `Remove arquivo não utilizado (${path.basename(filePath)}) pelo painel admin`,
      });
    } catch (error) {
      console.error(`Falha ao apagar ${filePath} no GitHub:`, error);
    }
  }
}
