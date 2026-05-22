import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { FAQ_SECTIONS } from "@/lib/trust-content";

export const metadata = {
  title: "FAQ — Achat, livraison & authenticité",
  description:
    "Paiement sécurisé, certificat d'authenticité, délais de livraison Maroc et international, retours.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Questions fréquentes" />
      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-8">
        <p className="text-stone-600">
          Tout ce qu&apos;il faut savoir avant d&apos;acquérir une œuvre originale ou un tirage.
          Une question ?{" "}
          <Link href="/contact" className="text-amber-800 underline">
            Contactez l&apos;atelier
          </Link>
          .
        </p>

        <div className="mt-14 space-y-14">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.id} id={section.id}>
              <h2 className="font-serif text-2xl text-stone-900">{section.title}</h2>
              <dl className="mt-6 space-y-8">
                {section.items.map((item) => (
                  <div key={item.q} className="border-b border-stone-100 pb-8 last:border-0">
                    <dt className="font-medium text-stone-900">{item.q}</dt>
                    <dd className="mt-2 leading-relaxed text-stone-600">{item.a}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-sm border border-amber-900/20 bg-[#faf7f2] p-8 text-center">
          <p className="font-serif text-xl text-stone-900">Prêt à acquérir ?</p>
          <p className="mt-2 text-sm text-stone-600">
            Parcourez la galerie et ajoutez une œuvre au panier.
          </p>
          <Link
            href="/paintings"
            className="mt-6 inline-block bg-stone-900 px-8 py-3 text-sm uppercase tracking-widest text-white hover:bg-stone-800"
          >
            Voir la galerie
          </Link>
        </div>
      </section>
    </>
  );
}
