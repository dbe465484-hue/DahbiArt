import { PageHeader } from "@/components/ui/PageHeader";

const faqs = [
  {
    q: "Comment est expédiée une toile originale ?",
    a: "Chaque œuvre est emballée professionnellement (carton renforcé ou caisse bois pour les grands formats). Livraison suivie.",
  },
  {
    q: "Proposez-vous des tirages ?",
    a: "Oui, pour de nombreuses œuvres vendues. Les tirages sur toile sont imprimés sur demande.",
  },
  {
    q: "Puis-je visiter l'atelier ?",
    a: "Sur rendez-vous, lors des portes ouvertes ou en contactant l'artiste par email.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Carte bancaire et virement (intégration paiement à venir sur ce site de démonstration).",
  },
];

export const metadata = { title: "FAQ" };

export default function FaqPage() {
  return (
    <>
      <PageHeader title="Questions fréquentes" />
      <section className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <dl className="space-y-8">
          {faqs.map((item) => (
            <div key={item.q}>
              <dt className="font-medium text-stone-900">{item.q}</dt>
              <dd className="mt-2 text-stone-600">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
