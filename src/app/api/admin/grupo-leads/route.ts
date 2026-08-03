import { NextRequest, NextResponse } from "next/server";
import { getGrupoLeads } from "@/lib/grupo-leads";

export const dynamic = "force-dynamic";

function checkAuth(request: NextRequest): boolean {
  return !!request.headers.get("x-admin-token");
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const leads = await getGrupoLeads();
  const sorted = [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ leads: sorted, total: sorted.length });
}
