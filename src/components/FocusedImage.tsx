import Image, { type ImageProps } from "next/image";
import { getImageFocusStyles } from "@/lib/image-focus";
import type { ImageFocusSource } from "@/lib/image-focus";

interface FocusedImageProps extends Omit<ImageProps, "style"> {
  focus?: ImageFocusSource | null;
  focusMode?: "cover" | "contain";
  style?: ImageProps["style"];
}

export default function FocusedImage({
  focus,
  focusMode = "cover",
  className = "",
  style,
  ...props
}: FocusedImageProps) {
  const focusStyles = getImageFocusStyles(focus, focusMode);

  return (
    <Image
      {...props}
      className={className}
      style={{ ...focusStyles, ...style }}
    />
  );
}
