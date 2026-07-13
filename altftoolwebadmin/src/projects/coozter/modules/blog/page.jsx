"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Edit3, Eye, FileText, Loader2, PencilLine, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
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
const paginationButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-50";
const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]";
const BLOGS_PER_PAGE = 10;

const SECTION_FIELDS = {
  heroSection: [
    ["eyebrowText", "Eyebrow text"],
    ["headingText", "Heading text", "textarea"],
    ["descriptionText", "Description", "textarea"],
    ["featuredBadgeText", "Featured badge text"],
    ["insightLabel", "Insight label"],
    ["notesLabel", "Notes label"],
  ],
  // articleListSection is intentionally hidden from the admin form.
  // articleListSection: [
  //   ["eyebrowText", "Eyebrow text"],
  //   ["headingText", "Heading text", "textarea"],
  //   ["articleFoundSingularText", "Article found singular text"],
  //   ["articleFoundPluralText", "Article found plural text"],
  //   ["emptyMoreArticlesText", "Empty more articles text", "textarea"],
  //   ["emptyTitle", "Empty title"],
  //   ["emptyDescription", "Empty description", "textarea"],
  // ],
  // Button labels are intentionally hidden from the admin form.
  // buttons: [
  //   ["featuredButtonLabel", "Featured button label"],
  //   ["cardButtonLabel", "Card button label"],
  //   ["previewButtonLabel", "Preview button label"],
  //   ["backButtonLabel", "Back button label"],
  //   ["allArticlesLabel", "All articles label"],
  // ],
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
  // relatedSection is intentionally hidden from the admin form.
  // relatedSection: [["eyebrowText", "Eyebrow text"], ["headingText", "Heading text"], ["allArticlesLabel", "All articles label"], ["allArticlesUrl", "All articles URL"]],
  // newsletterSection is intentionally hidden from the admin form.
  // newsletterSection: [["headingText", "Heading text"], ["descriptionText", "Description", "textarea"], ["placeholderText", "Placeholder text"], ["submitAriaLabel", "Submit aria label"], ["validationErrorText", "Validation error text"], ["successText", "Success text"]],
};

export default function CoozterBlogAdminPage() {
  const [content, setContent] = useState(DEFAULT_BLOG_PAGE_CONTENT);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / BLOGS_PER_PAGE));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * BLOGS_PER_PAGE;
    return filteredPosts.slice(start, start + BLOGS_PER_PAGE);
  }, [currentPage, filteredPosts]);
  const pageStart = filteredPosts.length ? (currentPage - 1) * BLOGS_PER_PAGE + 1 : 0;
  const pageEnd = Math.min(currentPage * BLOGS_PER_PAGE, filteredPosts.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, query]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

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
    <main className="min-h-screen bg-[var(--page)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
         
              <h1 className="mt-1 text-2xl font-bold">Blog Management</h1>
            
            </div>
            <div className="flex flex-wrap gap-2">
              {/* <button type="button" onClick={handleSeed} className={secondaryButtonClass}><RefreshCw className="h-4 w-4" /> Seed Defaults</button> */}
              <button type="button" onClick={handleSave} disabled={saving} className={buttonClass}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save 
              </button>
              <Link href="/coozter/blog/add-article" className={buttonClass}><Plus className="h-4 w-4" /> Add Post</Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Posts" value={postStats.total} icon={<FileText className="h-6 w-6" />} />
          <StatCard label="Published Posts" value={postStats.published} icon={<Eye className="h-6 w-6" />} tone="success" />
          <StatCard label="Draft Posts" value={postStats.drafts} icon={<PencilLine className="h-6 w-6" />} tone="warning" />
        </section>

        <section className="grid items-start gap-5 ">
          {/* <div className="space-y-5">
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

              
       
            </Panel>
          </div> */}

          <aside className="space-y-5 xl:sticky xl:top-6">
            <Panel title="Blog Posts">
              <div className="flex flex-wrap items-center justify-between gap-3">
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
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                  {pageStart}-{pageEnd} of {filteredPosts.length}
                </p>
              </div>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search posts..." />
              </label>
              <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                {loading ? (
                  <div className="p-6 text-sm font-semibold text-[var(--muted)]">Loading blogs...</div>
                ) : paginatedPosts.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                      <thead className="bg-[var(--surface-soft)] text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                        <tr>
                          <Th>Title</Th>
                          <Th>Category</Th>
                          <Th>Author</Th>
                          <Th>Date</Th>
                          <Th>Status</Th>
                          <Th>Actions</Th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {paginatedPosts.map((post) => (
                          <tr key={post.id} className="bg-[var(--surface)] text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
                            <td className="max-w-[280px] px-4 py-3">
                              <p className="truncate font-semibold">{post.title || "Untitled blog"}</p>
                              <p className="mt-1 truncate text-xs text-[var(--muted)]">{post.slug || "-"}</p>
                            </td>
                            <td className="px-4 py-3 text-[var(--muted)]">{post.category || "Uncategorized"}</td>
                            <td className="px-4 py-3 text-[var(--muted)]">{post.author || "-"}</td>
                            <td className="px-4 py-3 text-[var(--muted)]">{post.displayDate || post.date || formatDate(post.createdAt)}</td>
                            <td className="px-4 py-3"><StatusBadge published={isPublishedPost(post)} /></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Link href={`/coozter/blog/edit-article/${encodeURIComponent(post.id)}`} className={iconButtonClass} title="Edit blog" aria-label={`Edit ${post.title || "blog"}`}>
                                  <Edit3 className="h-4 w-4" />
                                </Link>
                                <button type="button" onClick={() => togglePost(post)} className="h-9 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]">
                                  {isPublishedPost(post) ? "Draft" : "Publish"}
                                </button>
                                <button type="button" onClick={() => removePost(post)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] text-[var(--danger)] transition hover:bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]" title="Delete blog" aria-label={`Delete ${post.title || "blog"}`}>
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <FileText className="mx-auto h-6 w-6 text-[var(--muted)]" />
                    <p className="mt-2 text-sm font-semibold text-[var(--muted)]">No blog posts yet.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-semibold text-[var(--muted)]">
                  Showing {pageStart}-{pageEnd} of {filteredPosts.length} blogs
                </p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage <= 1} className={paginationButtonClass}>
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="inline-flex h-9 items-center rounded-lg border border-[var(--border)] px-3 text-xs font-bold text-[var(--foreground)]">
                    Page {currentPage} / {totalPages}
                  </span>
                  <button type="button" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage >= totalPages} className={paginationButtonClass}>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
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

function Th({ children }) {
  return <th className="px-4 py-3 font-bold">{children}</th>;
}

function StatusBadge({ published }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        published
          ? "bg-[color-mix(in_srgb,var(--success)_12%,var(--surface))] text-[var(--success)]"
          : "bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {published ? "Published" : "Draft"}
    </span>
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

function formatDate(value) {
  const date = value?.toDate?.() || (value ? new Date(value) : null);
  if (!date || Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-US");
}

function Field({ label, children, wide = false }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
      {children}
    </label>
  );
}