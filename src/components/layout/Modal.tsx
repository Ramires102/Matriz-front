"use client";

import { useEffect } from "react";
import { CloseIcon, HeartIcon, CheckIcon } from "@/components/ui/Icons";
import type { EventItem } from "@/app/page";

interface ModalProps {
  event: EventItem | null;
  open: boolean;
  isLiked: boolean;
  onLike: () => void;
  onClose: () => void;
}

function renderStars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function Modal({ event, open, isLiked, onLike, onClose }: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!event) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[1000] transition-all duration-350 ease ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
        onClick={onClose}
      />
      <div
        className={`fixed top-1/2 left-1/2 w-[calc(100%-32px)] max-w-[680px] max-h-[85vh] z-[1001] flex flex-col rounded-[28px] overflow-hidden transition-all duration-350 ease overflow-y-auto ${
          open ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-[0.92]"
        }`}
        style={{
          transform: open ? "translate(-50%,-50%) scale(1)" : "translate(-50%,-50%) scale(0.92)",
          background: "var(--modal-bg)",
          border: "2px solid color-mix(in srgb, var(--tc, rgba(255,255,255,0.1)) 40%, transparent)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.85), 0 0 45px color-mix(in srgb, var(--tc, transparent) 25%, transparent)",
          scrollbarWidth: "thin",
          scrollbarColor: "transparent transparent",
          "--tc": event.themeColor,
        } as React.CSSProperties}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.scrollbarColor = "rgba(255,255,255,0.08) transparent";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.scrollbarColor = "transparent transparent";
        }}
      >
        <button
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-[34px] h-[34px] rounded-full cursor-pointer transition-all"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
          }}
          onClick={onClose}
        >
          <CloseIcon size={16} />
        </button>

        <div
          className="relative w-full h-[220px] shrink-0"
          style={{ background: event.bgStyle, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div
            className="absolute inset-0 z-[1]"
            style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0) 10%,rgba(0,0,0,0.4) 60%,var(--modal-bg) 100%)" }}
          />
          <div className="absolute bottom-4 left-5 flex gap-2 z-[2]">
            <span
              className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em]"
              style={{
                border: "1px solid rgba(139,92,246,0.4)",
                background: "rgba(139,92,246,0.25)",
                color: "#c4b5fd",
              }}
            >
              {event.category}
            </span>
            <span
              className="rounded-full px-3 py-1 text-[10px] font-extrabold"
              style={{
                background: event.free ? "#34d399" : "#8B5CF6",
                color: event.free ? "#000" : "#fff",
              }}
            >
              {event.price}
            </span>
          </div>
        </div>

        <div className="px-6 pt-5 pb-0" style={{ color: "#f59e0b", fontSize: 16, letterSpacing: 2 }}>
          {renderStars(event.rating)}
        </div>

        <div className="p-6 flex flex-col gap-5 flex-1" style={{ background: "var(--modal-body-bg)" }}>
          <h2 className="text-2xl font-black tracking-tight leading-tight" style={{ color: "var(--body-text)" }}>
            {event.title}
          </h2>

          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-light)",
            }}
          >
            <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "linear-gradient(135deg,#8B5CF6,#D946EF)" }} />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--body-text)" }}>
                Organizador Certificado
                <span className="inline-flex items-center justify-center rounded-full w-[13px] h-[13px]" style={{ background: "#8B5CF6" }}>
                  <CheckIcon size={8} />
                </span>
              </div>
              <div className="text-[11px]" style={{ color: "var(--text-40)" }}>Cuenta Verificada</div>
            </div>
          </div>

          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-50)" }}>
            {event.description}
          </p>

          <div>
            <div className="text-[11px] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: "var(--text-35)" }}>
              Galería del Sitio
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="h-[95px] rounded-xl" style={{ background: event.bgStyle, border: "1px solid var(--border-light)" }} />
              <div className="h-[95px] rounded-xl" style={{ background: event.bgStyle, border: "1px solid var(--border-light)" }} />
              <div className="h-[95px] rounded-xl" style={{ background: event.bgStyle, border: "1px solid var(--border-light)" }} />
            </div>
          </div>

          <div className="flex items-center gap-4 mt-0" style={{ borderTop: "1px solid var(--border-light)" }}>
            <button className="flex-1 text-center font-extrabold text-sm cursor-pointer rounded-2xl py-3.5 border-none transition-all" style={{ background: "var(--body-text)", color: "var(--body-bg)" }}>
              {event.free ? "Reservar Lugar Gratis" : `Adquirir Entrada • ${event.price}`}
            </button>
            <button
              className={`flex items-center justify-center w-[45px] h-[45px] rounded-2xl cursor-pointer transition-all shrink-0 border ${
                isLiked ? "liked" : ""
              }`}
              style={{
                background: isLiked ? "var(--surface)" : "var(--surface)",
                borderColor: "var(--border-light)",
                color: isLiked ? "#ef4444" : "var(--body-text)",
              }}
              onClick={onLike}
            >
              <HeartIcon size={18} style={isLiked ? { fill: "#ef4444", stroke: "#ef4444" } : {}} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
