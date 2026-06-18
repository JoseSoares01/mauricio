import { Suspense } from "react";
import type { Metadata } from "next";
import PageLayout from "@/components/PageLayout";
import ActionMapPage from "@/components/action-map/ActionMapPage";
import { getActiveTeresinaVisits, getActiveVisits } from "@/lib/action-map";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Mapa de Atuação",
  description: "Acompanhe visitas, ações e agendas pelo estado do Piauí.",
};

function ActionMapFallback() {
  return (
    <div className="container-site py-32 text-center text-gray-600">Carregando mapa de atuação...</div>
  );
}

export default async function MapaDeAtuacaoPage() {
  const config = await getSiteConfig();
  const visits = getActiveVisits(config.actionMap);
  const teresinaVisits = getActiveTeresinaVisits(config.actionMap);

  return (
    <PageLayout config={config}>
      <Suspense fallback={<ActionMapFallback />}>
        <ActionMapPage
          visits={visits}
          teresinaVisits={teresinaVisits}
          news={config.news}
          siteTitle={config.site.title}
          mapImage={config.actionMap.mapImage || "/uploads/piaui-3d-map-premium.png"}
        />
      </Suspense>
    </PageLayout>
  );
}
