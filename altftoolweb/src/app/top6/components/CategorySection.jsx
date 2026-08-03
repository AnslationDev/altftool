import RankedRow from "./RankedRow";
import { slugFor } from "../lib/slugFor";

/** One category block: heading, the provider's own framing line, six rows. */
export default function CategorySection({ category }) {
  return (
    <section id={slugFor(category.id)} className="scroll-mt-28 py-10">
      <div className="mb-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-(--primary-text) font-secondary">
          {category.tag}
        </span>
        <h2 className="mt-1 font-primary text-2xl font-extrabold tracking-tight text-(--foreground) sm:text-3xl">
          Top 6 {category.label}
        </h2>
        {category.description && (
          <p className="mt-1 text-sm text-(--muted-foreground) font-secondary">
            {category.description}
          </p>
        )}
      </div>

      {category.items.map((item) => (
        <RankedRow key={`${category.id}-${item.rank}`} item={item} />
      ))}

      {category.sectionId && (
        <a
          href={`/top10#${category.sectionId}`}
          className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-(--primary-text) font-secondary hover:text-(--primary-hover) focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
        >
          See up to ten {category.label.toLowerCase()} on Top10
        </a>
      )}
    </section>
  );
}
