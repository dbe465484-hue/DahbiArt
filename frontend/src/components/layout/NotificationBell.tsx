"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import {
  NOTIFICATION_TYPE_LABEL,
  formatNotificationDate,
  notificationTone,
} from "@/lib/notifications";

function IconBell({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4.5-5.8V4a1.5 1.5 0 00-3 0v1.2A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a2 2 0 11-4 0v-1m4 0H9"
      />
    </svg>
  );
}

const toneDot: Record<ReturnType<typeof notificationTone>, string> = {
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  emerald: "bg-emerald-500",
  stone: "bg-stone-400",
  red: "bg-red-500",
};

export function NotificationBell({
  iconClass,
  overlay,
}: {
  iconClass: string;
  overlay: boolean;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const { items, unreadCount, loading, refresh, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void refresh();
    const onPointerDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open, refresh]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative inline-flex h-10 w-10 items-center justify-center ${iconClass}`}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <IconBell />
        {unreadCount > 0 && (
          <span
            className={`absolute right-0 top-0 z-10 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
              overlay
                ? "bg-amber-500 text-white ring-2 ring-black/30"
                : "bg-amber-600 text-white ring-2 ring-white"
            }`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] flex w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
            <p className="text-sm font-semibold text-stone-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-xs font-medium text-amber-900 hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <ul className="max-h-[min(24rem,60vh)] overflow-y-auto">
            {loading && items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-stone-500">
                Chargement…
              </li>
            ) : items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-stone-500">
                Aucune notification
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="border-b border-stone-50 last:border-0">
                  {n.link ? (
                    <Link
                      href={n.link}
                      role="menuitem"
                      onClick={() => {
                        if (!n.read) void markRead(n.id);
                        setOpen(false);
                      }}
                      className={`block px-4 py-3 transition hover:bg-stone-50 ${
                        !n.read ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <NotificationRow n={n} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (!n.read) void markRead(n.id);
                      }}
                      className={`w-full px-4 py-3 text-left transition hover:bg-stone-50 ${
                        !n.read ? "bg-amber-50/40" : ""
                      }`}
                    >
                      <NotificationRow n={n} />
                    </button>
                  )}
                </li>
              ))
            )}
          </ul>

          <div className="border-t border-stone-100 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs font-medium text-stone-600 hover:text-amber-900"
            >
              Voir tout l&apos;historique
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationRow({ n }: { n: import("@/lib/api").AppNotification }) {
  const tone = notificationTone(n.type);
  return (
    <>
      <div className="flex items-start gap-2">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${toneDot[tone]}`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-900">{n.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-stone-600">{n.message}</p>
          <p className="mt-1 text-[10px] uppercase tracking-wide text-stone-400">
            {NOTIFICATION_TYPE_LABEL[n.type]} · {formatNotificationDate(n.createdAt)}
          </p>
        </div>
        {!n.read && (
          <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-amber-600" aria-hidden />
        )}
      </div>
    </>
  );
}
