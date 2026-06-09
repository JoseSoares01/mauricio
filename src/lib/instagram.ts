import { unstable_noStore as noStore } from "next/cache";
import type { InstagramPost, SiteConfig } from "./types";

interface IgMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
}

async function getMediaImageUrl(item: IgMedia, token: string): Promise<string | null> {
  if (item.media_type === "VIDEO") {
    return item.thumbnail_url || item.media_url || null;
  }

  if (item.media_type === "IMAGE") {
    return item.media_url || null;
  }

  if (item.media_url) return item.media_url;

  const childrenRes = await fetch(
    `https://graph.instagram.com/${item.id}/children?fields=media_url,media_type,thumbnail_url&access_token=${token}`,
    { next: { revalidate: 3600 } }
  );

  if (!childrenRes.ok) return null;

  const children = (await childrenRes.json()) as { data?: IgMedia[] };
  const first = children.data?.[0];
  if (!first) return null;

  return first.media_type === "VIDEO"
    ? first.thumbnail_url || first.media_url || null
    : first.media_url || null;
}

export async function getInstagramPosts(config: SiteConfig): Promise<InstagramPost[]> {
  noStore();

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return config.instagram.posts;
  }

  try {
    const res = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=9&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error("Instagram API error:", res.status, await res.text());
      return config.instagram.posts;
    }

    const data = (await res.json()) as { data?: IgMedia[] };
    if (!data.data?.length) return config.instagram.posts;

    const posts = await Promise.all(
      data.data.map(async (item) => {
        const image = await getMediaImageUrl(item, token);
        if (!image) return null;

        const post: InstagramPost = {
          id: item.id,
          image,
          caption: item.caption || "",
        };
        if (item.permalink) post.permalink = item.permalink;
        return post;
      })
    );

    const livePosts = posts.filter((post) => post !== null);
    return livePosts.length > 0 ? livePosts : config.instagram.posts;
  } catch (error) {
    console.error("Falha ao buscar posts do Instagram:", error);
    return config.instagram.posts;
  }
}

export function isInstagramLiveEnabled(): boolean {
  return !!(process.env.INSTAGRAM_ACCESS_TOKEN && process.env.INSTAGRAM_USER_ID);
}
