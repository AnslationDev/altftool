import Link from "next/link";
import CategoryIcon from "./CategoryIcon";
import { tonedStyle } from "../_lib/presentation";

export default function CategoryTile({ category, count }) {
  return (
    <div className="rh-tile rh-toned" style={tonedStyle(category.tone)}>
      <Link
        href={`/rabbithole/category/${category.id}`}
        className="flex h-full flex-col gap-3 p-4 focus-visible:outline-none sm:p-5"
      >
        <span
          className="flex h-10 w-10 items-center justify-center rounded-[var(--anslation-ds-radius-lg)] text-[var(--rh-hue)]"
          style={{ background: "var(--rh-hue-soft-strong)" }}
        >
          <CategoryIcon name={category.icon} />
        </span>

        <span className="flex-1">
          <span className="block text-base font-semibold leading-tight text-foreground">
            {category.name}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {category.blurb}
          </span>
        </span>

        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-[var(--rh-hue)]">
          {count} {count === 1 ? "site" : "sites"}
        </span>
      </Link>
    </div>
  );
}
