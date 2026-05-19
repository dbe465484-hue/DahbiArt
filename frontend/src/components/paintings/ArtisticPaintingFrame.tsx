import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Cadre galerie : baguette bois, passe-partout crème, ombre portée. */
export function ArtisticPaintingFrame({ children, className = "" }: Props) {
  return (
    <div
      className={`relative shadow-[0_16px_48px_-14px_rgba(28,25,23,0.45)] transition duration-500 group-hover:shadow-[0_22px_56px_-12px_rgba(28,25,23,0.5)] ${className}`}
    >
      <div className="bg-gradient-to-br from-[#9a7b3c] via-[#6f5428] to-[#4a3818] p-[3px] sm:p-1">
        <div className="bg-gradient-to-br from-[#8f7040] via-[#6b4f2a] to-[#5a4224] p-[2px]">
          <div className="bg-[#f7f4ef] p-2.5 sm:p-3.5">
            <div className="ring-1 ring-[#a08048]/35 ring-inset">{children}</div>
          </div>
        </div>
      </div>
      <span
        className="pointer-events-none absolute -bottom-px left-1/2 h-2 w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-stone-900/12 to-transparent"
        aria-hidden
      />
    </div>
  );
}
