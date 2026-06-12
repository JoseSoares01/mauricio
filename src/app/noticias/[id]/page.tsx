import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageLayout from "@/components/PageLayout";
import FormattedContent from "@/components/FormattedContent";
import { getSiteConfig, formatDate } from "@/lib/site-config";

export default async function NoticiaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const config = await getSiteConfig();
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
        <p className="text-sm text-gray-400 mt-3">{formatDate(news.date)}</p>
        <h1 className="text-3xl font-bold mt-4 mb-6" style={{ color: "var(--color-primary)" }}>
          {news.title}
        </h1>
        <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
          <Image src={news.image} alt={news.title} fill className="object-cover" />
        </div>
        <FormattedContent
          content={news.content}
          className="text-[17px] leading-relaxed"
        />
      </article>
    </PageLayout>
  );
}
