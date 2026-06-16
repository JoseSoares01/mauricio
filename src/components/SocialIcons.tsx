import Image from "next/image";
import type { SiteConfig } from "@/lib/types";

interface SocialIconsProps {
  social: SiteConfig["social"];
  variant?: "hero" | "footer";
}

export default function SocialIcons({ social, variant = "hero" }: SocialIconsProps) {
  const iconSize = variant === "footer" ? 22 : 38;
  const svgSize = variant === "footer" ? 22 : iconSize * 0.5;

  const icons = [
    {
      name: "Instagram",
      url: social.instagram,
      bg: "transparent",
      icon:
        variant === "footer" ? (
          <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ) : (
          <Image
            src="/uploads/instagram-icon.png"
            alt=""
            width={iconSize}
            height={iconSize}
            className="rounded-full object-cover w-full h-full"
          />
        ),
    },
    {
      name: "Facebook",
      url: social.facebook,
      bg: "#1877F2",
      icon: (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: "X",
      url: social.twitter,
      bg: "#000000",
      icon: (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: "Youtube",
      url: social.youtube,
      bg: "#FF0000",
      icon: (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
    },
    {
      name: "Tiktok",
      url: social.tiktok,
      bg: "#000000",
      icon: (
        <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="white">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 2.05 2.76 3.77 2.28.96-.26 1.76-1.04 2.03-2.01.07-.29.1-.59.1-.89V.02z"/>
        </svg>
      ),
    },
  ];

  if (variant === "footer") {
    return (
      <div className="footer-social-icons">
        {icons.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-social-icon"
            aria-label={item.name}
          >
            {item.icon}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="social-bar">
      {icons.map((item) => (
        <a
          key={item.name}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon rounded-full"
          style={{ background: item.bg }}
          aria-label={item.name}
        >
          <span className="flex items-center justify-center w-full h-full">{item.icon}</span>
        </a>
      ))}
    </div>
  );
}
