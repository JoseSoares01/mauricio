import PageLayout from "@/components/PageLayout";
import AgendaCalendar from "@/components/AgendaCalendar";
import { getSiteConfig } from "@/lib/site-config";

export default async function AgendaPage() {
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
          <h1 className="section-title">Agenda</h1>
          <p className="text-lg mt-4 max-w-2xl mx-auto" style={{ color: "var(--color-text)" }}>
            Acompanhe os eventos e compromissos de {config.site.title} na semana e no mês
          </p>
        </div>
      </section>

      <section className="container-site py-16">
        <AgendaCalendar events={config.agenda} />
      </section>
    </PageLayout>
  );
}
