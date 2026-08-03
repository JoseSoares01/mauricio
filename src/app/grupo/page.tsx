import Image from "next/image";
import { getSiteConfig } from "@/lib/site-config";
import Header from "@/components/Header";
import GrupoLeadForm, { GrupoBrandHeader } from "@/components/GrupoLeadForm";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: `Grupo de Apoio | ${config.site.title}`,
    description: config.whatsappGroup?.subtitle || "Entre no grupo de WhatsApp",
  };
}

export default async function GrupoPage() {
  const config = await getSiteConfig();
  const grupo = config.whatsappGroup!;

  if (!grupo.enabled) {
    return (
      <>
        <Header menu={config.menu} />
        <main className="grupo-page" data-reveal-skip>
          <div className="grupo-page-inner grupo-page-disabled">
            <p>Esta página está temporariamente indisponível.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header menu={config.menu} />
      <main className="grupo-page" data-reveal-skip>
        <div className="grupo-page-inner">
          <section className="grupo-content">
            <GrupoBrandHeader config={grupo} />

            <h1 className="grupo-headline">
              <span className="grupo-headline-line">{grupo.headlineBefore}</span>
              <span className="grupo-headline-highlight">{grupo.headlineHighlight}</span>
              <span className="grupo-headline-line">{grupo.headlineAfter}</span>
            </h1>

            <p className="grupo-subtitle">{grupo.subtitle}</p>

            <GrupoLeadForm config={grupo} />

            <p className="grupo-footer-note">{grupo.footerNote}</p>
          </section>

          <div className="grupo-divider" aria-hidden>
            <span className="grupo-divider-green" />
            <span className="grupo-divider-yellow" />
          </div>

          <aside className="grupo-hero" aria-hidden>
            <Image
              src={grupo.desktopHeroImage}
              alt=""
              fill
              className="grupo-hero-img"
              sizes="(min-width: 900px) 55vw, 0px"
              unoptimized
              priority
            />
            <span className="grupo-hero-fade" />
          </aside>
        </div>
      </main>
    </>
  );
}
