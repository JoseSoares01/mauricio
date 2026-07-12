import type { ActionVisit, TeresinaVisit } from "./types";

export const CLUSTER_SOURCE_ID = "acoes-cluster-source";

export function visitsToClusterGeoJSON(visits: Array<ActionVisit | TeresinaVisit>) {
  return {
    type: "FeatureCollection" as const,
    features: visits.map((visit) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [visit.longitude, visit.latitude] as [number, number],
      },
      properties: {
        visitId: visit.id,
        title: "title" in visit ? visit.title : "",
        city: "city" in visit ? visit.city : "neighborhood" in visit ? visit.neighborhood : "",
        category: visit.category,
        date: visit.date,
        excerpt: visit.excerpt,
        image: visit.image || "",
        slug: visit.slug,
      },
    })),
  };
}

export const CLUSTER_LAYER_IDS = [
  "acoes-clusters",
  "acoes-cluster-count",
  "acoes-unclustered-point",
] as const;

export const CLUSTER_PAINT = {
  clusterColor: "#6E8B3D",
  clusterRadius: ["step", ["get", "point_count"], 18, 5, 24, 15, 30, 40, 36] as [
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
  clusterOpacity: 0.88,
  pointColor: "#129547",
  pointRadius: 8,
};
