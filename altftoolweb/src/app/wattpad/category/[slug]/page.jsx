import books from "@/app/wattpad/data/books.json";
import categories from "@/app/wattpad/data/categories.json";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { notFound } from "next/navigation";
import {
  Eye,
  
  List,

} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = categories.find((cat) => cat.slug === slug);

  if (!category) {
    return {
      title: "Story Category Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${category.name} Stories - Wattpad-Style Reads`,
    description: category.description || `Explore trending ${category.name.toLowerCase()} stories on AltFTool.`,
    path: `/wattpad/category/${category.slug}`,
    image: category.coverImage,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const category = categories.find(
    (cat) => cat.slug === slug
  );

  if (!category) notFound();

  const filteredBooks = books.filter(
    (book) => book.categoryId === category.id
  );

  return (
    <div className="section min-h-screen max-w-[1750px] ">

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 item-start">

        {/* LEFT SIDE */}
        <div>

          {/* HEADER */}
          <div className="mb-8">
            <h1 className="section-title font-bold">
              {category.name} Stories
            </h1>

            <p className="section-subtitle mx-0!">
              Explore trending {category.name.toLowerCase()} stories
            </p>
          </div>

          {/* FEATURED STORIES */}
          <div className="mb-12">

            <h2 className="text-lg md:text-2xl font-bold ">
              Hottest Wattpad Originals
            </h2>

            <p className="text-(--muted-foreground) mt-2">
              Read the stories we love
            </p>

            {/* Horizontal Scroll */}
            <div className="flex gap-2 md:3 overflow-x-auto  mt-6 no-scrollbar overflow-y-hidden">

              {filteredBooks.slice(0, 8).map((book) => (

                <Link
                  key={book.id}
                  href={`/wattpad/book/${book.slug}`}
                  className="shrink-0"
                >
                  <div className="w-full">

                    <div className="relative rounded-md overflow-hidden w-full ">

                      <Image
                        src={book.coverImage}
                        width={180}
                        height={260}
                        alt={book.title}
                        className="w-[110px] h-[170px] sm:w-[130px] sm:h-[230px] md:w-[160px] md:h-[230px]  2xl:w-[180px] 2xl:h-[260px] object-cover hover:scale-104 transition duration-300"
                      />

                    </div>

                    {/* Tags */}
                    <div className="my-3">
                      <span className="bg-(--card) text-xs px-3 py-1 rounded-md border border-(--border) ">
                        {book.tags?.[0]}
                      </span>
                    </div>

                  </div>
                </Link>

              ))}

            </div>
          </div>

          {/* TAGS */}
          <div className="bg-(--background)  rounded-lg p-2 md:p-6 mb-3 shadow-[0_8px_4px_-10px_rgba(0,0,0,0.2)]">

            <h3 className="text-base text-(--muted-foreground) mb-2">
              Refine by tag:
            </h3>

            <div className="flex flex-wrap gap-3">

              {[
                "romance",
                "love",
                "slowburn",
                "billionaire",
                "darkromance",
                "mafia",
                "enemiestolovers",
                "newadult",
                "possessive",
                "marriage",
                "ceo",
                "india",
                "mature",
              ].map((tag) => (

                <button
                  key={tag}
                  className="border border-(--border) rounded-lg px-3 py-1 text-sm hover:bg-(--primary) hover:text-white transition bg-(--card) cursor-pointer"
                >
                  + {tag}
                </button>

              ))}

            </div>
          </div>

          {/* STORIES */}
          <div>

            {/* Top */}
             <div className="rounded-md shadow-[0_8px_4px_-10px_rgba(0,0,0,0.2)] md:p-5">
            <div className="flex items-center border-b border-(--border) justify-between pb-3 mb-8">

              <h2 className="text-sm font-bold">
                {filteredBooks.length} Stories
              </h2>

              <button className="text-sm font-bold">
                Sort by: Hot
              </button>

            </div>

            {/* Story List */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-7 gap-y-6">

              {filteredBooks.map((book, index) => (

                <Link
                  key={book.id}
                  href={`/wattpad/book/${book.slug}`}
                >
                  <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] 2xl:grid-cols-[170px_1fr] gap-2 sm:gap-4 md:gap-5 group cursor-pointer">

                    {/* Cover */}
                    <div className="relative rounded-md overflow-hidden">

                      <Image
                        src={book.coverImage}
                        width={170}
                        height={260}
                        alt={book.title}
                        className="w-[110px] h-[170px] sm:w-[130px] sm:h-[190px] md:w-[150px] md:h-[220px] 2xl:w-[170px] 2xl:h-[245px] object-cover group-hover:scale-105 transition duration-300"
                      />

                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-start md:pt-1">

                      <h3 className="text-2xl leading-tight tracking-tighter font-bold line-clamp-1">
                       <span className="text-3xl"> {index + 1}.</span>  {book.title}
                      </h3>

                      <p className="text-(--muted-foreground) mt-1">
                        {book.authorId}
                      </p>

                      {/* Stats */}
                      <div className="flex gap-4 md:gap-5 text-sm text-(--muted-foreground) mt-1 md:mt-2">

                        <span className="flex justify-center items-center gap-1 md:gap-2">
                          <Eye size={16}/> {book.stats.views}
                        </span>

                        <span className="flex justify-center items-center gap-1 md:gap-2">
                          <List size={16} /> {book.stats.totalChapters} parts
                        </span>

                      </div>

                      {/* Summary */}
                      <p className="text-(--mute-foreground) mt-1 md:mt-2 leading-6 tracking-tight line-clamp-2 2xl:line-clamp-4">
                        {book.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-2">

                        {book.tags?.slice(0, 4).map((tag) => (

                          <span
                            key={tag}
                            className="bg-(--card) px-3 py-1 rounded-md text-xs text-(--muted-foreground) "
                          >
                            {tag}
                          </span>

                        ))}

                      </div>

                    </div>

                  </div>
                </Link>

              ))}

            </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="hidden lg:block">

          {/* Sticky Ad */}
          <div className="sticky top-24 space-y-5">
            <p className="text-sm text-gray-400 text-center mb-2">
                  Advertisement
                </p>     
            <div className="overflow-hidden">

              <Image
                src="https://images.unsplash.com/photo-1616418625298-baef98bc34f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFkdmVydGlzaW5nfGVufDB8fDB8fHww"
                width={400}
                height={700}
                alt="Premium"
                className="w-full h-auto object-cover"
                aria-label="Advertisement"
              />

            </div>
              <p className="text-sm text-gray-400 text-center mb-2">
                  Advertisement
                </p>
            <div className="overflow-hidden">

              <Image
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1200"
                width={400}
                height={700}
                alt="Premium"
                className="w-full h-auto object-cover"
                aria-label="Advertisement"
              />

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
