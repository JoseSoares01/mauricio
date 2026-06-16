import Image from "next/image";
import type { NewsItem } from "@/lib/types";
import { getNewsImageObjectPosition } from "@/lib/news-image";

interface NewsImageProps {
  item: Pick<NewsItem, "image" | "imageFocusX" | "imageFocusY">;
  alt: string;
  className?: string;
}

export default function NewsImage({ item, alt, className = "" }: NewsImageProps) {
  return (
    <Image
      src={item.image}
      alt={alt}
      fill
      className={`object-cover ${className}`.trim()}
      style={{ objectPosition: getNewsImageObjectPosition(item) }}
      unoptimized
    />
  );
}
