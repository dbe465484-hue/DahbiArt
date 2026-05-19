"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { api, type AppNotification } from "@/lib/api";

type NotificationsContextValue = {
  items: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const POLL_MS = 45_000;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isAuthenticated } = useAuth();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token || !isAuthenticated) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        api.notifications.list(token),
        api.notifications.unreadCount(token),
      ]);
      setItems(list);
      setUnreadCount(count);
    } catch {
      /* silencieux si API indisponible */
    } finally {
      setLoading(false);
    }
  }, [getToken, isAuthenticated]);

  useEffect(() => {
    void refresh();
    if (!isAuthenticated) return;
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [isAuthenticated, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      const token = getToken();
      if (!token) return;
      try {
        const updated = await api.notifications.markRead(token, id);
        setItems((prev) => prev.map((n) => (n.id === id ? updated : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        /* ignore */
      }
    },
    [getToken],
  );

  const markAllRead = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await api.notifications.markAllRead(token);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      /* ignore */
    }
  }, [getToken]);

  const value = useMemo(
    () => ({
      items,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
    }),
    [items, unreadCount, loading, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications doit être utilisé dans NotificationsProvider");
  }
  return ctx;
}
