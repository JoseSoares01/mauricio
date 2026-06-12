import type { VideoItem } from "./types";

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

export function extractYoutubeId(value: string): string | null {
  const input = value.trim();
  if (!input) return null;
  if (YOUTUBE_ID_RE.test(input)) return input;

  try {
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return YOUTUBE_ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      const embedIndex = parts.indexOf("embed");
      if (embedIndex >= 0 && parts[embedIndex + 1] && YOUTUBE_ID_RE.test(parts[embedIndex + 1])) {
        return parts[embedIndex + 1];
      }

      const shortsIndex = parts.indexOf("shorts");
      if (shortsIndex >= 0 && parts[shortsIndex + 1] && YOUTUBE_ID_RE.test(parts[shortsIndex + 1])) {
        return parts[shortsIndex + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function resolveYoutubeId(video: VideoItem): string | null {
  return extractYoutubeId(video.youtubeId) || extractYoutubeId(video.videoFile || "");
}

export function isDirectVideoFile(url: string): boolean {
  if (!url || extractYoutubeId(url)) return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) ||
    url.includes("blob.vercel-storage.com") ||
    url.startsWith("/uploads/")
  );
}

export function getYoutubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getVideoHref(video: VideoItem): string {
  const youtubeId = resolveYoutubeId(video);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  if (video.videoFile) return video.videoFile;
  return "#";
}

export function getVideoThumbnail(video: VideoItem): string | null {
  if (video.thumbnail) return video.thumbnail;

  const youtubeId = resolveYoutubeId(video);
  if (youtubeId) return getYoutubeThumbnail(youtubeId);

  return null;
}

export function normalizeVideoItem(video: VideoItem): VideoItem {
  const youtubeId =
    extractYoutubeId(video.youtubeId) ||
    extractYoutubeId(video.videoFile || "") ||
    video.youtubeId;

  if (youtubeId && extractYoutubeId(video.videoFile || "")) {
    return {
      ...video,
      youtubeId,
      videoFile: undefined,
      thumbnail: video.thumbnail || getYoutubeThumbnail(youtubeId),
    };
  }

  if (extractYoutubeId(video.youtubeId)) {
    return {
      ...video,
      youtubeId,
      thumbnail: video.thumbnail || getYoutubeThumbnail(youtubeId),
    };
  }

  return video;
}
