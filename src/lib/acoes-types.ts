export interface AcaoGeocoding {
  query: string;
  resolved: boolean;
  source: string;
  error?: string;
  fallback?: boolean;
}

export interface AcaoRecord {
  id: string;
  tipoMapa: "piaui" | "teresina";
  cidade: string;
  bairro: string | null;
  titulo: string;
  categoria: string;
  descricao: string;
  data: string;
  latitude: number | null;
  longitude: number | null;
  imagem: string | null;
  slug: string | null;
  status: string;
  geocoding: AcaoGeocoding;
}

export type AcaoProcessed = AcaoRecord;
