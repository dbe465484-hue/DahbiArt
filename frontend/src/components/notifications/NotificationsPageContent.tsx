"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { accountCardClass } from "@/components/account/account-form-styles";
import {
  homeEyebrow,
  homeLink,
  homeTextureStyle,
  homeTitle,
} from "@/components/home/home-theme";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationsContext";
import type { AppNotification } from "@/lib/api";
import {
  NOTIFICATION_TYPE_LABEL,
  formatNotificationDate,
  notificationTone,
} from "@/lib/notifications";
import { defaultHomeForRole } from "@/lib/roles";

const toneBorder: Record<ReturnType<typeof notificationTone>, string> = {
  amber: "border-l-amber-600",
  sky: "border-l-sky-600",
  emerald: "border-l-emerald-600",
  stone: "border-l-stone-400",
  red: "border-l-red-500",
};

function NotificationCard({
  n,
  onRead,
}: {
  n: AppNotification;
  onRead: (id: string) => void;
}) {
  const inner = (
    <>
      <p className="font-medium text-stone-900">{n.title}</p>
      <p className="mt-1 text-sm text-stone-600">{n.message}</p>
      <p className="mt-2 text-xs text-stone-400">
        {NOTIFICATION_TYPE_LABEL[n.type]} · {formatNotificationDate(n.createdAt)}
      </p>
    </>
  );

  const className = `block border-l-4 ${toneBorder[notificationTone(n.type)]} ${
    !n.read ? "bg-amber-50/30" : ""
  } ${accountCardClass}`;

  if (n.link) {
    return (
      <Link
        href={n.link}
        className={className}
        onClick={() => {
          if (!n.read) onRead(n.id);
        }}
      >
        {inner}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`w-full text-left ${className}`}
      onClick={() => {
        if (!n.read) onRead(n.id);
      }}
    >
      {inner}
    </button>
  );
}

export function NotificationsPageContent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { items, unreadCount, loading, markRead, markAllRead, refresh } =
    useNotifications();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace("/login?redirect=/notifications");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) void refresh();
  }, [isAuthenticated, refresh]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#faf7f2]">
        <p className="text-sm text-stone-500">Chargement…</p>
      </div>
    );
  }

  const backHref = user ? defaultHomeForRole(user.role) : "/account";

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl px-4 py-12 lg:px-8">
          <Link href={backHref} className={`text-sm ${homeLink}`}>
            ← Retour
          </Link>
          <p className={`mt-6 ${homeEyebrow}`}>Activité</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <h1 className={`${homeTitle} text-3xl sm:text-4xl`}>Notifications</h1>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-sm font-medium text-amber-900 underline-offset-2 hover:underline"
              >
                Tout marquer comme lu ({unreadCount})
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 py-10 lg:px-8">
        {loading && items.length === 0 ? (
          <p className="text-center text-sm text-stone-500">Chargement…</p>
        ) : items.length === 0 ? (
          <div className={`text-center ${accountCardClass}`}>
            <p className="text-stone-600">Aucune notification pour le moment.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((n) => (
              <li key={n.id}>
                <NotificationCard n={n} onRead={(id) => void markRead(id)} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
