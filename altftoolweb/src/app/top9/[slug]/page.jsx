import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import "../top9.css";
import {
  absoluteUrl,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import {
  getTop9Category,
  getTop9Description,
  getTop9Image,
  getTop9Item,
  getTop9Items,
  getTop9Title,
} from "../data/getTop9Items";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getTop9Items().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const item = getTop9Item(slug);

  if (!item) {
    return {
      title: "Top9 List Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${getTop9Title(item)} | Top9`,
    description: getTop9Description(item),
    path: `/top9/${slug}`,
    image: getTop9Image(item),
    type: "article",
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const item = getTop9Item(slug);

  if (!item) notFound();

  const title = getTop9Title(item);
  const description = getTop9Description(item);
  const image = getTop9Image(item);
  const category = getTop9Category(item);

  return (
    <section className="top9-page px-4 md:px-6 py-10">
      <JsonLd
        id={`top9-schema-${slug}`}
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            image: absoluteUrl(image),
            mainEntityOfPage: absoluteUrl(`/top9/${slug}`),
            author: {
              "@type": "Organization",
              name: "AltFTool",
            },
          },
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Top9", path: "/top9" },
            { name: title, path: `/top9/${slug}` },
          ]),
        ]}
      />

      <div className="top9-image-frame max-w-5xl mx-auto overflow-hidden rounded-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-[260px] sm:h-[380px] md:h-[520px] object-cover" />
      </div>

      <div className="max-w-5xl mx-auto mt-8">
        <span className="top9-pill inline-flex items-center text-sm font-medium px-4 py-2 rounded-full">
          {category}
        </span>

        <h1 className="text-3xl md:text-5xl font-extrabold text-(--foreground) leading-tight mt-6">
          {title}
        </h1>

        {item.date && (
          <p className="top9-muted-text text-sm mt-4">
            {item.date}
          </p>
        )}

        <p className="top9-muted-text text-[17px] leading-8 mt-8">
          {description}
        </p>

        {item.top && (
          <div className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-(--foreground) mb-6">
              Top Picks
            </h2>

            <div className="space-y-4">
              {item.top.map((el, index) => (
                <div
                  key={index}
                  className="top9-card flex items-center gap-4 rounded-2xl px-5 py-4"
                >
                  <div className="top9-primary-action w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0">
                    {index + 1}
                  </div>

                  <p className="text-lg font-medium text-(--foreground)">
                    {el}
                  </p>

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
