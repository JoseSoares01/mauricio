import PageLayout from "@/components/PageLayout";
import InstagramSection from "@/components/InstagramSection";
import AboutPreviewSection from "@/components/AboutPreviewSection";
import NewsImage from "@/components/NewsImage";
import ViewCounter from "@/components/ViewCounter";
import VideoCard from "@/components/VideoCard";
import MobileScrollNudge from "@/components/MobileScrollNudge";
import HeroCarousel from "@/components/HeroCarousel";
import HomeBannerCarousel from "@/components/HomeBannerCarousel";
import { getSiteConfig, formatDate } from "@/lib/site-config";
import { getHomeBannerSlides } from "@/lib/home-banners";
import { getViews, getViewCount } from "@/lib/views";
import { resolvePropostaImages } from "@/lib/proposta-images.server";
import { getBackgroundFocusStyles } from "@/lib/image-focus";
import { computeActionMapStats, getActiveVisits } from "@/lib/action-map";
import Link from "next/link";

export default async function HomePage() {
  const [config, views] = await Promise.all([getSiteConfig(), getViews()]);
  const bannerSlides = getHomeBannerSlides(config);
  const propostaImages = resolvePropostaImages(config.propostas);
  const homeNews = config.news.slice(0, 3);
  const [featuredNews, ...secondaryNews] = homeNews;
  const mapVisits = getActiveVisits(config.actionMap);
  const mapStats = computeActionMapStats(mapVisits);

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
        news={config.news.slice(0, 4)}
        agenda={config.agenda.slice(0, 4)}
        mapVisits={mapVisits.slice(0, 8).map((visit) => ({
          id: visit.id,
          city: visit.city,
          title: visit.title,
        }))}
        mapStats={mapStats}
      />

      <AboutPreviewSection
        logoBlue={config.images.logoBlue}
        logoBlueFocus={config.images.focus?.logoBlue}
        aboutBg={config.images.aboutBg}
        aboutBgFocus={config.images.focus?.aboutBg}
        shortText={config.about.shortText}
        metrics={config.about.metrics}
      />

      {bannerSlides.length > 0 && <HomeBannerCarousel slides={bannerSlides} />}

      {/* News */}
      <section className="home-news-section">
        <div className="container-site">
          <header className="home-news-header">
            <p className="home-news-eyebrow">Atualizações</p>
            <h2 className="home-news-title">Notícias</h2>
            <div className="home-news-rule" aria-hidden="true" />
          </header>

          {featuredNews && (
            <article className="home-news-featured">
              <Link
                href={`/noticias/${featuredNews.id}`}
                className="home-news-featured-media"
                aria-label={featuredNews.title}
              >
                <NewsImage item={featuredNews} alt={featuredNews.title} />
              </Link>
              <div className="home-news-featured-body">
                <div className="home-news-meta">
                  {featuredNews.category?.trim() && (
                    <span className="home-news-category">{featuredNews.category}</span>
                  )}
                  <time className="home-news-date" dateTime={featuredNews.date}>
                    {formatDate(featuredNews.date)}
                  </time>
                  <ViewCounter
                    count={getViewCount(views, "news", featuredNews.id)}
                    className="home-news-views"
                  />
                </div>
                <h3 className="home-news-featured-title">
                  <Link href={`/noticias/${featuredNews.id}`}>{featuredNews.title}</Link>
                </h3>
                <p className="home-news-featured-excerpt">{featuredNews.excerpt}</p>
                <Link href={`/noticias/${featuredNews.id}`} className="home-news-cta">
                  LER NOTÍCIA <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          )}

          {secondaryNews.length > 0 && (
            <div className="home-news-secondary">
              {secondaryNews.map((item) => (
                <article key={item.id} className="home-news-item">
                  <Link
                    href={`/noticias/${item.id}`}
                    className="home-news-item-media"
                    aria-label={item.title}
                  >
                    <NewsImage item={item} alt={item.title} />
                  </Link>
                  <div className="home-news-item-body">
                    <div className="home-news-meta">
                      {item.category?.trim() && (
                        <span className="home-news-category">{item.category}</span>
                      )}
                      <time className="home-news-date" dateTime={item.date}>
                        {formatDate(item.date)}
                      </time>
                      <ViewCounter
                        count={getViewCount(views, "news", item.id)}
                        className="home-news-views"
                      />
                    </div>
                    <h3 className="home-news-item-title">
                      <Link href={`/noticias/${item.id}`}>{item.title}</Link>
                    </h3>
                    <p className="home-news-item-excerpt">{item.excerpt}</p>
                    <Link href={`/noticias/${item.id}`} className="home-news-cta">
                      LER NOTÍCIA <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="home-news-footer">
            <Link href="/noticias" className="btn-primary home-news-all">
              TODAS AS NOTÍCIAS
            </Link>
          </div>
        </div>
      </section>

      {/* Senado / Ação */}
      <section
        className="home-acao-section"
        style={getBackgroundFocusStyles(config.images.senadoBg, config.images.focus?.senadoBg)}
      >
        <div className="home-acao-overlay" aria-hidden="true" />
        <div className="container-site home-acao-inner">
          <p className="home-acao-eyebrow">Presença e atuação</p>
          <h2 className="home-acao-title">{config.senado.title}</h2>
          <p className="home-acao-lead">
            Presente no território e nas causas que importam — presença próxima,
            atuação constante e compromisso com o povo piauiense.
          </p>
          <div className="home-acao-actions">
            <a href={config.senado.accessUrl} className="btn-white home-acao-btn">
              {config.senado.buttonAccess} →
            </a>
            <a href={config.senado.proposicoesUrl} className="btn-yellow home-acao-btn">
              {config.senado.buttonProposicoes} →
            </a>
          </div>
        </div>
      </section>

      {/* Videos */}
      <section className="home-videos-section">
        <div className="container-site">
          <header className="home-videos-header">
            <p className="home-videos-eyebrow">YouTube</p>
            <h2 className="home-videos-title">Vídeos</h2>
            <div className="home-videos-rule" aria-hidden="true" />
          </header>
          <div className="home-videos-grid">
            {config.videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                initialCount={getViewCount(views, "video", video.id)}
              />
            ))}
          </div>
          <div className="home-videos-footer">
            <a
              href={config.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary home-videos-more"
            >
              Ver mais
            </a>
          </div>
        </div>
      </section>

      <InstagramSection config={config} />
    </PageLayout>
  );
}
