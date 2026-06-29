import type { Metadata } from "next";
import { ExternalLink, FileText } from "lucide-react";
import PageLayout from "@/components/PageLayout";
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.propostas.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <h2
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}
              >
                {item.title}
              </h2>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--color-text)" }}>
                {item.description}
              </p>

              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="read-more inline-flex items-center gap-1.5 mt-4"
                >
                  Saiba mais
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              )}

              {item.documents && item.documents.length > 0 && (
                <ul className="proposta-docs-list mt-4">
                  {item.documents
                    .filter((doc) => doc.url)
                    .map((doc) => (
                      <li key={`${item.id}-${doc.url}`}>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="proposta-doc-link"
                        >
                          <FileText size={15} aria-hidden="true" />
                          <span>{doc.title || "Documento"}</span>
                        </a>
                      </li>
                    ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
