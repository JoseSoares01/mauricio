import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import NewsImage from "@/components/NewsImage";
import ViewCounter from "@/components/ViewCounter";
import { getSiteConfig, formatDate } from "@/lib/site-config";
import { getViews, getViewCount } from "@/lib/views";
import type { NewsItem } from "@/lib/types";

function NewsMeta({
  item,
  views,
}: {
  item: NewsItem;
  views: Awaited<ReturnType<typeof getViews>>;
}) {
  return (
    <div className="noticias-meta">
      {item.category?.trim() && (
        <span className="noticias-category">{item.category}</span>
      )}
      <time className="noticias-date" dateTime={item.date}>
        {formatDate(item.date)}
      </time>
      <ViewCounter
        count={getViewCount(views, "news", item.id)}
        className="noticias-views"
      />
    </div>
  );
}

export default async function NoticiasPage() {
  const [config, views] = await Promise.all([getSiteConfig(), getViews()]);
  const news = config.news;
  const [featured, ...rest] = news;

  return (
    <PageLayout config={config}>
      <section className="noticias-hero">
        <div className="container-site noticias-hero-inner">
          <p className="noticias-hero-label">Acompanhe</p>
          <h1 className="noticias-hero-title">Notícias e atuação</h1>
          <div className="noticias-hero-rule" aria-hidden="true" />
          <p className="noticias-hero-desc">
            Atualizações, ações e posicionamentos públicos — o acompanhamento da
            trajetória e da atuação política em um só lugar.
          </p>
        </div>
      </section>

      <section className="noticias-listing">
        <div className="container-site">
          {featured && (
            <article className="noticias-featured">
              <Link
                href={`/noticias/${featured.id}`}
                className="noticias-featured-media"
                aria-label={featured.title}
              >
                <NewsImage item={featured} alt={featured.title} />
              </Link>
              <div className="noticias-featured-body">
                <NewsMeta item={featured} views={views} />
                <h2 className="noticias-featured-title">
                  <Link href={`/noticias/${featured.id}`}>{featured.title}</Link>
                </h2>
                <p className="noticias-featured-excerpt">{featured.excerpt}</p>
                <Link
                  href={`/noticias/${featured.id}`}
                  className="noticias-cta"
                >
                  Ler notícia <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          )}

          {rest.length > 0 && (
            <div className="noticias-grid">
              {rest.map((item) => (
                <article key={item.id} className="noticias-item">
                  <Link
                    href={`/noticias/${item.id}`}
                    className="noticias-item-media"
                    aria-label={item.title}
                  >
                    <NewsImage item={item} alt={item.title} />
                  </Link>
                  <div className="noticias-item-body">
                    <NewsMeta item={item} views={views} />
                    <h3 className="noticias-item-title">
                      <Link href={`/noticias/${item.id}`}>{item.title}</Link>
                    </h3>
                    <p className="noticias-item-excerpt">{item.excerpt}</p>
                    <Link href={`/noticias/${item.id}`} className="noticias-cta">
                      Ler notícia <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
