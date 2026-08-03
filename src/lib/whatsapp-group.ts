import { MAP_MUNICIPALITY_LABELS } from "@/lib/action-map-municipalities";

export interface WhatsappGroupCity {
  name: string;
  /** Se vazio, usa defaultGroupUrl */
  groupUrl?: string;
}

export interface WhatsappGroupConfig {
  enabled: boolean;
  profileImage: string;
  desktopHeroImage: string;
  displayName: string;
  roleLine: string;
  headlineBefore: string;
  headlineHighlight: string;
  headlineAfter: string;
  subtitle: string;
  ctaLabel: string;
  footerNote: string;
  privacyUrl: string;
  privacyLabel: string;
  defaultGroupUrl: string;
  cities: WhatsappGroupCity[];
  notifyEmail?: string;
}

const DEFAULT_CITY_NAMES = [...MAP_MUNICIPALITY_LABELS]
  .map((c) => c.name)
  .sort((a, b) => a.localeCompare(b, "pt-BR"));

export function defaultWhatsappGroupCities(): WhatsappGroupCity[] {
  return DEFAULT_CITY_NAMES.map((name) => ({ name, groupUrl: "" }));
}

export function defaultWhatsappGroupConfig(images?: {
  heroPhoto?: string;
  heroPhotoOriginal?: string;
}): WhatsappGroupConfig {
  const photo = images?.heroPhotoOriginal || images?.heroPhoto || "/uploads/hero-photo.png";
  return {
    enabled: true,
    profileImage: photo,
    desktopHeroImage: photo,
    displayName: "DR. MAURÍCIO SOARES",
    roleLine: "PRÉ-CANDIDATO · DEPUTADO FEDERAL · PIAUÍ",
    headlineBefore: "VENHA FAZER PARTE DO MEU",
    headlineHighlight: "GRUPO DE APOIO",
    headlineAfter: "NA SUA CIDADE.",
    subtitle:
      "Preencha os dados, escolha sua cidade e entre agora no grupo do WhatsApp do Piauí.",
    ctaLabel: "ENTRAR NO GRUPO",
    footerNote:
      "Ao entrar você passa a receber comunicações da pré-campanha. Você pode sair do grupo a qualquer momento.",
    privacyUrl: "/contato",
    privacyLabel: "Política de Privacidade",
    defaultGroupUrl: "",
    cities: defaultWhatsappGroupCities(),
    notifyEmail: "",
  };
}

export function normalizeWhatsappGroup(
  base: Partial<WhatsappGroupConfig> | undefined,
  images?: { heroPhoto?: string; heroPhotoOriginal?: string }
): WhatsappGroupConfig {
  const defaults = defaultWhatsappGroupConfig(images);
  const cities =
    base?.cities && base.cities.length > 0
      ? base.cities.map((c) => ({
          name: (c.name || "").trim(),
          groupUrl: (c.groupUrl || "").trim(),
        })).filter((c) => c.name)
      : defaults.cities;

  return {
    enabled: base?.enabled !== false,
    profileImage: base?.profileImage?.trim() || defaults.profileImage,
    desktopHeroImage: base?.desktopHeroImage?.trim() || defaults.desktopHeroImage,
    displayName: base?.displayName?.trim() || defaults.displayName,
    roleLine: base?.roleLine?.trim() || defaults.roleLine,
    headlineBefore: base?.headlineBefore?.trim() || defaults.headlineBefore,
    headlineHighlight: base?.headlineHighlight?.trim() || defaults.headlineHighlight,
    headlineAfter: base?.headlineAfter?.trim() || defaults.headlineAfter,
    subtitle: base?.subtitle?.trim() || defaults.subtitle,
    ctaLabel: base?.ctaLabel?.trim() || defaults.ctaLabel,
    footerNote: base?.footerNote?.trim() || defaults.footerNote,
    privacyUrl: base?.privacyUrl?.trim() || defaults.privacyUrl,
    privacyLabel: base?.privacyLabel?.trim() || defaults.privacyLabel,
    defaultGroupUrl: base?.defaultGroupUrl?.trim() || "",
    cities,
    notifyEmail: base?.notifyEmail?.trim() || "",
  };
}

export function resolveGroupUrl(
  config: WhatsappGroupConfig,
  cityName: string
): string {
  const city = config.cities.find(
    (c) => c.name.toLowerCase() === cityName.trim().toLowerCase()
  );
  const url = city?.groupUrl?.trim() || config.defaultGroupUrl.trim();
  return url;
}

export function formatWhatsappPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function digitsOnlyPhone(value: string): string {
  return value.replace(/\D/g, "");
}
