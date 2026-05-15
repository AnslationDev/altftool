
import books from "@/app/wattpad/data/books.json";
import chapters from "@/app/wattpad/data/chapters.json";
import BookTabs from "@/app/wattpad/components/BookTabs";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { notFound } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import {
  Eye,
  Star,
  List,
  Plus,
  ChevronRight,
  Headphones,
} from "lucide-react";

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const book = books.find((item) => item.slug === slug);

  if (!book) {
    return {
      title: "Story Not Found",
      robots: { index: false, follow: true },
    };
  }

  return createPageMetadata({
    title: `${book.title} - Wattpad-Style Story`,
    description: book.description || book.summary,
    path: `/wattpad/book/${book.slug}`,
    image: book.coverImage || book.bannerImage,
    type: "book",
  });
}

export default async function BookDetailPage({ params }) {
  const { slug } = await params;

  // BOOK
  const book = books.find(
    (item) => item.slug === slug
  );

  if (!book) notFound();

  // CHAPTERS
  const bookChapters = chapters.filter(
    (chapter) => chapter.bookId === book.id
  );

  // RELATED BOOKS
  const relatedBooks = books
    .filter(
      (item) =>
        item.categoryId === book.categoryId &&
        item.id !== book.id
    )
    .slice(0, 6);

  return (

    <div className="bg-(--background) min-h-screen ">

      {/* MAIN CONTAINER */}
      <div className="section pt-10 lg:pt-14 max-w-[1650px] ">

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-12 items-start">

          {/* LEFT CONTENT */}
          <div className="min-w-0">

            {/* HERO */}
            <div className="flex flex-col md:flex-row gap-8">

              {/* COVER */}
              <div className="shrink-0 mx-auto md:mx-0">

                <div className="relative w-[210px] h-[315px] rounded-[18px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.18)]">

                  <Image
                    src={book.coverImage}
                    fill
                    alt={book.title}
                    className="object-cover"
                    priority
                  />

                </div>

              </div>

              {/* DETAILS */}
              <div className="flex-1 min-w-0">

                {/* TITLE */}
                <h1 className="text-[32px] md:text-[42px] leading-tight tracking-[-1.5px] font-extrabold text-(--foreground)">
                  {book.title}
                </h1>

                {/* AUTHOR */}
                <div className="flex items-center gap-3 mt-4">

                  <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-200">

                    <Image
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330"
                      fill
                      alt="author"
                      className="object-cover"
                    />

                  </div>

                  <div>

                    <p className="font-medium text-base">
                      {book.authorId}
                    </p>

                  </div>

                </div>

                {/* STATS */}
                <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-(--muted-foreground)">

                  <div className="flex items-center gap-1.5">
                    <Eye size={18} />
                    <span>{book.stats.views}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Star size={18} />
                    <span>{book.stats.totalReviews}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <List size={18} />
                    <span>{book.stats.totalChapters} parts</span>
                  </div>

                </div>

                {/* BUTTONS */}
                <div className="flex items-center gap-4 mt-10">

                  <Link
                    href={`/wattpad/read/${book.slug}/1`}
                    className="flex-1 md:flex-none"
                  >

                    <button className="w-full md:w-[400px] h-[56px] rounded-full bg-(--primary) text-white font-semibold text-base hover:opacity-90 transition cursor-pointer">

                      Start reading

                    </button>

                  </Link>

                  {/* ADD BUTTON */}
                  {/* <button className="w-14 h-14 rounded-full border border-(--border) flex items-center justify-center hover:bg-(--card) transition cursor-pointer shrink-0">

                    <Plus size={28} strokeWidth={1.8} />

                  </button> */}

                </div>

              </div>

            </div>

          <BookTabs
          book={book}
          bookChapters={bookChapters}
          />
            {/* YOU MAY ALSO LIKE */}
            <div className="mt-20 ">

              <h2 className="text-[38px] font-extrabold tracking-tight mb-5">

                You may also like

              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 rounded-md shadow-[0_8px_5px_-10px_rgba(0,0,0,0.2)] md:p-5">

                {relatedBooks.map((item, index) => (

                  <Link
                    key={item.id}
                    href={`/wattpad/book/${item.slug}`}
                  >

                    <div className="grid grid-cols-[110px_1fr] sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] 2xl:grid-cols-[170px_1fr] gap-2 sm:gap-4 md:gap-5 group cursor-pointer bg-(--background) rounded-xl">

                      {/* COVER */}
                      <div className="relative rounded-xl overflow-hidden">

                        <Image
                          src={item.coverImage}
                          width={170}
                          height={260}
                          alt={item.title}
                          className="w-[110px] h-[170px] sm:w-[130px] sm:h-[190px] md:w-[150px] md:h-[220px] 2xl:w-[170px] 2xl:h-[245px]  object-cover group-hover:scale-105 transition duration-300"
                        />

                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-col justify-start md:pt-1">

                        <h3 className="text-2xl leading-tight tracking-tighter font-bold line-clamp-1">

                          <span className="text-3xl">{index + 1}.</span> {item.title}

                        </h3>

                        <p className="text-(--muted-foreground) mt-1">
                          {item.authorId}
                        </p>

                        {/* STATS */}
                        <div className="flex gap-4 md:gap-5 text-sm text-(--muted-foreground) mt-1 md:mt-2">

                          <span className="flex justify-center items-center gap-1 md:gap-2">
                           <Eye size={16} />{item.stats.views}
                          </span>

                          <span className="flex justify-center items-center gap-1 md:gap-2">
                           <List size={16} /> {item.stats.totalChapters} parts
                          </span>

                        </div>

                        {/* SUMMARY */}
                        <p className="text-(--mute-foreground) mt-1 md:mt-2 leading-6 tracking-tight line-clamp-2 2xl:line-clamp-4">

                          {item.summary}

                        </p>

                        {/* TAGS */}
                        <div className="flex flex-wrap gap-2 mt-2">

                          {item.tags?.slice(0, 3).map((tag) => (

                            <span
                              key={tag}
                              className="bg-(--card) px-3 py-1 rounded-md text-xs"
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

          {/* RIGHT SIDEBAR */}
          <aside className="hidden xl:block self-start sticky top-24">          

              <div>

                <p className="text-sm text-(--muted-foreground) text-center mb-3">
                  Advertisement
                </p>

                <div className="overflow-hidden">

                  <Image
                    src="https://images.unsplash.com/photo-1616418625298-baef98bc34f8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fGFkdmVydGlzaW5nfGVufDB8fDB8fHww"
                    width={320}
                    height={500}
                    alt="Advertisement"
                    className="w-full h-auto object-cover"
                  />

                </div>

              </div>           

          </aside>

        </div>

      </div>

    </div>

  );

}
