"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/theme/ThemeProvider";
import { CloseIcon, EditIcon, HomeIcon, GridIcon, UsersIcon, FileIcon, PlusIcon, SettingsIcon, LogoutIcon, MoonIcon, SunIcon, HeartIcon } from "@/components/ui/Icons";
import { getEventCategories } from "@/lib/api";
import type { EventCategory } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

function getProfileFields(user: { name?: string; email?: string; dni?: string | null; cuit?: string | null; address?: string | null } | null): Record<string, { label: string; value: string; type: string; placeholder: string; isPassword?: boolean }> {
  return {
    name: { label: "Nombre Completo", value: user?.name ?? "", type: "text", placeholder: "Sin nombre" },
    email: { label: "Correo Electrónico", value: user?.email ?? "", type: "email", placeholder: "Sin email" },
    password: { label: "Contraseña", value: "xxxxxxxxxxxx", type: "password", placeholder: "", isPassword: true },
    dni: { label: "DNI", value: user?.dni ?? "", type: "text", placeholder: user?.dni ? "" : "No asignado" },
    cuit: { label: "CUIT (Opcional)", value: user?.cuit ?? "", type: "text", placeholder: user?.cuit ? "" : "No asignado" },
    address: { label: "Domicilio", value: user?.address ?? "", type: "text", placeholder: user?.address ? "" : "No asignado" },
  };
}

function ProfileHeader({ onClose, editingField, onBack }: { onClose: () => void; editingField: string | null; onBack: () => void }) {
  return (
    <div className="flex items-center justify-between pb-[14px] mb-5" style={{ borderBottom: "1px solid var(--border-light)" }}>
      <div className="flex items-center gap-2">
        {editingField && (
          <button className="bg-transparent border-none text-[var(--text-50)] cursor-pointer p-1 text-sm" onClick={onBack}>←</button>
        )}
        <h3 className="text-lg font-bold text-[var(--body-text)] m-0">Editar Perfil</h3>
      </div>
      <button className="bg-transparent border-none text-[var(--text-50)] text-lg cursor-pointer p-1" onClick={onClose}>✕</button>
    </div>
  );
}

function ProfileCard() {
  const { user } = useAuth();
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}>
      <div className="relative shrink-0" style={{ width: 65, height: 65 }}>
        <img
          src={user?.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
          alt="Foto de perfil"
          className="w-full h-full rounded-full object-cover"
          style={{ border: "2px solid #8b5cf6" }}
        />
        <label htmlFor="gallery-input" className="absolute -bottom-[2px] -right-[2px] rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: "#8b5cf6", border: "2px solid var(--modal-bg)", padding: 5 }}
          title="Cambiar foto de perfil"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: "#fff" }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </label>
        <input type="file" id="gallery-input" accept="image/*" style={{ display: "none" }} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h2 className="text-base font-bold text-[var(--body-text)] m-0">{user?.name ?? "Usuario"}</h2>
          {user?.verified && (
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#8b5cf6" }} title="Cuenta Verificada">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          )}
        </div>
        <p className="text-[9.5pt] text-[var(--text-40)] m-0 mb-1" style={{ fontFamily: "monospace" }}>@{user?.user ?? "usuario"}</p>
        <span className="text-[8pt] font-bold text-[#c4b5fd] self-start px-1.5 py-[1px] rounded"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}
        >
          Rol: {user?.role ?? "CONSUMER"}
        </span>
      </div>
    </div>
  );
}

function ProfileFieldsList({ onEdit, user }: { onEdit: (key: string) => void; user: { name?: string; email?: string; dni?: string | null; cuit?: string | null; address?: string | null } | null }) {
  const fields = getProfileFields(user);
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(fields).map(([key, field]) => (
        <div key={key}>
          <div className="flex items-center gap-1.5 mb-1">
            <label className="text-[9.5pt] font-semibold text-[var(--text-40)]">{field.label}</label>
            <button type="button" className="w-[14px] h-[14px] rounded-full flex items-center justify-center text-[8px] font-bold cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", color: "var(--text-50)" }}
              title={`Explicación: Modifica tu ${field.label.toLowerCase()}`}
            >!</button>
          </div>
          <div className="flex w-full">
            <input type={field.type} value={field.value} placeholder={field.placeholder || undefined} readOnly
              className={`flex-1 outline-none text-[10pt] text-[var(--body-text)] ${field.isPassword ? "tracking-[3px] text-[var(--text-50)]" : ""} ${field.placeholder && !field.value ? "italic" : ""}`}
              style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderTopLeftRadius: 8, borderBottomLeftRadius: 8, padding: "9px 12px" }}
            />
            <button type="button" className="flex items-center justify-center px-3 cursor-pointer transition-colors"
              style={{ background: "rgba(139,92,246,0.08)", borderTop: "1px solid rgba(139,92,246,0.2)", borderRight: "1px solid rgba(139,92,246,0.2)", borderBottom: "1px solid rgba(139,92,246,0.2)", borderLeft: "none", borderTopRightRadius: 8, borderBottomRightRadius: 8, color: "#c4b5fd" }}
              title={`Modificar ${field.label.toLowerCase()}`}
              onClick={() => onEdit(key)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#8b5cf6"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.08)"; (e.currentTarget as HTMLElement).style.color = "#c4b5fd"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function StandardEditBox({ fieldKey, onBack, onSave, user }: { fieldKey: string; onBack: () => void; onSave: () => void; user: { name?: string; email?: string; dni?: string | null; cuit?: string | null; address?: string | null } | null }) {
  const [newValue, setNewValue] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const fields = getProfileFields(user);
  const field = fields[fieldKey];

  return (
    <div style={{ background: "var(--modal-bg)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 25px rgba(139,92,246,0.12), 0 10px 20px rgba(0,0,0,0.6)", borderRadius: 12, padding: 20, width: "100%" }}>
      <h4 className="text-[11pt] font-bold text-[var(--body-text)] m-0 pb-2 mb-[14px]" style={{ borderBottom: "1px solid var(--border-light)" }}>Modificar {field.label}</h4>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Dato Original</label>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border-light)", padding: "8px 12px", borderRadius: 6, color: "var(--text-50)", fontSize: "9.5pt" }}>{field.value || field.placeholder}</div>
      </div>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Nuevo {field.label}</label>
        <input type={field.type} value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Escribe el dato nuevo..."
          className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
      </div>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Contraseña Actual para Verificar</label>
        <input type="password" value={verifyPassword} onChange={e => setVerifyPassword(e.target.value)} placeholder="••••••••••••"
          className="w-full outline-none text-[9.5pt] text-[var(--body-text)] tracking-[3px]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
      </div>

      {!showConfirm ? (
        <button type="button" className="w-full text-center font-bold text-[9pt] cursor-pointer border-none rounded-lg py-2 transition-all" style={{ background: "#8b5cf6", color: "#fff" }}
          onClick={() => newValue.trim() && setShowConfirm(true)}>Confirmar Cambio</button>
      ) : (
        <div style={{ background: "#0d0d11", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 10, padding: 16, marginTop: 15, textAlign: "center" }}>
          <p className="text-[9.5pt] text-[var(--body-text)] m-0 mb-[14px]" style={{ lineHeight: 1.4 }}>
            {`¿Estás seguro de hacer el cambio de `}<span style={{ color: "#c4b5fd", fontWeight: "bold" }}>{`"${field.value || field.placeholder}"`}</span>{` por `}<span style={{ color: "#c4b5fd", fontWeight: "bold" }}>{`"${newValue}"`}</span>?
          </p>
          <div className="flex gap-3">
            <button type="button" className="flex-1 py-2 rounded-lg text-[9pt] font-bold cursor-pointer border-none transition-all"
              style={{ background: "#8b5cf6", color: "#fff" }} onClick={onSave}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#8b5cf6"}>SÍ</button>
            <button type="button" className="flex-1 py-2 rounded-lg text-[9pt] font-bold cursor-pointer transition-all"
              style={{ background: "var(--surface)", color: "var(--text-40)", border: "1px solid var(--border-light)" }}
              onClick={() => { setShowConfirm(false); setNewValue(""); setVerifyPassword(""); }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--text-40)"; }}>NO</button>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordEditBox({ onBack, onSave }: { onBack: () => void; onSave: () => void }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div style={{ background: "var(--modal-bg)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 25px rgba(139,92,246,0.12), 0 10px 20px rgba(0,0,0,0.6)", borderRadius: 12, padding: 20, width: "100%" }}>
      <h4 className="text-[11pt] font-bold text-[var(--body-text)] m-0 pb-2 mb-[14px]" style={{ borderBottom: "1px solid var(--border-light)" }}>Cambiar Contraseña</h4>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Contraseña Actual</label>
        <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
          className="w-full outline-none text-[9.5pt] text-[var(--body-text)] tracking-[3px]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
      </div>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Nueva Contraseña</label>
        <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
          className="w-full outline-none text-[9.5pt] text-[var(--body-text)] tracking-[3px]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
      </div>

      <div className="mb-3">
        <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Reescribir Nueva Contraseña</label>
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
          className="w-full outline-none text-[9.5pt] text-[var(--body-text)] tracking-[3px]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
      </div>

      <div className="text-[#ef4444] text-[8.5pt] mt-2 mb-3" style={{ fontWeight: 500, lineHeight: 1.3 }}>⚠️ Recuerda guardar la contraseña nueva para no perderla u olvidarte.</div>

      {!showConfirm ? (
        <button type="button" className="w-full text-center font-bold text-[9pt] cursor-pointer border-none rounded-lg py-2 transition-all" style={{ background: "#8b5cf6", color: "#fff" }}
          onClick={() => currentPw && newPw && confirmPw && newPw === confirmPw && setShowConfirm(true)}>Confirmar Cambio</button>
      ) : (
        <div style={{ background: "#0d0d11", border: "1px solid rgba(139,92,246,0.5)", borderRadius: 10, padding: 16, marginTop: 15, textAlign: "center" }}>
          <p className="text-[9.5pt] text-[var(--body-text)] m-0 mb-[14px]" style={{ lineHeight: 1.4 }}>¿Estás seguro de hacer el cambio de tu contraseña actual?</p>
          <div className="flex gap-3">
            <button type="button" className="flex-1 py-2 rounded-lg text-[9pt] font-bold cursor-pointer border-none transition-all"
              style={{ background: "#8b5cf6", color: "#fff" }} onClick={onSave}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#8b5cf6"}>SÍ</button>
            <button type="button" className="flex-1 py-2 rounded-lg text-[9pt] font-bold cursor-pointer transition-all"
              style={{ background: "var(--surface)", color: "var(--text-40)", border: "1px solid var(--border-light)" }}
              onClick={() => { setShowConfirm(false); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "var(--text-40)"; }}>NO</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FriendsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full" style={{ background: "var(--modal-bg)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 30px rgba(139,92,246,0.15), 0 15px 35px rgba(0,0,0,0.7)", borderRadius: 16, padding: 20 }}>
      <div className="flex items-center justify-between pb-[14px] mb-5" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <h3 className="text-lg font-bold text-[var(--body-text)] m-0">Buscar Amigos</h3>
        <button className="bg-transparent border-none text-[var(--text-50)] text-lg cursor-pointer p-1" onClick={onClose}>✕</button>
      </div>
      <div className="text-center py-8">
        <p className="text-[10pt] text-[var(--text-50)] m-0">No tienes amigos agregados todavía.</p>
        <p className="text-[9pt] text-[var(--text-70)] mt-2">Busca y conecta con otros usuarios para verlos aquí.</p>
      </div>
    </div>
  );
}

function CreateEventPanel({ onClose, onSave, token }: { onClose: () => void; onSave: (event: { name: string; description: string; meta: string; price: string; category: string; color: string; visibility: string }) => void; token?: string | null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [initDate, setInitDate] = useState(new Date().getFullYear() + "-01-01T00:00");
  const [endingDate, setEndingDate] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [color, setColor] = useState("#8B5CF6");
  const [apiCategories, setApiCategories] = useState<EventCategory[]>([]);

  useEffect(() => {
    getEventCategories().then(setApiCategories).catch(() => {});
  }, []);

  const categoryName = category
    ? apiCategories.find(c => String(c.id) === category)?.name ?? "Categoría"
    : "Categoría";

  function formatPrice(value: string): string {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "") return "";
    const num = parseInt(cleaned, 10);
    if (num > 99999999) return formatPrice(cleaned.slice(0, -1));
    return new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0 }).format(num);
  }

  function formatDatePreview(dateStr: string): string {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " hs";
  }

  function validarFechas() {
    if (initDate && endingDate && new Date(endingDate) <= new Date(initDate)) {
      alert("⚠️ Error: La fecha y hora de finalización debe ser posterior a la de inicio.");
      setEndingDate("");
      return false;
    }
    return true;
  }

  const formattedPrice = formatPrice(price);
  const metaStr = initDate ? formatDatePreview(initDate) + (location ? ` • ${location}` : "") : "";
  const hasDateError = initDate && endingDate && new Date(endingDate) <= new Date(initDate);
  const previewMeta = hasDateError ? "Fecha y Lugar (Inválida)" : (metaStr || "Fecha y Lugar");

  const allRequired = name.trim() && description.trim() && initDate && location.trim() && price && category && visibility;

  return (
    <div className="w-full editor-container-box" style={{ background: "var(--modal-bg)", border: "1px solid rgba(139, 92, 246, 0.2)", borderRadius: 14, padding: 14 }}>
      <div className="flex items-center justify-between pb-[14px] mb-5" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <h3 className="text-lg font-bold text-[var(--body-text)] m-0">Crear Evento</h3>
        <button className="bg-transparent border-none text-[var(--text-50)] text-lg cursor-pointer p-1" onClick={onClose}>✕</button>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Nombre del Evento</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Descripción</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)] resize-none" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Inicio</label>
          <input type="datetime-local" value={initDate} onChange={e => { setInitDate(e.target.value); if (endingDate && new Date(endingDate) <= new Date(e.target.value)) setEndingDate(""); }}
            min={new Date().getFullYear() + "-01-01T00:00"}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }}
            id="edit-initDate" />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Fin</label>
          <input type="datetime-local" value={endingDate} onChange={e => setEndingDate(e.target.value)}
            min={initDate || (new Date().getFullYear() + "-01-01T00:00")}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }}
            id="edit-endingDate" />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Ubicación</label>
          <input type="text" value={location} onChange={e => setLocation(e.target.value)}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }} />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Precio</label>
          <input type="text" inputMode="numeric" value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ""))}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }}
            id="edit-price" />
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Categoría</label>
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }}
            id="edit-category">
            <option value="" disabled>Selecciona una categoría...</option>
            {apiCategories.map(c => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Visibilidad</label>
          <select value={visibility} onChange={e => setVisibility(e.target.value)}
            className="w-full outline-none text-[9.5pt] text-[var(--body-text)]" style={{ background: "var(--surface)", border: "1px solid var(--border-light)", borderRadius: 6, padding: "8px 12px" }}>
            <option value="public">Público</option>
            <option value="private">Privado</option>
          </select>
        </div>
        <div>
          <label className="text-[8.5pt] text-[var(--text-40)] font-semibold block mb-1">Color de acento</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-none" style={{ background: "transparent", padding: 0 }}
              id="edit-color" />
            <span className="text-[8pt] text-[var(--text-50)]">{color}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-[8pt] font-bold tracking-[0.1em] text-[var(--text-50)] uppercase mb-3">👁️ REPRESENTACIÓN VISUAL</h4>
        <div
          className="group mitem rounded-2xl overflow-hidden transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_12px_40px_-15px_var(--tc)] flex flex-col cursor-pointer w-full"
          data-theme-color={color}
          style={{ "--tc": color, background: "#09090b", border: "1px solid rgba(255,255,255,0.08)" } as React.CSSProperties}
        >
          {/* ===== MITAD SUPERIOR: Gradiente ===== */}
          <div className="relative h-[180px] w-full shrink-0 overflow-hidden" style={{ background: `linear-gradient(135deg, #1a0a2e, ${color})` }}>
            <div className="absolute inset-0 bg-black/10 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 p-4 flex justify-between items-start z-10">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                {categoryName}
              </span>
              <button className="w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-md border border-white/10 text-white transition-colors hover:bg-white/20" onClick={e => e.preventDefault()}>
                <HeartIcon size={14} />
              </button>
            </div>
          </div>

          {/* ===== MITAD INFERIOR: Caja negra con datos ===== */}
          <div className="p-5 flex flex-col flex-1 justify-between z-10">
            <div>
              {/* 1. Estrellas arriba del nombre */}
              <div className="text-[#f59e0b] text-[12px] tracking-[2px] mb-1.5">★★★★★</div>

              {/* Título */}
              <h4 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-1">
                {name || "Nombre del Evento"}
              </h4>

              {/* 4. Descripción */}
              <p className="text-[13px] text-zinc-400 line-clamp-2 mb-3">
                {description.trim() || "Un viaje sonoro por los subsuelos de la ciudad con los mejores artistas."}
              </p>

              {/* 3. Solo fecha de inicio */}
              <div className="text-[12px] font-medium text-zinc-500">
                {hasDateError ? "Fecha inválida" : (metaStr || "sáb. 21 jun. · Córdoba")}
              </div>
            </div>

            <div className="h-px w-full bg-white/5 my-3" />

            {/* 2. Precio y botón Reservar */}
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-[#09090b]"></div>
                <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-[#09090b]"></div>
                <div className="w-6 h-6 rounded-full border-2 border-[#09090b] flex items-center justify-center text-[9px] text-white font-bold" style={{ background: color }}>+48</div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-white">
                  {price ? `$${formattedPrice}` : "Gratis"}
                </span>
                <button className="text-[12px] font-bold border-none rounded-lg px-4 py-2 transition-transform active:scale-95" style={{ background: "#8B5CF6", color: "#fff" }}>
                  Reservar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button"
        className="w-full text-center font-bold text-[9pt] cursor-pointer border-none rounded-lg py-2.5 mt-4 transition-all"
        style={{ background: "#8b5cf6", color: "#fff" }}
        onClick={async () => {
          if (!allRequired || hasDateError) return;
          const form = new FormData();
          form.append("name", name);
          form.append("description", description);
          form.append("initDate", new Date(initDate).toISOString());
          if (endingDate) form.append("endingDate", new Date(endingDate).toISOString());
          form.append("location", location);
          form.append("categoryFK", category);
          form.append("ticketPrice", price.replace(/[^0-9]/g, ""));
          form.append("open", visibility === "public" ? "true" : "false");
          if (token) {
            try {
              const res = await fetch(`http://localhost:3000/events`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: form,
              });
              if (!res.ok) {
                const err = await res.json().catch(() => null);
                alert(err?.message ?? "Error al crear evento");
                return;
              }
              const apiEvent = await res.json();
              onSave({
                name: apiEvent.name, description: apiEvent.description ?? "", meta: metaStr,
                price, category, color, visibility
              });
            } catch (e: any) {
              alert(e.message ?? "Error de conexión");
              return;
            }
          } else {
            onSave({ name, description, meta: metaStr, price, category, color, visibility });
          }
          setName(""); setDescription(""); setInitDate(new Date().getFullYear() + "-01-01T00:00");
          setEndingDate(""); setLocation(""); setPrice(""); setCategory(""); setVisibility("public"); setColor("#8B5CF6");
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#7c3aed"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#8b5cf6"}
      >
        Crear Evento
      </button>
    </div>
  );
}

function MisEventosPanel({ eventos, onClose }: { eventos: { id: string; name: string; description: string; meta: string; price: string; category: string; color: string; visibility: string }[]; onClose: () => void }) {
  return (
    <div className="w-full" style={{ background: "var(--modal-bg)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 0 30px rgba(139,92,246,0.15), 0 15px 35px rgba(0,0,0,0.7)", borderRadius: 16, padding: 20 }}>
      <div className="flex items-center justify-between pb-[14px] mb-5" style={{ borderBottom: "1px solid var(--border-light)" }}>
        <h3 className="text-lg font-bold text-[var(--body-text)] m-0">Mis Eventos</h3>
        <button className="bg-transparent border-none text-[var(--text-50)] text-lg cursor-pointer p-1" onClick={onClose}>✕</button>
      </div>

      {eventos.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[10pt] text-[var(--text-50)] m-0">No tienes eventos creados aún.</p>
          <p className="text-[9pt] text-[var(--text-70)] mt-2">{'Crea tu primer evento desde "Crear evento"'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {eventos.map(ev => (
            <div key={ev.id} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${ev.color}` }}>
              <div className="relative h-[140px] flex flex-col justify-end p-3"
                style={{ background: `linear-gradient(to top, rgba(0,0,0,0.95), transparent), linear-gradient(135deg, #1a0a2e, ${ev.color})` }}
              >
                <div className="absolute top-2 left-2 flex gap-1">
                  <div className="text-[9px] font-bold px-2 py-1 rounded-md"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff" }}>
                    {ev.category || "Categoría"}
                  </div>
                  <div className="text-[9px] font-bold px-2 py-1 rounded-md"
                    style={{ background: ev.visibility === "public" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)", backdropFilter: "blur(8px)", color: "#fff" }}>
                    {ev.visibility === "public" ? "Público" : "Privado"}
                  </div>
                </div>
                <h3 className="text-sm font-black text-white m-0 leading-tight">{ev.name}</h3>
                <p className="text-[10px] text-[#a1a1aa] m-0 mt-0.5">{ev.meta || "Fecha y Lugar"}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-white">{ev.price ? `$${ev.price}` : "Gratis"}</span>
                  <button className="text-[10px] font-bold py-1.5 px-3 rounded-full cursor-pointer border-none" style={{ background: "#8B5CF6", color: "#fff" }}>
                    Ver Más
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { token, user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [eventosOpen, setEventosOpen] = useState(false);
  const [misEventos, setMisEventos] = useState<{ id: string; name: string; description: string; meta: string; price: string; category: string; color: string; visibility: string }[]>([]);

  return (
    <>
      {open && <div className="fixed inset-0 z-[240] bg-black/30" onClick={onClose} />}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] z-[250] flex flex-col gap-6 p-6 transition-transform duration-300 ${
          open ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
        style={{
          background: "var(--body-bg)",
          borderRight: "1px solid var(--header-border)",
        }}
      >
        <button
          className="self-end bg-transparent border-none cursor-pointer p-1"
          style={{ color: "var(--body-text)" }}
          onClick={onClose}
        >
          <CloseIcon size={20} />
        </button>

        <div className="relative">
          <div className="flex items-center gap-3.5 p-1">
            <div className="w-12 h-12 rounded-full shrink-0 p-[2px]" style={{ background: "linear-gradient(45deg,#8B5CF6,#D946EF)" }}>
              <img
                src={user?.image ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
                style={{ background: "#111" }}
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="text-sm font-extrabold" style={{ color: "var(--body-text)" }}>{user?.name ?? "Usuario"}</div>
              <div className="text-xs" style={{ color: "var(--text-40)" }}>@{user?.user ?? "usuario"}</div>
            </div>
          </div>
          <button
            className="absolute right-1 top-1 flex items-center justify-center cursor-pointer w-[26px] h-[26px] rounded-lg"
            style={{ background: "var(--surface)", border: "1px solid var(--border-light)" }}
            onClick={() => setProfileOpen(true)}
          >
            <EditIcon style={{ stroke: "var(--text-40)" }} />
          </button>
        </div>

        <div>
          <div
            className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] uppercase mt-2"
            style={{ color: "var(--text-35)" }}
          >
            Navegación
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
          </div>
          <nav className="flex flex-col gap-1.5 mt-3">
            {[
              { icon: HomeIcon, label: "Home" },
              { icon: GridIcon, label: "Mis eventos", onClick: () => { router.push("/events"); onClose(); } },
              { icon: UsersIcon, label: "Mis amigos", onClick: () => { router.push("/chats"); onClose(); } },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer text-left transition-all border border-transparent"
                style={{
                  background: "transparent",
                  color: "var(--text-50)",
                }}
                onClick={onClick}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.3)";
                  (e.currentTarget as HTMLElement).style.color = "#c4b5fd";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-50)";
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          <div
            className="flex items-center gap-2.5 text-[10px] font-bold tracking-[0.2em] uppercase mt-2"
            style={{ color: "var(--text-35)" }}
          >
            Acciones
            <div className="flex-1 h-px" style={{ background: "var(--border-light)" }} />
          </div>
          <nav className="flex flex-col gap-1.5 mt-3">
            {[
              { icon: PlusIcon, label: "Crear evento", onClick: () => { router.push("/events"); onClose(); } },
              { icon: SettingsIcon, label: "Configuración" },
              { icon: LogoutIcon, label: "Cerrar Sesión", onClick: () => { logout(); } },
            ].map(({ icon: Icon, label, onClick }) => (
              <button
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold cursor-pointer text-left transition-all"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border-light)",
                  color: "var(--body-text)",
                }}
                onClick={onClick}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between pt-4 mt-auto" style={{ borderTop: "1px solid var(--border-light)" }}>
          <span className="text-xs font-bold" style={{ color: "var(--text-40)" }}>
            {theme === "light" ? "Modo Claro" : "Modo Oscuro"}
          </span>
          <button
            className="relative w-[52px] h-[26px] rounded-full border-none cursor-pointer p-0 transition-colors"
            style={{ background: theme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.07)" }}
            onClick={toggleTheme}
            aria-label="Cambiar tema"
          >
            <div
              className="absolute top-[3px] w-5 h-5 rounded-full flex items-center justify-center shadow-md z-[1] transition-all"
              style={{
                left: theme === "light" ? "28px" : "3px",
                background: theme === "light" ? "#8B5CF6" : "#fff",
              }}
            >
              {theme === "light" ? <SunIcon style={{ stroke: "#fff" }} /> : <MoonIcon style={{ stroke: "#000" }} />}
            </div>
            <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
              <span className="text-[11px] leading-none">🌙</span>
              <span className="text-[11px] leading-none">☀️</span>
            </div>
          </button>
        </div>
      </aside>

      {profileOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setProfileOpen(false)}>
          <div
            className="w-full max-w-[450px] mx-4 rounded-2xl p-6 animate-fadeIn"
            style={{
              background: "var(--modal-bg)",
              border: "1px solid rgba(139,92,246,0.4)",
              boxShadow: "0 0 30px rgba(139,92,246,0.15), 0 10px 25px rgba(0,0,0,0.5)",
            }}
            onClick={e => e.stopPropagation()}
          >
            <ProfileHeader onClose={() => setProfileOpen(false)} editingField={editingField} onBack={() => setEditingField(null)} />

            <ProfileCard />

            {!editingField && <ProfileFieldsList onEdit={setEditingField} user={user} />}

            {editingField && editingField !== "password" && (
              <StandardEditBox
                fieldKey={editingField}
                onBack={() => setEditingField(null)}
                onSave={() => setEditingField(null)}
                user={user}
              />
            )}

            {editingField === "password" && (
              <PasswordEditBox
                onBack={() => setEditingField(null)}
                onSave={() => setEditingField(null)}
              />
            )}
          </div>
        </div>
      )}

      {friendsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setFriendsOpen(false)}>
          <div
            className="w-full max-w-[480px] mx-4 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <FriendsPanel onClose={() => setFriendsOpen(false)} />
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setCreateOpen(false)}>
          <div
            className="w-full max-w-[480px] mx-4 animate-fadeIn overflow-y-auto max-h-[90vh] pb-8"
            onClick={e => e.stopPropagation()}
          >
            <CreateEventPanel onClose={() => setCreateOpen(false)} onSave={(ev) => { setMisEventos(prev => [...prev, { ...ev, id: `ev-${Date.now()}` }]); setCreateOpen(false); }} token={token} />
          </div>
        </div>
      )}

      {eventosOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[80px]" style={{ background: "rgba(0,0,0,0.6)" }} onClick={() => setEventosOpen(false)}>
          <div
            className="w-full max-w-[480px] mx-4 animate-fadeIn"
            onClick={e => e.stopPropagation()}
          >
            <MisEventosPanel eventos={misEventos} onClose={() => setEventosOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
