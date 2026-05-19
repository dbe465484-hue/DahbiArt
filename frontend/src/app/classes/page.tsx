import { PageHeader } from "@/components/ui/PageHeader";

const workshops = [
  { title: "Initiation à l'huile", date: "15 juin 2025", place: "Atelier, Rabat" },
  { title: "Plein air — côte atlantique", date: "6 juillet 2025", place: "Essaouira" },
  { title: "Nature morte florale", date: "20 septembre 2025", place: "Atelier, Rabat" },
];

export const metadata = { title: "Ateliers" };

export default function ClassesPage() {
  return (
    <>
      <PageHeader title="Ateliers & cours" description="Apprenez les bases de la peinture à l'huile avec Dahbi." />
      <section className="mx-auto max-w-2xl px-4 py-16 lg:px-8">
        <ul className="divide-y divide-stone-200">
          {workshops.map((w) => (
            <li key={w.title} className="py-8">
              <h2 className="font-serif text-xl">{w.title}</h2>
              <p className="mt-2 text-sm text-stone-600">{w.date} · {w.place}</p>
              <p className="mt-2 text-sm text-stone-500">Inscriptions par email — places limitées.</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
