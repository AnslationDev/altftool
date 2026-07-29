"use client";
import Link from "next/link";
import { blogs } from "@/app/top9/data/blogs";
import { toPublishDate } from "@/app/top9/data/publishDate";

const FeaturedList = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">

      <div className="top9-panel rounded-[var(--anslation-ds-radius)] px-4 py-2 mb-12 mt-[-20] lg:w-full">
        <h3 className="text-[15px] font-bold text-(--primary) uppercase">
          Featured Lists
        </h3>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

        {blogs.map((item, i) => (

          <div
            key={i}
            className="flex flex-col sm:flex-row items-stretch gap-6 group w-full"
          >

            {/* Image Part */}
            <div className="w-full sm:w-1/2 flex-shrink-0">

              <Link
                href={`/top9/${item.slug}`}
                className="block h-full"
              >

                {/* UPDATED HEIGHT */}
                <div className="top9-image-frame overflow-hidden h-[320px] rounded-[var(--anslation-ds-radius-lg)]">

                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                </div>

              </Link>

            </div>

            {/* Content Part */}
            <div className="w-full sm:w-1/2 flex flex-col justify-between py-1">

              <div className="space-y-4">

                <div className="flex items-center gap-3">

                  <span className="top9-pill text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                    {item.cat}
                  </span>

                  <span className="top9-muted-text font-mono text-xs">
                    #{String(i + 1).padStart(2, "0")}
                  </span>

                </div>

                <Link href={`/top9/${item.slug}`}>

                  <h2 className="text-2xl font-bold text-(--foreground) leading-tight hover:text-(--primary) transition-colors">
                    {item.title}
                  </h2>

                </Link>

                <p className="top9-muted-text text-[15px] leading-relaxed line-clamp-5 italic sm:not-italic">
                  {item.desc}
                </p>

              </div>

              {/* Bottom */}
              <div className="space-y-4 pt-4 mt-auto">

                {/*
                  There is no author byline here on purpose: these lists have no
                  recorded author, and the previous "Victoria" byline was
                  invented. Only the publish date, which is real data, is shown.
                */}
                {toPublishDate(item.date) && (
                  <p className="top9-muted-text text-[11px] font-medium tracking-wide uppercase">
                    Published{" "}
                    <time dateTime={toPublishDate(item.date)}>{item.date}</time>
                  </p>
                )}

                <Link
                  href={`/top9/${item.slug}`}
                  className="top9-link inline-flex items-center gap-2 font-bold text-sm group/link"
                >

                  Read article

                  <span className="w-7 h-7 bg-(--primary)/10 rounded-full flex items-center justify-center group-hover/link:bg-(--primary) group-hover/link:text-(--primary-foreground) transition-all">
                    →
                  </span>

                </Link>

              </div>

            </div>

          </div>
          <div className="top9-collection-grid">
            {items.map((x, i) => (
              <Link
                href={`/top9/${x.slug}`}
                className="top9-collection-card"
                key={x.slug}
              >
                <img src={x.img} alt="" />
                <div>
                  <strong>{collections[i]}</strong>
                  <small>{50 - i * 8} Lists</small>
                </div>
              </Link>
            ))}
          </div>
        </div>
        {(activeCategory || searchQuery) && (
          <p className="top9-empty" style={{ marginTop: 12 }}>
            Showing results{searchQuery ? ` for �${searchQuery}�` : ""}
            {activeCategory ? ` in ${activeCategory}` : ""}.{" "}
            <Link className="top9-link" href="/top9">
              Clear filters
            </Link>
          </p>
        )}
        <div className="top9-newsletter" style={{ marginTop: 18 }}>
          <div className="top9-newsletter-icon">??</div>
          <div>
            <h2>Stay Updated with the Best Top 9 Lists</h2>
            <p>
              Get the latest and greatest top 9 rankings delivered to your inbox
              daily.
            </p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              aria-label="Email address"
            />
            <button className="top9-primary-action">Subscribe</button>
          </form>
        </div>
        <div className="top9-trust">
          <Trust
            Icon={Award}
            title="Curated & Ranked"
            text="Every list is carefully curated and ranked by experts."
          />
          <Trust
            Icon={Clock3}
            title="Updated Daily"
            text="Fresh content added daily so you never miss a trend."
          />
          <Trust
            Icon={Heart}
            title="Trusted by Millions"
            text="Millions of readers trust Top9 for the best rankings."
          />
          <Trust
            Icon={ShieldCheck}
            title="Across All Topics"
            text="From movies to tech, we cover every topic you love."
          />
        </div>
      </div>
    </section>
  );
}
function Trust({ Icon, title, text }) {
  return (
    <div className="top9-trust-item">
      <Icon size={21} />
      <span>
        <strong>{title}</strong>
        {text}
      </span>
    </div>
  );
}
