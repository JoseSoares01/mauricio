"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SOBRE_SLIDE_KEY, SOBRE_SLIDE_MS, canUseSobreSlide } from "@/lib/mobile-sobre-slide";

/** Entra a página Sobre mim deslizando da direita. */
export default function MobilePageSlideEnter() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("page-sliding", "page-slide-out-left");

    const shouldEnter =
      pathname === "/sobre" &&
      sessionStorage.getItem(SOBRE_SLIDE_KEY) === "1" &&
      canUseSobreSlide();

    sessionStorage.removeItem(SOBRE_SLIDE_KEY);
    if (!shouldEnter) return;

    html.classList.add("page-sliding", "page-slide-in-from-right");
    const id = window.setTimeout(() => {
      html.classList.remove("page-sliding", "page-slide-in-from-right");
    }, SOBRE_SLIDE_MS);

    return () => {
      window.clearTimeout(id);
      html.classList.remove("page-sliding", "page-slide-in-from-right");
    };
  }, [pathname]);

  return null;
}
