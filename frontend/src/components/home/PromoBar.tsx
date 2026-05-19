"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const messages = [
  {
    text: "Rejoignez la liste et profitez de 5 % sur votre premier achat",
    href: "/join",
  },
  {
    text: "Livraison offerte au Maroc et en Europe sur les originaux",
    href: "/paintings/available",
  },
  {
    text: "Tirages sur toile — nombreuses œuvres vendues disponibles",
    href: "/paintings",
  },
];

export function PromoBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const msg = messages[index];

  return (
    <div className="fixed left-0 right-0 top-0 z-[70] flex h-10 items-center justify-center bg-black px-4">
      <Link
        href={msg.href}
        className="text-xs font-medium uppercase tracking-[0.1em] text-white underline decoration-white/80 underline-offset-4 transition hover:decoration-white sm:text-sm"
      >
        {msg.text}
      </Link>
    </div>
  );
}
