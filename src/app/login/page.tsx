"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(user, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--body-bg)" }}>
      <div className="w-full max-w-sm mx-4 p-8 rounded-2xl" style={{ background: "var(--modal-bg)", border: "1px solid var(--border-light)" }}>
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center mx-auto mb-3" style={{ background: "#8B5CF6" }}>
            <div className="w-4 h-4 rounded-full" style={{ background: "#fff" }} />
          </div>
          <h1 className="text-2xl font-black" style={{ color: "var(--body-text)" }}>Meeter</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-40)" }}>
            Iniciar sesión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Usuario o Email</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} required
              className="w-full outline-none text-sm px-4 py-3 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
          </div>

          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={4}
              className="w-full outline-none text-sm px-4 py-3 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
          </div>

          {error && <p className="text-sm font-medium" style={{ color: "#ef4444" }}>{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full font-bold text-sm py-3 rounded-xl border-none cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            style={{ background: "#8B5CF6", color: "#fff" }}>
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <button
          className="w-full text-center text-xs font-semibold mt-4 bg-transparent border-none cursor-pointer"
          style={{ color: "var(--text-40)" }}
          onClick={() => router.push("/register")}>
          ¿No tenés cuenta? Registrate
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
