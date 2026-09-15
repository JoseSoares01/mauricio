import type { Metadata } from "next";
import { Poppins, Red_Hat_Display, Roboto } from "next/font/google";
import "./globals.css";
import { getSiteConfig } from "@/lib/site-config";
import { getFaviconMetadata } from "@/lib/favicon";
import { getAbsoluteUrl, getSiteUrl } from "@/lib/site-url";
import SplashIntro from "@/components/SplashIntro";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-red-hat",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});

function themeFontStack(name: string, role: "heading" | "body"): string {
  const n = name.toLowerCase();
  if (n.includes("poppins")) return "var(--font-poppins), 'Poppins', sans-serif";
  if (n.includes("red hat") || n.includes("redhat")) {
    return "var(--font-red-hat), 'Red Hat Display', sans-serif";
  }
  if (n.includes("roboto")) return "var(--font-roboto), Roboto, sans-serif";
  if (role === "heading") return "var(--font-poppins), 'Poppins', sans-serif";
  return "var(--font-red-hat), 'Red Hat Display', sans-serif";
}

/** Cache curto; invalidado no admin via revalidatePath/revalidateTag. */
export const revalidate = 60;

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
    "--font-heading": themeFontStack(config.theme.fontHeading, "heading"),
    "--font-body": themeFontStack(config.theme.fontBody, "body"),
  })
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");

  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${redHatDisplay.variable} ${roboto.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: `:root { ${themeVars} }` }} />
      </head>
      <body>
        <SplashIntro />
        {children}
      </body>
    </html>
  );
}
