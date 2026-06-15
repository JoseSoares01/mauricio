import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSiteConfig } from "@/lib/site-config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      message?: string;
      website?: string;
    };

    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    const name = body.name?.trim() || "";
    const email = body.email?.trim() || "";
    const message = body.message?.trim() || "";

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Preencha nome, e-mail e mensagem." }, { status: 400 });
    }

    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    if (message.length < 10) {
      return NextResponse.json({ error: "A mensagem deve ter pelo menos 10 caracteres." }, { status: 400 });
    }

    const config = await getSiteConfig();
    const to = config.contact.email?.trim();

    if (!to || !EMAIL_RE.test(to)) {
      return NextResponse.json(
        { error: "E-mail de destino não configurado no site." },
        { status: 500 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Envio automático ainda não configurado.",
          fallbackMailto: true,
        },
        { status: 503 }
      );
    }

    const resend = new Resend(apiKey);
    const from = process.env.CONTACT_FROM_EMAIL || "Site Maurício <onboarding@resend.dev>";

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: email,
      subject: `Contato pelo site: ${name}`,
      text: [
        `Nome: ${name}`,
        `E-mail: ${email}`,
        "",
        "Mensagem:",
        message,
        "",
        `---`,
        `Enviado pelo formulário de contato de ${config.site.title}`,
      ].join("\n"),
      html: `
        <h2>Nova mensagem pelo site</h2>
        <p><strong>Nome:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-mail:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p><strong>Mensagem:</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        <hr />
        <p style="color:#666;font-size:12px">Enviado pelo formulário de contato de ${escapeHtml(config.site.title)}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Falha ao enviar o e-mail. Tente novamente em instantes." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json({ error: "Erro interno ao enviar mensagem." }, { status: 500 });
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
