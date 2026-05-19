"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { homeBtnPrimary, homeLink } from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";
import { resolvePostLoginPath } from "@/lib/roles";

type Mode = "login" | "register";

const labelClass =
  "mb-1.5 block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-stone-500";

const inputClass =
  "w-full border border-stone-200 bg-[#faf7f2]/50 px-4 py-3 text-sm text-stone-900 transition placeholder:text-stone-400 focus:border-amber-900/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-900/20";

const LOGIN_REDIRECT_HINTS: Record<string, string> = {
  "/checkout": "Connectez-vous pour finaliser votre commande.",
  "/account": "Connectez-vous pour accéder à votre compte.",
  "/wishlist": "Connectez-vous pour retrouver vos favoris.",
};

const REGISTER_REDIRECT_HINTS: Record<string, string> = {
  "/checkout": "Créez un compte pour finaliser votre commande.",
  "/account": "Créez un compte pour gérer vos achats.",
  "/wishlist": "Créez un compte pour enregistrer vos favoris.",
};

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/";
  const { login, register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";
  const redirectHint = isLogin
    ? LOGIN_REDIRECT_HINTS[redirect]
    : REGISTER_REDIRECT_HINTS[redirect];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(email, password);
        router.push(resolvePostLoginPath(user.role, redirect));
      } else {
        await register({
          firstName,
          lastName,
          email,
          password,
          phone: phone || undefined,
        });
        router.push(redirect);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const redirectQuery =
    redirect !== "/" ? `?redirect=${encodeURIComponent(redirect)}` : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {redirectHint && (
        <p
          className="rounded-sm border border-amber-900/15 bg-amber-50/60 px-4 py-3 text-sm text-amber-950"
          role="status"
        >
          {redirectHint}
        </p>
      )}

      {!isLogin && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              Prénom
            </label>
            <input
              id="firstName"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
              placeholder="Prénom"
            />
          </div>
          <div>
            <label htmlFor="lastName" className={labelClass}>
              Nom
            </label>
            <input
              id="lastName"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
              placeholder="Nom"
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="vous@exemple.com"
        />
      </div>

      {!isLogin && (
        <div>
          <label htmlFor="phone" className={labelClass}>
            Téléphone <span className="normal-case tracking-normal text-stone-400">(optionnel)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+212 6 00 00 00 00"
          />
        </div>
      )}

      <div>
        <label htmlFor="password" className={labelClass}>
          Mot de passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete={isLogin ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="••••••••"
        />
        {!isLogin && (
          <p className="mt-1.5 text-xs text-stone-400">Minimum 8 caractères</p>
        )}
      </div>

      {error && (
        <p
          className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full justify-center disabled:opacity-60 ${homeBtnPrimary}`}
      >
        {loading ? "Chargement…" : isLogin ? "Se connecter" : "Créer mon compte"}
      </button>

      <p className="border-t border-stone-100 pt-6 text-center text-sm text-stone-600">
        {isLogin ? (
          <>
            Pas encore de compte ?{" "}
            <Link href={`/register${redirectQuery}`} className={homeLink}>
              S&apos;inscrire
            </Link>
          </>
        ) : (
          <>
            Déjà inscrit ?{" "}
            <Link href={`/login${redirectQuery}`} className={homeLink}>
              Se connecter
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
