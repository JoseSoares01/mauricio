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
        <Image
          src="/uploads/instagram-icon.png"
          alt="Instagram"
          width={70}
          height={48}
          className="h-12 w-auto"
        />
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
