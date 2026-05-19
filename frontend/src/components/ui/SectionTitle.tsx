import Link from "next/link";

export function SectionTitle({
  eyebrow,
  title,
  href,
  linkLabel = "Voir tout →",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.28em] text-amber-900/80">
            {eyebrow}
          </p>
        )}
        <h2 className="font-serif text-3xl font-light text-stone-900 md:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </div>
      {href && (
        <Link
          href={href}
          className="border-b border-amber-900/40 pb-0.5 text-sm uppercase tracking-[0.14em] text-amber-900 hover:border-amber-900"
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
