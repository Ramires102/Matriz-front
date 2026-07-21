"use client";

import { HeartIcon } from "@/components/ui/Icons";
import type { EventItem } from "@/app/page";

interface FeedGridProps {
  events: EventItem[];
  likedCards: Set<string>;
  onLikeToggle: (id: string) => void;
  onCardClick: (event: EventItem) => void;
  eventCount: number;
}

function renderStars(n: number) {
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function FeedGrid({ events, likedCards, onLikeToggle, onCardClick, eventCount }: FeedGridProps) {
  return (
    <>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <div className="text-xs font-bold tracking-[0.05em]" style={{ color: "var(--text-35)" }}>Feed dinámico</div>
          <h3 className="text-xl font-black tracking-tight" style={{ color: "var(--body-text)" }}>Descubrí experiencias</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold" style={{ color: "var(--text-35)" }}>{eventCount} EVENTOS</span>
          <button
            className="text-[11px] font-bold border-none rounded-lg px-4 py-2 cursor-pointer transition-colors"
            style={{
              background: "#8B5CF6",
              color: "#fff",
            }}
          >
            Ver tendencias
          </button>
        </div>
      </div>

      <div className="masonry-grid">
        {events.map(event => {
          const liked = likedCards.has(event.id);
          return (
            <div
              key={event.id}
              className="mitem"
              data-rating={event.rating}
              style={{
                flex: "0 0 calc(33.333% - 14px)",
                background: "var(--card-bg)",
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                border: `1px solid color-mix(in srgb, var(--tc, rgba(255,255,255,0.08)) 40%, transparent)`,
                transition: "transform .3s cubic-bezier(0.175,0.885,0.32,1.275), border-color .2s, box-shadow .2s",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                "--tc": event.themeColor,
              } as React.CSSProperties}
              onClick={() => onCardClick(event)}
            >
              <button
                className={`absolute top-2.5 right-2.5 z-10 border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-all ${
                  liked ? "liked" : ""
                }`}
                style={{
                  background: liked ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.4)",
                  color: liked ? "#ef4444" : "rgba(255,255,255,0.5)",
                }}
                onClick={e => { e.stopPropagation(); onLikeToggle(event.id); }}
              >
                <HeartIcon size={16} style={liked ? { fill: "#ef4444", stroke: "#ef4444" } : {}} />
              </button>

              <div className="relative w-full overflow-hidden shrink-0" style={{ background: "#111" }}>
                <div style={{ height: 180, background: event.bgStyle, width: "100%", transition: "transform .5s ease" }} />
                <div
                  className="absolute top-[9px] left-[9px] rounded-full inline-flex items-center px-2 py-0.5 text-[9px] font-semibold whitespace-nowrap max-w-[90%]"
                  style={{
                    border: "1px solid rgba(139,92,246,0.3)",
                    background: "rgba(139,92,246,0.15)",
                    color: "#c4b5fd",
                  }}
                >
                  {event.category}
                </div>
                {event.live && (
                  <div
                    className="absolute bottom-[9px] left-[9px] rounded-full px-2.5 py-1 text-[9px] font-semibold w-fit whitespace-nowrap"
                    style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                  >
                    LIVE NOW
                  </div>
                )}
              </div>

              <div style={{ color: "#f59e0b", fontSize: 12, letterSpacing: 1, padding: "8px 16px 0", margin: 0 }}>
                {renderStars(event.rating)}
              </div>

              <div className="p-4 flex flex-col gap-2 flex-1">
                <h4 className="text-[15px] font-extrabold leading-tight" style={{ color: "var(--body-text)" }}>
                  {event.title}
                </h4>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--text-50)" }}>
                  {event.description}
                </p>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--text-35)" }}>
                  {event.meta}
                </div>
                <div
                  className="flex items-center justify-between pt-3 mt-auto"
                  style={{ borderTop: "1px solid var(--border-light)" }}
                >
                  <div className="flex items-center">
                    <div
                      className="w-[26px] h-[26px] rounded-full border-2 -ml-2 object-cover transition-transform"
                      style={{ borderColor: "#000", background: "#222", zIndex: 2 }}
                    />
                    <div
                      className="w-[26px] h-[26px] rounded-full border-2 -ml-2 object-cover transition-transform"
                      style={{ borderColor: "#000", background: "#222" }}
                    />
                    <div
                      className="w-[26px] h-[26px] rounded-full border-2 -ml-2 flex items-center justify-center text-[9px] font-bold relative z-[2]"
                      style={{
                        borderColor: "#000",
                        background: event.themeColor,
                        color: "#fff",
                      }}
                    >
                      +{event.attendees}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {event.free ? (
                      <span className="text-xs font-extrabold" style={{ color: "#10B981", background: "rgba(16,185,129,0.1)", padding: "4px 8px", borderRadius: 8 }}>
                        {event.price}
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold" style={{ color: "var(--body-text)", background: "var(--surface)", padding: "4px 8px", borderRadius: 8 }}>
                        {event.price}
                      </span>
                    )}
                    <button
                      className="text-[11px] font-bold border-none rounded-lg px-3 py-1.5 cursor-pointer transition-colors"
                      style={{ background: "#8B5CF6", color: "#fff" }}
                    >
                      Reservar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media (max-width: 900px) {
          .masonry-grid .mitem { flex: 0 0 calc(50% - 8px) !important; }
        }
        @media (max-width: 600px) {
          .masonry-grid .mitem { flex: 0 0 100% !important; }
        }
        .mitem:hover > div:first-of-type > div:first-of-type { transform: scale(1.04); }
        .mitem[data-theme-color]:hover { border-color: var(--tc); box-shadow: 0 12px 30px rgba(0,0,0,0.5), 0 0 25px color-mix(in srgb, var(--tc) 35%, transparent); }
        body.light-theme .mitem[data-theme-color]:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.1), 0 0 25px color-mix(in srgb, var(--tc) 25%, transparent); }
        .mitem:not([data-theme-color]):hover { border-color: rgba(139,92,246,0.4); box-shadow: 0 12px 30px rgba(0,0,0,0.5), 0 0 25px rgba(139,92,246,0.2); }
        body.light-theme .mitem:not([data-theme-color]):hover { box-shadow: 0 12px 30px rgba(0,0,0,0.1), 0 0 25px rgba(139,92,246,0.15); }
        body.light-theme .mitem { background: #fff; border-color: color-mix(in srgb, var(--tc, rgba(0,0,0,0.1)) 40%, transparent); }
          `
        }}
      />
    </>
  );
}
