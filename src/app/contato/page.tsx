import PageLayout from "@/components/PageLayout";
import SocialIcons from "@/components/SocialIcons";
import ContactForm from "@/components/ContactForm";
import { getSiteConfig } from "@/lib/site-config";

export default async function ContatoPage() {
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
          <h1 className="section-title">{config.contact.title}</h1>
          <h2 className="text-2xl mt-4" style={{ color: "var(--color-primary)" }}>Contato</h2>
        </div>
      </section>

      <section className="container-site py-16 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="space-y-6 mb-10">
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">E-mail</h3>
              <a href={`mailto:${config.contact.email}`} className="text-lg" style={{ color: "var(--color-primary)" }}>
                {config.contact.email}
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Telefone</h3>
              <p className="text-lg" style={{ color: "var(--color-primary)" }}>{config.contact.phone}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Endereço</h3>
              <p className="text-lg" style={{ color: "var(--color-primary)" }}>{config.contact.address}</p>
            </div>
          </div>

          <ContactForm
            recipientEmail={config.contact.email}
            siteTitle={config.site.title}
          />

          <div className="mt-12 text-center">
            <h3 className="font-semibold mb-4" style={{ color: "var(--color-primary)" }}>
              Redes Sociais
            </h3>
            <SocialIcons social={config.social} variant="footer" />
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
