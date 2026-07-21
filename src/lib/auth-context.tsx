"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { ApiUser } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface AuthState {
  token: string | null;
  user: ApiUser | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: string, password: string) => Promise<void>;
  register: (user: string, name: string, email: string, password: string, dni?: string, address?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem("meeter_token");
    const user = localStorage.getItem("meeter_user");
    if (token && user) {
      try {
        setState({ token, user: JSON.parse(user), loading: false });
      } catch {
        localStorage.removeItem("meeter_token");
        localStorage.removeItem("meeter_user");
        setState({ token: null, user: null, loading: false });
      }
    } else {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = useCallback(async (user: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error al iniciar sesión");
    }
    const data = await res.json();
    localStorage.setItem("meeter_token", data.token);
    localStorage.setItem("meeter_user", JSON.stringify(data.user));
    setState({ token: data.token, user: data.user, loading: false });
  }, []);

  const register = useCallback(async (user: string, name: string, email: string, password: string, dni?: string, address?: string) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, name, email, password, dni, address }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err?.message ?? "Error al registrarse");
    }
    const data = await res.json();
    localStorage.setItem("meeter_token", data.token);
    localStorage.setItem("meeter_user", JSON.stringify(data.user));
    setState({ token: data.token, user: data.user, loading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("meeter_token");
    localStorage.removeItem("meeter_user");
    setState({ token: null, user: null, loading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
