import type { ActionVisit, TeresinaVisit } from "./types";
import { getVisitDisplayCoordinate } from "./map-pin-spread";

export const CLUSTER_SOURCE_ID = "acoes-cluster-source";

export function visitsToClusterGeoJSON(
  visits: Array<ActionVisit | TeresinaVisit>,
  spreadCoords: Map<string, { latitude: number; longitude: number }>
) {
  return {
    type: "FeatureCollection" as const,
    features: visits.map((visit) => {
      const coords = getVisitDisplayCoordinate(visit, spreadCoords);
      return {
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [coords.longitude, coords.latitude] as [number, number],
        },
        properties: {
          visitId: visit.id,
          title: visit.title,
          city: "city" in visit ? visit.city : visit.neighborhood,
          category: visit.category,
          date: visit.date,
          excerpt: visit.excerpt,
          image: visit.image || "",
          slug: visit.slug,
        },
      };
    }),
  };
}

/** Camadas clicáveis: apenas agrupamentos (pins usam Marker React). */
export const CLUSTER_LAYER_IDS = ["acoes-clusters", "acoes-cluster-count"] as const;

/** Degradê institucional: amarelo → limão → verde (por densidade do cluster). */
export const CLUSTER_PAINT = {
  clusterColor: [
    "interpolate",
    ["linear"],
    ["get", "point_count"],
    2,
    "#FDCE27",
    8,
    "#C6D92E",
    20,
    "#7CB518",
    40,
    "#129547",
  ] as [
    "interpolate",
    ["linear"],
    ["get", "point_count"],
    number,
    string,
    number,
    string,
    number,
    string,
    number,
    string,
  ],
  clusterRadius: ["step", ["get", "point_count"], 20, 5, 26, 15, 32, 40, 38] as [
    "step",
    ["get", "point_count"],
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ],
  clusterOpacity: 0.94,
  clusterStrokeColor: [
    "interpolate",
    ["linear"],
    ["get", "point_count"],
    2,
    "#F5E06A",
    20,
    "#A8D035",
    40,
    "#0E7A38",
  ] as [
    "interpolate",
    ["linear"],
    ["get", "point_count"],
    number,
    string,
    number,
    string,
    number,
    string,
  ],
};
