import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function RouteDiscoveryBand({
  eyebrow = "Explore AltFTool",
  title,
  description,
  items = [],
}) {
  if (!items.length) return null;

  const headingId = `${String(title || eyebrow).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-heading`;

  return (
    <section
      aria-labelledby={headingId}
      className="border-y border-(--border) bg-(--card) text-(--foreground)"
    >
      <div className="mx-auto grid w-full max-w-[1500px] gap-5 px-4 py-7 sm:px-5 sm:py-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex h-8 items-center gap-2 rounded-[7px] border border-(--border) bg-(--background) px-3 text-xs font-semibold text-(--primary)">
            <Compass className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          {title ? (
            <h2 id={headingId} className="text-xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-3 max-w-xl text-sm leading-6 text-(--muted-foreground) sm:text-base">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          {items.map(({ title: itemTitle, description: itemDescription, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex min-h-[132px] flex-col justify-between rounded-[8px] border border-(--border) bg-(--background) p-3 transition hover:-translate-y-0.5 hover:border-(--primary) hover:shadow-[var(--anslation-ds-shadow-md)] motion-reduce:transform-none sm:min-h-[150px] sm:p-4"
            >
              <div>
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-[7px] bg-(--muted) text-(--primary)">
                  {Icon ? <Icon className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </div>
                <h3 className="text-sm font-semibold text-(--foreground)">{itemTitle}</h3>
                {itemDescription ? (
                  <p className="mt-2 text-xs leading-5 text-(--muted-foreground)">
                    {itemDescription}
                  </p>
                ) : null}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-(--primary)">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
