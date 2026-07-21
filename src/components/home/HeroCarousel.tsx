"use client";

import { useState, useCallback, useEffect } from "react";
import { HeartIcon } from "@/components/ui/Icons";

interface HeroSlide {
  rating: number;
  badge: string;
  title: string;
  desc: string;
  meta: string[];
  gradient: string;
  glow: string;
}

interface HeroCarouselProps {
  slides: HeroSlide[];
  likedHero: Set<string>;
  onLikeToggle: (title: string) => void;
  onOpenDetail: (slide: HeroSlide) => void;
}

function renderStars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function HeroCarousel({ slides, likedHero, onLikeToggle, onOpenDetail }: HeroCarouselProps) {
  const [cur, setCur] = useState(0);

  const totalSlides = slides.length;

  const moveSlide = useCallback((dir: number) => {
    setCur(prev => (prev + dir + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goSlide = useCallback((i: number) => {
    setCur(i);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => moveSlide(1), 5000);
    return () => clearInterval(timer);
  }, [moveSlide]);

  if (totalSlides === 0) return null;

  return (
    <section
      className="relative w-full h-[380px] rounded-3xl overflow-hidden mb-8"
      style={{ boxShadow: "0 15px 35px rgba(0,0,0,0.4)" }}
    >
      <div className="overflow-hidden rounded-3xl w-full h-full">
        <div
          className="flex transition-transform duration-400 ease w-full h-full"
          style={{ transform: `translateX(-${cur * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div key={i} className="min-w-full max-w-full h-full relative shrink-0">
              <div className="absolute inset-0" style={{ background: slide.gradient }}>
                <div className="absolute inset-0" style={{ opacity: 0.4, background: slide.glow }} />
              </div>
              <div
                className="absolute inset-0 z-[1]"
                style={{ background: "linear-gradient(to top,rgba(0,0,0,0.95) 20%,rgba(0,0,0,0.4) 60%,rgba(0,0,0,0.1) 100%)" }}
              />
              <div className="absolute bottom-0 left-0 p-9 z-[2] max-w-[600px] flex flex-col gap-3 items-start">
                <div
                  className="inline-flex rounded-full border px-3 py-1 text-[9px] tracking-[0.3em] uppercase"
                  style={{
                    borderColor: "rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.5)",
                    color: "rgba(255,255,255,0.8)",
                  }}
                >
                  {slide.badge}
                </div>
                <div style={{ color: "#f59e0b", fontSize: 13, letterSpacing: 1, marginBottom: -4 }}>
                  {renderStars(slide.rating)}
                </div>
                <h2 className="text-4xl font-black leading-none tracking-tight text-white max-w-[12ch] sm:text-[36px]">
                  {slide.title}
                </h2>
                <p className="text-sm leading-relaxed max-w-[40ch]" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {slide.desc}
                </p>
                <div className="flex flex-wrap gap-3.5 text-[11px] font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {slide.meta.map((m, mi) => (
                    <span key={mi} className="flex items-center gap-1.5">{m}</span>
                  ))}
                </div>
                <div className="flex gap-2.5 mt-1">
                  <button
                    className="rounded-full bg-[#8B5CF6] px-[22px] py-2.5 text-xs font-bold text-white border-none cursor-pointer transition-colors hover:bg-[#7c4dff]"
                    onClick={() => onOpenDetail(slide)}
                  >
                    Reservar acceso
                  </button>
                  <button
                    className="rounded-full px-[22px] py-2.5 text-xs font-bold text-white cursor-pointer transition-colors"
                    style={{
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.08)",
                    }}
                    onClick={() => onOpenDetail(slide)}
                  >
                    Ver detalle
                  </button>
                  <button
                    className={`bg-transparent border-none cursor-pointer p-1.5 flex items-center transition-colors ${
                      likedHero.has(slide.title) ? "liked" : ""
                    }`}
                    style={{
                      color: likedHero.has(slide.title) ? "#ef4444" : "rgba(255,255,255,0.4)",
                    }}
                    onClick={e => { e.stopPropagation(); onLikeToggle(slide.title); }}
                  >
                    <HeartIcon size={14} style={likedHero.has(slide.title) ? { fill: "#ef4444", stroke: "#ef4444" } : {}} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute top-1/2 -translate-y-1/2 left-3.5 z-[5] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-lg leading-none transition-all"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "#fff",
        }}
        onClick={() => moveSlide(-1)}
      >
        &#8592;
      </button>
      <button
        className="absolute top-1/2 -translate-y-1/2 right-3.5 z-[5] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer text-lg leading-none transition-all"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1.5px solid rgba(255,255,255,0.3)",
          color: "#fff",
        }}
        onClick={() => moveSlide(1)}
      >
        &#8594;
      </button>

      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex gap-1.5 z-[5]">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-[7px] h-[7px] rounded-full cursor-pointer transition-all ${
              i === cur ? "bg-white scale-125" : ""
            }`}
            style={{ background: i === cur ? "#fff" : "rgba(255,255,255,0.3)" }}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>
    </section>
  );
}
