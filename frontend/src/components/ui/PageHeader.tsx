export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="border-b border-stone-200 bg-white py-16 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="font-serif text-4xl font-light italic text-stone-900 md:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-stone-600">{description}</p>
        )}
      </div>
    </header>
  );
}
