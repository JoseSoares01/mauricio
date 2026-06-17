export interface MapMunicipalityLabel {
  name: string;
  x: number;
  y: number;
  strategic?: boolean;
}

/** Posições calibradas sobre a arte premium 1024×911. */
export const MAP_MUNICIPALITY_LABELS: MapMunicipalityLabel[] = [
  { name: "Parnaíba", x: 68.0, y: 16.5, strategic: true },
  { name: "Buriti dos Lopes", x: 61.5, y: 12.5 },
  { name: "Cocal", x: 56.0, y: 14.0 },
  { name: "Esperantina", x: 75.5, y: 13.5 },
  { name: "Piracuruca", x: 63.5, y: 20.5 },
  { name: "Piripiri", x: 62.0, y: 28.0 },
  { name: "Pedro II", x: 72.0, y: 28.5 },
  { name: "Barras", x: 48.5, y: 22.0 },
  { name: "União", x: 52.5, y: 22.5 },
  { name: "Altos", x: 44.5, y: 36.0 },
  { name: "Teresina", x: 47.0, y: 50.5, strategic: true },
  { name: "Campo Maior", x: 58.5, y: 40.0 },
  { name: "Castelo do Piauí", x: 55.0, y: 44.5 },
  { name: "São Miguel do Tapuio", x: 53.5, y: 48.0 },
  { name: "São Pedro do Piauí", x: 42.0, y: 46.0 },
  { name: "Elesbão Veloso", x: 39.0, y: 50.0 },
  { name: "Valença do Piauí", x: 56.0, y: 52.0 },
  { name: "Regeneração", x: 36.5, y: 44.0 },
  { name: "Floriano", x: 30.0, y: 54.0, strategic: true },
  { name: "Oeiras", x: 12.0, y: 58.0 },
  { name: "Picos", x: 76.0, y: 47.0, strategic: true },
  { name: "Fronteiras", x: 83.0, y: 52.0 },
  { name: "Jaicós", x: 80.5, y: 56.0 },
  { name: "Paulistana", x: 72.5, y: 58.5 },
  { name: "Guadalupe", x: 5.5, y: 65.0 },
  { name: "Uruçuí", x: 8.5, y: 72.0 },
  { name: "Bom Jesus", x: 24.0, y: 71.0, strategic: true },
  { name: "Simplício Mendes", x: 64.5, y: 62.0 },
  { name: "São João do Piauí", x: 58.5, y: 66.0 },
  { name: "Queimada Nova", x: 61.0, y: 69.0 },
  { name: "Dom Inocêncio", x: 55.0, y: 72.0 },
  { name: "Monte Alegre do Piauí", x: 52.0, y: 75.0 },
  { name: "São Raimundo Nonato", x: 54.0, y: 77.5, strategic: true },
  { name: "Caracol", x: 48.0, y: 80.0 },
  { name: "Gilbués", x: 18.0, y: 78.0 },
  { name: "Curimatá", x: 22.0, y: 82.0 },
  { name: "Corrente", x: 10.5, y: 83.5 },
  { name: "Parnaguá", x: 14.0, y: 86.0 },
  { name: "Canto do Buriti", x: 28.5, y: 85.0 },
];

export const MAP_LABEL_ZOOM_THRESHOLD = 1.35;

export function getVisibleMunicipalityLabels(
  labels: MapMunicipalityLabel[],
  zoom: number
): MapMunicipalityLabel[] {
  if (zoom >= MAP_LABEL_ZOOM_THRESHOLD) return labels;
  return labels.filter((label) => label.strategic);
}
