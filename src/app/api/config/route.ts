import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  return !!token;
}

export async function GET() {
  const config = await getSiteConfig();
  const { admin, ...publicConfig } = config;
  return NextResponse.json(publicConfig);
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await saveSiteConfig(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar";
    console.error("Erro ao salvar config:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
