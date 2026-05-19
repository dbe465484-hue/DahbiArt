import { CalendarPageContent } from "@/components/calendar/CalendarPageContent";
import { getEvents } from "@/lib/events";

export const metadata = {
  title: "Calendrier",
  description:
    "Vernissages, portes ouvertes et rencontres avec Dahbi Machrouhi — agenda des événements de l'atelier au Maroc.",
};

export default async function CalendarPage() {
  const events = await getEvents();

  return <CalendarPageContent events={events} />;
}
