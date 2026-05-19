import Image from "next/image";
import Link from "next/link";
import { homeFrame } from "@/components/home/home-theme";
import type { BlogPostCard } from "@/lib/blog";

export function BlogCompactCard({
  post,
  index,
}: {
  post: BlogPostCard;
  index: number;
}) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex gap-4 sm:gap-5">
      <div
        className={`relative w-[38%] max-w-[148px] shrink-0 overflow-hidden sm:max-w-[168px] ${homeFrame} shadow-[0_12px_32px_-12px_rgba(28,25,23,0.32)] transition duration-500 group-hover:shadow-[0_16px_40px_-10px_rgba(28,25,23,0.38)]`}
      >
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.05]"
            sizes="168px"
          />
        </div>
        <span
          className="pointer-events-none absolute bottom-2 right-2 font-serif text-2xl font-light text-stone-900/10"
          aria-hidden
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center border-l border-amber-900/15 py-1 pl-4 sm:pl-5">
        <time
          dateTime={post.publishedAt}
          className="text-[0.65rem] uppercase tracking-[0.16em] text-stone-400"
        >
          {post.dateLabel}
        </time>
        <h3 className="mt-2 font-serif text-lg leading-snug text-stone-900 transition group-hover:text-amber-900 md:text-xl">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone-500">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 text-xs uppercase tracking-[0.14em] text-stone-400 transition group-hover:text-amber-900">
          Lire l&apos;article →
        </span>
      </div>
    </Link>
  );
}
