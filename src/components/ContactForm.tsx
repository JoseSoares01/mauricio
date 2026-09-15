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
    <form className="contato-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        className="contato-form-honeypot"
        aria-hidden="true"
      />

      <div className="contato-field">
        <label className="contato-field-label" htmlFor="contact-name">
          Nome
        </label>
        <input
          id="contact-name"
          type="text"
          className="contato-field-input"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="contato-field">
        <label className="contato-field-label" htmlFor="contact-email">
          E-mail
        </label>
        <input
          id="contact-email"
          type="email"
          className="contato-field-input"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === "loading"}
        />
      </div>

      <div className="contato-field">
        <label className="contato-field-label" htmlFor="contact-message">
          Mensagem
        </label>
        <textarea
          id="contact-message"
          className="contato-field-input contato-field-textarea"
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
          className={`contato-feedback${
            status === "success"
              ? " contato-feedback--success"
              : status === "error"
                ? " contato-feedback--error"
                : " contato-feedback--info"
          }`}
          role="status"
        >
          {feedback}
        </p>
      )}

      <button
        type="submit"
        className="contato-submit"
        disabled={status === "loading" || status === "success"}
      >
        {status === "loading" ? (
          "Enviando..."
        ) : (
          <>
            Enviar mensagem <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className="contato-form-note">
        Sua mensagem será enviada para {recipientEmail} ({siteTitle}).
      </p>
    </form>
  );
}
