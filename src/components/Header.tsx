"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import type { MenuItem } from "@/lib/types";

interface HeaderProps {
  menu: MenuItem[];
}

const MENU_ACCENTS: Record<string, string> = {
  "/": "color-mix(in srgb, var(--color-secondary) 55%, transparent)",
  "/sobre": "color-mix(in srgb, var(--color-accent) 60%, transparent)",
  "/noticias": "color-mix(in srgb, var(--color-primary) 55%, transparent)",
  "/agenda": "color-mix(in srgb, var(--color-secondary) 55%, transparent)",
  "/mapa-de-atuacao": "color-mix(in srgb, var(--color-primary) 55%, transparent)",
  "/contato": "color-mix(in srgb, var(--color-accent) 60%, transparent)",
};

const MENU_INDICATOR =
  "absolute bottom-0 left-0 right-0 h-[3px] rounded-full transition-opacity duration-500 ease-in-out";

function isMenuActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header({ menu }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-[10px] left-0 right-0 z-50">
      <nav className="container-site flex items-center justify-end py-3 sm:py-4">
        <ul className="hidden md:flex gap-8 list-none m-0 p-0">
          {menu.map((item) => {
            const active = isMenuActive(pathname, item.href);
            const accent = MENU_ACCENTS[item.href] ?? "var(--color-primary)";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="relative inline-flex flex-col items-center text-white font-medium text-[15px] hover:opacity-80 transition-opacity drop-shadow pb-2"
                >
                  {item.label}
                  <span
                    className={MENU_INDICATOR}
                    style={{
                      backgroundColor: accent,
                      opacity: active ? 0.85 : 0,
                    }}
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className={`hamburger-btn md:hidden ${open ? "is-active" : ""}`}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <span className="hamburger-bar hamburger-bar--top" />
          <span className="hamburger-bar hamburger-bar--mid" />
          <span className="hamburger-bar hamburger-bar--bot" />
        </button>
      </nav>

      {open && (
        <div className="md:hidden bg-[var(--color-primary)] mx-4 rounded-lg shadow-lg">
          <ul className="flex flex-col list-none m-0 p-4 gap-1">
            {menu.map((item) => {
              const active = isMenuActive(pathname, item.href);
              const accent = MENU_ACCENTS[item.href] ?? "var(--color-primary)";

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="relative inline-flex flex-col text-white font-medium py-2 pb-3"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                    <span
                      className={`${MENU_INDICATOR} bottom-1`}
                      style={{
                        backgroundColor: accent,
                        opacity: active ? 0.85 : 0,
                      }}
                      aria-hidden
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}
