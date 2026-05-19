type Props = {
  className?: string;
  title?: string;
};

/** Drapeau du Maroc (SVG) — rendu fiable sur tous les systèmes */
export function MoroccanFlag({ className = "h-4 w-6 shrink-0", title = "Maroc" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 16"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title}</title>
      <rect width="24" height="16" fill="#C1272D" rx="1" />
      <path
        fill="#006233"
        d="M12 3.2l1.55 4.78h5.02l-4.06 2.95 1.55 4.78L12 12.9l-4.06 2.81 1.55-4.78-4.06-2.95h5.02z"
      />
    </svg>
  );
}
