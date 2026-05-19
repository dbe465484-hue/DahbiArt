"use client";

import { useState } from "react";
import type { UserRole } from "@/lib/api";
import { roleLabel } from "@/lib/roles";

export type UserFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
};

const ROLES: UserRole[] = ["customer", "admin", "artiste", "commande"];

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-stone-500";
const inputClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-100";

type Props = {
  initial?: Partial<UserFormInput>;
  passwordRequired?: boolean;
  onSubmit: (data: UserFormInput) => Promise<void>;
  submitLabel: string;
};

export function AdminUserForm({
  initial,
  passwordRequired = true,
  onSubmit,
  submitLabel,
}: Props) {
  const [form, setForm] = useState<UserFormInput>({
    firstName: initial?.firstName ?? "",
    lastName: initial?.lastName ?? "",
    email: initial?.email ?? "",
    password: "",
    phone: initial?.phone ?? "",
    role: initial?.role ?? "customer",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof UserFormInput>(key: K, value: UserFormInput[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        phone: form.phone?.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Prénom</span>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>Nom</span>
          <input
            type="text"
            required
            value={form.lastName}
            onChange={(e) => set("lastName", e.target.value)}
            className={inputClass}
          />
        </label>
      </div>

      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          required
          autoComplete="off"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Téléphone</span>
        <input
          type="tel"
          value={form.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className={labelClass}>Mot de passe</span>
        <input
          type="password"
          required={passwordRequired}
          minLength={passwordRequired ? 8 : undefined}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-stone-400">
          {passwordRequired
            ? "Minimum 8 caractères"
            : "Laisser vide pour conserver le mot de passe actuel"}
        </p>
      </label>

      <label className="block">
        <span className={labelClass}>Rôle</span>
        <select
          value={form.role}
          onChange={(e) => set("role", e.target.value as UserRole)}
          className={inputClass}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabel(r)}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-amber-950 disabled:opacity-50"
      >
        {loading ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
