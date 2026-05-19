"use client";

import { useState } from "react";
import { homeBtnGhost } from "@/components/home/home-theme";
import {
  accountCardClass,
  accountInputClass,
  accountLabelClass,
} from "@/components/account/account-form-styles";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

export function AccountPasswordForm() {
  const { updateProfile } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Échec du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={accountCardClass}>
      <header className="mb-6 border-b border-stone-100 pb-6">
        <h2 className="font-serif text-xl text-stone-900">Mot de passe</h2>
        <p className="mt-1 text-sm text-stone-500">
          Choisissez un mot de passe d&apos;au moins 8 caractères.
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <label htmlFor="currentPassword" className={accountLabelClass}>
            Mot de passe actuel
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              setSuccess(false);
            }}
            className={accountInputClass}
          />
        </div>

        <div>
          <label htmlFor="newPassword" className={accountLabelClass}>
            Nouveau mot de passe
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setSuccess(false);
            }}
            className={accountInputClass}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className={accountLabelClass}>
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setSuccess(false);
            }}
            className={accountInputClass}
          />
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="mt-5 rounded-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Mot de passe mis à jour.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`mt-6 w-full justify-center disabled:opacity-60 sm:w-auto ${homeBtnGhost}`}
      >
        {loading ? "Mise à jour…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
