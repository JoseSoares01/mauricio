import type { Metadata } from "next";
import PageLayout from "@/components/PageLayout";
import PropostaCard from "@/components/PropostaCard";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: "Propostas",
    description: `Conheça as principais propostas e compromissos de ${config.site.title} para o Piauí e o Brasil.`,
  };
}

export default async function PropostasPage() {
  const config = await getSiteConfig();

  return (
    <PageLayout config={config}>
      <section
        className="pt-32 pb-16"
        style={{
          background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
        }}
      >
        <div className="container-site text-center">
          <h1 className="section-title">Propostas</h1>
          <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text)" }}>
            Conheça as principais propostas e compromissos para transformar o Piauí.
          </p>
        </div>
      </section>

      <section className="container-site py-16">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {config.propostas.map((item) => (
            <PropostaCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
