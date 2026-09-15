/** Categorias derivadas apenas de termos já presentes nos títulos das propostas. */
const CATEGORY_ORDER = [
  "Desenvolvimento",
  "Segurança",
  "Social",
  "Educação",
  "Agro",
  "Saúde",
] as const;

export type PropostaCategory = (typeof CATEGORY_ORDER)[number];

export function getPropostaCategory(title: string): PropostaCategory | null {
  const t = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (t.includes("desenvolvimento") || t.includes("desburocratizacao") || t.includes("ipva")) {
    return "Desenvolvimento";
  }
  if (
    t.includes("seguranca") ||
    t.includes("policial") ||
    t.includes("desarmamento") ||
    t.includes("nuclea")
  ) {
    return "Segurança";
  }
  if (t.includes("professor") || t.includes("educacao") || t.includes("magisterio")) {
    return "Educação";
  }
  if (t.includes("agronegocio") || /\bagro\b/.test(t)) {
    return "Agro";
  }
  if (t.includes("pcd") || t.includes("necessidades especificas") || t.includes("saude")) {
    return "Saúde";
  }
  if (
    t.includes("aborto") ||
    t.includes("comunismo") ||
    t.includes("caridade") ||
    t.includes("pobre") ||
    t.includes("amparo") ||
    t.includes("meio ambiente") ||
    t.includes("animal")
  ) {
    return "Social";
  }

  return null;
}

export function listPropostaCategories(titles: string[]): PropostaCategory[] {
  const present = new Set<PropostaCategory>();
  for (const title of titles) {
    const cat = getPropostaCategory(title);
    if (cat) present.add(cat);
  }
  return CATEGORY_ORDER.filter((c) => present.has(c));
}

export function countLinkedPropostas(
  links: { url: string }[],
  documents?: { url?: string }[],
  mainLink?: string
): number {
  const urls = new Set<string>();
  for (const l of links) {
    if (l.url?.trim()) urls.add(l.url.trim());
  }
  if (mainLink?.trim()) urls.add(mainLink.trim());
  for (const d of documents || []) {
    if (d.url?.trim()) urls.add(d.url.trim());
  }
  return urls.size;
}
