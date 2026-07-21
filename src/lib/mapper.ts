import type { ApiEvent, EventCategory } from "./types";
import type { EventItem } from "@/app/page";

const CATEGORY_COLORS: Record<string, string> = {
  Techno: "#a855f7",
  Jazz: "#10b981",
  Arte: "#f97316",
  House: "#3b82f6",
  Pop: "#22c55e",
  Electrónica: "#eab308",
  Indie: "#3b82f6",
  Ambient: "#14b8a6",
  Rock: "#ef4444",
  Boliche: "#8B5CF6",
  Deporte: "#3b82f6",
  Música: "#D946EF",
  Festival: "#f59e0b",
  Cultura: "#10b981",
  Gastronomía: "#ef4444",
};

function getThemeColor(categoryName: string): string {
  return CATEGORY_COLORS[categoryName] ?? "#8B5CF6";
}

function getBgStyle(color: string): string {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  const darkR = Math.round(r * 0.12);
  const darkG = Math.round(g * 0.1);
  const darkB = Math.round(b * 0.12);
  return `linear-gradient(135deg,#1a0a2e,rgb(${darkR},${darkG},${darkB}))`;
}

function formatPrice(price: number): string {
  if (price === 0) return "Gratis";
  return `$${price.toLocaleString("es-AR")}`;
}

function isLive(initDate: string): boolean {
  const now = Date.now();
  const start = new Date(initDate).getTime();
  const diff = start - now;
  return diff > 0 && diff < 86400000;
}

export function apiEventToEventItem(api: ApiEvent): EventItem {
  const color = getThemeColor(api.category.name);
  return {
    id: String(api.id),
    rating: api.rate > 0 ? Math.round(Math.min(api.rate, 10) / 2) : 5,
    themeColor: color,
    title: api.name,
    category: api.category.name,
    description: api.description ?? "",
    meta: api.location,
    price: formatPrice(api.ticketPrice),
    free: api.ticketPrice === 0,
    attendees: api._count?.guestsRel ?? 0,
    bgStyle: getBgStyle(color),
    live: isLive(api.initDate),
  };
}

export function apiEventsToEventItems(apiEvents: ApiEvent[]): EventItem[] {
  return apiEvents.map(apiEventToEventItem);
}

export function categoriesToFilterItems(categories: EventCategory[]) {
  return categories.map(c => ({
    name: c.name,
    color: getThemeColor(c.name),
  }));
}
