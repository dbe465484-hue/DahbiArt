import Link from "next/link";
import { collectionOptions } from "@/lib/paintings";
import { PAINTING_TRUST_POINTS } from "@/lib/trust-content";
import {
  resolveShippingZone,
  shippingDelayHint,
  shippingZoneLabel,
} from "@/lib/shipping";
import type { Painting } from "@/lib/types";

type Props = { painting: Painting };

export function PaintingTrustPanel({ painting }: Props) {
  const collectionTitle =
    collectionOptions.find((c) => c.slug === painting.collection)?.title ??
    painting.collection;
  const zone = resolveShippingZone("MA");

  return (
    <div className="mt-10 space-y-8 border-t border-stone-200 pt-10">
      <div>
        <h2 className="font-serif text-xl text-stone-900">À propos de cette œuvre</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          {painting.description}
        </p>
        <dl className="mt-4 grid gap-2 text-sm text-stone-500 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Série</dt>
            <dd>{collectionTitle}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Technique</dt>
            <dd>{painting.medium}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Format</dt>
            <dd>{painting.dimensions}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-stone-400">Année</dt>
            <dd>{painting.year}</dd>
          </div>
        </dl>
      </div>

      <ul className="space-y-2 text-sm text-stone-600">
        {PAINTING_TRUST_POINTS.map((point) => (
          <li key={point} className="flex gap-2">
            <span className="text-amber-800" aria-hidden>
              ✓
            </span>
            {point}
          </li>
        ))}
        <li className="flex gap-2">
          <span className="text-amber-800" aria-hidden>
            ✓
          </span>
          Livraison {shippingZoneLabel(zone)} — {shippingDelayHint(zone)}
        </li>
      </ul>

      <p className="text-sm text-stone-500">
        <Link href="/faq" className="text-amber-800 underline hover:text-amber-950">
          Questions fréquentes (achat, livraison, retours)
        </Link>
      </p>
    </div>
  );
}
