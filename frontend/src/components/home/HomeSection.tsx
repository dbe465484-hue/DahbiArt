import type { ReactNode } from "react";
import {
  homeBg,
  homeContainer,
  homeSection,
  homeTextureStyle,
} from "./home-theme";

type Variant = keyof typeof homeBg;

export function HomeBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={homeTextureStyle}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-80 w-80 translate-x-1/4 rounded-full bg-amber-200/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 rounded-full bg-stone-300/20 blur-3xl"
        aria-hidden
      />
    </>
  );
}

export function HomeSection({
  children,
  variant = "cream",
  className = "",
  noTexture = false,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  noTexture?: boolean;
}) {
  return (
    <section className={`${homeSection} ${homeBg[variant]} ${className}`}>
      {variant !== "dark" && !noTexture && <HomeBackdrop />}
      <div className={homeContainer}>{children}</div>
    </section>
  );
}
