"use client";
import Link from "next/link";
import { blogs } from "../data/blogs";
import { trending } from "../data2/trending";
import { autoLists } from "../data3/content";
import { toPublishDate } from "../data/publishDate";

/*
  Nothing on this page may describe a list with copy that does not come from
  that list's own record. Every card below renders `item.title` for the item its
  href points at. The blocks this replaced carried four hardcoded title arrays
  that had drifted away from the slugs they linked to, plus star ratings, view
  counts, "hours ago" stamps and read times for which this data set holds no
  field at all.
*/

const cardShell =
  "top9-card group block overflow-hidden rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) transition-colors hover:border-(--primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)";

const headingClass =
  "text-2xl md:text-3xl font-bold text-(--foreground) leading-tight";

export default function ContentArea({ searchQuery = "", sidebarOnly = false }) {
  const q = searchQuery.toLowerCase().trim();
  const matches = (item) => !q || item.title.toLowerCase().includes(q);

  const topics = trending.slice(0, 4).filter(matches);
  const guides = blogs.slice(0, 4).filter(matches);
  const moreLists = autoLists.filter(matches);

  if (sidebarOnly) {
    return (
      <aside className="top9-sidebar">
        <Sidebar />
      </aside>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
      {/* TOPICS */}
      <section className="top9-section">
        <div className="top9-section-heading mb-6">
          <h2 className={headingClass}>Top 9 Topics</h2>
        </div>

        {topics.length ? (
          <div className="top9-popular-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topics.map((item) => (
              <Link className={cardShell} href={`/top9/${item.slug}`} key={item.slug}>
                <div className="top9-image-frame h-40 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col gap-2 p-4">
                  <strong className="text-base font-bold leading-snug text-(--foreground) group-hover:text-(--primary) transition-colors">
                    {item.title}
                  </strong>

                  {item.description ? (
                    <p className="top9-muted-text text-sm leading-relaxed text-(--muted-foreground) line-clamp-3">
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="top9-empty text-(--muted-foreground)">
            No topics match your search.
          </p>
        )}
      </section>

      {/* GUIDES */}
      <section className="top9-section">
        <div className="top9-section-heading mb-6">
          <h2 className={headingClass}>Top 9 Guides</h2>
        </div>

        {guides.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {guides.map((item) => (
              <Link
                className={`${cardShell} flex items-start gap-4 p-4`}
                href={`/top9/${item.slug}`}
                key={item.slug}
              >
                <div className="top9-image-frame h-20 w-24 shrink-0 overflow-hidden rounded-[var(--anslation-ds-radius)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 space-y-2">
                  {item.cat ? (
                    <span className="top9-pill inline-flex text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full bg-(--primary-soft) text-(--primary)">
                      {item.cat}
                    </span>
                  ) : null}

                  <strong className="block text-base font-bold leading-snug text-(--foreground) group-hover:text-(--primary) transition-colors">
                    {item.title}
                  </strong>

                  {/*
                    The publish date is the only time signal this data carries.
                    When a record has none, nothing is rendered in its place --
                    never a build date, never an invented "N hours ago".
                  */}
                  {toPublishDate(item.date) ? (
                    <p className="top9-muted-text text-xs text-(--muted-foreground)">
                      Published{" "}
                      <time dateTime={toPublishDate(item.date)}>
                        {item.date}
                      </time>
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="top9-empty text-(--muted-foreground)">
            No guides match your search.
          </p>
        )}
      </section>

      {/* AUTO LISTS */}
      <section className="top9-section">
        {/*
          Previously labelled "Auto-Updating Lists" with an "Auto Updated"
          stamp per row. Nothing here updates automatically — these are the
          same four static entries as every other block — so the claim and
          the stamp are gone.
        */}
        <h3 className="top9-muted-text text-[14px] uppercase tracking-wider text-(--muted-foreground) mb-5">
          More Lists
        </h3>

        {moreLists.length ? (
          <div className="space-y-5">
            {moreLists.map((item) => (
              <Link
                key={item.slug}
                href={`/top9/${item.slug}`}
                className="group flex items-center gap-3 rounded-[var(--anslation-ds-radius)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
              >
                <div className="top9-image-frame h-14 w-14 shrink-0 overflow-hidden rounded-[var(--anslation-ds-radius)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="top9-link text-[14px] font-semibold leading-snug text-(--foreground) group-hover:text-(--primary) group-hover:underline transition-colors">
                  {item.title}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="top9-empty text-(--muted-foreground)">
            No lists match your search.
          </p>
        )}
      </section>
    </div>
  );
}

/*
  Rendered only when `sidebarOnly` is set. The two panels that used to sit
  beside this one -- "Featured Collections" and "Editor's Picks" -- were removed
  rather than repaired: both linked to /top9 or to an unrelated slug under a
  collection name, a documentary title, a "N lists" count and a "4.9 / 10.2K
  views" line, none of which exist as data anywhere in this section.
*/
function Sidebar() {
  return (
    <section className="top9-panel top9-sidebar-panel rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5">
      <div className="top9-section-heading mb-4">
        <h2 className="text-lg font-bold text-(--foreground)">
          All Top 9 Topics
        </h2>
      </div>

      <div className="top9-sidebar-list flex flex-col">
        {trending.map((item) => (
          <Link
            href={`/top9/${item.slug}`}
            className="top9-sidebar-row group flex items-center gap-3 py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--primary)"
            key={item.slug}
          >
            <div className="top9-image-frame h-10 w-10 shrink-0 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.img}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            <strong className="text-sm font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
              {item.title}
            </strong>
          </Link>
        ))}
      </div>
    </section>
  );
}
