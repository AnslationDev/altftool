"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  Headphones,
} from "lucide-react";

export default function BookTabs({ book, bookChapters }) {
  const [activeTab, setActiveTab] = useState("summary");
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="mt-12 border-b border-(--border)">
        <div className="flex items-center gap-10">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-4 text-base font-semibold transition cursor-pointer border-b-[3px] ${
              activeTab === "summary"
                ? "border-(--primary) text-(--foreground)"
                : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("parts")}
            className={`pb-4 text-base font-semibold transition cursor-pointer border-b-[3px] ${
              activeTab === "parts"
                ? "border-(--primary) text-(--foreground)"
                : "border-transparent text-(--muted-foreground) hover:text-(--foreground)"
            }`}
          >
            Parts
          </button>
        </div>
      </div>

      {activeTab === "summary" && (
        <div>
          <div className="py-6 border-b border-(--border)">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-bold text-(--foreground) capitalize">{book.status}</span>
              {book.meta?.readingTime ? (
                <>
                  <span className="text-(--muted-foreground)">•</span>
                  <span className="text-(--muted-foreground)">{book.meta.readingTime}</span>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 py-8">
            {book.tags?.map((tag) => (
              <span key={tag} className="wp-book-tag">{tag}</span>
            ))}
          </div>

          <div className="border-b border-(--border) pb-5">
            <p
              className={`text-base leading-relaxed text-(--foreground) transition-all duration-300 ${
                expanded ? "" : "line-clamp-2"
              }`}
            >
              {book.description}
            </p>
            {book.description?.length > 150 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="font-bold text-sm text-(--primary) hover:opacity-80 transition cursor-pointer mt-2"
              >
                {expanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>

          <div className="py-6 border-b border-(--border)">
            <div className="flex items-center gap-3 text-(--foreground)">
              <Headphones size={20} />
              <span className="text-base">Text-to-speech</span>
            </div>
          </div>

          <div className="py-6 border-b border-(--border)">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-(--foreground)">#2</span>
                <span className="wp-book-tag">romance</span>
              </div>
              <ChevronRight size={22} className="text-(--muted-foreground)" />
            </div>
          </div>
        </div>
      )}

      {activeTab === "parts" && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight text-(--foreground)">
              Parts
            </h2>
            <span className="text-(--muted-foreground) text-sm">
              {bookChapters.length} Chapters
            </span>
          </div>

          <div className="space-y-4">
            {bookChapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/wattpad/read/${book.slug}/${chapter.chapterNumber}`}
                className="block"
              >
                <div className="wp-chapter-item">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="wp-chapter-number">Part {chapter.chapterNumber}</p>
                      <h3 className="wp-chapter-title">{chapter.title}</h3>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-(--muted-foreground) opacity-50 shrink-0"
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
