"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import BlogPostForm from "../../components/BlogPostForm";
import { fetchBlogPost } from "../../service/blog.service";

export default function EditCoozterBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params?.id || (Array.isArray(params?.subpath) ? params.subpath.at(-1) : "");
  const id = routeId ? decodeURIComponent(String(routeId)) : "";
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      emitAlert({ type: "error", message: "Blog post id is missing." });
      router.push("/coozter/blog");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBlogPost(id);
        if (cancelled) return;
        if (!data) {
          emitAlert({ type: "error", message: "Blog post not found." });
          router.push("/coozter/blog");
          return;
        }
        setPost(data);
      } catch (error) {
        emitAlert({ type: "error", message: error?.message || "Failed to load blog post." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-sm font-semibold text-[var(--muted)]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading blog post...
      </div>
    );
  }

  return <BlogPostForm mode="edit" post={post} />;
}
