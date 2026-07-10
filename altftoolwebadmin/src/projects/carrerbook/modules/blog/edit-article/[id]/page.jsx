"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import ArticleForm from "../../components/ArticleForm";
import { fetchBlogArticle } from "../../service/blog.service";

export default function EditCareerBookArticlePage() {
  const params = useParams();
  const router = useRouter();
  const routeId = params?.id || (Array.isArray(params?.subpath) ? params.subpath.at(-1) : "");
  const id = routeId ? decodeURIComponent(String(routeId)) : "";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      emitAlert({ type: "error", message: "Article id is missing from the edit route." });
      router.push("/carrerbook/blog");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchBlogArticle(id);
        if (cancelled) return;
        if (!data) {
          emitAlert({ type: "error", message: "Article not found." });
          router.push("/carrerbook/blog");
          return;
        }
        setArticle(data);
      } catch (error) {
        emitAlert({ type: "error", message: error?.message || "Failed to load article." });
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm font-semibold text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading article...
      </div>
    );
  }

  return <ArticleForm mode="edit" article={article} />;
}
