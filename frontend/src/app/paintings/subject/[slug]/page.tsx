import { PaintingGrid } from "@/components/paintings/PaintingGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { subjects } from "@/lib/navigation";
import { getBySubject, getPaintings } from "@/lib/paintings";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return subjects.map((s) => ({ slug: s.slug }));
}

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const subject = subjects.find((s) => s.slug === slug);
  if (!subject) notFound();

  const paintings = await getPaintings();

  return (
    <>
      <PageHeader title={subject.label} description="Peintures par thème." />
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <PaintingGrid paintings={getBySubject(paintings, slug)} />
      </section>
    </>
  );
}
