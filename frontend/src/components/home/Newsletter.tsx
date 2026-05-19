"use client";

import { useState } from "react";
import { HomeSection } from "./HomeSection";
import { homeEyebrow, homeTitle, homeTitleItalic } from "./home-theme";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setStatus("error");
      return;
    }
    setStatus("ok");
    setEmail("");
  }

  return (
    <HomeSection variant="dark" noTexture className="!border-b-0">
      <div className="mx-auto max-w-2xl text-center">
        <p className={`${homeEyebrow} !text-amber-200/80`}>Liste privée</p>
        <h2 className={`mt-3 ${homeTitle} !text-white`}>
          Soyez les premiers
          <span className={`mt-1 block ${homeTitleItalic} !text-amber-100/90`}>
            informés
          </span>
        </h2>
        <p className="mt-5 text-base leading-relaxed text-stone-300">
          Nouvelles œuvres, offres collectionneurs, invitations aux vernissages et ateliers —
          avant l&apos;annonce publique.
        </p>
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-3 border border-white/10 bg-white/5 p-2 backdrop-blur-sm sm:flex-row"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            className="flex-1 border-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-400/50"
          />
          <button
            type="submit"
            className="bg-amber-100 px-8 py-3.5 text-sm uppercase tracking-[0.12em] text-stone-900 transition hover:bg-white"
          >
            M&apos;inscrire
          </button>
        </form>
        {status === "ok" && (
          <p className="mt-4 text-sm text-amber-200/90">
            Merci ! Vérifiez votre boîte mail pour confirmer.
          </p>
        )}
        {status === "error" && (
          <p className="mt-4 text-sm text-red-300">Une erreur est survenue. Réessayez.</p>
        )}
      </div>
    </HomeSection>
  );
}
