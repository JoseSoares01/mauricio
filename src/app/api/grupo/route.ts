import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { Resend } from "resend";
import { getSiteConfig } from "@/lib/site-config";
import { resolveGroupUrl } from "@/lib/whatsapp-group";

const LEADS_PATH = path.join(process.cwd(), "data", "grupo-leads.json");

type Lead = {
  id: string;
  name: string;
  phone: string;
  city: string;
  createdAt: string;
};

async function appendLead(lead: Lead) {
  try {
    let list: Lead[] = [];
    try {
      const raw = await fs.readFile(LEADS_PATH, "utf-8");
      list = JSON.parse(raw) as Lead[];
      if (!Array.isArray(list)) list = [];
    } catch {
      list = [];
    }
    list.push(lead);
    await fs.writeFile(LEADS_PATH, `${JSON.stringify(list, null, 2)}\n`, "utf-8");
  } catch (error) {
    console.error("Falha ao gravar lead do grupo:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      city?: string;
      website?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: true, redirectUrl: "https://wa.me/" });
    }

    const name = body.name?.trim() || "";
    const phone = (body.phone || "").replace(/\D/g, "");
    const city = body.city?.trim() || "";

    if (!name || !phone || !city) {
      return NextResponse.json(
        { error: "Preencha nome, WhatsApp e cidade." },
        { status: 400 }
      );
    }

    if (phone.length < 10 || phone.length > 13) {
      return NextResponse.json(
        { error: "Informe um WhatsApp válido com DDD." },
        { status: 400 }
      );
    }

    const config = await getSiteConfig();
    const grupo = config.whatsappGroup;
    if (!grupo?.enabled) {
      return NextResponse.json({ error: "Página indisponível." }, { status: 503 });
    }

    const redirectUrl = resolveGroupUrl(grupo, city);
    if (!redirectUrl) {
      return NextResponse.json(
        {
          error:
            "Link do grupo ainda não configurado. Configure no admin (aba Grupo) o link do WhatsApp.",
        },
        { status: 503 }
      );
    }

    const lead: Lead = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      phone,
      city,
      createdAt: new Date().toISOString(),
    };
    await appendLead(lead);

    const notifyTo = (grupo.notifyEmail || config.contact.email || "").trim();
    const apiKey = process.env.RESEND_API_KEY;
    if (notifyTo && apiKey) {
      try {
        const resend = new Resend(apiKey);
        const from =
          process.env.CONTACT_FROM_EMAIL || "Site Maurício <onboarding@resend.dev>";
        await resend.emails.send({
          from,
          to: [notifyTo],
          subject: `Novo lead do Grupo: ${name}`,
          text: [
            `Nome: ${name}`,
            `WhatsApp: ${phone}`,
            `Cidade: ${city}`,
            `Data: ${lead.createdAt}`,
          ].join("\n"),
        });
      } catch (error) {
        console.error("Falha ao notificar lead do grupo:", error);
      }
    }

    return NextResponse.json({ ok: true, redirectUrl });
  } catch (error) {
    console.error("Grupo API error:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
