import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = { title: "Commande sur mesure" };

export default function CommissionPage() {
  return (
    <>
      <PageHeader
        title="Commande sur mesure"
        description="Une toile unique, pensée pour vous."
      />
      <section className="mx-auto max-w-2xl px-4 py-16 text-stone-700 lg:px-8">
        <p className="leading-relaxed">
          Vous souhaitez immortaliser un lieu, un portrait animalier ou une scène de famille ?
          Dahbi Machrouhi accepte un nombre limité de commandes par an. Le processus commence par
          un échange (email ou visio), puis une esquisse validée avant la réalisation sur toile.
        </p>
        <ul className="mt-8 list-inside list-disc space-y-2 text-sm">
          <li>Délais habituels : 6 à 10 semaines</li>
          <li>Acompte de 40 % à la commande</li>
          <li>Formats du 8×10 au 30×48</li>
          <li>Livraison internationale</li>
        </ul>
        <Link
          href="/contact"
          className="mt-10 inline-block bg-stone-900 px-8 py-3 text-xs uppercase tracking-widest text-white hover:bg-stone-800"
        >
          Demander un devis
        </Link>
      </section>
    </>
  );
}
