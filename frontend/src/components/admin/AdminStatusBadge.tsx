type Tone = "success" | "muted" | "warning" | "sky";

const styles: Record<Tone, { wrap: string; dot: string }> = {
  success: { wrap: "bg-green-50 text-green-800 ring-green-100", dot: "bg-green-500" },
  muted: { wrap: "bg-stone-100 text-stone-600 ring-stone-200/80", dot: "bg-stone-400" },
  warning: { wrap: "bg-amber-50 text-amber-900 ring-amber-100", dot: "bg-amber-500" },
  sky: { wrap: "bg-sky-50 text-sky-800 ring-sky-100", dot: "bg-sky-500" },
};

type Props = {
  label: string;
  tone?: Tone;
};

export function AdminStatusBadge({ label, tone = "muted" }: Props) {
  const s = styles[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} aria-hidden />
      {label}
    </span>
  );
}
