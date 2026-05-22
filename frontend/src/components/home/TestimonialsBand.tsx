import Link from "next/link";
import { homeEyebrow, homeLink, homeLinkUnderline } from "@/components/home/home-theme";
import { TESTIMONIALS } from "@/lib/trust-content";

export function TestimonialsBand() {
  return (
    <section className="border-y border-stone-200/80 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className={homeEyebrow}>Collectionneurs</p>
            <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl">
              Ce qu&apos;ils en disent
            </h2>
          </div>
          <Link href="/faq" className={`${homeLink} ${homeLinkUnderline} text-sm`}>
            FAQ achat →
          </Link>
        </div>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li
              key={t.author}
              className="border border-stone-200/80 bg-[#faf7f2] p-8"
            >
              <p className="font-serif text-lg leading-relaxed text-stone-800">
                « {t.quote} »
              </p>
              <footer className="mt-6 border-t border-stone-200/60 pt-4">
                <p className="text-sm font-medium text-stone-900">{t.author}</p>
                <p className="text-xs text-stone-500">
                  {t.role}
                  {t.location ? ` · ${t.location}` : ""}
                </p>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
