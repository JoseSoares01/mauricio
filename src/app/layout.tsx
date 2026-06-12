import type { Metadata } from "next";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";
import { getFaviconMetadata } from "@/lib/favicon";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  const siteName = config.site.title;
  const description = config.site.description;
  const image = getAbsoluteUrl(config.images.heroPhoto || "/uploads/favicon-192.png");

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    icons: getFaviconMetadata(),
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName,
      title: siteName,
      description,
      images: [{ url: image, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [image],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSiteConfig();
  const themeVars = Object.entries({
    "--color-primary": config.theme.primary,
    "--color-secondary": config.theme.secondary,
    "--color-accent": config.theme.accent,
    "--color-text": config.theme.text,
    "--color-text-light": config.theme.textLight,
    "--color-background": config.theme.background,
    "--color-hero-start": config.theme.heroGradientStart,
    "--color-hero-end": config.theme.heroGradientEnd,
    "--color-footer": config.theme.footerBg,
    "--font-heading": config.theme.fontHeading,
    "--font-body": config.theme.fontBody,
  })
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  return (
    <html lang="pt-BR">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeVars} }` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
