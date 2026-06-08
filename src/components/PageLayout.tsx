import Header from "./Header";
import Footer from "./Footer";
import type { SiteConfig } from "@/lib/types";

interface PageLayoutProps {
  config: SiteConfig;
  children: React.ReactNode;
  showFlagBar?: boolean;
}

export default function PageLayout({ config, children, showFlagBar = true }: PageLayoutProps) {
  return (
    <>
      {showFlagBar && <div className="flag-bar fixed top-0 left-0 right-0 z-[60]" />}
      <Header menu={config.menu} />
      <main>{children}</main>
      <Footer config={config} />
    </>
  );
}
