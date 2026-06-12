import type { VideoItem } from "./types";

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

export function normalizeInput(value: string): string {
  const input = value.trim();
  if (!input) return "";

  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }

  if (input.startsWith("watch?") || input.startsWith("www.youtube.com/")) {
    return `https://www.youtube.com/${input.replace(/^www\.youtube\.com\//, "")}`;
  }

  if (input.includes("youtube.com/") || input.includes("youtu.be/")) {
    return `https://${input.replace(/^\/+/, "")}`;
  }

  return input;
}

export function extractYoutubeId(value: string): string | null {
  const input = normalizeInput(value);
  if (!input) return null;
  if (YOUTUBE_ID_RE.test(input)) return input;

  const vParamMatch = input.match(/(?:^|[?&])v=([\w-]{11})/);
  if (vParamMatch) return vParamMatch[1];

  try {
    const url = new URL(input);
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

function getYoutubeUrlFromField(value?: string): string | null {
  const input = normalizeInput(value || "");
  if (!input || !extractYoutubeId(input)) return null;
  return input.startsWith("http") ? input : `https://${input}`;
}

export function resolveYoutubeId(video: VideoItem): string | null {
  return (
    extractYoutubeId(video.videoFile || "") ||
    extractYoutubeId(video.youtubeId)
  );
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
  const youtubeUrl = getYoutubeUrlFromField(video.videoFile);
  if (youtubeUrl) return youtubeUrl;

  const youtubeId = extractYoutubeId(video.youtubeId);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;

  if (video.videoFile) return normalizeInput(video.videoFile);
  return "#";
}

export function getVideoThumbnail(video: VideoItem): string | null {
  const youtubeId = resolveYoutubeId(video);
  if (youtubeId) return getYoutubeThumbnail(youtubeId);

  if (video.thumbnail && !video.thumbnail.includes("img.youtube.com")) {
    return video.thumbnail;
  }

  return null;
}

export function normalizeVideoItem(video: VideoItem): VideoItem {
  const youtubeFileUrl = getYoutubeUrlFromField(video.videoFile);
  const fromFile = youtubeFileUrl ? extractYoutubeId(youtubeFileUrl) : null;
  const fromId = extractYoutubeId(video.youtubeId);
  const youtubeId = fromFile || fromId;

  if (!youtubeId) return video;

  const directFile =
    video.videoFile && isDirectVideoFile(video.videoFile) ? video.videoFile : undefined;

  return {
    ...video,
    youtubeId,
    videoFile: youtubeFileUrl || directFile,
    thumbnail: getYoutubeThumbnail(youtubeId),
  };
}

export function normalizeVideos(videos: VideoItem[]): VideoItem[] {
  return videos.map(normalizeVideoItem);
}
