import Link from "next/link";
import { BlogCompactCard } from "@/components/blog/BlogCompactCard";
import { BlogFeaturedCard } from "@/components/blog/BlogFeaturedCard";
import { BlogGridCard } from "@/components/blog/BlogGridCard";
import {
  homeBtnGhost,
  homeBtnPrimary,
  homeEyebrow,
  homeLead,
  homeTextureStyle,
  homeTitle,
  homeTitleItalic,
} from "@/components/home/home-theme";
import type { BlogPostCard } from "@/lib/blog";

export function BlogPageContent({ posts }: { posts: BlogPostCard[] }) {
  const [featured, ...rest] = posts;
  const spotlight = rest.slice(0, 2);
  const more = rest.slice(2);

  return (
    <div className="bg-[#faf7f2]">
      <section className="relative overflow-hidden border-b border-stone-200/80 bg-[#f6f1ea]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={homeTextureStyle}
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 text-center lg:px-8 lg:py-24">
          <p className={homeEyebrow}>Inspiration</p>
          <h1 className={`mt-3 ${homeTitle} sm:text-5xl`}>
            Blog de
            <span className={`mt-2 block ${homeTitleItalic}`}>l&apos;artiste</span>
          </h1>
          <p className={`mx-auto mt-6 max-w-2xl ${homeLead}`}>
            Coulisses de l&apos;atelier, techniques de peinture et regards sur le Maroc
            contemporain — carnets de voyage et réflexions du peintre.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          {posts.length === 0 ? (
            <EmptyBlog />
          ) : (
            <>
              <div className="mb-12 max-w-xl border-l border-amber-900/30 pl-6 md:pl-8">
                <p className={homeEyebrow}>À lire</p>
                <h2 className={`mt-2 ${homeTitle}`}>
                  Derniers
                  <span className={`mt-1 block ${homeTitleItalic}`}>articles</span>
                </h2>
              </div>

              <div className="grid gap-10 lg:grid-cols-12 lg:grid-rows-2 lg:gap-x-8 lg:gap-y-0">
                <div className="lg:col-span-7 lg:row-span-2">
                  <BlogFeaturedCard post={featured} />
                </div>

                {spotlight.length > 0 && (
                  <div className="flex flex-col gap-8 lg:col-span-5 lg:row-span-2 lg:justify-center lg:gap-10 lg:py-6">
                    {spotlight.map((post, i) => (
                      <div
                        key={post.slug}
                        className="border-t border-stone-200/80 pt-8 first:border-t-0 first:pt-0 lg:border-t lg:pt-10 lg:first:border-t-0 lg:first:pt-0"
                      >
                        <BlogCompactCard post={post} index={i + 2} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {more.length > 0 && (
                <div className="mt-20 border-t border-stone-200/80 pt-16 md:mt-24 md:pt-20">
                  <div className="mb-10 flex items-end justify-between gap-4">
                    <div>
                      <p className={homeEyebrow}>Archives</p>
                      <h2 className={`mt-1 ${homeTitle}`}>Autres articles</h2>
                    </div>
                    <span className="hidden text-xs uppercase tracking-[0.2em] text-stone-400 sm:block">
                      {more.length} article{more.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-14">
                    {more.map((post) => (
                      <BlogGridCard key={post.slug} post={post} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="border-t border-stone-200/80 bg-[#f6f1ea] py-14 md:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center lg:px-8">
          <p className={homeEyebrow}>L&apos;atelier</p>
          <p className="max-w-lg font-serif text-2xl font-light text-stone-800">
            Envie d&apos;en savoir plus sur le processus créatif ?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/about" className={homeBtnPrimary}>
              Découvrir l&apos;artiste
            </Link>
            <Link href="/calendar" className={homeBtnGhost}>
              Voir le calendrier
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyBlog() {
  return (
    <div className="rounded-sm border border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center">
      <p className="font-serif text-2xl font-light text-stone-800">Aucun article pour le moment</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500">
        Le blog sera bientôt alimenté. Revenez découvrir les coulisses de l&apos;atelier et les
        carnets de voyage du peintre.
      </p>
      <Link href="/" className={`mt-8 inline-flex ${homeBtnPrimary}`}>
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
