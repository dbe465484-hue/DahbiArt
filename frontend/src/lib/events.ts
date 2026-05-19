import fallback from "@/data/events-fallback.json";
import { formatFrenchDate } from "./format-date";

import { fetchApi } from "./fetch-api";

export type CalendarEvent = {
  id?: string;
  title: string;
  city: string;
  eventDate: string;
  description?: string;
  published?: boolean;
};

export type CalendarEventCard = CalendarEvent & { dateLabel: string };

function toCard(event: CalendarEvent): CalendarEventCard {
  return { ...event, dateLabel: formatFrenchDate(event.eventDate) };
}

function staticEvents(): CalendarEventCard[] {
  return fallback.events.map((e) => toCard(e as CalendarEvent));
}

export async function getEvents(): Promise<CalendarEventCard[]> {
  try {
    const res = await fetchApi("/events", { next: { revalidate: 60 } });
    if (!res.ok) return staticEvents();
    const data = (await res.json()) as CalendarEvent[];
    return data.map((e) => toCard(e));
  } catch {
    return staticEvents();
  }
}
