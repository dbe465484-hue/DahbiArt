"use client";

import { useEffect, useState } from "react";
import {
  accountInputClass,
  accountLabelClass,
  accountCardClass,
} from "@/components/account/account-form-styles";
import { homeBtnGhost, homeEyebrow } from "@/components/home/home-theme";
import type { AuthUser } from "@/lib/api";

export type ShippingFormData = {
  address: string;
  postalCode: string;
  city: string;
  country: string;
  saveToProfile: boolean;
};

const COUNTRIES = [
  { code: "MA", label: "Maroc" },
  { code: "FR", label: "France" },
  { code: "BE", label: "Belgique" },
  { code: "CH", label: "Suisse" },
  { code: "ES", label: "Espagne" },
  { code: "US", label: "États-Unis" },
] as const;

const COUNTRY_LABELS: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.label]),
);

export function shippingFromUser(user: AuthUser): ShippingFormData {
  return {
    address: user.address ?? "",
    postalCode: user.postalCode ?? "",
    city: user.city ?? "",
    country: user.country || "MA",
    saveToProfile: true,
  };
}

export function hasCompleteShipping(data: ShippingFormData) {
  return data.address.trim().length >= 3 && data.city.trim().length >= 2;
}

export function formatShippingDisplay(data: ShippingFormData) {
  return [
    data.address,
    [data.postalCode, data.city].filter(Boolean).join(" "),
    COUNTRY_LABELS[data.country] ?? data.country,
  ].filter(Boolean);
}

type Props = {
  user: AuthUser;
  value: ShippingFormData;
  onChange: (data: ShippingFormData) => void;
};

export function CheckoutShippingForm({ user, value, onChange }: Props) {
  const hasSaved = Boolean(user.address?.trim() && user.city?.trim());
  const [editing, setEditing] = useState(!hasSaved);

  useEffect(() => {
    setEditing(!hasSaved);
  }, [hasSaved, user.id]);

  const set = <K extends keyof ShippingFormData>(key: K, v: ShippingFormData[K]) => {
    onChange({ ...value, [key]: v });
  };

  return (
    <div className={accountCardClass}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={homeEyebrow}>Livraison</p>
          <h2 className="font-serif text-xl text-stone-900">Adresse de livraison</h2>
        </div>
        {hasSaved && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={`${homeBtnGhost} px-4 py-2 text-xs`}
          >
            Modifier
          </button>
        )}
      </div>

      {editing ? (
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="ship-address" className={accountLabelClass}>
              Adresse
            </label>
            <input
              id="ship-address"
              required
              value={value.address}
              onChange={(e) => set("address", e.target.value)}
              className={accountInputClass}
              placeholder="Rue, numéro, appartement…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ship-postal" className={accountLabelClass}>
                Code postal
              </label>
              <input
                id="ship-postal"
                value={value.postalCode}
                onChange={(e) => set("postalCode", e.target.value)}
                className={accountInputClass}
              />
            </div>
            <div>
              <label htmlFor="ship-city" className={accountLabelClass}>
                Ville
              </label>
              <input
                id="ship-city"
                required
                value={value.city}
                onChange={(e) => set("city", e.target.value)}
                className={accountInputClass}
              />
            </div>
          </div>
          <div>
            <label htmlFor="ship-country" className={accountLabelClass}>
              Pays
            </label>
            <select
              id="ship-country"
              value={value.country}
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
          <label className="flex cursor-pointer items-center gap-2 text-sm text-stone-600">
            <input
              type="checkbox"
              checked={value.saveToProfile}
              onChange={(e) => set("saveToProfile", e.target.checked)}
              className="rounded border-stone-300"
            />
            Enregistrer cette adresse dans mon compte
          </label>
          {hasSaved && (
            <button
              type="button"
              onClick={() => {
                onChange(shippingFromUser(user));
                setEditing(false);
              }}
              className="text-xs text-stone-500 underline hover:text-stone-800"
            >
              Annuler les modifications
            </button>
          )}
        </div>
      ) : (
        <address className="mt-4 not-italic text-sm leading-relaxed text-stone-600">
          {formatShippingDisplay(value).map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </address>
      )}
    </div>
  );
}
