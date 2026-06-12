export const FAVICON_PATHS = {
  tab: "/uploads/favicon-150.png",
  large: "/uploads/favicon-192.png",
  apple: "/uploads/apple-touch-icon.png",
  ico: "/uploads/favicon.ico",
} as const;

export function getFaviconMetadata() {
  return {
    icon: [
      { url: FAVICON_PATHS.tab, sizes: "32x32", type: "image/png" },
      { url: FAVICON_PATHS.large, sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: FAVICON_PATHS.apple, sizes: "180x180", type: "image/png" }],
    shortcut: [FAVICON_PATHS.ico],
  };
}
