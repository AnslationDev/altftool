"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAds } from "@/ads/AdsProvider";

import { useMemo } from "react";

import BlogCard from "@/app/blogs/components/BlogCard";
import AdCard from "../../components/AdCard";

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
  const router = useRouter();

  const [blogs, setBlogs] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [visibleBlogs, setVisibleBlogs] = useState([]);
  const [page, setPage] = useState(1);
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

      setVisibleBlogs(data);
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

    setVisibleBlogs((prev) => [...prev, ...newBlogs]);
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
    "latest-blogs": "Latest Insights to Boost Your Productivity",
    "tool-guides": "Work Smarter with AI Tools",
    "trending-articles": "Everything You Need to Work Smarter",
    "editors-picks": " Explore Our Editor's Favorite Reads",
  };

  const heading = sectionHeadings[section] || "All Blogs";

  const blogListAds = useAds({ placement: "blog_list" });

  const blogsWithAds = useMemo(() => {
    return interleaveAds(visibleBlogs, blogListAds, 3);
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
    <div className="section">
      <h1 className="text-center font-bold mb-2 lg:text-4xl text-md sm:text-xl md:text-2xl text-(--primary) mt-5">
        {heading}
      </h1>

      <div className="mb-6 w-full border-b border-(--border) p-2 cursor-pointer mt-5">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-4 py-2 rounded-md text-var(--primary) transition cursor-pointer gap-3 hover:text-(--primary)"
        >
          <span className="w-8 h-8 flex justify-center items-center border border-(--border) rounded-full hover:bg-(--primary) hover:text-white transition-all duration-300">
            <ArrowLeft size={22} />
          </span>
          Back to Blogs Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    height="h-[300px]"
                    variant="horizontal"
                  />
                </div>
              );
            })}
      </div>

      {hasMore && !loading && (
        <p className="text-center mt-4 text-gray-500">Loading more...</p>
      )}
    </div>
  );

  function BlogCardSkeleton() {
    return (
      <div className="animate-pulse rounded-2xl border border-gray-200 overflow-hidden ">
        <div className="h-[150px] bg-gray-200"></div>

        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>

          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>

          <div className="h-3 bg-gray-200  rounded w-1/4"></div>
        </div>
      </div>
    );
  }
}
