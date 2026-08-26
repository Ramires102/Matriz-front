"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HomeIcon } from "@/components/ui/Icons";
import { getEventCategories, createEvent, deleteEvent as deleteEventApi, getEvents } from "@/lib/api";
import type { EventCategory, ApiEvent } from "@/lib/types";

const STORAGE_KEY = "meetr_events";
const DRAFT_KEY = "meetr_draft";
const DELETE_AFTER_DAYS = 30;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface DraftEvent {
  name: string;
  desc: string;
  start: string;
  end: string;
  location: string;
  price: string;
  category: string;
  visibility: string;
  color: string;
}

interface LocalEvent extends DraftEvent {
  id: number;
  status: "published" | "pending" | "finished";
  createdAt: string;
  publishedAt?: string;
}

function getLocalEvents(): LocalEvent[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLocalEvents(events: LocalEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}


function formatPriceDisplay(price: string): string {
  const n = parseFloat(price);
  if (!price || n === 0) return "Gratis";
  return "$" + n.toLocaleString("es-AR");
}

function formatDatePreview(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function EventsDashboard() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [apiEvents, setApiEvents] = useState<ApiEvent[]>([]);
  const [localEvents, setLocalEvents] = useState<LocalEvent[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventsListOpen, setEventsListOpen] = useState(true);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(20, 0, 0, 0);
    return t.toISOString().slice(0, 16);
  });
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [color, setColor] = useState("#8B5CF6");

  // Toast
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((title: string, body: string) => {
    setToast({ title, body });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  // Load categories & API events
  useEffect(() => {
    getEventCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    setLocalEvents(getLocalEvents());
    if (token) {
      getEvents({ limit: 100 })
        .then(res => setApiEvents(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const formData = useMemo(() => ({
    name,
    desc,
    start,
    end,
    location,
    price,
    category,
    visibility,
    color,
  }), [name, desc, start, end, location, price, category, visibility, color]);

  const isComplete = name && start && location && price !== "" && category;

  const fieldCount = [name, start, location, price, category].filter(Boolean).length;

  const previewPrice = price && parseFloat(price) > 0
    ? "$" + parseFloat(price).toLocaleString("es-AR")
    : "Gratis";
  const previewPriceColor = !price || parseFloat(price) === 0 ? "#34d399" : "#fff";
  const previewDateStr = start ? formatDatePreview(start) : "";
  const hasDateError = start && end && new Date(end) <= new Date(start);

  // Save draft
  useEffect(() => {
    if (fieldCount > 0) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        name, desc, start, end, location, price, category, visibility, color,
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, desc, start, end, location, price, category, visibility, color, fieldCount]);

  // Load draft on mount
  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (draft) {
        if (draft.name) setName(draft.name);
        if (draft.desc) setDesc(draft.desc);
        if (draft.start) setStart(draft.start);
        if (draft.end) setEnd(draft.end);
        if (draft.location) setLocation(draft.location);
        if (draft.price) setPrice(draft.price);
        if (draft.category) setCategory(draft.category);
        if (draft.visibility) setVisibility(draft.visibility);
        if (draft.color) setColor(draft.color);
      }
    } catch {}
  }, []);

  function clearForm() {
    setName("");
    setDesc("");
    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(20, 0, 0, 0);
    setStart(t.toISOString().slice(0, 16));
    setEnd("");
    setLocation("");
    setPrice("");
    setCategory("");
    setVisibility("public");
    setColor("#8B5CF6");
  }

  const handlePublish = useCallback(async () => {
    if (!isComplete) {
      showToast("Campos incompletos", "Completá todos los campos obligatorios para publicar.");
      return;
    }
    setSaving(true);
    try {
      if (token) {
        const categoryObj = categories.find(c =>
          c.name.toLowerCase() === category.toLowerCase()
        );
        if (!categoryObj) {
          showToast("Error", "Categoría no encontrada en la base de datos.");
          setSaving(false);
          return;
        }
        const formDataObj = new FormData();
        formDataObj.append("name", name);
        formDataObj.append("description", desc);
        formDataObj.append("initDate", new Date(start).toISOString());
        if (end) formDataObj.append("endingDate", new Date(end).toISOString());
        formDataObj.append("location", location);
        formDataObj.append("categoryFK", String(categoryObj.id));
        formDataObj.append("ticketPrice", String(parseInt(price) || 0));
        formDataObj.append("open", visibility === "public" ? "true" : "false");

        const res = await fetch(`${API_URL}/events`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formDataObj,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message ?? "Error al crear evento");
        }
        const created = await res.json();
        setApiEvents(prev => [created, ...prev]);
        showToast("Evento publicado", "POST /events ejecutado correctamente.");
      } else {
        const newEvent: LocalEvent = {
          id: Date.now(),
          name, desc, start, end: end || "", location, price,
          category, visibility, color,
          status: "published",
          createdAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        };
        const updated = [...localEvents, newEvent];
        saveLocalEvents(updated);
        setLocalEvents(updated);
        showToast("Evento publicado", "Guardado localmente (sin conexión).");
      }
      localStorage.removeItem(DRAFT_KEY);
      clearForm();
    } catch (e: any) {
      showToast("Error", e.message || "Error al publicar el evento");
    }
    setSaving(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, token, name, desc, start, end, location, price, category, visibility, color, categories, localEvents]);

  const handleSaveDraft = useCallback(() => {
    if (!name) {
      showToast("Sin nombre", "Agregá al menos un nombre para guardar.");
      return;
    }
    const newEvent: LocalEvent = {
      id: Date.now(),
      name, desc, start, end: end || "", location, price,
      category, visibility, color,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    const updated = [...localEvents, newEvent];
    saveLocalEvents(updated);
    setLocalEvents(updated);
    clearForm();
    showToast("Borrador guardado", "Guardado en localStorage del navegador.");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, desc, start, end, location, price, category, visibility, color, localEvents]);

  const handleDeleteLocal = useCallback((id: number) => {
    const updated = localEvents.filter(e => e.id !== id);
    saveLocalEvents(updated);
    setLocalEvents(updated);
    showToast("Evento eliminado", "Eliminado del almacenamiento local.");
  }, [localEvents, showToast]);

  const handleDeleteApi = useCallback(async (id: number) => {
    if (!token) return;
    try {
      await deleteEventApi(id, token);
      setApiEvents(prev => prev.filter(e => e.id !== id));
      showToast("Evento eliminado", "DELETE /events/:id ejecutado.");
    } catch (e: any) {
      showToast("Error", e.message || "Error al eliminar");
    }
  }, [token, showToast]);

  // Combine and categorize
  const now = useMemo(() => new Date(), []);

  const { published, pending, finished, stats } = useMemo(() => {
    const apiPublished = apiEvents.filter(e => e.open && new Date(e.initDate) > now);
    const apiFinished = apiEvents.filter(e => e.open && new Date(e.initDate) <= now);
    const localPub = localEvents.filter(e => e.status === "published" && new Date(e.start) > now);
    const localPen = localEvents.filter(e => e.status === "pending");
    const localFin = localEvents.filter(e => e.status === "published" && new Date(e.start) <= now);

    return {
      published: [...apiPublished, ...localPub],
      pending: localPen,
      finished: [...apiFinished, ...localFin],
      stats: {
        total: apiEvents.length + localEvents.length,
        published: apiPublished.length + localPub.length,
        pending: localPen.length,
      },
    };
  }, [apiEvents, localEvents, now]);

  const sortedAll = useMemo(() => [...published, ...pending, ...finished], [published, pending, finished]);

  return (
    <>
      <style>{`
        .events-page {
          width: 100%;
          max-width: 1400px;
          min-height: 100vh;
          margin: 0 auto;
          padding: 24px 28px;
          box-sizing: border-box;
          color: var(--body-text);
          font-family: Inter, sans-serif;
        }
        .events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .events-grid {
            grid-template-columns: 1fr;
          }
          .events-page {
            padding: 14px;
          }
        }
        @media (max-width: 480px) {
          .events-page {
            padding: 10px;
          }
        }
      `}</style>
      <div className="events-page">
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        paddingBottom: 14, borderBottom: "1px solid var(--border-light)", marginBottom: 20,
      }}>
        <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Editor de eventos — Meetr</h1>
        <button
          aria-label="Ir al inicio"
          onClick={() => router.push("/")}
          style={{
            width: 42, height: 42, borderRadius: 12,
            border: "0.5px solid var(--border-light)",
            background: "var(--surface)",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-50)", fontSize: 18,
            transition: "background 0.15s, opacity 0.15s, transform 0.1s",
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
          onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <HomeIcon size={18} />
        </button>
      </div>

      <div className="events-grid">

        {/* Quadrant I: Event list */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: 16, padding: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            color: "var(--text-40)", textTransform: "uppercase", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: "rgba(59,130,246,0.15)", color: "#60a5fa",
            }}>i</span>
            Mis eventos
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14,
          }}>
            {[
              { label: "Total", value: stats.total, color: "var(--body-text)" },
              { label: "Publicados", value: stats.published, color: "#34d399" },
              { label: "Pendientes", value: stats.pending, color: "#fbbf24" },
            ].map(s => (
              <div key={s.label} style={{
                background: "var(--surface)", border: "1px solid var(--border-light)",
                borderRadius: 9, padding: 10, textAlign: "center",
              }}>
                <div style={{ fontSize: 10, color: "var(--text-35)", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <button onClick={() => setEventsListOpen(!eventsListOpen)}
            style={{
              width: "100%", background: "var(--surface)", border: "1px solid var(--border-light)",
              borderRadius: 10, padding: "10px 14px", color: "var(--body-text)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span>Eventos recientes</span>
            <span style={{
              fontSize: 10, color: "var(--text-40)",
              transform: eventsListOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}>▼</span>
          </button>

          {eventsListOpen && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {sortedAll.length === 0 ? (
                <div style={{ textAlign: "center", padding: 20, color: "var(--text-30)", fontSize: 12 }}>
                  Todavía no hay eventos.<br />Creá uno usando el formulario.
                </div>
              ) : (
                sortedAll.map(e => renderEventItem(e, now, handleDeleteApi, handleDeleteLocal, token, (draft) => {
                  setName(draft.name);
                  setDesc(draft.desc);
                  setStart(draft.start);
                  setEnd(draft.end);
                  setLocation(draft.location);
                  setPrice(draft.price);
                  setCategory(draft.category);
                  setVisibility(draft.visibility);
                  setColor(draft.color);
                }))
              )}
            </div>
          )}
        </div>

        {/* Quadrant D: Form */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: 16, padding: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            color: "var(--text-40)", textTransform: "uppercase", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: "rgba(245,158,11,0.15)", color: "#fbbf24",
            }}>D</span>
            Datos del evento
            <span style={{ fontSize: 10, color: "var(--text-30)", fontWeight: 400, textTransform: "none" }}>
              (<span style={{ color: "#ef4444" }}>*</span> obligatorio)
            </span>
          </div>

          <FormField label="Nombre del evento" required>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ej: Fiesta Neon Night 2026"
              style={inputStyle} />
          </FormField>

          <FormField label="Descripción">
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Describí el evento..."
              style={{ ...inputStyle, resize: "vertical", minHeight: 70, fontFamily: "inherit" }} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Inicio" required>
              <input type="datetime-local" value={start} onChange={e => {
                setStart(e.target.value);
                if (end && new Date(end) <= new Date(e.target.value)) setEnd("");
              }} style={inputStyle} />
            </FormField>
            <FormField label="Fin">
              <input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)}
                style={inputStyle} />
            </FormField>
          </div>

          <FormField label="Ubicación" required>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Ej: Club Oasis, Mendoza" style={inputStyle} />
          </FormField>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <FormField label="Precio ($)" required>
              <input type="number" min={0} value={price} onChange={e => setPrice(e.target.value)}
                placeholder="0 = Gratis" style={inputStyle} />
            </FormField>
            <FormField label="Categoría" required>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
                <option value="">
                  {categories.length === 0 ? "Cargando categorías..." : "Seleccioná una categoría..."}
                </option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField label="Visibilidad">
            <select value={visibility} onChange={e => setVisibility(e.target.value)} style={inputStyle}>
              <option value="public">Público</option>
              <option value="private">Privado</option>
            </select>
          </FormField>

          <FormField label="Color de acento">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{
                  width: 38, height: 38, padding: 2, borderRadius: 8, cursor: "pointer",
                  background: "transparent", border: "none",
                }} />
              <span style={{ fontSize: 12, color: "var(--text-50)" }}>{color}</span>
            </div>
          </FormField>

          {!isComplete && fieldCount > 0 && (
            <div style={{ fontSize: 11, color: "#ef4444", marginTop: 6 }}>
              Completá todos los campos obligatorios para publicar.
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button onClick={handlePublish} disabled={saving || !isComplete}
              style={{
                flex: 1, background: saving ? "rgba(139,92,246,0.3)" : "#8B5CF6",
                color: "#fff", border: "none", borderRadius: 10, padding: "11px 0",
                fontSize: 13, fontWeight: 700, cursor: saving || !isComplete ? "not-allowed" : "pointer",
              }}
            >{saving ? "Publicando..." : "Publicar evento"}</button>
            <button onClick={handleSaveDraft}
              style={{
                background: "var(--surface)", color: "var(--text-50)",
                border: "1px solid var(--border-light)", borderRadius: 10,
                padding: "11px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >Guardar borrador</button>
          </div>
        </div>

        {/* Quadrant R: Registration status */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: 16, padding: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            color: "var(--text-40)", textTransform: "uppercase", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: "rgba(16,185,129,0.15)", color: "#34d399",
            }}>R</span>
            Registro
          </div>

          <div style={{
            background: "var(--surface)", border: "1px solid var(--border-light)",
            borderRadius: 10, padding: 12,
          }}>
            {[
              { label: "Estado actual", value: isComplete ? "Listo para publicar" : fieldCount > 0 ? "En edición" : "Sin completar",
                color: isComplete ? "#34d399" : fieldCount > 0 ? "#fbbf24" : "var(--text-30)" },
              { label: "Visibilidad", value: visibility === "private" ? "Privado" : "Público", color: "var(--text-50)" },
              { label: "Categoría", value: category || "—", color: "var(--text-50)" },
              { label: "Campos completos", value: `${fieldCount} / 5`, color: "var(--text-50)" },
            ].map(r => (
              <div key={r.label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 8,
              }}>
                <span style={{ fontSize: 12, color: "var(--text-40)" }}>{r.label}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: r.color }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quadrant V: Preview */}
        <div style={{
          background: "var(--card-bg)", border: "1px solid var(--card-border)",
          borderRadius: 16, padding: 18,
        }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            color: "var(--text-40)", textTransform: "uppercase", marginBottom: 14,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: 6, display: "flex",
              alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
              background: "rgba(139,92,246,0.15)", color: "#a78bfa",
            }}>V</span>
            Vista previa (en tiempo real)
          </div>

          <div style={{
            background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{
              height: 90, position: "relative", display: "flex", alignItems: "flex-end",
              padding: "10px 12px", background: color + "33",
              borderBottom: "2px solid " + color + "66",
            }}>
              <span style={{
                background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                color: previewPriceColor,
              }}>{previewPrice}</span>
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#fff", marginBottom: 6 }}>
                {name || <Placeholder>Nombre del evento...</Placeholder>}
              </div>
              <div style={{
                fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 10,
                lineHeight: 1.5,
              }}>
                {desc || <Placeholder>Descripción del evento...</Placeholder>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📅</span>
                  {previewDateStr || <Placeholder>Fecha de inicio...</Placeholder>}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📍</span>
                  {location || <Placeholder>Ubicación...</Placeholder>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {category ? (
                  <span style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 999,
                    border: `1px solid ${color}66`, color: color,
                  }}>{category}</span>
                ) : (
                  <span style={{
                    fontSize: 10, padding: "3px 9px", borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.3)",
                    fontStyle: "italic",
                  }}>Categoría</span>
                )}
                <span style={{
                  fontSize: 10, padding: "3px 9px", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)",
                }}>{visibility === "private" ? "🔒 Privado" : "🌐 Público"}</span>
              </div>
              <button style={{
                width: "100%", padding: 10, borderRadius: 9, fontSize: 12, fontWeight: 700,
                color: "#fff", border: "none", cursor: "pointer", background: color,
              }}>Obtener entradas</button>
            </div>
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 20, right: 20,
          background: "var(--card-bg)", border: "1px solid rgba(139,92,246,0.4)",
          borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "var(--body-text)",
          zIndex: 9999, opacity: 1, transform: "translateY(0)",
          transition: "all 0.3s",
        }}>
          <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 2 }}>{toast.title}</div>
          <div style={{ fontSize: 11, color: "var(--text-50)" }}>{toast.body}</div>
        </div>
      )}
    </div>
    </>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", fontSize: 11, color: "var(--text-40)", marginBottom: 5,
      }}>
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "rgba(255,255,255,0.2)", fontStyle: "italic" }}>{children}</span>;
}

function renderEventItem(
  e: ApiEvent | LocalEvent,
  now: Date,
  onDeleteApi: (id: number) => void,
  onDeleteLocal: (id: number) => void,
  token: string | null,
  onResumeDraft?: (draft: LocalEvent) => void,
) {
  const isApi = "owner" in e;
  const isPublished = isApi ? e.open && new Date(e.initDate) > now : (e as LocalEvent).status === "published" && new Date((e as LocalEvent).start) > now;
  const isPending = !isApi && (e as LocalEvent).status === "pending";
  const isFinished = isApi ? new Date(e.initDate) <= now : (e as LocalEvent).status !== "pending" && new Date((e as LocalEvent).start) <= now;

  let statusClass = "", statusText = "";
  let dotColor = "";
  let extraInfo = "";

  if (isPublished) {
    statusClass = "badge-published";
    statusText = "Publicado";
    dotColor = "#34d399";
  } else if (isPending) {
    statusClass = "badge-pending";
    statusText = "Pendiente";
    dotColor = "#fbbf24";
  } else {
    statusClass = "badge-finished";
    statusText = "Finalizado";
    dotColor = "rgba(255,255,255,0.2)";
    const created = isApi
      ? new Date(e.initDate).getTime()
      : new Date((e as LocalEvent).createdAt).getTime();
    const deleteAt = created + DELETE_AFTER_DAYS * 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((deleteAt - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0) {
      extraInfo = ` · Se elimina en ${daysLeft} día${daysLeft !== 1 ? "s" : ""}`;
    }
  }

  const name = isApi ? e.name : (e as LocalEvent).name;
  const cat = isApi ? e.category?.name : (e as LocalEvent).category;
  const date = isApi
    ? new Date(e.initDate).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : (e as LocalEvent).start
      ? new Date((e as LocalEvent).start).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" })
      : "Sin fecha";
  const eventId = isApi ? e.id : (e as LocalEvent).id;

  const handleRowClick = isPending && !isApi && onResumeDraft
    ? () => onResumeDraft(e as LocalEvent)
    : undefined;

  return (
    <div
      key={eventId}
      onClick={handleRowClick}
      title={isPending ? "Hacer clic para retomar el borrador" : undefined}
      style={{
        background: "var(--surface)",
        border: isPending ? "1px solid rgba(245,158,11,0.3)" : "1px solid var(--border-light)",
        borderRadius: 10, padding: "10px 12px", display: "flex",
        alignItems: "center", justifyContent: "space-between", gap: 10,
        cursor: isPending ? "pointer" : "default",
        transition: "background 0.15s, border-color 0.15s, transform 0.1s",
      }}
      onMouseEnter={isPending ? (ev) => {
        ev.currentTarget.style.background = "rgba(245,158,11,0.07)";
        ev.currentTarget.style.borderColor = "rgba(245,158,11,0.55)";
        ev.currentTarget.style.transform = "translateY(-1px)";
      } : undefined}
      onMouseLeave={isPending ? (ev) => {
        ev.currentTarget.style.background = "var(--surface)";
        ev.currentTarget.style.borderColor = "rgba(245,158,11,0.3)";
        ev.currentTarget.style.transform = "translateY(0)";
      } : undefined}
      onMouseDown={isPending ? (ev) => { ev.currentTarget.style.transform = "scale(0.99)"; } : undefined}
      onMouseUp={isPending ? (ev) => { ev.currentTarget.style.transform = "translateY(-1px)"; } : undefined}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: dotColor,
        }} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "var(--body-text)",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>{name}</div>
          <div style={{ fontSize: 10, color: "var(--text-35)", marginTop: 2 }}>
            {date} · {cat || "Sin categoría"}{extraInfo}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{
          fontSize: 10, padding: "2px 8px", borderRadius: 999, whiteSpace: "nowrap",
          background: isPublished ? "rgba(16,185,129,0.12)" : isPending ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.05)",
          color: isPublished ? "#34d399" : isPending ? "#fbbf24" : "rgba(255,255,255,0.35)",
          border: `1px solid ${
            isPublished ? "rgba(16,185,129,0.25)" : isPending ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.1)"
          }`,
        }}>{statusText}</span>
        <button
          onClick={(ev) => {
            ev.stopPropagation();
            isApi ? onDeleteApi(eventId) : onDeleteLocal(eventId);
          }}
          style={{
            background: "none", border: "none", color: "rgba(239,68,68,0.5)",
            cursor: "pointer", fontSize: 13, padding: "2px 4px",
          }}
          title="Eliminar">✕</button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border-light)",
  borderRadius: 9,
  padding: "9px 12px",
  color: "var(--body-text)",
  fontSize: 13,
  outline: "none",
  transition: "border-color 0.2s",
  fontFamily: "inherit",
};
