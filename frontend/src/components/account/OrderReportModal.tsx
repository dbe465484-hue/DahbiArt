"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { ApiError, api } from "@/lib/api";
import {
  ORDER_ALERT_TYPES,
  type OrderAlertType,
} from "@/lib/order-alerts";

type Props = {
  open: boolean;
  orderId: string;
  orderReference: string;
  onClose: () => void;
  onSuccess?: () => void;
};

export function OrderReportModal({
  open,
  orderId,
  orderReference,
  onClose,
  onSuccess,
}: Props) {
  const { getToken } = useAuth();
  const [type, setType] = useState<OrderAlertType>("no_confirmation");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(() => {
    setDone(false);
    setMessage("");
    setType("no_confirmation");
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.accountOrders.reportAlert(token, orderId, {
        type,
        message: message.trim() || undefined,
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Envoi impossible. Réessayez dans un instant.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] overflow-y-auto overscroll-contain"
      role="presentation"
    >
      <button
        type="button"
        className="fixed inset-0 bg-stone-900/50"
        aria-label="Fermer la fenêtre"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-order-title"
          className="relative z-10 flex w-full max-w-md max-h-[min(90dvh,calc(100vh-2rem))] flex-col rounded-2xl bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
            <div className="min-w-0">
              <h2
                id="report-order-title"
                className="font-serif text-xl text-stone-900"
              >
                {done ? "Signalement envoyé" : "Signaler un problème"}
              </h2>
              {!done && (
                <p className="mt-0.5 truncate text-sm text-stone-500">
                  Commande {orderReference}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
              aria-label="Fermer"
            >
              <span className="text-xl leading-none" aria-hidden>
                ×
              </span>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {done ? (
              <p className="text-sm text-stone-600">
                Votre signalement pour la commande{" "}
                <strong>{orderReference}</strong> a été transmis à notre équipe.
                Nous vous recontacterons si nécessaire.
              </p>
            ) : (
              <form id="order-report-form" onSubmit={(e) => void handleSubmit(e)}>
                <fieldset className="space-y-2">
                  <legend className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Motif
                  </legend>
                  {ORDER_ALERT_TYPES.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm transition ${
                        type === opt.value
                          ? "border-amber-800 bg-amber-50/50"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="alertType"
                        value={opt.value}
                        checked={type === opt.value}
                        onChange={() => setType(opt.value)}
                        className="mt-0.5"
                      />
                      <span className="text-stone-800">{opt.label}</span>
                    </label>
                  ))}
                </fieldset>

                <label className="mt-4 block">
                  <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Détails (optionnel)
                  </span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    maxLength={2000}
                    placeholder="Précisez votre situation…"
                    className="mt-2 w-full resize-none rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:border-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-800"
                  />
                </label>

                {error && (
                  <p className="mt-3 text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="shrink-0 border-t border-stone-100 px-5 py-4">
            {done ? (
              <button
                type="button"
                onClick={handleClose}
                className="w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
              >
                Fermer
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  form="order-report-form"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-amber-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-950 disabled:opacity-60"
                >
                  {submitting ? "Envoi…" : "Envoyer"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
