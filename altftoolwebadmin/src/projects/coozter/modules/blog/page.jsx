"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Edit3, Eye, FileText, Loader2, PencilLine, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_BLOG_PAGE_CONTENT,
  deleteBlogPost,
  saveBlogPageContent,
  seedBlogPageContent,
  subscribeBlogPageContent,
  subscribeBlogPosts,
  toggleBlogPostStatus,
} from "./service/blog.service";

const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
const textareaClass =
  "w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
const buttonClass =
  "inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition disabled:opacity-60";
const secondaryButtonClass =
  "inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-soft)] disabled:opacity-60";

const SECTION_FIELDS = {
  heroSection: [
    ["eyebrowText", "Eyebrow text"],
    ["headingText", "Heading text", "textarea"],
    ["descriptionText", "Description", "textarea"],
    ["featuredBadgeText", "Featured badge text"],
    ["insightLabel", "Insight label"],
    ["notesLabel", "Notes label"],
  ],
  articleListSection: [
    ["eyebrowText", "Eyebrow text"],
    ["headingText", "Heading text", "textarea"],
    ["articleFoundSingularText", "Article found singular text"],
    ["articleFoundPluralText", "Article found plural text"],
    ["emptyMoreArticlesText", "Empty more articles text", "textarea"],
    ["emptyTitle", "Empty title"],
    ["emptyDescription", "Empty description", "textarea"],
  ],
  buttons: [
    ["featuredButtonLabel", "Featured button label"],
    ["cardButtonLabel", "Card button label"],
    ["previewButtonLabel", "Preview button label"],
    ["backButtonLabel", "Back button label"],
    ["allArticlesLabel", "All articles label"],
  ],
};

const DETAIL_GROUPS = {
  detailPage: [
    ["fieldNoteBadgeText", "Field note badge text"],
    ["contentsTitle", "Contents title"],
    ["defaultExtraParagraph", "Default extra paragraph", "textarea"],
  ],
  sideCardOne: [["iconKey", "Icon key"], ["eyebrowText", "Eyebrow text"], ["descriptionText", "Description", "textarea"]],
  sideCardTwo: [["iconKey", "Icon key"], ["eyebrowText", "Eyebrow text"], ["descriptionText", "Description", "textarea"]],
  ctaSection: [["headingText", "Heading text"], ["descriptionText", "Description", "textarea"], ["buttonLabel", "Button label"], ["buttonUrl", "Button URL"]],
  relatedSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text"], ["allArticlesLabel", "All articles label"], ["allArticlesUrl", "All articles URL"]],
  newsletterSection: [["headingText", "Heading text"], ["descriptionText", "Description", "textarea"], ["placeholderText", "Placeholder text"], ["submitAriaLabel", "Submit aria label"], ["validationErrorText", "Validation error text"], ["successText", "Success text"]],
};

export default function CoozterBlogAdminPage() {
  const [content, setContent] = useState(DEFAULT_BLOG_PAGE_CONTENT);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveInFlightRef = useRef(false);

  useEffect(() => {
    const unsubContent = subscribeBlogPageContent(
      (next) => {
        setContent(next);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load Coozter blog page content." });
      },
    );
    const unsubPosts = subscribeBlogPosts(
      setPosts,
      (error) => emitAlert({ type: "error", message: error?.message || "Failed to load blog posts." }),
    );
    return () => {
      unsubContent();
      unsubPosts();
    };
  }, []);

  const postStats = useMemo(() => {
    const published = posts.filter((post) => isPublishedPost(post)).length;
    return {
      total: posts.length,
      published,
      drafts: posts.length - published,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTab === "published" && !isPublishedPost(post)) return false;
      if (activeTab === "draft" && isPublishedPost(post)) return false;
      if (!search) return true;
      return [post.title, post.slug, post.category, post.author].some((value) => String(value || "").toLowerCase().includes(search));
    });
  }, [activeTab, posts, query]);

  function setSectionField(sectionKey, field, value) {
    setContent((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [field]: value,
      },
    }));
  }

  function setDetailField(groupKey, field, value) {
    setContent((prev) => {
      if (groupKey === "detailPage") {
        return { ...prev, detailPage: { ...prev.detailPage, [field]: value } };
      }
      return {
        ...prev,
        detailPage: {
          ...prev.detailPage,
          [groupKey]: {
            ...prev.detailPage[groupKey],
            [field]: value,
          },
        },
      };
    });
  }

  function updateContentRow(index, field, value) {
    setContent((prev) => {
      const rows = [...(prev.detailPage.contents || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, detailPage: { ...prev.detailPage, contents: rows } };
    });
  }

  async function handleSave() {
    if (saveInFlightRef.current) return;
    saveInFlightRef.current = true;
    setSaving(true);
    try {
      await saveBlogPageContent(content);
      emitAlert({ type: "success", message: "Coozter blog page content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save blog page content." });
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  }

  async function handleSeed() {
    try {
      await seedBlogPageContent();
      emitAlert({ type: "success", message: "Default Coozter blog page content seeded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to seed blog page content." });
    }
  }

  async function removePost(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await deleteBlogPost(post.id);
      emitAlert({ type: "success", message: "Blog post deleted." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete blog post." });
    }
  }

  async function togglePost(post) {
    try {
      await toggleBlogPostStatus(post.id, post.status !== "published");
      emitAlert({ type: "success", message: "Blog post status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update blog post." });
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mt-1 text-2xl font-bold">Blog Page Content</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Page fields and posts for `projects/coozter/blogs`.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSeed} className={secondaryButtonClass}><RefreshCw className="h-4 w-4" /> Seed Defaults</button>
            <button type="button" onClick={handleSave} disabled={saving} className={buttonClass}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Page Text
            </button>
            <Link href="/coozter/blog/add-article" className={buttonClass}><Plus className="h-4 w-4" /> Add Post</Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Posts" value={postStats.total} icon={<FileText className="h-6 w-6" />} />
          <StatCard label="Published Posts" value={postStats.published} icon={<Eye className="h-6 w-6" />} tone="success" />
          <StatCard label="Draft Posts" value={postStats.drafts} icon={<PencilLine className="h-6 w-6" />} tone="warning" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.58fr)_minmax(420px,0.42fr)]">
          <div className="space-y-5">
            {Object.entries(SECTION_FIELDS).map(([sectionKey, fields]) => (
              <Panel key={sectionKey} title={sectionKey}>
                <div className="mb-3 flex items-center gap-2">
                  {sectionKey !== "buttons" ? (
                    <button
                      type="button"
                      onClick={() => setSectionField(sectionKey, "isActive", content[sectionKey]?.isActive === false)}
                      className={content[sectionKey]?.isActive === false ? secondaryButtonClass : buttonClass}
                    >
                      {content[sectionKey]?.isActive === false ? "Hidden" : "Active"}
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {fields.map(([field, label, type]) => (
                    <Field key={field} label={label} wide={type === "textarea"}>
                      {type === "textarea" ? (
                        <textarea rows={3} value={content[sectionKey]?.[field] || ""} onChange={(event) => setSectionField(sectionKey, field, event.target.value)} className={textareaClass} />
                      ) : (
                        <input value={content[sectionKey]?.[field] || ""} onChange={(event) => setSectionField(sectionKey, field, event.target.value)} className={inputClass} />
                      )}
                    </Field>
                  ))}
                </div>
              </Panel>
            ))}

            <Panel title="detailPage">
              {Object.entries(DETAIL_GROUPS).map(([groupKey, fields]) => (
                <div key={groupKey} className="rounded-lg border border-[var(--border)] p-4">
                  <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">{groupKey}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {fields.map(([field, label, type]) => {
                      const value = groupKey === "detailPage" ? content.detailPage?.[field] : content.detailPage?.[groupKey]?.[field];
                      return (
                        <Field key={field} label={label} wide={type === "textarea"}>
                          {type === "textarea" ? (
                            <textarea rows={3} value={value || ""} onChange={(event) => setDetailField(groupKey, field, event.target.value)} className={textareaClass} />
                          ) : (
                            <input value={value || ""} onChange={(event) => setDetailField(groupKey, field, event.target.value)} className={inputClass} />
                          )}
                        </Field>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="rounded-lg border border-[var(--border)] p-4">
                <h3 className="mb-3 text-sm font-bold text-[var(--foreground)]">contents</h3>
                <div className="space-y-3">
                  {(content.detailPage?.contents || []).map((row, index) => (
                    <div key={index} className="grid gap-3 md:grid-cols-[1fr_1fr_110px_110px]">
                      <input value={row.label || ""} onChange={(event) => updateContentRow(index, "label", event.target.value)} className={inputClass} />
                      <input value={row.targetId || ""} onChange={(event) => updateContentRow(index, "targetId", event.target.value)} className={inputClass} />
                      <input type="number" value={row.sortOrder ?? index + 1} onChange={(event) => updateContentRow(index, "sortOrder", event.target.value)} className={inputClass} />
                      <button type="button" onClick={() => updateContentRow(index, "isActive", row.isActive === false)} className={secondaryButtonClass}>
                        {row.isActive === false ? "Hidden" : "Active"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <aside className="space-y-5">
            <Panel title="Blog Posts">
              <div className="flex flex-wrap gap-2">
                <TabButton active={activeTab === "all"} onClick={() => setActiveTab("all")}>
                  All Blogs
                </TabButton>
                <TabButton active={activeTab === "draft"} onClick={() => setActiveTab("draft")}>
                  Drafts
                </TabButton>
                <TabButton active={activeTab === "published"} onClick={() => setActiveTab("published")}>
                  Published
                </TabButton>
              </div>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search posts..." />
              </label>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                {filteredPosts.length} {filteredPosts.length === 1 ? "blog" : "blogs"}
              </p>
              <div className="mt-4 space-y-3">
                {loading ? (
                  <p className="text-sm font-semibold text-[var(--muted)]">Loading...</p>
                ) : filteredPosts.length ? filteredPosts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold">{post.title}</h3>
                        <p className="mt-1 text-xs text-[var(--muted)]">{post.category || "Uncategorized"} · {post.displayDate || post.date || "-"}</p>
                      </div>
                      <span className={isPublishedPost(post) ? "text-xs font-bold text-[var(--success)]" : "text-xs font-bold text-[var(--muted)]"}>
                        {isPublishedPost(post) ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href={`/coozter/blog/edit-article/${encodeURIComponent(post.id)}`} className={secondaryButtonClass}><Edit3 className="h-4 w-4" /> Edit</Link>
                      <button type="button" onClick={() => togglePost(post)} className={secondaryButtonClass}>{isPublishedPost(post) ? "Draft" : "Publish"}</button>
                      <button type="button" onClick={() => removePost(post)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] px-4 text-sm font-semibold text-[var(--danger)]">
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-lg border border-dashed border-[var(--border)] p-6 text-center">
                    <FileText className="mx-auto h-6 w-6 text-[var(--muted)]" />
                    <p className="mt-2 text-sm font-semibold text-[var(--muted)]">No blog posts yet.</p>
                  </div>
                )}
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, tone = "primary" }) {
  const toneClass = {
    primary: "bg-[color-mix(in_srgb,var(--primary)_12%,var(--surface))] text-[var(--primary)]",
    success: "bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] text-[var(--success)]",
    warning: "bg-[color-mix(in_srgb,var(--warning)_14%,var(--surface))] text-[var(--warning)]",
  }[tone];

  return (
    <article className="flex min-h-[92px] items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <div>
        <p className="text-sm font-semibold text-[var(--muted)]">{label}</p>
        <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{value}</p>
      </div>
      <span className={`inline-flex h-11 w-11 items-center justify-center rounded-lg ${toneClass}`}>{icon}</span>
    </article>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-lg border px-4 text-sm font-semibold transition ${
        active
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
      }`}
    >
      {children}
    </button>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function isPublishedPost(post) {
  return post?.status === "published" || post?.published === true;
}

function Field({ label, children, wide = false }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}
