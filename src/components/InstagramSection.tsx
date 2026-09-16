import Image from "next/image";
import type { SiteConfig } from "@/lib/types";
import { getInstagramPosts } from "@/lib/instagram";
import FocusedImage from "@/components/FocusedImage";

interface InstagramSectionProps {
  config: SiteConfig;
}

export default async function InstagramSection({ config }: InstagramSectionProps) {
  const posts = await getInstagramPosts(config);
  const profileUrl = config.social.instagram;

  return (
    <section className="home-instagram-section">
      <div className="container-site home-instagram-inner">
        <header className="home-instagram-header">
          <div className="home-instagram-brand">
            <Image
              src="/uploads/instagram-icon.png"
              alt=""
              width={48}
              height={48}
              className="home-instagram-icon"
            />
            <h2 className="home-instagram-title">INSTAGRAM</h2>
          </div>
          <div className="home-instagram-rule" aria-hidden="true" />
          <h3 className="home-instagram-handle">@{config.instagram.username}</h3>
        </header>

        <div className="instagram-grid home-instagram-grid">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink || profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="home-instagram-shot group"
            >
              <FocusedImage
                src={post.image}
                alt={post.caption || "Post do Instagram"}
                fill
                focus={post}
                className="home-instagram-shot-img object-cover"
                unoptimized
              />
              <div className="home-instagram-shot-overlay">
                <p className="home-instagram-shot-caption">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="home-instagram-cta-wrap">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary home-instagram-cta"
          >
            Seguir no Instagram
          </a>
        </div>
      </div>

      <div className="home-instagram-footer-bridge" aria-hidden="true">
        <div className="home-instagram-footer-accent" />
      </div>
    </section>
  );
}
