import type { Metadata } from "next";
import PageLayout from "@/components/PageLayout";
import PropostasCatalog from "@/components/PropostasCatalog";
import { getSiteConfig } from "@/lib/site-config";
import { getPropostaCardTheme } from "@/lib/proposta-images";
import { resolvePropostaImage } from "@/lib/proposta-images.server";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Propostas",
    description: `Conheça as principais propostas e compromissos de ${config.site.title} para o Piauí e o Brasil.`,
  };
}

export default async function PropostasPage() {
  const config = await getSiteConfig();
  const catalogItems = config.propostas.map((item, index) => ({
    item,
    index,
    imageSrc: resolvePropostaImage(item.title),
    theme: getPropostaCardTheme(index),
  }));

  return (
    <PageLayout config={config}>
      <section className="propostas-hero">
        <div className="container-site propostas-hero-inner">
          <p className="propostas-hero-label">Compromissos</p>
          <h1 className="propostas-hero-title">Propostas</h1>
          <div className="propostas-hero-rule" aria-hidden="true" />
          <p className="propostas-hero-desc">
            Conheça as principais propostas e compromissos para transformar o Piauí.
          </p>
        </div>
      </section>

      <section className="propostas-grid-section">
        <div className="container-site">
          <PropostasCatalog items={catalogItems} />
        </div>
      </section>
    </PageLayout>
  );
}
