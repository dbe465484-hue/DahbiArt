import Image from "next/image";
import Link from "next/link";
import { BlogGridCard } from "@/components/blog/BlogGridCard";
import {
  homeBtnGhost,
  homeEyebrow,
  homeFrame,
  homeLead,
  homeLink,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import type { BlogPostCard } from "@/lib/blog";

type Props = {
  post: BlogPostCard;
  related: BlogPostCard[];
};

export function BlogPostPageContent({ post, related }: Props) {
  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-14 text-center lg:px-8 lg:py-20">
          <Link
            href="/blog"
            className={`inline-flex items-center gap-2 ${homeLink} text-stone-500 hover:text-amber-900`}
          >
            <span aria-hidden>←</span>
            Tous les articles
          </Link>
          <p className={`mt-8 ${homeEyebrow}`}>
            <time dateTime={post.publishedAt}>{post.dateLabel}</time>
          </p>
          <h1 className={`mt-4 ${homeTitle} sm:text-4xl lg:text-5xl`}>{post.title}</h1>
          {post.excerpt && (
            <p className={`mx-auto mt-6 max-w-2xl ${homeLead}`}>{post.excerpt}</p>
          )}
        </div>
      </section>

      <article className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 lg:px-8">
          <div className={`relative mb-10 overflow-hidden ${homeFrame} shadow-[0_16px_48px_-16px_rgba(28,25,23,0.38)]`}>
            <div className="relative aspect-[16/9]">
              <Image
                src={post.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 768px"
                priority
              />
            </div>
          </div>

          <div>
            <div className="whitespace-pre-wrap text-base leading-[1.85] text-stone-700 md:text-lg md:leading-[1.9]">
              {post.content}
            </div>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/80 pt-8">
            <Link href="/blog" className={homeLink}>
              ← Retour au blog
            </Link>
            <Link href="/commission" className={homeBtnGhost}>
              Demander une commande
            </Link>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-stone-200/80 bg-white/50 py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mb-10 max-w-xl border-l border-amber-900/30 pl-6 md:pl-8">
              <p className={homeEyebrow}>À lire aussi</p>
              <h2 className={`mt-2 ${homeTitle}`}>
                Autres
                <span className={`mt-1 block ${homeTitleItalic}`}>articles</span>
              </h2>
            </div>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
              {related.map((p) => (
                <BlogGridCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
