import Image from "next/image";
import Link from "next/link";
import type { SiteConfig } from "@/lib/types";
import SocialIcons from "./SocialIcons";

interface FooterProps {
  config: SiteConfig;
}

export default function Footer({ config }: FooterProps) {
  const footerLogo = config.images.logoBlue || config.images.heroLogo;

  return (
    <footer className="site-footer" style={{ backgroundColor: "var(--color-footer)" }}>
      <div className="container-site py-10 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-5 max-w-xl">
            {footerLogo && (
              <Link href="/" className="inline-flex">
                <Image
                  src={footerLogo}
                  alt={config.site.title}
                  width={280}
                  height={90}
                  className="h-16 md:h-20 w-auto object-contain object-left"
                  unoptimized
                />
              </Link>
            )}
            <div className="space-y-2 text-sm text-white/90 leading-relaxed">
              {config.contact.address && (
                <p>
                  <span className="font-semibold text-white">Endereço:</span> {config.contact.address}
                </p>
              )}
              {config.contact.phone && (
                <p>
                  <span className="font-semibold text-white">Telefones:</span> {config.contact.phone}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-4 lg:items-end">
            <p
              className="text-xs md:text-sm font-semibold uppercase tracking-wide text-white"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              ACESSE NOSSAS REDES SOCIAIS
            </p>
            <SocialIcons social={config.social} variant="footer" />
          </div>
        </div>

        <div className="site-footer-divider" />

        <p className="text-center text-xs text-white/75 md:text-sm">{config.site.copyright}</p>
      </div>
    </footer>
  );
}
