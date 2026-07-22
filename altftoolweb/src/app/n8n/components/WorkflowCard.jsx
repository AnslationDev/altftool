import Link from "next/link";
import { Eye, Workflow } from "lucide-react";
import NodeBadge from "./NodeBadge";
import { stripMarkdown, stripEmojis } from "../data/text";

function formatCount(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n || 0);
}

export default function WorkflowCard({ workflow }) {
  const { slug, title, description, author, categories, nodes, totalViews } = workflow;
  const shownNodes = nodes.slice(0, 4);
  const extra = nodes.length - shownNodes.length;

  return (
    <div className="group flex h-full flex-col rounded-2xl border border-(--color-border) bg-(--color-card) p-5 transition-all hover:border-(--color-primary) hover:shadow-lg">
      {/* Node badges */}
      <div className="mb-4 flex items-center gap-1.5">
        {shownNodes.map((n) => (
          <NodeBadge key={n.slug} name={n.name} />
        ))}
        {extra > 0 && (
          <span className="inline-flex h-[26px] items-center justify-center rounded-md bg-(--color-muted) px-1.5 text-xs font-semibold text-(--color-muted-foreground)">
            +{extra}
          </span>
        )}
      </div>

      {/* Title */}
      <Link href={`/n8n/${slug}`} className="block">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-(--color-card-foreground) transition-colors group-hover:text-(--color-primary)">
          {stripEmojis(title)}
        </h3>
      </Link>

      {/* Description — one or two lines */}
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-(--color-muted-foreground)">
        {stripMarkdown(description)}
      </p>

      {/* Author + stats */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.avatar}
              alt={author.name}
              width={22}
              height={22}
              className="h-[22px] w-[22px] rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="h-[22px] w-[22px] rounded-full bg-(--color-muted)" />
          )}
          {author?.name && (
            <span className="truncate text-xs text-(--color-muted-foreground)">
              by {author.name}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-(--color-muted-foreground)">
          <span className="flex items-center gap-1" title="Views">
            <Eye size={13} /> {formatCount(totalViews)}
          </span>
          <span className="flex items-center gap-1" title="Nodes used">
            <Workflow size={13} /> {nodes.length}
          </span>
        </div>
      </div>

      {/* Category tags */}
      {categories.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.slice(0, 2).map((c) => (
            <Link
              key={c.slug}
              href={`/n8n/category/${c.slug}`}
              className="rounded-full bg-(--color-muted) px-2.5 py-1 text-[11px] font-medium text-(--color-muted-foreground) transition-colors hover:bg-(--color-primary) hover:text-(--color-primary-foreground)"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
