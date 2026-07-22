import Link from "next/link";

export default function CategoryBrowse({ categories = [] }) {
  if (!categories.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-xl font-bold text-(--color-foreground)">
        Browse n8n Workflows by Category
      </h2>
      <p className="mt-1 text-sm text-(--color-muted-foreground)">
        Find the specific workflows you need based on your industry or technical
        requirement.
      </p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/n8n/category/${c.slug}`}
            className="rounded-full border border-(--color-border) bg-(--color-card) px-4 py-2 text-sm font-medium text-(--color-foreground) transition-colors hover:border-(--color-primary) hover:text-(--color-primary)"
          >
            {c.name}
            <span className="ml-1.5 text-xs text-(--color-muted-foreground)">
              {c.count}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
