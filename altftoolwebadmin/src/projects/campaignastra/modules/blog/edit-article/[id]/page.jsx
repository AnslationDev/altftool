"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import ArticleForm from "../../components/ArticleForm";
import { subscribeBlogArticles } from "../../service/blog.service";

export default function EditCampaignastraBlogArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? decodeURIComponent(String(params.id)) : "";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      emitAlert({ type: "error", message: "Article id is missing from the edit route." });
      router.push("/campaignastra/blog");
      return;
    }

    const unsub = subscribeBlogArticles(
      (items) => {
        const match = items.find((item) => item.id === id);
        if (!match) {
          setLoading(false);
          emitAlert({ type: "error", message: "Article not found." });
          router.push("/campaignastra/blog");
          return;
        }
        setArticle(match);
        setLoading(false);
      },
      () => {
        setLoading(false);
        emitAlert({ type: "error", message: "Failed to load article." });
      },
    );

    return () => unsub();
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
