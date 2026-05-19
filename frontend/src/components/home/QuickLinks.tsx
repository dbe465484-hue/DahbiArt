import Link from "next/link";

const links = [
  {
    href: "/paintings/available",
    title: "Originaux disponibles",
    subtitle: "40+ peintures",
  },
  {
    href: "/collections/petits-formats",
    title: "Petits formats",
    subtitle: "Moins de 600 €",
  },
  {
    href: "/collections/figures-symboliques",
    title: "Figures symboliques",
    subtitle: "Silhouettes & symbolisme",
  },
];

export function QuickLinks() {
  return (
    <section id="collections" className="border-b border-stone-200 bg-white py-4">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-stone-200 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group px-6 py-8 text-center transition hover:bg-stone-50"
          >
            <h3 className="font-serif text-lg text-stone-900 group-hover:text-amber-800">
              {link.title}
            </h3>
            <p className="mt-1 text-sm text-stone-500">{link.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
