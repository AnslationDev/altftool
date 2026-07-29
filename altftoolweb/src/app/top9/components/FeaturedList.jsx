"use client";
import Link from "next/link";
import { blogs } from "@/app/top9/data/blogs";
import { toPublishDate } from "@/app/top9/data/publishDate";

const FeaturedList = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-16">

      <div className="top9-panel rounded-[var(--anslation-ds-radius)] px-4 py-2 mb-12 lg:w-full">
        <h3 className="text-[15px] font-bold text-(--primary) uppercase">
          Featured Lists
        </h3>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">

        {blogs.map((item, i) => (

          <div
            key={item.slug}
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

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt=""
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
        ))}
      </div>
    </section>
  );
};

export default FeaturedList;
