"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, Plus } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { getModuleDocRef } from "../shared/collectionService";
import { getDoc, setDoc } from "firebase/firestore";
import { Field, TextArea } from "../shared/fields";
import ImagePreview from "../shared/ImagePreview";

const clone = (v) => JSON.parse(JSON.stringify(v));

function FieldWithImage({ label, value, onChange }) {
  return (
    <div className="mb-4">
      <span className="mb-1.5 block text-xs font-semibold tracking-wide text-[var(--muted)]">{label}</span>
      <input className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20"
        value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
      {value && typeof value === "string" && (value.startsWith("http") || value.startsWith("/")) && (
        <div className="mt-2"><ImagePreview src={value} /></div>
      )}
    </div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(getModuleDocRef("blogs"));
        if (active) setPosts(snap.exists() ? (snap.data().items || []) : []);
      } catch {} finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(getModuleDocRef("blogs"), { items: posts, updatedAt: new Date() }, { merge: true });
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Blog posts updated." });
    } catch (err) { emitAlert({ type: "error", title: "Save failed", message: err?.message }); }
    finally { setSaving(false); }
  };

  const updatePost = (i, v) => { const n = posts.slice(); n[i] = v; setPosts(n); setDirty(true); };
  const removePost = (i) => { setPosts(posts.filter((_, j) => j !== i)); setDirty(true); };
  const addPost = () => setPosts([...posts, { title: "", slug: "", category: "", excerpt: "", coverImage: "", author: "", body: [] }]);

  if (loading) return <div className="flex items-center gap-2.5 p-10 text-sm text-[var(--muted)]"><Loader2 size={18} className="animate-spin" /> Loading blog posts…</div>;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">Blog</h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Manage blog posts.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleSave} disabled={saving || !dirty} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>
      </div>

      {posts.map((post, i) => (
        <div key={i} className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Post {i + 1}</h3>
            <button onClick={() => removePost(i)} className="text-xs text-red-500 hover:text-red-600">Remove</button>
          </div>
          <Field label="Title" value={post.title} onChange={(v) => updatePost(i, { ...post, title: v })} />
          <Field label="Slug" value={post.slug} onChange={(v) => updatePost(i, { ...post, slug: v })} />
          <Field label="Category" value={post.category} onChange={(v) => updatePost(i, { ...post, category: v })} />
          <Field label="Author" value={post.author} onChange={(v) => updatePost(i, { ...post, author: v })} />
          <TextArea label="Excerpt" value={post.excerpt} onChange={(v) => updatePost(i, { ...post, excerpt: v })} />
          <FieldWithImage label="Cover Image" value={post.coverImage} onChange={(v) => updatePost(i, { ...post, coverImage: v })} />
        </div>
      ))}
      <button onClick={addPost} className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10">
        <Plus size={15} /> Add post
      </button>
    </div>
  );
}
