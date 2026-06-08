import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import { getSiteConfig } from "@/lib/site-config";

export default async function SobrePage() {
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
          <h1 className="section-title">{config.site.title}</h1>
          <h2 className="text-2xl mt-4" style={{ color: "var(--color-primary)" }}>Sobre</h2>
        </div>
      </section>

      <section className="py-16">
        <div className="container-site grid lg:grid-cols-[minmax(320px,38%)_1fr] gap-10 lg:gap-16 items-start">
          <div className="lg:-ml-5">
            <Image
              src={config.images.heroPhotoOriginal || config.images.heroPhoto}
              alt={config.site.title}
              width={500}
              height={625}
              className="rounded-lg w-full"
              unoptimized
            />
          </div>
          <div>
            {config.about.fullText.split("\n\n").map((paragraph, i) => (
              <p key={i} className="text-[17px] leading-relaxed mb-4" style={{ color: "var(--color-text)" }}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
