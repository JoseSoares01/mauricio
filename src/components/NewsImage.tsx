import FocusedImage from "@/components/FocusedImage";
import type { NewsItem } from "@/lib/types";

interface NewsImageProps {
  item: Pick<NewsItem, "image" | "imageFocusX" | "imageFocusY" | "imageZoom">;
  alt: string;
  className?: string;
}

export default function NewsImage({ item, alt, className = "" }: NewsImageProps) {
  return (
    <FocusedImage
      src={item.image}
      alt={alt}
      fill
      focus={item}
      className={`object-cover ${className}`.trim()}
      unoptimized
    />
  );
}
