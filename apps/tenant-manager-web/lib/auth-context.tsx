"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface AuthenticatedUser {
  id: string;
  tenantId: string;
  roleId: string;
  email: string;
  permissions: string[];
}

interface AuthContextValue {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  apiFetch: <T = unknown>(path: string, init?: RequestInit) => Promise<T>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * O access token vive só em memória (nunca localStorage — reduz superfície
 * de XSS). Ao carregar a página, tentamos um refresh silencioso usando o
 * cookie httpOnly que a API já deixou setado no login.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const tokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rawFetch = useCallback(async (path: string, init?: RequestInit) => {
    try {
      return await fetch(`${API_URL}/v1${path}`, {
        ...init,
        credentials: "include",
        headers: {
          // FormData define seu próprio Content-Type com boundary — nunca fixar aqui.
          ...(init?.body && !(init.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
          ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
          ...init?.headers,
        },
      });
    } catch {
      // fetch falha com um TypeError genérico ("Failed to fetch") quando o servidor
      // está fora do ar/inacessível — troca por uma mensagem que o usuário entende.
      throw new Error("Não foi possível conectar ao servidor. Tente novamente em instantes.");
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const res = await rawFetch("/auth/refresh", { method: "POST" });
    if (!res.ok) return false;
    const data = await res.json();
    tokenRef.current = data.accessToken;
    return true;
  }, [rawFetch]);

  const loadMe = useCallback(async () => {
    const res = await rawFetch("/auth/me", { method: "POST" });
    if (!res.ok) return null;
    return (await res.json()) as AuthenticatedUser;
  }, [rawFetch]);

  useEffect(() => {
    (async () => {
      try {
        const refreshed = await refreshSession();
        if (refreshed) setUser(await loadMe());
      } catch {
        // API fora do ar/inacessível — cai pro login em vez de travar "Carregando…" para sempre.
      } finally {
        setIsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await rawFetch("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: "Falha no login" }));
        throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message);
      }
      const data = await res.json();
      tokenRef.current = data.accessToken;
      setUser(await loadMe());
    },
    [rawFetch, loadMe],
  );

  const logout = useCallback(async () => {
    await rawFetch("/auth/logout", { method: "POST" });
    tokenRef.current = null;
    setUser(null);
  }, [rawFetch]);

  const apiFetch = useCallback(
    async <T = unknown,>(path: string, init?: RequestInit): Promise<T> => {
      let res = await rawFetch(path, init);

      if (res.status === 401) {
        const refreshed = await refreshSession();
        if (refreshed) res = await rawFetch(path, init);
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(Array.isArray(body.message) ? body.message.join(", ") : body.message);
      }

      return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
    },
    [rawFetch, refreshSession],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, apiFetch }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
