import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import NewsImage from "@/components/NewsImage";
import FormattedContent from "@/components/FormattedContent";
import TrackNewsView from "@/components/TrackNewsView";
import { getSiteConfig, formatDate } from "@/lib/site-config";
import { getViews, getViewCount } from "@/lib/views";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site-url";

function getNewsDescription(excerpt: string, content: string): string {
  const source = excerpt.trim() || content.trim();
  return source
    .replace(/\*\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s+/g, " ")
    .slice(0, 200)
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const config = await getSiteConfig();
  const news = config.news.find((item) => item.id === id);

  if (!news) {
    return { title: "Notícia não encontrada" };
  }

  const description = getNewsDescription(news.excerpt, news.content);
  const imageUrl = getAbsoluteUrl(news.image);
  const pageUrl = `${getSiteUrl()}/noticias/${news.id}`;

  return {
    title: news.title,
    description,
    openGraph: {
      type: "article",
      url: pageUrl,
      title: news.title,
      description,
      siteName: config.site.title,
      publishedTime: news.date,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: news.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: news.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [config, views] = await Promise.all([getSiteConfig(), getViews()]);
  const news = config.news.find((n) => n.id === id);

  if (!news) notFound();

  return (
    <PageLayout config={config}>
      <section
        className="pt-32 pb-8"
        style={{
          background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
        }}
      >
        <div className="container-site">
          <Link href="/noticias" className="text-sm" style={{ color: "var(--color-primary)" }}>
            ← Voltar para Notícias
          </Link>
        </div>
      </section>

      <article className="container-site py-8 max-w-3xl mx-auto">
        <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: "var(--color-accent)" }}>
          {news.category}
        </span>
        <div className="flex items-center gap-3 mt-3">
          <p className="text-sm text-gray-400">{formatDate(news.date)}</p>
          <TrackNewsView id={news.id} initialCount={getViewCount(views, "news", news.id)} />
        </div>
        <h1 className="text-3xl font-bold mt-4 mb-6" style={{ color: "var(--color-primary)" }}>
          {news.title}
        </h1>
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <NewsImage item={news} alt={news.title} />
        </div>
        <FormattedContent
          content={news.content}
          className="text-[17px] leading-relaxed"
        />
      </article>
    </PageLayout>
  );
}
