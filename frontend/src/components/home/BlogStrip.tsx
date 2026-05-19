import Link from "next/link";
import { BlogCompactCard } from "@/components/blog/BlogCompactCard";
import { BlogFeaturedCard } from "@/components/blog/BlogFeaturedCard";
import { HomeSection } from "./HomeSection";
import {
  homeBtnPrimary,
  homeEyebrow,
  homeTitle,
  homeTitleItalic,
} from "./home-theme";
import { getBlogPosts } from "@/lib/blog";

export async function BlogStrip() {
  const posts = (await getBlogPosts()).slice(0, 3);
  const [featured, ...rest] = posts;

  if (!featured) return null;

  return (
    <HomeSection variant="cream">
      <div className="mb-12 max-w-xl border-l border-amber-900/30 pl-6 md:pl-8">
        <p className={homeEyebrow}>Inspiration</p>
        <h2 className={`mt-2 ${homeTitle}`}>
          Blog de
          <span className={`mt-1 block ${homeTitleItalic}`}>l&apos;artiste</span>
        </h2>
        <p className="mt-4 text-base leading-relaxed text-stone-600">
          Coulisses de l&apos;atelier, techniques de peinture et regards sur le Maroc contemporain.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-12 lg:grid-rows-2 lg:gap-x-8 lg:gap-y-0">
        <div className="lg:col-span-7 lg:row-span-2">
          <BlogFeaturedCard post={featured} />
        </div>

        <div className="flex flex-col gap-8 lg:col-span-5 lg:row-span-2 lg:justify-center lg:gap-10 lg:py-6">
          {rest.map((post, i) => (
            <div
              key={post.slug}
              className="border-t border-stone-200/80 pt-8 first:border-t-0 first:pt-0 lg:border-t lg:pt-10 lg:first:border-t-0 lg:first:pt-0"
            >
              <BlogCompactCard post={post} index={i + 2} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 border-t border-stone-200/80 pt-12 text-center">
        <Link href="/blog" className={homeBtnPrimary}>
          Tous les articles
          <span aria-hidden>→</span>
        </Link>
      </div>
    </HomeSection>
  );
}
