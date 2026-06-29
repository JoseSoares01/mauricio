import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { blobAuth, blobPathname, isBlobEnabled } from "@/lib/blob-storage";
import { getGitHubRawUrl, isGithubStorageEnabled, writeFileToGitHub } from "@/lib/github-storage";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const token = request.headers.get("x-admin-token");
  if (!token) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const ext = path.extname(file.name) || mimeToExt(file.type);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanFolder = folder.replace(/^\/+/, "").replace(/\/+$/, "");

    if (isGithubStorageEnabled()) {
      const filePath = `public/${cleanFolder}/${filename}`;
      await writeFileToGitHub({
        filePath,
        content: buffer,
        message: `Upload de arquivo (${filename}) pelo painel admin`,
      });
      return NextResponse.json({
        url: getGitHubRawUrl(filePath),
        filename,
      });
    }

    if (isBlobEnabled()) {
      const pathname = blobPathname(folder, filename);
      const result = await put(pathname, buffer, {
        access: "public",
        addRandomSuffix: false,
        contentType: file.type || "application/octet-stream",
        cacheControlMaxAge: 60,
        ...blobAuth(),
      });

      return NextResponse.json({ url: result.url, filename, pathname: result.pathname });
    }

    if (process.env.VERCEL === "1") {
      return NextResponse.json(
        { error: "Blob não configurado. Ative o Blob Storage na Vercel para enviar imagens." },
        { status: 500 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", cleanFolder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/${cleanFolder}/${filename}`;
    return NextResponse.json({ url, filename });
  } catch (error) {
    console.error("Erro no upload:", error);
    const message = error instanceof Error ? error.message : "Erro no upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "video/mp4": ".mp4",
    "video/webm": ".webm",
  };
  return map[mime] || ".bin";
}
