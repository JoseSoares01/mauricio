import { NextRequest, NextResponse } from "next/server";
import { getSiteConfigFresh } from "@/lib/site-config";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const config = await getSiteConfigFresh();

  if (password === config.admin.password) {
    const token = createHash("sha256")
      .update(password + "mauricio-salt")
      .digest("hex");
    return NextResponse.json({ token });
  }

  return NextResponse.json({ error: "Senha incorreta" }, { status: 401 });
}
