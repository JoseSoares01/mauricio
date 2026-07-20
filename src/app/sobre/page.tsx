import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import AboutGallery from "@/components/AboutGallery";
import AboutTimeline from "@/components/AboutTimeline";
import { getSiteConfig } from "@/lib/site-config";
import { getImageFocusStyles } from "@/lib/image-focus";

export default async function SobrePage() {
  const config = await getSiteConfig();
  const introParagraphs = config.about.fullText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <PageLayout config={config}>
      <section
        className="about-hero pt-32 pb-14"
        style={{
          background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
        }}
      >
        <div className="container-site text-center">
          <p className="about-hero-eyebrow">Conheça</p>
          <h1 className="section-title">{config.site.title}</h1>
          <h2 className="about-hero-subtitle">Sobre</h2>
        </div>
      </section>

      <section className="about-intro">
        <div className="container-site about-intro-grid">
          <div className="about-intro-photo">
            <Image
              src={config.images.heroPhotoOriginal || config.images.heroPhoto}
              alt={config.site.title}
              width={560}
              height={700}
              className="w-full h-full object-cover"
              style={getImageFocusStyles(config.images.focus?.heroPhoto, "cover")}
              unoptimized
              priority
            />
          </div>
          <div className="about-intro-text">
            {introParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <AboutGallery items={config.about.gallery ?? []} />

      <AboutTimeline
        eyebrow={config.about.timelineEyebrow}
        title={config.about.timelineTitle}
        items={config.about.timeline ?? []}
      />
    </PageLayout>
  );
}
