"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";

import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAds } from "@/ads/AdsProvider";

import BlogCard from "@/app/blogs/components/BlogCard";
import AdCard from "../../components/AdCard";
import { normalizeBlog } from "../../data";

function interleaveAds(posts, ads) {
  if (!ads?.length) {
    return posts.map((data) => ({ type: "blog", data }));
  }

  const result = posts.map((data) => ({
    type: "blog",
    data,
  }));

  const BLOGS_PER_ROW = 4;
  const MIN_GAP = 6; // minimum blogs between ads

  const adPositions = [];
  let lastAdIndex = -MIN_GAP;

  for (let i = 2; i < result.length; i++) {
    const isFarEnough = i - lastAdIndex >= MIN_GAP;
    const isRandomPick = Math.random() < 0.25;

    // avoid same row ads
    const sameRow =
      Math.floor(i / BLOGS_PER_ROW) === Math.floor(lastAdIndex / BLOGS_PER_ROW);

    if (isFarEnough && isRandomPick && !sameRow) {
      adPositions.push(i);
      lastAdIndex = i;
    }
  }

  // insert ads
  let adIndex = 0;

  adPositions.reverse().forEach((pos) => {
    result.splice(pos, 0, {
      type: "ad",
      data: ads[adIndex % ads.length],
    });

    adIndex++;
  });

  return result;
}

export default function BlogsViewAllPage() {
  const [loading, setLoading] = useState(true);
  const { section } = useParams();

  const [visibleBlogs, setVisibleBlogs] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [lastDoc, setLastDoc] = useState(null);

  const PAGE_SIZE = 12;

  const observerRef = useRef(null);

  useEffect(() => {
    loadBlogs();
  }, [section]);

  const loadBlogs = async () => {
    try {
      setLoading(true);

      const blogsRef = collection(db, "projects", "altftool", "blogs");

      let q;

      if (section === "tool-guides") {
        q = query(
          blogsRef,
          where("status", "==", "published"),
          where("category", "in", [
            "Digital Tools",
            "Extensions",
            "Tool Reviews",
          ]),

          limit(PAGE_SIZE),
        );
      } else if (section === "latest-blogs") {
        q = query(
          blogsRef,
          where("status", "==", "published"),
          orderBy("createdAt", "desc"),
          limit(PAGE_SIZE),
        );
      } else if (section === "trending-articles") {
        q = query(
          blogsRef,

          orderBy("views", "desc"),
          limit(PAGE_SIZE),
        );
      } else {
        q = query(
          blogsRef,
          where("status", "==", "published"),

          limit(PAGE_SIZE),
        );
      }

      const snap = await getDocs(q);

      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setVisibleBlogs(data.map((blog, index) => normalizeBlog(blog, index)));
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || !lastDoc) return;

    const blogsRef = collection(db, "projects", "altftool", "blogs");

    let q;

    if (section === "tool-guides") {
      q = query(
        blogsRef,
        where("status", "==", "published"),
        where("category", "in", [
          "Digital Tools",
          "Extensions",
          "Tool Reviews",
        ]),

        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
    } else if (section === "latest-blogs") {
      q = query(
        blogsRef,
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
    } else if (section === "trending-articles") {
      q = query(
        blogsRef,

        orderBy("views", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
    } else {
      q = query(
        blogsRef,
        where("status", "==", "published"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
    }

    const snap = await getDocs(q);

    const newBlogs = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setVisibleBlogs((prev) => [
      ...prev,
      ...newBlogs.map((blog, index) => normalizeBlog(blog, prev.length + index)),
    ]);
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setHasMore(snap.docs.length === PAGE_SIZE);
  };

  const lastBlogRef = (node) => {
    if (!hasMore) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    });

    if (node) observerRef.current.observe(node);
  };

  const sectionHeadings = {
    "latest-blogs": "Latest Blog Articles",
    "tool-guides": "Tool Guides",
    "trending-articles": "Trending Articles",
    "editors-picks": "Editor's Picks",
  };

  const heading = sectionHeadings[section] || "All Blogs";

  const blogListAds = useAds({ placement: "blog_list" });

  const blogsWithAds = useMemo(() => {
    return interleaveAds(visibleBlogs, blogListAds);
  }, [visibleBlogs, blogListAds]);

  const lastBlogIndex = useMemo(() => {
    for (let i = blogsWithAds.length - 1; i >= 0; i--) {
      if (blogsWithAds[i].type === "blog") {
        return i;
      }
    }
    return -1;
  }, [blogsWithAds]);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <div className="mx-auto w-full max-w-[1500px] px-3 py-6 sm:px-5 md:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-(--border) pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/blogs"
              className="mb-4 inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:border-(--primary) hover:text-(--primary)"
            >
              <ArrowLeft className="h-4 w-4" />
              All blogs
            </Link>
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
              Blog collection
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-(--foreground) sm:text-4xl">
              {heading}
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Read practical guides from this topic and continue into related AltFTool resources.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <BlogCardSkeleton key={i} />
              ))
            : blogsWithAds.map((item, index) => {
                if (item.type === "ad") {
                  return (
                    <AdCard
                      key={`ad-${index}`}
                      src={item.data}
                      height="h-[300px]"
                    />
                  );
                }

                return (
                  <div
                    ref={index === lastBlogIndex ? lastBlogRef : null}
                    key={item.data.id}
                  >
                    <BlogCard
                      blog={item.data}
                      height="h-[320px]"
                      showExcerpt
                    />
                  </div>
                );
              })}
        </div>

        {hasMore && !loading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-(--muted-foreground)">
            <Loader2 className="h-4 w-4 animate-spin text-(--primary)" />
            Loading more articles
          </div>
        )}
      </div>
    </main>
  );

  function BlogCardSkeleton() {
    return (
      <div className="animate-pulse overflow-hidden rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card)">
        <div className="h-[170px] bg-(--muted)"></div>

        <div className="p-4 space-y-3">
          <div className="h-4 bg-(--muted) rounded w-3/4"></div>

          <div className="h-3 bg-(--muted) rounded w-full"></div>
          <div className="h-3 bg-(--muted) rounded w-5/6"></div>

          <div className="h-3 bg-(--muted) rounded w-1/4"></div>
        </div>
      </div>
    );
  }
}
