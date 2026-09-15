import PageLayout from "@/components/PageLayout";
import AgendaCalendar from "@/components/AgendaCalendar";
import { getSiteConfig } from "@/lib/site-config";

export default async function AgendaPage() {
  const config = await getSiteConfig();

  return (
    <PageLayout config={config}>
      <section className="agenda-hero">
        <div className="container-site agenda-hero-inner">
          <p className="agenda-hero-label">Presença pública</p>
          <h1 className="agenda-hero-title">Agenda</h1>
          <div className="agenda-hero-rule" aria-hidden="true" />
          <p className="agenda-hero-desc">
            Compromissos, encontros e ações em curso — a agenda de presença e
            atuação pública de {config.site.title}.
          </p>
        </div>
      </section>

      <section className="agenda-listing">
        <div className="container-site">
          <AgendaCalendar events={config.agenda} />
        </div>
      </section>
    </PageLayout>
  );
}
