import type { CalendarEventCard } from "@/lib/events";

function parseParts(iso: string) {
  const d = new Date(iso.includes("T") ? iso : `${iso}T12:00:00`);
  return {
    day: d.getDate(),
    month: new Intl.DateTimeFormat("fr-FR", { month: "short" })
      .format(d)
      .replace(".", ""),
    year: d.getFullYear(),
    weekday: new Intl.DateTimeFormat("fr-FR", { weekday: "long" }).format(d),
  };
}

export function CalendarEventItem({
  event,
  variant = "upcoming",
}: {
  event: CalendarEventCard;
  variant?: "upcoming" | "past";
}) {
  const { day, month, year, weekday } = parseParts(event.eventDate);
  const muted = variant === "past";

  return (
    <article
      className={`group relative grid gap-6 sm:grid-cols-[5.5rem_1fr] sm:gap-8 ${
        muted ? "opacity-75" : ""
      }`}
    >
      <div
        className={`flex flex-col items-center justify-center border px-3 py-4 text-center transition ${
          muted
            ? "border-stone-200 bg-stone-50"
            : "border-amber-900/20 bg-white shadow-[0_8px_30px_-12px_rgba(28,25,23,0.2)] group-hover:border-amber-900/40"
        }`}
      >
        <span
          className={`font-serif text-3xl leading-none ${
            muted ? "text-stone-500" : "text-amber-950"
          }`}
        >
          {day}
        </span>
        <span className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-stone-500">
          {month}
        </span>
        <span className="mt-0.5 text-xs text-stone-400">{year}</span>
      </div>

      <div
        className={`border-l pl-6 sm:pl-8 ${
          muted ? "border-stone-200" : "border-amber-900/25"
        }`}
      >
        <p className="text-xs capitalize text-stone-400">{weekday}</p>
        <h2
          className={`mt-1 font-serif text-xl leading-snug sm:text-2xl ${
            muted ? "text-stone-600" : "text-stone-900"
          }`}
        >
          {event.title}
        </h2>
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-stone-600">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-900/70" aria-hidden />
          {event.city}
        </p>
        {event.description && (
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-stone-500">
            {event.description}
          </p>
        )}
        {!muted && (
          <span className="mt-4 inline-block text-[0.65rem] font-medium uppercase tracking-[0.18em] text-amber-900/80">
            À venir
          </span>
        )}
      </div>
    </article>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z"
      />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
