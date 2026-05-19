import Link from "next/link";
import type { ReactNode } from "react";

export type KpiItem = {
  label: string;
  value: number | string;
  hint?: string;
  href?: string;
  icon?: ReactNode;
  tone?: "default" | "sky" | "green" | "amber" | "stone";
};

const toneStyles = {
  default: {
    card: "border-stone-200/90 bg-white hover:border-stone-300 hover:shadow-md",
    icon: "bg-stone-100 text-stone-600",
    value: "text-stone-900",
  },
  sky: {
    card: "border-sky-100 bg-gradient-to-br from-sky-50/80 to-white hover:border-sky-200 hover:shadow-md",
    icon: "bg-sky-100 text-sky-700",
    value: "text-sky-900",
  },
  green: {
    card: "border-green-100 bg-gradient-to-br from-green-50/60 to-white hover:border-green-200 hover:shadow-md",
    icon: "bg-green-100 text-green-700",
    value: "text-green-900",
  },
  amber: {
    card: "border-amber-100 bg-gradient-to-br from-amber-50/70 to-white hover:border-amber-200 hover:shadow-md",
    icon: "bg-amber-100 text-amber-800",
    value: "text-amber-950",
  },
  stone: {
    card: "border-stone-200/90 bg-gradient-to-br from-stone-50 to-white hover:border-stone-300 hover:shadow-md",
    icon: "bg-stone-200/80 text-stone-600",
    value: "text-stone-700",
  },
} as const;

function KpiCard({ item }: { item: KpiItem }) {
  const tone = toneStyles[item.tone ?? "default"] ?? toneStyles.default;
  const inner = (
    <div
      className={`group relative flex h-full min-h-[8.75rem] flex-col overflow-hidden rounded-xl border p-5 shadow-sm transition ${tone.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        {item.icon && (
          <span
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}
          >
            {item.icon}
          </span>
        )}
        {item.href && (
          <span className="text-stone-300 transition group-hover:text-sky-500" aria-hidden>
            →
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-500">
        {item.label}
      </p>
      <p className={`mt-1 font-serif text-3xl tabular-nums ${tone.value}`}>{item.value}</p>
      <p className="mt-auto min-h-[1.125rem] pt-1.5 text-xs text-stone-400">
        {item.hint ?? "\u00a0"}
      </p>
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        {inner}
      </Link>
    );
  }

  return <div className="h-full">{inner}</div>;
}

type GridProps = { items: KpiItem[]; columns?: 4 | 6 };

function gridColsClass(columns: 4 | 6) {
  return columns === 4
    ? "sm:grid-cols-2 lg:grid-cols-4"
    : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6";
}

export function AdminKpiGrid({ items, columns = 6 }: GridProps) {
  return (
    <div className={`grid auto-rows-fr gap-4 ${gridColsClass(columns)}`}>
      {items.map((item) => (
        <KpiCard key={item.label} item={item} />
      ))}
    </div>
  );
}

export function AdminKpiSkeleton({
  count = 6,
  columns = 6,
}: {
  count?: number;
  columns?: 4 | 6;
}) {
  return (
    <div className={`grid auto-rows-fr gap-4 ${gridColsClass(columns)}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-h-[8.75rem] animate-pulse rounded-xl bg-stone-200/50" />
      ))}
    </div>
  );
}
