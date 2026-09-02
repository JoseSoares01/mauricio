import PageLayout from "@/components/PageLayout";
import InstagramSection from "@/components/InstagramSection";
import AboutPreviewSection from "@/components/AboutPreviewSection";
import ViewCounter from "@/components/ViewCounter";
import VideoCard from "@/components/VideoCard";
import FocusedImage from "@/components/FocusedImage";
import MobileScrollNudge from "@/components/MobileScrollNudge";
import HeroCarousel from "@/components/HeroCarousel";
import { getSiteConfig, formatDate, getConfiguredImageUrl } from "@/lib/site-config";
import { getViews, getViewCount } from "@/lib/views";
import { resolvePropostaImages } from "@/lib/proposta-images.server";
import { getBackgroundFocusStyles, getImageFocusStyles } from "@/lib/image-focus";
import Image from "next/image";
import Link from "next/link";

export default async function HomePage() {
  const [config, views] = await Promise.all([getSiteConfig(), getViews()]);
  const bannerLeft = getConfiguredImageUrl(config.images.banner);
  const bannerRight = getConfiguredImageUrl(config.images.bannerSecondary);
  const propostaImages = resolvePropostaImages(config.propostas);

  return (
    <PageLayout config={config}>
      <MobileScrollNudge />
      <HeroCarousel
        siteTitle={config.site.title}
        heroLogo={config.images.heroLogo}
        heroLogoFocus={config.images.focus?.heroLogo}
        heroPhoto={config.images.heroPhoto}
        heroPhotoFocus={config.images.focus?.heroPhoto}
        social={config.social}
        propostas={config.propostas}
        propostaImages={propostaImages}
      />

      <AboutPreviewSection
        logoBlue={config.images.logoBlue}
        logoBlueFocus={config.images.focus?.logoBlue}
        aboutBg={config.images.aboutBg}
        aboutBgFocus={config.images.focus?.aboutBg}
        shortText={config.about.shortText}
        metrics={config.about.metrics}
      />

      {/* Banners */}
      {(bannerLeft || bannerRight) && (
        <section className="container-site py-12">
          <div
            className={`grid gap-4 ${
              bannerLeft && bannerRight ? "md:grid-cols-2" : "max-w-3xl mx-auto"
            }`}
          >
            {bannerLeft && (
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={bannerLeft}
                  alt="Banner MMBus"
                  width={512}
                  height={1024}
                  className="w-full h-auto rounded-lg"
                  style={getImageFocusStyles(config.images.focus?.banner, "cover")}
                  unoptimized
                />
              </div>
            )}
            {bannerRight && (
              <div className="relative aspect-[3/1] overflow-hidden rounded-lg">
                <FocusedImage
                  src={bannerRight}
                  alt="Banner 2"
                  fill
                  focus={config.images.focus?.bannerSecondary}
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* News */}
      <section className="container-site py-16">
        <h2 className="section-title mb-10">Notícias</h2>
        <div className="max-w-4xl mx-auto">
          {config.news.slice(0, 3).map((item) => (
            <article key={item.id} className="news-card">
              <div className="flex items-center gap-3 mb-1">
                <p className="date mb-0">{formatDate(item.date)}</p>
                <ViewCounter count={getViewCount(views, "news", item.id)} />
              </div>
              <h3>
                <Link href={`/noticias/${item.id}`}>{item.title}</Link>
              </h3>
              <p className="excerpt">{item.excerpt}</p>
              <Link href={`/noticias/${item.id}`} className="read-more">
                Leia mais
              </Link>
            </article>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/noticias" className="btn-primary">
            Todas as notícias
          </Link>
        </div>
      </section>

      {/* Senado / Ação */}
      <section
        className="relative min-h-[569px] flex items-center bg-cover bg-center"
        style={getBackgroundFocusStyles(config.images.senadoBg, config.images.focus?.senadoBg)}
      >
        <div className="absolute inset-0 bg-black/35" />
        <div className="container-site relative z-10 py-16">
          <h2 className="text-white text-[40px] md:text-[60px] font-semibold mb-8" style={{ fontFamily: "Roboto, sans-serif" }}>
            {config.senado.title}
          </h2>
          <div className="flex flex-wrap gap-4">
            <a href={config.senado.accessUrl} className="btn-white">
              {config.senado.buttonAccess} →
            </a>
            <a href={config.senado.proposicoesUrl} className="btn-yellow">
              {config.senado.buttonProposicoes} →
            </a>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="container-site py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <h2 className="text-[40px] font-semibold" style={{ color: "var(--color-primary)", fontFamily: "Roboto, sans-serif" }}>
            VÍDEOS
          </h2>
        </div>
        <div className="video-grid">
          {config.videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              initialCount={getViewCount(views, "video", video.id)}
            />
          ))}
        </div>
        <div className="text-center mt-8">
          <a href={config.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Ver mais...
          </a>
        </div>
      </section>

      <InstagramSection config={config} />
    </PageLayout>
  );
}
