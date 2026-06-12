import { unstable_noStore as noStore } from "next/cache";
import type { InstagramPost, SiteConfig } from "./types";

const FB_GRAPH = "https://graph.facebook.com/v21.0";
const IG_GRAPH = "https://graph.instagram.com";

interface IgMedia {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
}

type GraphHost = "facebook" | "instagram";

async function graphFetch(path: string, token: string, host: GraphHost) {
  const base = host === "facebook" ? FB_GRAPH : IG_GRAPH;
  return fetch(`${base}${path}${path.includes("?") ? "&" : "?"}access_token=${token}`, {
    next: { revalidate: 3600 },
  });
}

async function resolveInstagramUserId(token: string, userId: string): Promise<string> {
  const pageId = process.env.INSTAGRAM_PAGE_ID;
  if (!pageId) return userId;

  const res = await graphFetch(
    `/${pageId}?fields=instagram_business_account{id}`,
    token,
    "facebook"
  );
  if (!res.ok) return userId;

  const data = (await res.json()) as { instagram_business_account?: { id?: string } };
  return data.instagram_business_account?.id || userId;
}

async function fetchMediaList(token: string, userId: string, host: GraphHost) {
  const fields =
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
  return graphFetch(`/${userId}/media?fields=${fields}&limit=9`, token, host);
}

async function getMediaImageUrl(
  item: IgMedia,
  token: string,
  host: GraphHost
): Promise<string | null> {
  if (item.media_type === "VIDEO") {
    return item.thumbnail_url || item.media_url || null;
  }

  if (item.media_type === "IMAGE") {
    return item.media_url || null;
  }

  if (item.media_url) return item.media_url;

  const childrenRes = await graphFetch(
    `/${item.id}/children?fields=media_url,media_type,thumbnail_url`,
    token,
    host
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
    const igUserId = await resolveInstagramUserId(token, userId);

    let host: GraphHost = "facebook";
    let res = await fetchMediaList(token, igUserId, host);

    if (!res.ok) {
      host = "instagram";
      res = await fetchMediaList(token, igUserId, host);
    }

    if (!res.ok) {
      console.error("Instagram API error:", res.status, await res.text());
      return config.instagram.posts;
    }

    const data = (await res.json()) as { data?: IgMedia[] };
    if (!data.data?.length) return config.instagram.posts;

    const posts = await Promise.all(
      data.data.map(async (item) => {
        const image = await getMediaImageUrl(item, token, host);
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
