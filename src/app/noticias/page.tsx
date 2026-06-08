import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import { getSiteConfig, formatDate } from "@/lib/site-config";

export default async function NoticiasPage() {
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
          <h1 className="section-title">Notícias</h1>
        </div>
      </section>

      <section className="container-site py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {config.news.map((item) => (
            <article key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="p-6">
                <span className="text-xs font-medium px-2 py-1 rounded" style={{ backgroundColor: "var(--color-accent)", color: "var(--color-primary)" }}>
                  {item.category}
                </span>
                <p className="text-xs text-gray-400 mt-2">{formatDate(item.date)}</p>
                <h3 className="text-lg font-semibold mt-2 mb-2" style={{ color: "var(--color-primary)" }}>
                  <Link href={`/noticias/${item.id}`}>{item.title}</Link>
                </h3>
                <p className="text-sm text-gray-600">{item.excerpt}</p>
                <Link href={`/noticias/${item.id}`} className="read-more inline-block mt-3">
                  Leia mais
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
