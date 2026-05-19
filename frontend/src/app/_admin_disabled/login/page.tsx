"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const inputClass =
  "w-full border border-stone-300 bg-white px-4 py-3 text-sm focus:border-stone-900 focus:outline-none";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, logout, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.replace("/admin");
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        logout();
        setError("Accès réservé aux administrateurs.");
        return;
      }
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <p className="text-sm text-stone-500">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 px-4">
      <div className="w-full max-w-md border border-stone-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-800">Mayn</p>
        <h1 className="mt-2 font-serif text-3xl text-stone-900">Administration</h1>
        <p className="mt-2 text-sm text-stone-500">Connectez-vous avec un compte administrateur.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p className="rounded bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-stone-600">
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
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-stone-600">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 py-3 text-sm uppercase tracking-wider text-white hover:bg-amber-950 disabled:opacity-60"
          >
            {loading ? "Connexion…" : "Se connecter"}
          </button>
        </form>

        <Link href="/" className="mt-6 block text-center text-sm text-stone-500 hover:text-stone-900">
          ← Retour au site
        </Link>
      </div>
    </div>
  );
}
