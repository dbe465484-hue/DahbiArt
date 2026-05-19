import Link from "next/link";
import { homeEyebrow, homeLink, homeLinkUnderline, homeTitle, homeTitleItalic } from "./home-theme";

export function HomeSectionHeader({
  eyebrow,
  title,
  titleAccent,
  href,
  linkLabel = "Voir tout →",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";

  return (
    <div
      className={`mb-10 flex flex-wrap items-end justify-between gap-4 ${centered ? "text-center md:justify-center" : ""}`}
    >
      <div className={centered ? "mx-auto" : "relative border-l border-amber-900/25 pl-6 md:pl-8"}>
        {eyebrow && <p className={homeEyebrow}>{eyebrow}</p>}
        <h2 className={`${homeTitle} ${eyebrow ? "mt-2" : ""}`}>
          {title}
          {titleAccent && (
            <span className={`mt-1 block ${homeTitleItalic}`}>{titleAccent}</span>
          )}
        </h2>
      </div>
      {href && (
        <Link href={href} className={`${homeLink} ${homeLinkUnderline}`}>
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
