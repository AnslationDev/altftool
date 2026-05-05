"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { ArrowLeft, Loader2 } from "lucide-react";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { getCachedFirebaseRead } from "@/lib/firebaseCache";
import { incrementUniqueView } from "../context/views.service";
import { normalizeBlog } from "../data";
import BlogHeader from "../components/slug/BlogHeader";
import BlogActions from "../components/slug/BlogActions";
import BlogContent from "../components/slug/BlogContent";
import BlogAds from "../components/slug/BlogAds";
import BlogComments from "../components/slug/BlogComments";
import BlogTopBarLoader from "../components/slug/BlogTopBarLoader";
import BlogTableOfContents from "../components/slug/BlogTableOfContents";
import BlogCard from "../components/BlogCard";
import "../../styles/ckeditor.css";

const PROJECT_ID = "altftool";
const SIMILAR_LIMIT = 6;

const blogsCol = () => collection(db, "projects", PROJECT_ID, "blogs");
const commentsCol = (blogId) => collection(db, "projects", PROJECT_ID, "blogs", blogId, "comments");

function withTimeout(promise, timeoutMs, fallbackValue) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      window.setTimeout(() => resolve(fallbackValue), timeoutMs);
    }),
  ]);
}

async function fetchBlogBySlug(slug) {
  return getCachedFirebaseRead(
    `blogs:detail:${slug}:v2`,
    async () => {
      const snap = await getDocs(
        query(
          blogsCol(),
          where("slug", "==", slug),
          where("status", "==", "published"),
          limit(1)
        )
      );

      if (snap.empty) return null;
      return normalizeBlog({ id: snap.docs[0].id, ...snap.docs[0].data() });
    },
    120000
  );
}

async function fetchSimilarPosts(category, excludeSlug) {
  if (!category) return [];

  return getCachedFirebaseRead(
    `blogs:similar:${category}:${excludeSlug}:v2`,
    async () => {
      const snap = await getDocs(
        query(
          blogsCol(),
          where("status", "==", "published"),
          where("category", "==", category),
          orderBy("createdAt", "desc"),
          limit(SIMILAR_LIMIT + 1)
        )
      );

      return snap.docs
        .map((item, index) => normalizeBlog({ id: item.id, ...item.data() }, index))
        .filter((post) => post.slug !== excludeSlug)
        .slice(0, SIMILAR_LIMIT);
    },
    120000
  );
}

export default function BlogDetailClient({ slug, initialBlog, initialRelated }) {
  const router = useRouter();

  const [blog, setBlog] = useState(initialBlog);
  const [similarPosts, setSimilarPosts] = useState(initialRelated);
  const [likes, setLikes] = useState(initialBlog?.likesCount || 0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [refreshing, setRefreshing] = useState(Boolean(!initialBlog));

  const loadComments = useCallback(async (blogId) => {
    if (!blogId || typeof blogId !== "string") return;

    const snap = await getDocs(
      query(commentsCol(blogId), orderBy("createdAt", "desc"), limit(20))
    );
    setComments(snap.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, []);

  useEffect(() => {
    if (!slug) return undefined;

    let cancelled = false;
    const schedule = window.requestIdleCallback || ((callback) => window.setTimeout(callback, initialBlog ? 450 : 0));
    const cancel = window.cancelIdleCallback || window.clearTimeout;

    const handle = schedule(async () => {
      if (!isFirebaseConfigured) {
        setRefreshing(false);
        if (!initialBlog) setNotFound(true);
        return;
      }

      setRefreshing(true);
      try {
        const found = await withTimeout(fetchBlogBySlug(slug), 4500, initialBlog);
        if (cancelled) return;

        if (!found) {
          if (!initialBlog) setNotFound(true);
          return;
        }

        setBlog(found);
        setLikes(found.likesCount || 0);
        if (typeof found.id === "string") {
          incrementUniqueView(found.id);
          loadComments(found.id);
        }

        fetchSimilarPosts(found.category, slug)
          .then((posts) => {
            if (!cancelled && posts.length) setSimilarPosts(posts);
          })
          .catch(console.error);
      } catch (error) {
        if (!cancelled && !initialBlog) {
          console.error("Blog detail fetch failed:", error);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    });

    return () => {
      cancelled = true;
      cancel(handle);
    };
  }, [initialBlog, loadComments, slug]);

  useEffect(() => {
    if (notFound) router.replace("/blogs");
  }, [notFound, router]);

  useEffect(() => {
    if (!blog) return undefined;

    document.title = blog.seoTitle?.trim() || `${blog.heading} | AltFTool Blog`;
    let meta = document.querySelector('meta[name="description"]');

    if (blog.seoDescription || blog.excerpt) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", blog.seoDescription || blog.excerpt);
    }

    return () => {
      document.title = "AltFTool Blog";
    };
  }, [blog]);

  const addComment = async (text) => {
    if (!text?.trim() || !blog?.id || typeof blog.id !== "string") return;

    await addDoc(commentsCol(blog.id), {
      text: text.trim(),
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "projects", PROJECT_ID, "blogs", blog.id), {
      commentsCount: increment(1),
    });
    setComments((prev) => [
      { text: text.trim(), createdAt: { seconds: Date.now() / 1000 } },
      ...prev,
    ]);
  };

  if (!blog && !notFound) return <BlogTopBarLoader />;

  return (
    <main className="bg-(--background) py-4 text-(--foreground)">
      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-(--border) pb-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-9 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-sm font-semibold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary)"
          >
            <ArrowLeft className="h-4 w-4" />
            Blogs
          </button>
          {refreshing && (
            <span className="inline-flex h-8 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-3 text-xs font-medium text-(--muted-foreground)">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-(--primary)" />
              Syncing live article
            </span>
          )}
        </div>

        <BlogHeader blog={blog} />
        <BlogActions
          likes={likes}
          blogId={blog.id}
          setLikes={setLikes}
          liked={liked}
          setLiked={setLiked}
          commentsCount={comments.length}
          showCommentBox={showCommentBox}
          setShowCommentBox={setShowCommentBox}
          date={blog.date}
          author={blog.author}
        />

        <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-[240px_minmax(0,1fr)_260px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <div className="hidden lg:block">
            <BlogTableOfContents content={blog.description} />
          </div>
          <div className="min-w-0">
            <div className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] md:p-7">
              <BlogContent content={blog.description} />
            </div>
            <BlogComments
              comments={comments}
              addComment={addComment}
              showCommentBox={showCommentBox}
              setShowCommentBox={setShowCommentBox}
            />
          </div>
          <BlogAds slug={slug} category={blog.category} />
        </div>

        {similarPosts.length > 0 && (
          <section className="mt-14 border-t border-(--border) pt-8">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
                More in {blog.category}
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-(--foreground)">Similar posts</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similarPosts.map((post) => (
                <BlogCard key={post.slug} blog={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
