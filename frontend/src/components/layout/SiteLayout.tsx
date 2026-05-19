"use client";

import { usePathname } from "next/navigation";
import { PromoBar } from "@/components/home/PromoBar";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <PromoBar />
      <Header />
      <main className={`flex-1 overflow-x-hidden ${isHome ? "" : "pt-[7.5rem]"}`}>{children}</main>
      <Footer />
    </>
  );
}
