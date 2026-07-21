"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [user, setUser] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(user, password);
      } else {
        await register(user, name, email, password, dni, address);
      }
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
            {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Usuario o Email</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} required
              className="w-full outline-none text-sm px-4 py-3 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
          </div>

          {mode === "register" && (
            <>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Nombre</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full outline-none text-sm px-4 py-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full outline-none text-sm px-4 py-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>DNI <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" value={dni} onChange={e => setDni(e.target.value)} required
                  className="w-full outline-none text-sm px-4 py-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1 block" style={{ color: "var(--text-40)" }}>Domicilio <span className="text-[var(--text-35)]">(opcional)</span></label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  className="w-full outline-none text-sm px-4 py-3 rounded-xl"
                  style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--body-text)" }} />
              </div>
            </>
          )}

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
            {loading ? "Cargando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <button
          className="w-full text-center text-xs font-semibold mt-4 bg-transparent border-none cursor-pointer"
          style={{ color: "var(--text-40)" }}
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </div>
    </div>
  );
}
