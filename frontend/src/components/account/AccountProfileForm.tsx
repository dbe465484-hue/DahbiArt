"use client";

import { useEffect, useState } from "react";
import { homeBtnPrimary } from "@/components/home/home-theme";
import {
  accountCardClass,
  accountInputClass,
  accountLabelClass,
} from "@/components/account/account-form-styles";
import { useAuth } from "@/context/AuthContext";
import type { AuthUser } from "@/lib/api";
import { ApiError } from "@/lib/api";

const COUNTRIES = [
  { code: "MA", label: "Maroc" },
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "ES", label: "Espagne" },
  { code: "US", label: "États-Unis" },
] as const;

function toFormState(user: AuthUser) {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone ?? "",
    address: user.address ?? "",
    postalCode: user.postalCode ?? "",
    city: user.city ?? "",
    country: user.country || "MA",
  };
}

export function AccountProfileForm() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => (user ? toFormState(user) : null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) setForm(toFormState(user));
  }, [user]);

  if (!user || !form) return null;

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSuccess(false);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        address: form.address || undefined,
        postalCode: form.postalCode || undefined,
        city: form.city || undefined,
        country: form.country,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={accountCardClass}>
      <header className="mb-6 border-b border-stone-100 pb-6">
        <h2 className="font-serif text-xl text-stone-900">Informations personnelles</h2>
        <p className="mt-1 text-sm text-stone-500">
          Modifiez vos coordonnées et votre adresse de livraison.
        </p>
      </header>

      <div className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="firstName" className={accountLabelClass}>
              Prénom
            </label>
            <input
              id="firstName"
              required
              value={form.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={accountInputClass}
            />
          </div>
          <div>
            <label htmlFor="lastName" className={accountLabelClass}>
              Nom
            </label>
            <input
              id="lastName"
              required
              value={form.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={accountInputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className={accountLabelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={accountInputClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={accountLabelClass}>
            Téléphone
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className={accountInputClass}
            placeholder="+212 6 00 00 00 00"
          />
        </div>

        <div>
          <label htmlFor="address" className={accountLabelClass}>
            Adresse
          </label>
          <input
            id="address"
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className={accountInputClass}
            placeholder="Rue, numéro, appartement…"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="postalCode" className={accountLabelClass}>
              Code postal
            </label>
            <input
              id="postalCode"
              value={form.postalCode}
              onChange={(e) => set("postalCode", e.target.value)}
              className={accountInputClass}
            />
          </div>
          <div>
            <label htmlFor="city" className={accountLabelClass}>
              Ville
            </label>
            <input
              id="city"
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className={accountInputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="country" className={accountLabelClass}>
            Pays
          </label>
          <select
            id="country"
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
            className={accountInputClass}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Vos informations ont été enregistrées.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`mt-6 w-full justify-center disabled:opacity-60 sm:w-auto ${homeBtnPrimary}`}
      >
        {loading ? "Enregistrement…" : "Enregistrer les modifications"}
      </button>
    </form>
  );
}
