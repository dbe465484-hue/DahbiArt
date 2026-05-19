import Image from "next/image";
import Link from "next/link";
import { homeFrame } from "@/components/home/home-theme";
import type { BlogPostCard } from "@/lib/blog";

export function BlogGridCard({ post }: { post: BlogPostCard }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
      <div
        className={`relative overflow-hidden ${homeFrame} shadow-[0_12px_36px_-14px_rgba(28,25,23,0.35)] transition duration-500 group-hover:shadow-[0_18px_44px_-12px_rgba(28,25,23,0.4)]`}
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(max-width:768px) 100vw, 400px"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-5">
        <time
          dateTime={post.publishedAt}
          className="text-[0.65rem] uppercase tracking-[0.16em] text-stone-400"
        >
          {post.dateLabel}
        </time>
        <h3 className="mt-2 font-serif text-xl leading-snug text-stone-900 transition group-hover:text-amber-900">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-stone-500">
            {post.excerpt}
          </p>
        )}
        <span className="mt-4 text-xs uppercase tracking-[0.14em] text-amber-900/70 transition group-hover:text-amber-900">
          Lire l&apos;article →
        </span>
      </div>
    </Link>
  );
}
