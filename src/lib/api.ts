import type { ApiEvent, EventCategory, EventsResponse, EventsQueryParams } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: customHeaders, ...rest } = options ?? {};
  const headers = new Headers(customHeaders);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(`${API_URL}${path}`, { ...rest, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `API error ${res.status}`);
  }
  return res.json();
}

export async function getEvents(params?: EventsQueryParams): Promise<EventsResponse> {
  const search = new URLSearchParams();
  if (params?.search) search.set("search", params.search);
  if (params?.open !== undefined) search.set("open", String(params.open));
  if (params?.categoryFK) search.set("categoryFK", String(params.categoryFK));
  if (params?.location) search.set("location", params.location);
  if (params?.from) search.set("from", params.from);
  if (params?.to) search.set("to", params.to);
  if (params?.orderBy) search.set("orderBy", params.orderBy);
  if (params?.order) search.set("order", params.order);
  if (params?.cursor) search.set("cursor", String(params.cursor));
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return fetchJSON<EventsResponse>(`/events${qs ? `?${qs}` : ""}`);
}

export async function getEvent(id: number): Promise<ApiEvent> {
  return fetchJSON<ApiEvent>(`/events/${id}`);
}

export async function getEventCategories(): Promise<EventCategory[]> {
  return fetchJSON<EventCategory[]>("/events/categories");
}

export async function createEvent(formData: FormData, token: string): Promise<ApiEvent> {
  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `API error ${res.status}`);
  }
  return res.json();
}
