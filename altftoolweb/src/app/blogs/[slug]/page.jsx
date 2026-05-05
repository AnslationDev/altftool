// app/blogs/[slug]/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection, query, where, limit,
  getDocs, doc, updateDoc, increment,
  addDoc, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ArrowLeft } from "lucide-react";
import { incrementUniqueView } from "../context/views.service";

import BlogHeader        from "../components/slug/BlogHeader";
import BlogActions       from "../components/slug/BlogActions";
import BlogContent       from "../components/slug/BlogContent";
import BlogAds           from "../components/slug/BlogAds";
import BlogComments      from "../components/slug/BlogComments";
import BlogTopBarLoader  from "../components/slug/BlogTopBarLoader";
import BlogTableOfContents from "../components/slug/BlogTableOfContents";
import BlogCard          from "../components/BlogCard";
import "../../styles/ckeditor.css";

const SIMILAR_LIMIT = 6;

// ── Fetch blog by slug (no global context dependency) ──────────────────────
async function fetchBlogBySlug(slug) {
  const snap = await getDocs(
    query(
      collection(db, "projects", "altftool", "blogs"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    )
  );
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ── Fetch similar posts by category ────────────────────────────────────────
async function fetchSimilarPosts(category, excludeSlug) {
  const snap = await getDocs(
    query(
      collection(db, "projects", "altftool", "blogs"),
      where("status",   "==", "published"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(SIMILAR_LIMIT + 1)           // +1 to account for self
    )
  );
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((b) => b.slug !== excludeSlug)
    .slice(0, SIMILAR_LIMIT);
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const router   = useRouter();

  const [blog,           setBlog]           = useState(null);
  const [similarPosts,   setSimilarPosts]   = useState([]);
  const [likes,          setLikes]          = useState(0);
  const [liked,          setLiked]          = useState(false);
  const [comments,       setComments]       = useState([]);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [notFound,       setNotFound]       = useState(false);

  // ── Load blog + similar in parallel ────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    (async () => {
      const found = await fetchBlogBySlug(slug);
      if (cancelled) return;

      if (!found) { setNotFound(true); return; }

      setBlog(found);
      setLikes(found.likesCount || 0);
      loadComments(found.id);
      incrementUniqueView(found.id);

      // Similar posts — non-blocking
      fetchSimilarPosts(found.category, slug)
        .then((posts) => { if (!cancelled) setSimilarPosts(posts); })
        .catch(console.error);
    })();

    return () => { cancelled = true; };
  }, [slug]);

  // Redirect 404
  useEffect(() => {
    if (notFound) router.replace("/blogs");
  }, [notFound, router]);

  // ── Meta ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!blog) return;
    document.title = blog.seoTitle?.trim() || blog.heading;
    let meta = document.querySelector('meta[name="description"]');
    if (blog.seoDescription) {
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", "description");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", blog.seoDescription);
    }
    return () => { document.title = ""; };
  }, [blog]);

  const loadComments = async (blogId) => {
    if (!blogId) return;
    const snap = await getDocs(
      query(collection(db, "blogs", blogId, "comments"), orderBy("createdAt", "desc"))
    );
    setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const addComment = async (text) => {
    if (!text?.trim()) return;
    await addDoc(collection(db, "blogs", blog.id, "comments"), {
      text, createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "blogs", blog.id), { commentsCount: increment(1) });
    setComments((prev) => [
      { text, createdAt: { seconds: Date.now() / 1000 } },
      ...prev,
    ]);
  };

  if (!blog && !notFound) return <BlogTopBarLoader />;

  return (
    <div className="py-4" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <div className="w-full px-4 md:px-20">

        <div className="mb-6 w-full border-b border-[var(--border)] p-2 text-[var(--primary)] flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full
              border border-[var(--border)] bg-[var(--card)] text-[var(--primary)]
              hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition"
          >
            <ArrowLeft size={18} />
          </button>
          Back to Blogs Page
        </div>

        <BlogHeader blog={blog} />
        <BlogActions
          likes={likes} blogId={blog.id} setLikes={setLikes}
          liked={liked} setLiked={setLiked}
          commentsCount={comments.length}
          showCommentBox={showCommentBox} setShowCommentBox={setShowCommentBox}
          date={blog.date} author={blog.author}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_4fr_1fr] gap-8 mt-10 items-start">
          <BlogTableOfContents content={blog.description} />
          <div className="flex flex-col gap-2">
            <div className="md:px-8 w-full">
              <BlogContent content={blog.description} />
            </div>
            <BlogComments
              comments={comments} addComment={addComment}
              showCommentBox={showCommentBox} setShowCommentBox={setShowCommentBox}
            />
          </div>
          <BlogAds slug={slug} category={blog.category} />
        </div>

        {similarPosts.length > 0 && (
          <section className="mt-16 border-t border-[var(--border)] pt-10">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-1">
                More in {blog.category}
              </p>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">Similar Posts</h2>
              <div className="mt-2 h-[2px] w-16 bg-gradient-to-r from-[#2D68C4] to-[#519CF1] rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarPosts.map((post) => (
                <BlogCard key={post.slug} blog={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}