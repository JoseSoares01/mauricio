import Image from "next/image";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import SocialIcons from "@/components/SocialIcons";
import { getSiteConfig, formatDate } from "@/lib/site-config";

export default async function HomePage() {
  const config = await getSiteConfig();

  return (
    <PageLayout config={config}>
      {/* Hero */}
      <section
        className="relative min-h-[98vh] overflow-hidden"
        style={{
          background: `radial-gradient(at top center, var(--color-hero-start) 0%, var(--color-hero-end) 100%)`,
        }}
      >
        <div className="container-site relative pt-24 z-10">
          <div className="flex justify-center pt-4 md:justify-start md:items-center md:min-h-[calc(98vh-6rem)] md:max-w-[50%]">
            <Image
              src={config.images.heroLogo}
              alt={`${config.site.title} - Deputado Federal`}
              width={700}
              height={400}
              className="w-full max-w-[88%] sm:max-w-[82%] md:max-w-[80%] object-contain"
              priority
              unoptimized
            />
          </div>
        </div>
        <Image
          src={config.images.heroPhoto}
          alt={config.site.title}
          width={609}
          height={887}
          className="absolute bottom-0 left-1/2 z-[1] h-[min(54vh,480px)] sm:h-[min(58vh,520px)] w-auto max-w-[95%] -translate-x-1/2 object-contain object-bottom pointer-events-none md:left-auto md:right-[6vw] lg:right-[10vw] md:translate-x-0 md:h-[min(96vh,920px)] md:max-w-none"
          priority
          unoptimized
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-20">
          <SocialIcons social={config.social} />
        </div>
      </section>

      {/* About Preview */}
      <section style={{ backgroundColor: "var(--color-primary)" }} className="min-h-[660px]">
        <div className="container-site grid md:grid-cols-2 items-center min-h-[660px]">
          <div className="py-12 md:pr-12">
            <Image
              src={config.images.logoBlue}
              alt="Logo"
              width={500}
              height={280}
              className="w-[60%] md:w-[50%] mb-6"
              unoptimized
            />
            <p className="text-white text-[17px] leading-relaxed mb-6">
              {config.about.shortText}
            </p>
            <Link href="/sobre" className="btn-primary">
              Saiba mais
            </Link>
          </div>
          <div
            className="min-h-[400px] md:min-h-[660px] bg-cover bg-center"
            style={{ backgroundImage: `url(${config.images.aboutBg})` }}
          />
        </div>
      </section>

      {/* Banners */}
      <section className="container-site py-12">
        <div className="grid md:grid-cols-2 gap-4">
          <Image
            src={config.images.banner}
            alt="Banner"
            width={900}
            height={300}
            className="w-full rounded-lg"
          />
          <Image
            src={config.images.bannerSecondary || config.images.aboutBg}
            alt="Banner 2"
            width={900}
            height={300}
            className="w-full rounded-lg object-cover"
            unoptimized
          />
        </div>
      </section>

      {/* News */}
      <section className="container-site py-16">
        <h2 className="section-title mb-10">Notícias</h2>
        <div className="max-w-4xl mx-auto">
          {config.news.slice(0, 3).map((item) => (
            <article key={item.id} className="news-card">
              <p className="date">{formatDate(item.date)}</p>
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
        style={{ backgroundImage: `url(${config.images.senadoBg})` }}
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
            <a
              key={video.id}
              href={video.videoFile ? video.videoFile : `https://youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
                {video.videoFile ? (
                  <video src={video.videoFile} className="w-full h-full object-cover" />
                ) : (
                  <Image
                    src={video.thumbnail || `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
                    alt={video.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium" style={{ color: "var(--color-primary)" }}>
                {video.title}
              </p>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href={config.social.youtube} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Ver mais...
          </a>
        </div>
      </section>

      {/* Instagram */}
      <section className="container-site py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <h2 className="text-[40px] font-semibold" style={{ color: "var(--color-primary)", fontFamily: "Roboto, sans-serif" }}>
            INSTAGRAM
          </h2>
        </div>
        <h3 className="text-center text-xl mb-6" style={{ color: "var(--color-primary)" }}>
          @{config.instagram.username}
        </h3>
        <div className="instagram-grid max-w-3xl mx-auto">
          {config.instagram.posts.map((post) => (
            <a
              key={post.id}
              href={config.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square group overflow-hidden"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2">
                <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity line-clamp--2">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <a href={config.social.instagram} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Seguir no Instagram
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
