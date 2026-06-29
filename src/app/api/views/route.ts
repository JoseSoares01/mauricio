import { NextRequest, NextResponse } from "next/server";
import { getViews, incrementView, type ViewType } from "@/lib/views";

export const dynamic = "force-dynamic";

function isValidType(value: unknown): value is ViewType {
  return value === "news" || value === "video";
}

export async function GET() {
  const views = await getViews();
  return NextResponse.json(views);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body as { type?: unknown; id?: unknown };

    if (!isValidType(type) || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
    }

    const count = await incrementView(type, id.trim());
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
    return NextResponse.json({ error: "Erro ao registrar visualização" }, { status: 500 });
  }
}
