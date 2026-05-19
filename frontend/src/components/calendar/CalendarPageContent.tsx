import Link from "next/link";
import { CalendarEventItem } from "@/components/calendar/CalendarEventItem";
import {
  homeBtnGhost,
  homeBtnPrimary,
  homeEyebrow,
  homeLead,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import { ARTIST } from "@/lib/artist";
import type { CalendarEventCard } from "@/lib/events";

function eventTimestamp(iso: string) {
  return new Date(iso.includes("T") ? iso : `${iso}T12:00:00`).getTime();
}

function partitionEvents(events: CalendarEventCard[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now = today.getTime();

  const sorted = [...events].sort(
    (a, b) => eventTimestamp(a.eventDate) - eventTimestamp(b.eventDate),
  );

  const upcoming = sorted.filter((e) => eventTimestamp(e.eventDate) >= now);
  const past = sorted.filter((e) => eventTimestamp(e.eventDate) < now).reverse();

  return { upcoming, past };
}

export function CalendarPageContent({ events }: { events: CalendarEventCard[] }) {
  const { upcoming, past } = partitionEvents(events);

  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
          <p className={homeEyebrow}>Agenda</p>
          <h1 className={`mt-3 ${homeTitle} sm:text-5xl`}>
            Calendrier
            <span className={`mt-2 block ${homeTitleItalic}`}>des événements</span>
          </h1>
          <p className={`mx-auto mt-6 max-w-2xl ${homeLead}`}>
            Vernissages, portes ouvertes de l&apos;atelier et rencontres — retrouvez Dahbi
            Machrouhi en galerie et sur les marchés d&apos;art au Maroc.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[1fr_18rem] lg:gap-20 xl:grid-cols-[1fr_20rem]">
            <div>
              {events.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {upcoming.length > 0 && (
                    <EventSection
                      label="À venir"
                      count={upcoming.length}
                      events={upcoming}
                      variant="upcoming"
                    />
                  )}

                  {upcoming.length === 0 && past.length > 0 && (
                    <p className="mb-10 rounded-sm border border-amber-900/15 bg-amber-50/50 px-5 py-4 text-sm text-stone-600">
                      Aucun événement à venir pour le moment. Consultez les dates passées ou
                      contactez l&apos;atelier pour organiser une visite privée.
                    </p>
                  )}

                  {past.length > 0 && (
                    <EventSection
                      label="Événements passés"
                      count={past.length}
                      events={past}
                      variant="past"
                      className={upcoming.length > 0 ? "mt-20" : ""}
                    />
                  )}
                </>
              )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <StudioAside />
            </aside>
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200/80 bg-[#f6f1ea] py-14 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center lg:px-8">
          <p className={homeEyebrow}>Sur invitation</p>
          <p className="max-w-lg font-serif text-2xl font-light text-stone-800">
            Organiser une exposition ou une visite d&apos;atelier ?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/commission" className={homeBtnPrimary}>
              Demander une commande
            </Link>
            <a href={`mailto:${ARTIST.studio.email}`} className={homeBtnGhost}>
              Écrire à l&apos;atelier
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function EventSection({
  label,
  count,
  events,
  variant,
  className = "",
}: {
  label: string;
  count: number;
  events: CalendarEventCard[];
  variant: "upcoming" | "past";
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-10 flex items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <p className={homeEyebrow}>{label}</p>
          <h2
            className={`mt-1 font-serif text-2xl ${variant === "past" ? "text-stone-600" : "text-stone-900"}`}
          >
            {count === 1 ? "Un rendez-vous" : `${count} rendez-vous`}
          </h2>
        </div>
        <span className="hidden text-xs uppercase tracking-[0.2em] text-stone-400 sm:block">
          {variant === "upcoming" ? "Prochaines dates" : "Archives"}
        </span>
      </div>

      <ol className="relative space-y-12 md:space-y-14">
        {events.map((event, i) => (
          <li key={event.id ?? `${event.title}-${event.eventDate}`} className="relative">
            {i < events.length - 1 && (
              <span
                className="absolute left-[2.6875rem] top-[5.5rem] hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-amber-900/25 to-transparent sm:block"
                aria-hidden
              />
            )}
            <CalendarEventItem event={event} variant={variant} />
          </li>
        ))}
      </ol>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center">
      <p className="font-serif text-2xl font-light text-stone-800">Aucun événement programmé</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        Le calendrier sera bientôt mis à jour. En attendant, contactez l&apos;atelier pour une visite
        privée ou une commande sur mesure.
      </p>
      <Link href="/commission" className={`mt-8 inline-flex ${homeBtnPrimary}`}>
        Demander une commande
      </Link>
    </div>
  );
}

function StudioAside() {
  return (
    <div className="border border-stone-200/90 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(28,25,23,0.25)]">
      <p className={homeEyebrow}>L&apos;atelier</p>
      <h3 className="mt-2 font-serif text-xl text-stone-900">{ARTIST.studio.name}</h3>
      <p className="mt-3 text-sm leading-relaxed text-stone-600">{ARTIST.location}</p>
      <address className="mt-4 not-italic text-sm leading-relaxed text-stone-500">
        {ARTIST.studio.address}
      </address>
      <div className="mt-6 space-y-2 border-t border-stone-100 pt-6 text-sm">
        <a
          href={`mailto:${ARTIST.studio.email}`}
          className="block text-amber-900 transition hover:text-amber-950"
        >
          {ARTIST.studio.email}
        </a>
        <a
          href={`tel:${ARTIST.studio.phone.replace(/\s/g, "")}`}
          className="block text-stone-600 transition hover:text-stone-900"
        >
          {ARTIST.studio.phone}
        </a>
      </div>
      <Link
        href="/about"
        className="mt-6 inline-block text-xs uppercase tracking-[0.16em] text-stone-500 transition hover:text-amber-900"
      >
        Découvrir l&apos;artiste →
      </Link>
    </div>
  );
}
