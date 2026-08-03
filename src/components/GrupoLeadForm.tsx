"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { WhatsappGroupConfig } from "@/lib/whatsapp-group";
import { digitsOnlyPhone, formatWhatsappPhone } from "@/lib/whatsapp-group";

interface GrupoLeadFormProps {
  config: WhatsappGroupConfig;
}

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function GrupoLeadForm({ config }: GrupoLeadFormProps) {
  const cities = useMemo(() => {
    const sorted = [...config.cities].sort((a, b) =>
      a.name.localeCompare(b.name, "pt-BR")
    );
    const withoutOutra = sorted.filter((c) => c.name.toLowerCase() !== "outra");
    return [...withoutOutra, { name: "Outra", groupUrl: "" }];
  }, [config.cities]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [otherCity, setOtherCity] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isOtherCity = city.trim().toLowerCase() === "outra";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const resolvedCity = isOtherCity ? otherCity.trim() : city.trim();

    if (!name.trim() || !phone.trim() || !resolvedCity) {
      setError(
        isOtherCity
          ? "Preencha nome, WhatsApp e informe a cidade."
          : "Preencha nome, WhatsApp e cidade."
      );
      return;
    }
    if (digitsOnlyPhone(phone).length < 10) {
      setError("Informe um WhatsApp válido com DDD.");
      return;
    }
    if (!accepted) {
      setError("É necessário aceitar a Política de Privacidade.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: digitsOnlyPhone(phone),
          city: resolvedCity,
          website: honeypot,
        }),
      });
      const data = (await res.json()) as { error?: string; redirectUrl?: string };

      if (!res.ok || !data.redirectUrl) {
        setError(data.error || "Não foi possível entrar no grupo. Tente novamente.");
        setLoading(false);
        return;
      }

      window.location.href = data.redirectUrl;
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <form className="grupo-form" onSubmit={onSubmit} noValidate>
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="grupo-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <label className="grupo-field">
        <span>Nome completo</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          autoComplete="name"
          required
        />
      </label>

      <label className="grupo-field">
        <span>WhatsApp</span>
        <input
          type="tel"
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatWhatsappPhone(e.target.value))}
          placeholder="(00) 00000-0000"
          autoComplete="tel"
          required
        />
      </label>

      <label className="grupo-field">
        <span>Cidade</span>
        <input
          type="text"
          list="grupo-cidades"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            if (e.target.value.trim().toLowerCase() !== "outra") {
              setOtherCity("");
            }
          }}
          placeholder="Digite ou escolha sua cidade"
          autoComplete="address-level2"
          required
        />
        <datalist id="grupo-cidades">
          {cities.map((item) => (
            <option key={item.name} value={item.name} />
          ))}
        </datalist>
      </label>

      {isOtherCity && (
        <label className="grupo-field">
          <span>Qual cidade?</span>
          <input
            type="text"
            value={otherCity}
            onChange={(e) => setOtherCity(e.target.value)}
            placeholder="Digite o nome da cidade"
            required
          />
        </label>
      )}

      <label className="grupo-consent">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span>
          Li e concordo com a{" "}
          <Link
            href={
              config.privacyUrl ||
              "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            {config.privacyLabel || "Política de Privacidade"}
          </Link>{" "}
          e autorizo o tratamento dos meus dados conforme a LGPD.
        </span>
      </label>

      {error && <p className="grupo-error" role="alert">{error}</p>}

      <button type="submit" className="grupo-cta" disabled={loading}>
        <WhatsAppIcon className="grupo-cta-icon" />
        <span>{loading ? "ABRINDO..." : config.ctaLabel}</span>
      </button>
    </form>
  );
}

export function GrupoBrandHeader({ config }: { config: WhatsappGroupConfig }) {
  return (
    <div className="grupo-brand">
      <div className="grupo-brand-avatar">
        <Image
          src={config.profileImage}
          alt={config.displayName}
          width={72}
          height={72}
          className="grupo-brand-avatar-img"
          unoptimized
          priority
        />
      </div>
      <div className="grupo-brand-text">
        <p className="grupo-brand-name">{config.displayName}</p>
        <p className="grupo-brand-role">{config.roleLine}</p>
      </div>
    </div>
  );
}
