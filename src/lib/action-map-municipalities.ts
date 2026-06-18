export interface MapMunicipalityLabel {
  name: string;
  x: number;
  y: number;
  strategic?: boolean;
}

/** Posições calibradas sobre a arte premium 1024×911. */
export const MAP_MUNICIPALITY_LABELS: MapMunicipalityLabel[] = [
  { name: "Parnaíba", x: 71.8, y: 10.4, strategic: true },
  { name: "Buriti dos Lopes", x: 61.5, y: 14.5 },
  { name: "Cocal", x: 68.5, y: 16.0 },
  { name: "Esperantina", x: 58.5, y: 19.0 },
  { name: "Piracuruca", x: 69.5, y: 20.0 },
  { name: "Piripiri", x: 67.2, y: 24.5 },
  { name: "Pedro II", x: 75.8, y: 28.0 },
  { name: "Barras", x: 58.2, y: 25.8 },
  { name: "União", x: 49.3, y: 32.0 },
  { name: "Altos", x: 56.8, y: 35.8 },
  { name: "Teresina", x: 58.6, y: 38.6, strategic: true },
  { name: "Campo Maior", x: 64.8, y: 29.5 },
  { name: "Castelo do Piauí", x: 79.5, y: 35.5 },
  { name: "São Miguel do Tapuio", x: 74.8, y: 39.5 },
  { name: "São Pedro do Piauí", x: 48.2, y: 41.5 },
  { name: "Elesbão Veloso", x: 58.2, y: 46.5 },
  { name: "Valença do Piauí", x: 74.5, y: 45.0 },
  { name: "Regeneração", x: 48.8, y: 47.5 },
  { name: "Floriano", x: 48.8, y: 52.8, strategic: true },
  { name: "Oeiras", x: 58.8, y: 53.8 },
  { name: "Picos", x: 70.2, y: 51.8, strategic: true },
  { name: "Fronteiras", x: 88.5, y: 51.0 },
  { name: "Jaicós", x: 83.8, y: 56.0 },
  { name: "Paulistana", x: 78.5, y: 60.5 },
  { name: "Guadalupe", x: 37.8, y: 52.0 },
  { name: "Uruçuí", x: 29.5, y: 56.0 },
  { name: "Bom Jesus", x: 30.8, y: 65.0, strategic: true },
  { name: "Simplício Mendes", x: 65.2, y: 61.0 },
  { name: "São João do Piauí", x: 59.8, y: 66.5 },
  { name: "Queimada Nova", x: 69.2, y: 68.2 },
  { name: "Dom Inocêncio", x: 62.8, y: 72.8 },
  { name: "Monte Alegre do Piauí", x: 14.8, y: 73.8 },
  { name: "São Raimundo Nonato", x: 53.0, y: 71.2, strategic: true },
  { name: "Caracol", x: 41.2, y: 73.2 },
  { name: "Gilbués", x: 12.8, y: 77.8 },
  { name: "Curimatá", x: 25.0, y: 75.8 },
  { name: "Corrente", x: 20.2, y: 82.5 },
  { name: "Parnaguá", x: 30.5, y: 83.8 },
  { name: "Canto do Buriti", x: 41.2, y: 65.0 },
];

export const MAP_LABEL_ZOOM_THRESHOLD = 1.35;

export function getVisibleMunicipalityLabels(
  labels: MapMunicipalityLabel[],
  zoom: number
): MapMunicipalityLabel[] {
  if (zoom >= MAP_LABEL_ZOOM_THRESHOLD) return labels;
  return labels.filter((label) => label.strategic);
}
