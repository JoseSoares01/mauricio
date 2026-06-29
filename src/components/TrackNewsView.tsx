"use client";

import { useEffect, useState } from "react";
import ViewCounter from "@/components/ViewCounter";

interface TrackNewsViewProps {
  id: string;
  initialCount: number;
  className?: string;
}

export default function TrackNewsView({ id, initialCount, className }: TrackNewsViewProps) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const key = `view-tracked-news-${id}`;
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "news", id }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.count != null) setCount(data.count);
      })
      .catch(() => {});
  }, [id]);

  return <ViewCounter count={count} className={className} />;
}
