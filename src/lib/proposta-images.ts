const PROPOSTA_IMAGE_FILES: Record<string, string> = {
  "soberania nacional": "DESENVOLVIMENTO NACIONAL.png",
  "contra o aborto e o comunismo": "CONTRA O ABORTO.png",
  "seguranca nacional e valorizacao do policial": "segurança nacional.png",
  "salario digno para professores": "salario digno.png",
  "doacao de metade da remuneracao para instituicoes de caridade": "DOAÇÃO.png",
  "amparo aos pobres e necessitados": "amparo aos pob.png",
  "desburocratizacao da maquina publica": "desburocratização.png",
  "defesa do meio ambiente e causa animal": "causa animal.png",
  "protecao as pessoas com necessidades especificas (pcds)": "DEFICIENTES.png",
  "ipva 1% nacional": "IPVA.png",
  "agronegocio e infraestrutura": "AGRONEGOCIO.png",
  "apoio a pec de armas nuclearess": "NUCLEAR.png",
  "extincao do estatuto do desarmamento": "EXTINCAO.png",
};

/** Palavras-chave para fallback se o ficheiro mapeado não existir no disco. */
export const TITLE_KEYWORD_FALLBACK: Record<string, string[]> = {
  "soberania nacional": ["desenvolvimento", "nacional"],
  "contra o aborto e o comunismo": ["aborto"],
  "seguranca nacional e valorizacao do policial": ["seguranca"],
  "salario digno para professores": ["salario", "digno"],
  "doacao de metade da remuneracao para instituicoes de caridade": ["doacao"],
  "amparo aos pobres e necessitados": ["amparo"],
  "desburocratizacao da maquina publica": ["desburocratiz"],
  "defesa do meio ambiente e causa animal": ["causa", "animal"],
  "protecao as pessoas com necessidades especificas (pcds)": ["deficient"],
  "ipva 1% nacional": ["ipva"],
  "agronegocio e infraestrutura": ["agronegocio"],
  "apoio a pec de armas nuclearess": ["nuclear"],
  "extincao do estatuto do desarmamento": ["extinc"],
};

export type PropostaCardTheme = "green" | "blue" | "mint";

const THEME_BY_INDEX: PropostaCardTheme[] = ["green", "blue", "mint"];

function normalizeTitle(title: string): string {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function encodePropostaAssetPath(filename: string): string {
  return `/uploads/propostas/${encodeURIComponent(filename)}`;
}

export function getPropostaFilename(title: string): string | null {
  return PROPOSTA_IMAGE_FILES[normalizeTitle(title)] ?? null;
}

export function getPropostaImageKeywords(title: string): string[] | null {
  return TITLE_KEYWORD_FALLBACK[normalizeTitle(title)] ?? null;
}

export function getPropostaImage(title: string): string | null {
  const filename = getPropostaFilename(title);
  return filename ? encodePropostaAssetPath(filename) : null;
}

export function getPropostaCardTheme(index: number): PropostaCardTheme {
  return THEME_BY_INDEX[index % THEME_BY_INDEX.length];
}

export function listPropostaImageMap(): Record<string, string> {
  return { ...PROPOSTA_IMAGE_FILES };
}
