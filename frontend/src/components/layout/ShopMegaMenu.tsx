"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { buildShopMegaMenu } from "@/lib/shop-mega";

type Props = {
  onNavigate?: () => void;
};

export function ShopMegaMenu({ onNavigate }: Props) {
  const { primary, featured } = useMemo(() => buildShopMegaMenu(), []);

  const close = () => onNavigate?.();

  return (
    <div className="grid gap-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] sm:gap-10 lg:gap-14">
      <div>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          Boutique
        </p>
        <ul className="space-y-2.5">
          {primary.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-[0.9375rem] font-medium text-stone-800 transition hover:text-amber-900"
                onClick={close}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {featured.length > 0 && (
        <div className="border-t border-stone-100 pt-8 sm:border-t-0 sm:border-l sm:pl-10 sm:pt-0">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            En vedette
          </p>
          <div className="grid grid-cols-2 gap-2">
            {featured.map((p) => (
              <Link
                key={p.slug}
                href={p.href}
                className="group relative aspect-[4/5] overflow-hidden bg-stone-100"
                onClick={close}
              >
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width:640px) 45vw, 140px"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-900/70 to-transparent px-2 pb-2 pt-6 text-[10px] leading-tight text-white">
                  {p.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
