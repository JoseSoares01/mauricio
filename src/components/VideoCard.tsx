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
      <div className="video-card-media">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={video.title}
            fill
            className="video-card-thumb"
            unoptimized={thumbnail.startsWith("http")}
          />
        ) : directVideo ? (
          <video
            src={video.videoFile}
            preload="metadata"
            muted
            playsInline
            className="video-card-thumb-video"
          />
        ) : (
          <div className="video-card-placeholder" />
        )}
        <div className="video-card-scrim" aria-hidden="true">
          <span className="video-card-play">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
      </div>
      <div className="video-card-meta">
        <p className="video-card-title">{video.title}</p>
        <ViewCounter count={count} className="video-card-views" />
      </div>
    </>
  );

  if (!clickable) {
    return (
      <div className="video-card video-card--disabled">
        {card}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="video-card group"
      aria-label={`Abrir vídeo: ${video.title}`}
      onClick={handleClick}
    >
      {card}
    </a>
  );
}
