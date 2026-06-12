import Image from "next/image";
import type { SiteConfig } from "@/lib/types";
import { getInstagramPosts, isInstagramLiveEnabled } from "@/lib/instagram";

interface InstagramSectionProps {
  config: SiteConfig;
}

export default async function InstagramSection({ config }: InstagramSectionProps) {
  const posts = await getInstagramPosts(config);
  const profileUrl = config.social.instagram;

  return (
    <section className="container-site py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center shrink-0">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
        <h2 className="text-[40px] font-semibold" style={{ color: "var(--color-primary)", fontFamily: "Roboto, sans-serif" }}>
          INSTAGRAM
        </h2>
      </div>
      <h3 className="text-center text-xl mb-6" style={{ color: "var(--color-primary)" }}>
        @{config.instagram.username}
      </h3>
      {isInstagramLiveEnabled() && (
        <p className="text-center text-sm text-gray-500 mb-4">Feed atualizado automaticamente do Instagram</p>
      )}
      <div className="instagram-grid max-w-3xl mx-auto">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.permalink || profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square group overflow-hidden"
          >
            <Image
              src={post.image}
              alt={post.caption || "Post do Instagram"}
              fill
              className="object-cover group-hover:scale-110 transition-transform"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end p-2">
              <p className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity line-clamp-2">
                {post.caption}
              </p>
            </div>
          </a>
        ))}
      </div>
      <div className="text-center mt-8">
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Seguir no Instagram
        </a>
      </div>
    </section>
  );
}
