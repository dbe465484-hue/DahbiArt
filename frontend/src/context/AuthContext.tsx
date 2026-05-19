"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { api, type AuthUser, type UpdateProfileInput } from "@/lib/api";
import { isAdminRole, isArtisteRole, isCommandeRole, panelLinksForRole, type PanelLink } from "@/lib/roles";

const TOKEN_KEY = "mayn_access_token";

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isArtiste: boolean;
  isCommande: boolean;
  panelLinks: PanelLink[];
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  updateProfile: (data: UpdateProfileInput) => Promise<AuthUser>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  }, []);

  const persistSession = useCallback((accessToken: string, authUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setUser(authUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .me(token)
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, [getToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.login({ email, password });
      persistSession(res.accessToken, res.user);
      return res.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const res = await api.register(data);
      persistSession(res.accessToken, res.user);
    },
    [persistSession],
  );

  const updateProfile = useCallback(
    async (data: UpdateProfileInput) => {
      const token = getToken();
      if (!token) throw new Error("Non connecté");
      const updated = await api.updateProfile(token, data);
      setUser(updated);
      return updated;
    },
    [getToken],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: isAdminRole(user?.role),
      isArtiste: isArtisteRole(user?.role),
      isCommande: isCommandeRole(user?.role),
      panelLinks: panelLinksForRole(user?.role),
      login,
      register,
      logout,
      getToken,
      updateProfile,
    }),
    [user, isLoading, login, register, logout, getToken, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
