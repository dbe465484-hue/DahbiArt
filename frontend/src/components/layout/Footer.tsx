import Image from "next/image";
import Link from "next/link";
import { SocialIconLink } from "@/components/layout/SocialIconLink";
import { ARTIST } from "@/lib/artist";

export function Footer() {
  return (
    <footer className="relative border-t border-stone-800/30 text-white">
      <Image
        src={ARTIST.footerImage}
        alt=""
        fill
        className="object-cover object-center"
        sizes="100vw"
        priority={false}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/75 via-stone-900/88 to-stone-950/95" aria-hidden />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-4 lg:px-8 lg:py-20">
        <div className="lg:col-span-1">
          <p className="font-serif text-xl tracking-wide text-white">{ARTIST.name}</p>
          <p className="mt-2 text-sm text-stone-300">{ARTIST.tagline}</p>
          <div className="mt-5 flex gap-3">
            <SocialIconLink href={ARTIST.social.instagram} type="instagram" />
            <SocialIconLink href={ARTIST.social.facebook} type="facebook" />
            <SocialIconLink href={ARTIST.social.youtube} type="youtube" />
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-200/80">
            Visiter l&apos;atelier
          </h3>
          <p className="text-sm font-medium text-white">{ARTIST.studio.name}</p>
          <p className="mt-2 text-sm text-stone-300">{ARTIST.studio.address}</p>
          <p className="mt-2 text-sm text-stone-300">{ARTIST.studio.phone}</p>
          <a
            href={`mailto:${ARTIST.studio.email}`}
            className="mt-2 inline-block text-sm text-amber-200 hover:underline"
          >
            {ARTIST.studio.email}
          </a>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-200/80">
            Acheter
          </h3>
          <ul className="space-y-2 text-sm text-stone-300">
            <li>
              <Link href="/paintings/available" className="transition hover:text-white">
                Originaux disponibles
              </Link>
            </li>
            <li>
              <Link href="/commission" className="transition hover:text-white">
                Commande sur mesure
              </Link>
            </li>
            <li>
              <Link href="/paintings" className="transition hover:text-white">
                Toutes les peintures
              </Link>
            </li>
            <li>
              <Link href="/collections" className="transition hover:text-white">
                Collections
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium uppercase tracking-widest text-amber-200/80">
            À propos
          </h3>
          <ul className="space-y-2 text-sm text-stone-300">
            <li>
              <Link href="/about" className="transition hover:text-white">
                Qui est {ARTIST.name.split(" ")[0]} ?
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-white">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/classes" className="transition hover:text-white">
                Ateliers
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition hover:text-white">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10">
        <p className="px-4 py-6 text-center text-sm text-stone-400 lg:px-8">
          © {new Date().getFullYear()} {ARTIST.brand} · {ARTIST.location}
        </p>
      </div>
    </footer>
  );
}
