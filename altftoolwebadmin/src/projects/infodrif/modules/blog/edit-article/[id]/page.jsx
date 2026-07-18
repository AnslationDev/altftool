"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import ArticleForm from "../../components/ArticleForm";
import { getBlogArticle } from "../../service/blog.service";

export default function EditInfodrifBlogArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? decodeURIComponent(String(params.id)) : "";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setLoading(false);
      emitAlert({ type: "error", message: "Article id is missing from the edit route." });
      router.push("/infodrif/blog");
      return undefined;
    }

    // One document read — the form only needs a starting value, so there is no
    // reason to subscribe to the whole collection to find a single article.
    getBlogArticle(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          emitAlert({ type: "error", message: "Article not found." });
          router.push("/infodrif/blog");
          return;
        }
        setArticle(data);
      })
      .catch((error) => {
        if (cancelled) return;
        emitAlert({ type: "error", message: error?.message || "Failed to load article." });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, router]);

  if (loading || !article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm font-semibold text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading article...
      </div>
    );
  }

  return <ArticleForm mode="edit" article={article} />;
}
