import type {
  BlogPostInput,
  BlogPostRecord,
  EventInput,
  EventRecord,
  PaintingInput,
  PaintingRecord,
} from "./api";

/** Corps API sans champs lecture seule (id, dates, slug catalogue). */
export function paintingPayload(
  form: PaintingInput & Partial<PaintingRecord>,
): PaintingInput {
  return {
    title: form.title.trim(),
    year: Number(form.year),
    dimensions: form.dimensions.trim(),
    medium: form.medium.trim(),
    price: Number(form.price),
    status: form.status,
    printAvailable: Boolean(form.printAvailable),
    printPrice: form.printAvailable ? Number(form.printPrice ?? 0) : undefined,
    image: form.image.trim(),
    description: form.description.trim(),
    subject: form.subject,
    location: form.location,
    collection: form.collection,
    featured: Boolean(form.featured),
    bestSeller: Boolean(form.bestSeller),
  };
}

export function blogPostPayload(
  form: BlogPostInput & Partial<BlogPostRecord>,
): BlogPostInput {
  const payload: BlogPostInput = {
    title: form.title.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    image: form.image.trim(),
    publishedAt: form.publishedAt,
    published: form.published ?? true,
  };
  const slug = form.slug?.trim();
  if (slug) payload.slug = slug;
  return payload;
}

export function eventPayload(form: EventInput & Partial<EventRecord>): EventInput {
  return {
    title: form.title.trim(),
    city: form.city.trim(),
    eventDate: form.eventDate,
    description: form.description?.trim() || undefined,
    published: form.published ?? true,
  };
}
