import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import AboutGallery from "@/components/AboutGallery";
import AboutTimeline from "@/components/AboutTimeline";
import { getSiteConfig } from "@/lib/site-config";
import { getImageFocusStyles } from "@/lib/image-focus";

export default async function SobrePage() {
  const config = await getSiteConfig();
  const about = config.about;
  const heading = about.pageHeading?.trim() || config.site.title;
  const introImage =
    about.introImage?.trim() ||
    config.images.heroPhotoOriginal ||
    config.images.heroPhoto;
  const introParagraphs = (about.introText || about.fullText || "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageLayout config={config}>
      <section
        className="about-hero pt-32 pb-14"
        style={{
          background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
        }}
      >
        <div className="container-site text-center">
          {about.pageEyebrow?.trim() && (
            <p className="about-hero-eyebrow">{about.pageEyebrow}</p>
          )}
          <h1 className="section-title">{heading}</h1>
          {about.pageSubtitle?.trim() && (
            <h2 className="about-hero-subtitle">{about.pageSubtitle}</h2>
          )}
        </div>
      </section>

      {(introImage || introParagraphs.length > 0) && (
        <section className="about-intro">
          <div className="container-site about-intro-grid">
            {introImage && (
              <div className="about-intro-photo">
                <Image
                  src={introImage}
                  alt={heading}
                  width={560}
                  height={700}
                  className="w-full h-full object-cover"
                  style={getImageFocusStyles(
                    {
                      imageFocusX: about.introImageFocusX,
                      imageFocusY: about.introImageFocusY,
                      imageZoom: about.introImageZoom,
                    },
                    "cover"
                  )}
                  unoptimized
                  priority
                />
              </div>
            )}
            {introParagraphs.length > 0 && (
              <div className="about-intro-text">
                {introParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {about.showGallery !== false && (
        <AboutGallery
          eyebrow={about.galleryEyebrow}
          title={about.galleryTitle}
          items={about.gallery ?? []}
        />
      )}

      {about.showTimeline !== false && (
        <AboutTimeline
          eyebrow={about.timelineEyebrow}
          title={about.timelineTitle}
          items={about.timeline ?? []}
        />
      )}
    </PageLayout>
  );
}
