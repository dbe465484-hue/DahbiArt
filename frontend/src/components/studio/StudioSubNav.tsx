"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type StudioNavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

const links: StudioNavItem[] = [
  { href: "/studio", label: "Accueil", exact: true },
  { href: "/studio/blog", label: "Blog" },
  { href: "/studio/events", label: "Événements" },
];

export function StudioSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation espace artiste"
      className="mb-8 flex flex-wrap gap-2 border-b border-stone-200/90 pb-4"
    >
      {links.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? "bg-amber-900 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-amber-50 hover:text-amber-950"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
