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
    </header>
  );
}
