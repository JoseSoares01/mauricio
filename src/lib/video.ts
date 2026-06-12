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
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return YOUTUBE_ID_RE.test(id) ? id : null;
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "music.youtube.com"
    ) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

      const parts = url.pathname.split("/").filter(Boolean);
      for (const segment of ["embed", "shorts", "live", "v"]) {
        const index = parts.indexOf(segment);
        if (index >= 0 && parts[index + 1] && YOUTUBE_ID_RE.test(parts[index + 1])) {
          return parts[index + 1];
        }
      }
    }
  } catch {
    const shortMatch = input.match(/youtu\.be\/([\w-]{11})/);
    if (shortMatch) return shortMatch[1];
  }

  return null;
}

function isBareYoutubeId(value: string): boolean {
  return YOUTUBE_ID_RE.test(value.trim());
}

export function getYoutubeUrlFromField(value?: string): string | null {
  const raw = (value || "").trim();
  if (!raw || !extractYoutubeId(raw) || isBareYoutubeId(raw)) return null;

  const normalized = normalizeInput(raw);
  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (
    raw.includes("watch?") ||
    raw.includes("youtu.be/") ||
    raw.includes("youtube.com/")
  ) {
    return normalized.startsWith("https://")
      ? normalized
      : `https://www.youtube.com/${normalized.replace(/^.*youtube\.com\//, "")}`;
  }

  return null;
}

function getStoredWatchUrl(video: VideoItem): string | null {
  return getYoutubeUrlFromField(video.videoFile) || getYoutubeUrlFromField(video.youtubeId);
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
  const watchUrl = getStoredWatchUrl(video);
  if (watchUrl) return watchUrl;

  const youtubeId = resolveYoutubeId(video);
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;

  if (video.videoFile && isDirectVideoFile(video.videoFile)) {
    return normalizeInput(video.videoFile);
  }

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

export function getYoutubeInputValue(video: VideoItem): string {
  return getStoredWatchUrl(video) || video.youtubeId || "";
}

export function mergeYoutubeInput(video: VideoItem, raw: string): VideoItem {
  const value = raw.trim();
  if (!value) {
    const directFile =
      video.videoFile && isDirectVideoFile(video.videoFile) ? video.videoFile : undefined;
    return {
      ...video,
      youtubeId: "",
      videoFile: directFile,
      thumbnail: "",
    };
  }

  const youtubeId = extractYoutubeId(value);
  if (!youtubeId) {
    return { ...video, youtubeId: value, thumbnail: "" };
  }

  const watchUrl = getYoutubeUrlFromField(value);
  const directFile =
    video.videoFile && isDirectVideoFile(video.videoFile) ? video.videoFile : undefined;

  return {
    ...video,
    youtubeId,
    videoFile: watchUrl || directFile,
    thumbnail: getYoutubeThumbnail(youtubeId),
  };
}

export function mergeDirectVideoFile(video: VideoItem, raw: string): VideoItem {
  const value = raw.trim();
  if (!value) {
    return { ...video, videoFile: undefined };
  }

  const youtubeId = extractYoutubeId(value);
  if (youtubeId) {
    return mergeYoutubeInput(video, value);
  }

  return {
    ...video,
    videoFile: value,
    thumbnail: video.thumbnail,
  };
}

export function normalizeVideoItem(video: VideoItem): VideoItem {
  const youtubeId = resolveYoutubeId(video);
  if (!youtubeId) return video;

  const watchUrl = getStoredWatchUrl(video);
  const directFile =
    video.videoFile && isDirectVideoFile(video.videoFile) ? video.videoFile : undefined;

  return {
    ...video,
    youtubeId,
    videoFile: watchUrl || directFile,
    thumbnail: getYoutubeThumbnail(youtubeId),
  };
}

export function normalizeVideos(videos: VideoItem[]): VideoItem[] {
  return videos.map(normalizeVideoItem);
}

export function isVideoClickable(video: VideoItem): boolean {
  return getVideoHref(video) !== "#";
}
