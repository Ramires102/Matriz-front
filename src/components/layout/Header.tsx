"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SearchIcon, FilterIcon, HeartIcon, StarIcon } from "@/components/ui/Icons";
import { useTheme } from "@/components/theme/ThemeProvider";

interface FilterCategory {
  tab: string;
  label: string;
  items: { name: string; sub?: string; color: string }[];
}

const FILTER_CATEGORIES: FilterCategory[] = [
  {
    tab: "boliches",
    label: "Boliches",
    items: [
      { name: "Electrónica", sub: "Eventos EDM", color: "#8B5CF6" },
      { name: "Jazz & Blues", sub: "Música en vivo", color: "#D946EF" },
      { name: "Arte & Cultura", sub: "Galerías y shows", color: "#10b981" },
      { name: "Pop & Rock", sub: "Bandas y solistas", color: "#f59e0b" },
      { name: "Techno", sub: "Underground", color: "#ef4444" },
      { name: "Ambient", sub: "Chill & downtempo", color: "#06b6d4" },
    ],
  },
  {
    tab: "deportes",
    label: "Deportes",
    items: [
      { name: "Fútbol", sub: "Partidos y torneos", color: "#3b82f6" },
      { name: "Volley", sub: "Indoor y playa", color: "#10b981" },
      { name: "Básquet", sub: "3x3 y 5x5", color: "#f59e0b" },
      { name: "Tenis", sub: "Simples y dobles", color: "#ec4899" },
      { name: "Running", sub: "Carreras y maratones", color: "#8B5CF6" },
      { name: "Otros", sub: "Más deportes", color: "#ef4444" },
    ],
  },
  {
    tab: "suministros",
    label: "Suministros",
    items: [
      { name: "Carnes y Pescados", color: "#ef4444" },
      { name: "Lácteos y Huevos", color: "#f59e0b" },
      { name: "Verdulería", color: "#10b981" },
      { name: "Almacén y Despensa", color: "#8B5CF6" },
      { name: "Panadería y Masas", color: "#D946EF" },
      { name: "Congelados", color: "#06b6d4" },
    ],
  },
];

const STAR_FILTERS = [
  { stars: 5, label: "Excelente" },
  { stars: 4, label: "Muy bueno" },
  { stars: 3, label: "Bueno" },
  { stars: 2, label: "Medio" },
  { stars: 1, label: "Malo" },
];

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  menuTab: string;
  onMenuTabChange: (tab: string) => void;
  likedFilter: boolean;
  onLikedFilterToggle: () => void;
  starsFilter: number | null;
  onStarsFilterChange: (stars: number | null) => void;
  onDrawerToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  fullContent: string;
  time: string;
  category: string;
  location?: string;
  unread: boolean;
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Nuevo evento publicado",
    desc: "Deep Horizon ha sido publicado en Buenos Aires.",
    fullContent: "¡Hola! Se ha publicado un nuevo evento exclusivo en la categoría House. 'Deep Horizon' se llevará a cabo el 27 de junio a las 23:30 hs en Buenos Aires. Esperamos música electrónica en vivo, DJ set internacional y una experiencia inolvidable. ¡Explorá más detalles y reservá tus entradas!",
    time: "Hace 10 min",
    category: "House",
    location: "Buenos Aires",
    unread: true,
  },
  {
    id: "2",
    title: "Invitación a evento",
    desc: "Nico Fernández te invitó a Eclipse Underground.",
    fullContent: "Nico Fernández te ha enviado una invitación formal para asistir a 'Eclipse Underground' en Córdoba. El evento contará con la presencia de artistas underground locales e internacionales. Podés confirmar tu asistencia o chatear directamente con el organizador.",
    time: "Hace 1 hora",
    category: "Techno",
    location: "Córdoba",
    unread: true,
  },
  {
    id: "3",
    title: "Recordatorio de evento",
    desc: "Blue Note Mendoza comienza mañana a las 21:00.",
    fullContent: "Recordatorio automático: Tu evento agendado 'Blue Note Mendoza' comenzará mañana a las 21:00 hs. Te sugerimos llegar con 15 minutos de anticipación para el ingreso prioritario. Recordá presentar tu entrada digital al ingresar.",
    time: "Hace 3 horas",
    category: "Jazz",
    location: "Mendoza",
    unread: false,
  },
];

export default function Header({
  searchTerm, onSearchChange, menuOpen, onMenuToggle, menuTab, onMenuTabChange,
  likedFilter, onLikedFilterToggle, starsFilter, onStarsFilterChange, onDrawerToggle,
}: HeaderProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const { theme, toggleTheme } = useTheme();
  const [starMenuOpen, setStarMenuOpen] = useState(false);
  const starMenuRef = useRef<HTMLDivElement>(null);

  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const notifPopRef = useRef<HTMLDivElement>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifPos, setNotifPos] = useState({ top: 0, left: 16 });
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("meeter_notifications_v1");
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return SAMPLE_NOTIFICATIONS;
  });
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("meeter_notifications_v1", JSON.stringify(notifications));
    }
  }, [notifications]);

  useEffect(() => {
    if (notifOpen && notifBtnRef.current) {
      const updatePosition = () => {
        if (!notifBtnRef.current) return;
        const rect = notifBtnRef.current.getBoundingClientRect();
        const popoverWidth = Math.min(380, window.innerWidth - 32);
        const clampedLeft = Math.max(16, Math.min(rect.left, window.innerWidth - popoverWidth - 16));
        setNotifPos({ top: rect.bottom + 8, left: clampedLeft });
      };
      updatePosition();
      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [notifOpen]);

  const unreadCount = notifications.filter(n => n.unread).length;
  const hasUnread = unreadCount > 0;

  const filteredNotifications = notifications.filter(n => {
    if (notifFilter === "unread") return n.unread;
    return true;
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (!document.body.contains(target)) return;
      if (
        notifOpen &&
        notifPopRef.current &&
        !notifPopRef.current.contains(target) &&
        notifBtnRef.current &&
        !notifBtnRef.current.contains(target)
      ) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [notifOpen]);

  useEffect(() => {
    if (menuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  }, [menuOpen]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        onMenuToggle();
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen, onMenuToggle]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (starMenuOpen && starMenuRef.current && !starMenuRef.current.contains(e.target as Node)) {
        setStarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [starMenuOpen]);

  function renderStars(n: number, filled: number) {
    return "★".repeat(filled) + "<span style='opacity:.2'>" + "★".repeat(n - filled) + "</span>";
  }

  function getNotifCategoryIcon(cat: string) {
    if (cat.toLowerCase().includes("house") || cat.toLowerCase().includes("techno") || cat.toLowerCase().includes("pop")) return "🎉";
    if (cat.toLowerCase().includes("jazz") || cat.toLowerCase().includes("arte")) return "🎷";
    return "🔔";
  }

  return (
    <header
      className="sticky top-0 z-200 flex items-center gap-3.5 px-5 py-3 w-full"
      style={{ background: "var(--header-bg)", borderBottom: "1px solid var(--header-border)" }}
    >
      <button className="flex flex-col justify-between w-[22px] h-4 bg-transparent border-none cursor-pointer shrink-0 z-[210]" onClick={onDrawerToggle} aria-label="Menú">
        <span className="w-full h-[2px] rounded-sm transition-all" style={{ background: "var(--body-text)" }} />
        <span className="w-full h-[2px] rounded-sm transition-all" style={{ background: "var(--body-text)" }} />
        <span className="w-full h-[2px] rounded-sm transition-all" style={{ background: "var(--body-text)" }} />
      </button>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0" style={{ border: "1px solid var(--border-light)", background: "var(--surface)" }}>
          <div className="w-3 h-3 rounded-full" style={{ background: "#8B5CF6" }} />
        </div>
        <div>
          <div className="text-[8px] tracking-[0.4em] uppercase whitespace-nowrap" style={{ color: "var(--text-35)" }}>Luxury Social</div>
          <div className="text-base font-black mt-0.5 whitespace-nowrap" style={{ color: "var(--body-text)" }}>Meeter</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center gap-2.5 min-w-0">
        {/* Botón de Notificaciones al lado izquierdo de la barra de búsqueda */}
        <div className="relative shrink-0">
          <button
            ref={notifBtnRef}
            onClick={() => setNotifOpen(prev => !prev)}
            aria-label="Notificaciones"
            title={hasUnread ? `${unreadCount} notificaciones sin leer` : "Notificaciones"}
            className="relative flex items-center justify-center w-10 h-10 rounded-[14px] transition-all cursor-pointer hover:scale-105 active:scale-95"
            style={{
              background: hasUnread
                ? notifOpen ? "rgba(239,68,68,0.25)" : "rgba(239,68,68,0.14)"
                : notifOpen ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.12)",
              border: `1.5px solid ${
                hasUnread
                  ? notifOpen ? "rgba(239,68,68,0.85)" : "rgba(239,68,68,0.5)"
                  : notifOpen ? "rgba(139,92,246,0.7)" : "rgba(139,92,246,0.35)"
              }`,
              boxShadow: hasUnread ? "0 0 14px rgba(239,68,68,0.35)" : "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={hasUnread ? "#f43f5e" : "var(--body-text)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {hasUnread && (
              <span
                className="flex items-center justify-center text-[9px] font-black text-white rounded-full px-1 min-w-[14px] h-[14px]"
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  background: "#ef4444",
                  border: "2px solid var(--header-bg)",
                  boxShadow: "0 0 8px rgba(239,68,68,0.6)",
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

          {/* Ventana emergente (dropdown) de notificaciones */}
          {notifOpen && createPortal(
            <div
              ref={notifPopRef}
              className="fixed rounded-[22px] p-4.5 shadow-2xl z-[9999] animate-fadeIn backdrop-blur-2xl"
              style={{
                top: notifPos.top,
                left: notifPos.left,
                width: "min(380px, calc(100vw - 32px))",
                background: "var(--modal-bg)",
                border: "1px solid var(--border-light)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b gap-2" style={{ borderColor: "var(--border-light)" }}>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold" style={{ color: "var(--body-text)" }}>Notificaciones</span>
                  {hasUnread && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.18)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                  }}
                  disabled={!hasUnread}
                  className="px-3 py-1.5 text-[11px] font-extrabold rounded-xl transition-all cursor-pointer select-none active:scale-95"
                  style={{
                    background: hasUnread ? "linear-gradient(135deg, #8B5CF6, #7C3AED)" : "var(--surface)",
                    color: hasUnread ? "#ffffff" : "var(--text-40)",
                    border: `1px solid ${hasUnread ? "rgba(139,92,246,0.6)" : "var(--border-light)"}`,
                    opacity: hasUnread ? 1 : 0.4,
                    boxShadow: hasUnread ? "0 4px 12px rgba(139,92,246,0.35)" : "none",
                  }}
                >
                  Marcar leídas
                </button>
              </div>

              {/* Filtros Pestañas */}
              <div className="flex gap-2 my-3">
                <button
                  type="button"
                  onClick={() => setNotifFilter("all")}
                  className="text-xs font-bold px-3 py-1 rounded-lg transition-all border cursor-pointer"
                  style={{
                    background: notifFilter === "all" ? "rgba(139,92,246,0.18)" : "transparent",
                    color: notifFilter === "all" ? "var(--body-text)" : "var(--text-40)",
                    borderColor: notifFilter === "all" ? "rgba(139,92,246,0.4)" : "transparent",
                  }}
                >
                  Todas ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter("unread")}
                  className="text-xs font-bold px-3 py-1 rounded-lg transition-all border cursor-pointer"
                  style={{
                    background: notifFilter === "unread" ? "rgba(239,68,68,0.15)" : "transparent",
                    color: notifFilter === "unread" ? "#ef4444" : "var(--text-40)",
                    borderColor: notifFilter === "unread" ? "rgba(239,68,68,0.35)" : "transparent",
                  }}
                >
                  Sin leer ({unreadCount})
                </button>
              </div>

              <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="py-8 text-center flex flex-col items-center gap-2">
                    <span className="text-2xl opacity-60">🔔</span>
                    <div className="text-xs font-medium" style={{ color: "var(--text-40)" }}>
                      {notifFilter === "unread" ? "No tenés notificaciones sin leer." : "No hay notificaciones."}
                    </div>
                  </div>
                ) : (
                  filteredNotifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item));
                        setSelectedNotification(n);
                      }}
                      className="p-3.5 rounded-2xl transition-all cursor-pointer relative hover:scale-[1.01] active:scale-[0.99] flex items-start gap-3"
                      style={{
                        background: n.unread ? "rgba(239,68,68,0.12)" : "var(--surface)",
                        border: `1px solid ${n.unread ? "rgba(239,68,68,0.35)" : "var(--card-border)"}`,
                        boxShadow: n.unread ? "0 4px 14px rgba(239,68,68,0.12)" : "none",
                      }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ background: n.unread ? "rgba(239,68,68,0.2)" : "rgba(139,92,246,0.12)" }}>
                        {getNotifCategoryIcon(n.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold truncate" style={{ color: "var(--body-text)" }}>{n.title}</span>
                          <span className="text-[10px] font-semibold shrink-0" style={{ color: "var(--text-40)" }}>{n.time}</span>
                        </div>
                        <p className="text-[11px] mt-0.5 leading-snug line-clamp-2" style={{ color: "var(--text-50)" }}>{n.desc}</p>
                      </div>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: "#ef4444", boxShadow: "0 0 6px #ef4444" }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>,
            document.body
          )}

        <style>{`
          @keyframes bell-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.35); opacity: 0.7; }
          }
        `}</style>

        <div className="flex items-center gap-2.5 rounded-[14px] px-[18px] py-[11px] w-[340px] max-w-full min-w-0 transition-all" style={{ border: "1.5px solid rgba(139,92,246,0.4)", background: "rgba(139,92,246,0.08)" }}>
          <SearchIcon className="shrink-0" style={{ stroke: "var(--text-40)" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar eventos, lugares o categorías..."
            className="bg-transparent border-none outline-none text-sm w-full min-w-0"
            style={{ color: "var(--body-text)" }}
          />
        </div>

        <div className="relative shrink-0" style={{ zIndex: 1 }}>
          <button
            ref={buttonRef}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 cursor-pointer text-sm font-bold whitespace-nowrap transition-all ${menuOpen ? "active" : ""}`}
            style={{
              background: menuOpen ? "rgba(139,92,246,0.22)" : "rgba(139,92,246,0.12)",
              border: `1.5px solid ${menuOpen ? "rgba(139,92,246,0.7)" : "rgba(139,92,246,0.35)"}`,
              color: "var(--body-text)",
            }}
            onClick={onMenuToggle}
          >
            <FilterIcon />
            <span className="hidden sm:inline">Explorar</span>
          </button>
        </div>
      </div>

      {menuOpen && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[9999] rounded-[20px] p-6 shadow-2xl animate-fadeIn"
          style={{
            top: menuPos.top,
            right: menuPos.right,
            width: "min(500px, calc(100vw - 32px))",
            background: "var(--modal-bg)",
            border: "1px solid var(--border-light)",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
          }}
        >
          <div className="flex gap-5 border-b pb-1 mb-4 overflow-x-auto" style={{ borderColor: "var(--border-light)" }}>
            {FILTER_CATEGORIES.map(cat => (
              <button
                key={cat.tab}
                className={`bg-transparent border-none pb-2.5 text-sm font-bold cursor-pointer whitespace-nowrap transition-colors relative ${menuTab === cat.tab ? "active" : ""}`}
                style={{
                  color: menuTab === cat.tab ? "var(--body-text)" : "var(--text-40)",
                }}
                onClick={() => onMenuTabChange(cat.tab)}
              >
                {cat.label}
                {menuTab === cat.tab && <span className="absolute bottom-[-1px] left-0 w-full h-0.5 rounded-sm" style={{ background: "#8B5CF6" }} />}
              </button>
            ))}
            <div className="relative flex shrink-0" ref={starMenuRef}>
              <button
                className={`flex items-center gap-1 pb-2.5 text-sm font-bold cursor-pointer whitespace-nowrap bg-transparent border-none shrink-0 transition-colors ${starsFilter ? "active" : ""}`}
                style={{ color: starsFilter ? "#f59e0b" : "var(--text-40)" }}
                onClick={() => setStarMenuOpen(!starMenuOpen)}
                title="Filtrar por puntuación"
              >
                <StarIcon size={14} style={starsFilter ? { fill: "#f59e0b", stroke: "#f59e0b" } : {}} />
              </button>
              {starMenuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-44 rounded-xl p-2 shadow-2xl z-[10000] animate-fadeIn"
                  style={{ background: "var(--modal-bg)", border: "1px solid var(--border-light)" }}
                >
                  <div className="text-[10px] font-bold px-3 py-1.5 uppercase tracking-wider" style={{ color: "var(--text-40)" }}>
                    Puntuación
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {[5, 4, 3, 2, 1].map(num => (
                      <button
                        key={num}
                        className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-lg text-xs font-medium transition-colors ${
                          starsFilter === num ? "font-bold" : ""
                        }`}
                        style={{
                          background: starsFilter === num ? "rgba(139,92,246,0.22)" : "transparent",
                          color: starsFilter === num ? "var(--body-text)" : "var(--text-40)",
                        }}
                        onClick={() => {
                          onStarsFilterChange(starsFilter === num ? null : num);
                          setStarMenuOpen(false);
                        }}
                      >
                        <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1 }} dangerouslySetInnerHTML={{ __html: renderStars(5, num) }} />
                        <span className="text-[10px]" style={{ opacity: 0.6, color: "var(--body-text)" }}>{num === 1 ? "1 Estrella" : `${num} Estrellas`}</span>
                      </button>
                    ))}
                  </div>
                  {starsFilter && (
                    <>
                      <div className="h-px my-1.5" style={{ background: "var(--border-light)" }} />
                      <button
                        className="w-full text-center py-1.5 text-[11px] font-bold rounded-lg transition-colors"
                        style={{ color: "#f43f5e" }}
                        onClick={() => { onStarsFilterChange(null); setStarMenuOpen(false); }}
                      >
                        Limpiar filtro
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              className={`flex items-center gap-1 pb-2.5 text-sm font-bold cursor-pointer whitespace-nowrap bg-transparent border-none shrink-0 transition-colors ${likedFilter ? "active" : ""}`}
              style={{ color: likedFilter ? "#ef4444" : "var(--text-40)" }}
              onClick={onLikedFilterToggle}
              title="Filtrar favoritos"
            >
              <HeartIcon size={14} style={likedFilter ? { fill: "#ef4444", stroke: "#ef4444" } : {}} />
            </button>
          </div>

          {FILTER_CATEGORIES.map(cat => (
            <div key={cat.tab} className={`${menuTab === cat.tab ? "block" : "hidden"} animate-fadeIn`}>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
                {cat.items.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center gap-2.5 p-[11px_13px] rounded-xl cursor-pointer text-left transition-all"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: item.color }} />
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--body-text)" }}>{item.name}</div>
                      {item.sub && <div className="text-[11px]" style={{ color: "var(--text-40)" }}>{item.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {menuTab === "experiencia" && (
            <div className="animate-fadeIn">
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))" }}>
                {STAR_FILTERS.map(sf => (
                  <div
                    key={sf.stars}
                    className={`flex items-center gap-2.5 p-[11px_13px] rounded-xl cursor-pointer text-left transition-all rating-filter-btn ${starsFilter === sf.stars ? "active-stars-filter" : ""}`}
                    style={{
                      background: starsFilter === sf.stars ? "rgba(139,92,246,0.22)" : "var(--surface)",
                      border: `1px solid ${starsFilter === sf.stars ? "rgba(139,92,246,0.7)" : "var(--card-border)"}`,
                    }}
                    onClick={() => onStarsFilterChange(starsFilter === sf.stars ? null : sf.stars)}
                  >
                    <span style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1 }} dangerouslySetInnerHTML={{ __html: renderStars(5, sf.stars) }} />
                    <span className="text-[10px] ml-auto" style={{ opacity: 0.6, color: "var(--body-text)" }}>{sf.label}</span>
                  </div>
                ))}
                <div
                  className="flex items-center gap-2.5 p-[11px_13px] rounded-xl cursor-pointer text-left transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--card-border)" }}
                  onClick={() => onStarsFilterChange(null)}
                >
                  <span style={{ fontSize: 12, color: "var(--text-40)" }}>✕</span>
                  <span className="text-[10px] ml-auto" style={{ opacity: 0.6, color: "var(--body-text)" }}>Sin filtro</span>
                </div>
              </div>
            </div>
          )}
        </div>
      , document.body)}

      {selectedNotification && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="w-full max-w-lg sm:max-w-xl rounded-[24px] p-6 sm:p-8 shadow-2xl relative animate-fadeIn"
            style={{
              background: "var(--modal-bg)",
              border: "1px solid var(--border-light)",
              color: "var(--body-text)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNotification(null)}
              aria-label="Cerrar"
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-sm font-bold transition-transform hover:scale-110"
              style={{ background: "var(--surface)", color: "var(--text-50)" }}
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: "rgba(139,92,246,0.18)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)" }}
              >
                {selectedNotification.category}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--text-40)" }}>
                {selectedNotification.time}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black mb-2" style={{ color: "var(--body-text)" }}>
              {selectedNotification.title}
            </h2>

            {selectedNotification.location && (
              <div className="text-xs font-semibold mb-4 flex items-center gap-1.5" style={{ color: "var(--text-40)" }}>
                <span>📍</span> {selectedNotification.location}
              </div>
            )}

            <div className="py-4 border-t border-b my-5 text-sm leading-relaxed" style={{ borderColor: "var(--border-light)", color: "var(--text-70)" }}>
              {selectedNotification.fullContent}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-6 py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: "#8B5CF6",
                  color: "#ffffff",
                  border: "none",
                  boxShadow: "0 4px 14px rgba(139,92,246,0.4)",
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </header>
  );
}
