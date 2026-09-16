import PageLayout from "@/components/PageLayout";
import SocialIcons from "@/components/SocialIcons";
import ContactForm from "@/components/ContactForm";
import { getSiteConfig } from "@/lib/site-config";

export default async function ContatoPage() {
  const config = await getSiteConfig();

  return (
    <PageLayout config={config}>
      <section className="contato-hero">
        <div className="container-site contato-hero-inner">
          <p className="contato-hero-label">Canal oficial</p>
          <h1 className="contato-hero-title">{config.contact.title}</h1>
          <div className="contato-hero-rule" aria-hidden="true" />
          <p className="contato-hero-desc">Contato</p>
        </div>
      </section>

      <section className="contato-section">
        <div className="container-site contato-layout">
          <aside className="contato-info" aria-label="Informações de contato">
            <p className="contato-info-label">Informações</p>
            <h2 className="contato-info-title">Fale conosco</h2>
            <div className="contato-info-rule" aria-hidden="true" />
            <p className="contato-info-message">
              Este é o canal oficial para mensagens, pedidos de agenda e
              esclarecimentos junto à equipe de {config.site.title}. Sua
              mensagem será recebida com atenção e seriedade.
            </p>

            <dl className="contato-details">
              <div className="contato-detail">
                <dt>E-mail</dt>
                <dd>
                  <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
                </dd>
              </div>
              <div className="contato-detail">
                <dt>Telefone</dt>
                <dd>{config.contact.phone}</dd>
              </div>
              <div className="contato-detail">
                <dt>Localização</dt>
                <dd>{config.contact.address}</dd>
              </div>
            </dl>

            <div className="contato-social">
              <p className="contato-social-label">Redes sociais</p>
              <SocialIcons social={config.social} variant="footer" />
            </div>
          </aside>

          <div className="contato-form-panel">
            <p className="contato-form-label">Mensagem</p>
            <h2 className="contato-form-title">Envie sua mensagem</h2>
            <div className="contato-form-rule" aria-hidden="true" />
            <ContactForm
              recipientEmail={config.contact.email}
              siteTitle={config.site.title}
            />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
