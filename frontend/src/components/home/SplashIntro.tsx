"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ARTIST } from "@/lib/artist";

const STORAGE_KEY = "mayn-intro-dismissed";

function BracketLogo({ first, last }: { first: string; last: string }) {
  return (
    <div className="relative inline-block px-14 py-12 md:px-20 md:py-14">
      <span className="pointer-events-none absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-white md:h-14 md:w-14" />
      <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r-2 border-t-2 border-white md:h-14 md:w-14" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-10 w-10 border-b-2 border-l-2 border-white md:h-14 md:w-14" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 border-b-2 border-r-2 border-white md:h-14 md:w-14" />
      <div className="select-none font-sans font-bold leading-none tracking-[0.08em]">
        <p className="text-4xl text-amber-500 sm:text-5xl md:text-7xl">{first.toUpperCase()}</p>
        <p className="text-4xl text-white sm:text-5xl md:text-7xl">{last.toUpperCase()}</p>
        <p className="mt-3 text-base tracking-[0.35em] text-white sm:text-lg md:text-xl">
          FINE ART
        </p>
      </div>
    </div>
  );
}

export function SplashIntro() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [videoOk, setVideoOk] = useState(true);

  const nameParts = ARTIST.name.split(" ");
  const first = nameParts[0] ?? ARTIST.name;
  const last = nameParts.slice(1).join(" ") || "";

  const enter = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
    document.body.style.overflow = "";

    window.setTimeout(() => {
      setVisible(false);
      document.getElementById("home-main")?.scrollIntoView({ behavior: "smooth" });
    }, 650);
  }, [leaving]);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;

    setVisible(true);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!visible || leaving) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY > 8) enter();
    };

    let touchStart = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStart = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY ?? 0;
      if (touchStart - y > 40) enter();
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [visible, leaving, enter]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex cursor-pointer flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-out ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      onClick={enter}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          enter();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Entrer sur le site — cliquer ou faire défiler"
    >
      {videoOk ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={ARTIST.heroPoster}
          src={ARTIST.heroVideo}
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-sm brightness-75"
          onError={() => setVideoOk(false)}
        />
      ) : (
        <Image
          src={ARTIST.heroPoster}
          alt=""
          fill
          className="scale-110 object-cover blur-md brightness-75"
          sizes="100vw"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/55" aria-hidden />

      <div className="relative z-10 px-4 text-center">
        <BracketLogo first={first} last={last} />
        <p className="mx-auto mt-10 max-w-md text-sm uppercase tracking-[0.16em] text-white/75 sm:text-base">
          {ARTIST.tagline} · {ARTIST.location.toUpperCase()}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          enter();
        }}
        className="absolute bottom-10 z-10 flex flex-col items-center gap-2 text-white/70 transition hover:text-white"
        aria-label="Faire défiler pour entrer"
      >
        <svg
          className="h-5 w-5 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-xs tracking-[0.35em] sm:text-sm">SCROLL</span>
      </button>
    </div>
  );
}
