import { NextRequest, NextResponse } from "next/server";
import { PIAUI_BOUNDS } from "@/lib/action-map";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const adminToken = request.headers.get("x-admin-token");
  if (!adminToken) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const city = request.nextUrl.searchParams.get("city")?.trim();
  if (!city) {
    return NextResponse.json({ error: "Informe o nome da cidade" }, { status: 400 });
  }

  const mapboxToken =
    process.env.MAPBOX_ACCESS_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!mapboxToken) {
    return NextResponse.json({ error: "Token Mapbox não configurado" }, { status: 503 });
  }

  const [[west, south], [east, north]] = PIAUI_BOUNDS;
  const query = encodeURIComponent(`${city}, Piauí, Brasil`);
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json` +
    `?access_token=${mapboxToken}&bbox=${west},${south},${east},${north}` +
    "&limit=1&country=br&language=pt&types=place,locality,district";

  try {
    const response = await fetch(url, { next: { revalidate: 0 } });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Falha na geocodificação" },
        { status: response.status }
      );
    }

    const feature = data.features?.[0];
    if (!feature?.center) {
      return NextResponse.json(
        { error: "Cidade não encontrada no Piauí. Verifique o nome e tente novamente." },
        { status: 404 }
      );
    }

    const [longitude, latitude] = feature.center as [number, number];
    return NextResponse.json({
      latitude,
      longitude,
      placeName: feature.place_name as string,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar o Mapbox" }, { status: 502 });
  }
}
