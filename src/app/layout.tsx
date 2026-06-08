import type { Metadata } from "next";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return {
    title: config.site.title,
    description: config.site.description,
    icons: { icon: config.images.favicon },
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
