import Image from "next/image";
import Link from "next/link";
import { homeFrame } from "@/components/home/home-theme";
import type { BlogPostCard } from "@/lib/blog";

export function BlogFeaturedCard({
  post,
  badge = "À la une",
}: {
  post: BlogPostCard;
  badge?: string;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="group relative block h-full">
      <div
        className={`relative overflow-hidden ${homeFrame} shadow-[0_20px_56px_-16px_rgba(28,25,23,0.42)] transition duration-500 group-hover:shadow-[0_28px_64px_-12px_rgba(28,25,23,0.48)]`}
      >
        <div className="relative aspect-[4/3] overflow-hidden lg:aspect-auto lg:min-h-[440px]">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(max-width:1024px) 100vw, 55vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-stone-900/30 via-stone-900/5 to-stone-900/75"
            aria-hidden
          />
          {badge && (
            <span className="absolute left-5 top-5 bg-white/95 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.16em] text-amber-950 backdrop-blur-sm">
              {badge}
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-20 md:px-7 md:pb-8">
          <time
            dateTime={post.publishedAt}
            className="text-[0.65rem] uppercase tracking-[0.2em] text-white/65"
          >
            {post.dateLabel}
          </time>
          <h2 className="mt-2 font-serif text-2xl font-light leading-snug text-white md:text-[1.75rem] lg:text-3xl">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/80 md:text-base">
              {post.excerpt}
            </p>
          )}
          <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/70 transition duration-300 group-hover:text-white">
            Lire l&apos;article
            <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden>
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
