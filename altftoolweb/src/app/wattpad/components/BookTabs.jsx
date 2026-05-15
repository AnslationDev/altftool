"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Headphones,
} from "lucide-react";

export default function BookTabs({
  book,
  bookChapters,
}) {

  const [activeTab, setActiveTab] = useState("summary");
    const [expanded, setExpanded] = useState(false);

  return (

    <div>

      {/* TABS */}
      <div className="mt-16 border-b border-(--border)">

        <div className="flex items-center gap-10">

          {/* SUMMARY */}
          <button
            onClick={() =>
              setActiveTab("summary")
            }
            className={`pb-4 text-[17px] transition cursor-pointer ${
              activeTab === "summary"
                ? "font-bold border-b-[3px] border-(--primary) text-(--foreground)"
                : "font-semibold text-(--muted-foreground)"
            }`}
          >
            Summary
          </button>

          {/* PARTS */}
          <button
            onClick={() =>
              setActiveTab("parts")
            }
            className={`pb-4 text-[17px] transition cursor-pointer ${
              activeTab === "parts"
                ? "font-bold border-b-[3px] border-(--primary) text-(--foreground)"
                : "font-semibold text-(--muted-foreground)"
            }`}
          >
            Parts
          </button>

        </div>

      </div>

      {/* SUMMARY */}
      {activeTab === "summary" && (

        <>

          {/* STORY META */}
          <div className="py-6 border-b border-(--border)">

            <div className="flex flex-wrap items-center gap-3 text-sm">

              <span className="font-bold">
                Complete
              </span>

              <span className="text-(--muted-foreground)">
                •
              </span>

              <span className="text-(--muted-foreground)">
                13h 13m
              </span>

            </div>

          </div>

          {/* TAGS */}
          <div className="flex flex-wrap gap-3 py-8">

            {book.tags?.map((tag) => (

              <span
                key={tag}
                className="bg-(--card) transition px-4 py-2 rounded-lg text-sm font-medium"
              >
                {tag}
              </span>

            ))}

          </div>

         
         {/* DESCRIPTION */}
<div className="border-b border-(--border) pb-5">

 <p
  className={`text-[17px] leading-snug text-(--foreground) transition-all duration-300 ${
    expanded ? "" : "line-clamp-2"
  }`}
>
  {book.description}
</p>

  {/* BUTTON */}
  {book.description?.length > 150 && (

    <button
      onClick={() =>
        setExpanded(!expanded)
      }
      className="font-bold text-sm cursor-pointer hover:text-(--primary) transition"
    >

      {expanded ? "Read less" : "Read more"}

    </button>

  )}

</div>

          {/* TEXT TO SPEECH */}
          <div className="py-6 border-b border-(--border)">

            <div className="flex items-center gap-3">

              <Headphones size={20} />

              <span className="text-base">
                Text-to-speech
              </span>

            </div>

          </div>

          {/* RANKING */}
          <div className="py-6 border-b border-(--border)">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <span className="text-2xl font-bold">
                  #2
                </span>

                <span className="bg-(--card) px-3 py-1 rounded-md text-sm font-medium">
                  romance
                </span>

              </div>

              <ChevronRight size={22} />

            </div>

          </div>

        </>

      )}

      {/* PARTS */}
      {activeTab === "parts" && (

        <div className="mt-10">

          <div className="flex items-center justify-between mb-8">

            <h2 className="text-3xl font-extrabold tracking-tight">
              Parts
            </h2>

            <span className="text-(--muted-foreground)">
              {bookChapters.length} Chapters
            </span>

          </div>

          <div className="space-y-4">

            {bookChapters.map((chapter) => (

              <Link
                key={chapter.id}
                href={`/wattpad/read/${book.slug}/${chapter.chapterNumber}`}
                className="block mb-2"
              >

                <div className="group border border-(--border) rounded-2xl p-5 hover:bg-(--card) transition cursor-pointer">

                  <div className="flex items-center justify-between gap-5">

                    <div>

                      <p className="text-sm text-(--muted-foreground)">
                        Part {chapter.chapterNumber}
                      </p>

                      <h3 className="font-bold text-lg mt-1 group-hover:text-(--primary) transition">

                        {chapter.title}

                      </h3>

                    </div>

                    <ChevronRight
                      size={20}
                      className="opacity-50"
                    />

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </div>

      )}

    </div>

  );

}