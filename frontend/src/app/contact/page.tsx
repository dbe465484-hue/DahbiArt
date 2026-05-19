"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { ARTIST } from "@/lib/artist";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader title="Contact" description="Écrivez-moi pour une commande, une visite d'atelier ou toute question." />
      <section className="mx-auto max-w-xl px-4 py-16 lg:px-8">
        <div className="mb-10 text-center text-sm text-stone-600">
          <p>{ARTIST.studio.name}</p>
          <p className="mt-2">{ARTIST.studio.address}</p>
          <p className="mt-2">{ARTIST.studio.phone}</p>
          <a href={`mailto:${ARTIST.studio.email}`} className="mt-2 inline-block text-amber-800 hover:underline">
            {ARTIST.studio.email}
          </a>
        </div>
        {sent ? (
          <p className="text-center text-stone-600">Merci ! Votre message a bien été envoyé (simulation).</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="space-y-4"
          >
            <input required name="name" placeholder="Nom" className="w-full border border-stone-300 px-4 py-3 text-sm focus:border-stone-900 focus:outline-none" />
            <input required type="email" name="email" placeholder="Email" className="w-full border border-stone-300 px-4 py-3 text-sm focus:border-stone-900 focus:outline-none" />
            <textarea required name="message" rows={5} placeholder="Message" className="w-full border border-stone-300 px-4 py-3 text-sm focus:border-stone-900 focus:outline-none" />
            <button type="submit" className="w-full bg-stone-900 py-3 text-xs uppercase tracking-widest text-white hover:bg-stone-800">
              Envoyer
            </button>
          </form>
        )}
      </section>
    </>
  );
}
