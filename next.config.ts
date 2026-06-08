import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./data/site-config.json"],
    "/api/**": ["./data/site-config.json"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cironogueira.com.br" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

export default nextConfig;
