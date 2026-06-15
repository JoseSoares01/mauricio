"use client";

import { useState } from "react";

interface ContactFormProps {
  recipientEmail: string;
  siteTitle: string;
}

export default function ContactForm({ recipientEmail, siteTitle }: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const buildMailto = () => {
    const subject = encodeURIComponent(`Contato pelo site - ${name}`);
    const body = encodeURIComponent(
      `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`
    );
    return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website: honeypot }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        fallbackMailto?: boolean;
      };

      if (res.ok) {
        setStatus("success");
        setFeedback("Mensagem enviada com sucesso! Responderemos em breve.");
        setName("");
        setEmail("");
        setMessage("");
        return;
      }

      if (data.fallbackMailto) {
        window.location.href = buildMailto();
        setStatus("idle");
        setFeedback("Abrindo seu aplicativo de e-mail para concluir o envio...");
        return;
      }

      setStatus("error");
      setFeedback(data.error || "Não foi possível enviar a mensagem. Tente novamente.");
    } catch {
      setStatus("error");
      setFeedback("Erro de conexão. Tente novamente ou use o e-mail direto acima.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
        aria-hidden="true"
      />

      <div>
        <label className="admin-label" htmlFor="contact-name">
          Nome
        </label>
        <input
          id="contact-name"
          type="text"
          className="admin-input"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div>
        <label className="admin-label" htmlFor="contact-email">
          E-mail
        </label>
        <input
          id="contact-email"
          type="email"
          className="admin-input"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div>
        <label className="admin-label" htmlFor="contact-message">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          className="admin-input min-h-[120px] resize-y"
          placeholder="Sua mensagem..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={10}
          disabled={status === "loading"}
        />
      </div>

      {feedback && (
        <p
          className={`text-sm rounded-lg px-4 py-3 ${
            status === "success"
              ? "bg-green-50 text-green-800"
              : status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-blue-50 text-blue-800"
          }`}
          role="status"
        >
          {feedback}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary w-full text-center disabled:opacity-60"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? "Enviando..." : "Enviar mensagem"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Sua mensagem será enviada para {recipientEmail} ({siteTitle}).
      </p>
    </form>
  );
}
