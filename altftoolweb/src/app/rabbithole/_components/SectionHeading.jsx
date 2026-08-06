import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "See all",
  as: Tag = "h2",
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="max-w-2xl">
        {eyebrow ? <p className="rh-eyebrow mb-1.5">{eyebrow}</p> : null}
        <Tag className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </Tag>
        {description ? (
          <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {linkLabel}
          <ArrowRight
            className="h-4 w-4 transition group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
