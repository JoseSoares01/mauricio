import Link from "next/link";
import type { SiteConfig } from "@/lib/types";
import SocialIcons from "./SocialIcons";

interface FooterProps {
  config: SiteConfig;
}

export default function Footer({ config }: FooterProps) {
  return (
    <footer style={{ backgroundColor: "var(--color-footer)" }}>
      <div className="container-site py-16 text-center">
        <h2
          className="text-white text-[28px] md:text-[32px] font-semibold mb-8"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ACESSE NOSSAS REDES SOCIAIS
        </h2>
        <SocialIcons social={config.social} variant="footer" />
        <p className="text-white/80 text-sm mt-10">{config.site.copyright}</p>
      </div>
    </footer>
  );
}
