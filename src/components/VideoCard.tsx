"use client";

import Image from "next/image";
import { useState, type Dispatch, type SetStateAction } from "react";
import ViewCounter from "@/components/ViewCounter";
import type { VideoItem } from "@/lib/types";
import {
  getVideoHref,
  getVideoThumbnail,
  isDirectVideoFile,
  isVideoClickable,
} from "@/lib/video";

interface VideoCardProps {
  video: VideoItem;
  initialCount: number;
}

function trackVideoView(id: string, setCount: Dispatch<SetStateAction<number>>) {
  fetch("/api/views", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "video", id }),
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data?.count != null) setCount(data.count);
      else setCount((c) => c + 1);
    })
    .catch(() => setCount((c) => c + 1));
}

export default function VideoCard({ video, initialCount }: VideoCardProps) {
  const [count, setCount] = useState(initialCount);
  const thumbnail = getVideoThumbnail(video);
  const href = getVideoHref(video);
  const clickable = isVideoClickable(video);
  const directVideo = video.videoFile && isDirectVideoFile(video.videoFile);

  const handleClick = () => {
    trackVideoView(video.id, setCount);
  };

  const card = (
    <>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-200">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            unoptimized={thumbnail.startsWith("http")}
          />
        ) : directVideo ? (
          <video
            src={video.videoFile}
            preload="metadata"
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <p
          className="text-sm font-medium group-hover:underline flex-1"
          style={{ color: "var(--color-primary)" }}
        >
          {video.title}
        </p>
        <ViewCounter count={count} className="shrink-0 mt-0.5" />
      </div>
    </>
  );

  if (!clickable) {
    return (
      <div className="block opacity-60">
        {card}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer"
      aria-label={`Abrir vídeo: ${video.title}`}
      onClick={handleClick}
    >
      {card}
    </a>
  );
}
