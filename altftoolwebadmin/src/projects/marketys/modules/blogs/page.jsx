"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, FileText, Pencil, Trash2, RotateCcw, ChevronDown, Image as ImageIcon } from "lucide-react";
import { listBlogs, deleteBlog } from "./services/blogService";
import { emitAlert } from "@/lib/alertBus";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddBlogModal from "./components/AddBlogModal";
import ResetButton from "../../components/ResetButton";
import ImageUpload from "../../components/ImageUpload";

const FALLBACK_BLOGS = [
  { id: "google-ads-2026-guide", title: "The Complete Google Ads Guide for 2026", category: "Digital Marketing", readTime: "8 min read", date: "May 15, 2026", status: "published", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80", excerpt: "Everything you need to know about the latest AI features and campaign types in Google Ads." },
  { id: "best-seo-tools", title: "10 Best SEO Tools That Actually Work in 2026", category: "SEO Tools", readTime: "6 min read", date: "May 12, 2026", status: "published", image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=600&q=80", excerpt: "Stop wasting money on redundant software. Here are the only 10 SEO tools you need this year." },
  { id: "affiliate-marketing-beginners", title: "Affiliate Marketing for Beginners: Complete 2026 Guide", category: "Affiliate Marketing", readTime: "10 min read", date: "May 10, 2026", status: "published", image: "https://images.unsplash.com/photo-1553729459-afe8f2e2e910?w=600&q=80", excerpt: "Learn how to start earning passive income through affiliate marketing from scratch." },
  { id: "social-media-trends", title: "Social Media Trends Dominating 2026", category: "Social Media", readTime: "5 min read", date: "May 8, 2026", status: "published", image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600&q=80", excerpt: "Short-form video, AI-generated content, and community-driven platforms are reshaping the landscape." },
  { id: "email-marketing-automation", title: "Email Marketing Automation: The 2026 Playbook", category: "Email Marketing", readTime: "7 min read", date: "May 5, 2026", status: "draft", image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&q=80", excerpt: "Automate your email sequences to nurture leads and drive conversions on autopilot." },
];

const HERO_DOC = "projects/marketys/blog/config";

const DEFAULT_HERO = {
  badge: "RESOURCES & NEWS",
  title: "Marketing News &amp; <br/> <span class=&quot;text-blue-400 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent&quot;>Strategy Guides</span>",
  subtitle: "Expert advice, software teardowns, and actionable guides to help you scale your business and optimize your marketing stack.",
  bgImage: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1600&q=80",
};

export default function MarketysBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [heroOpen, setHeroOpen] = useState(false);
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [heroLoading, setHeroLoading] = useState(true);
  const [savingHero, setSavingHero] = useState(false);

  const loadBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listBlogs();
      setBlogs(data.length > 0 ? data : FALLBACK_BLOGS);
    } catch {
      setBlogs(FALLBACK_BLOGS);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadHero = useCallback(async () => {
    try {
      const snap = await getDoc(doc(db, HERO_DOC));
      if (snap.exists()) setHero({ ...DEFAULT_HERO, ...snap.data() });
    } catch { /* use defaults */ }
    setHeroLoading(false);
  }, []);

  useEffect(() => {
    loadBlogs();
    loadHero();
  }, [loadBlogs, loadHero]);

  const handleSave = useCallback((saved) => {
    loadBlogs();
  }, [loadBlogs]);

  const handleEdit = (blog) => {
    setEditBlog(blog);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditBlog(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditBlog(null);
  };

  const handleReset = async () => {
    try {
      const snap = await getDocs(collection(db, "projects/marketys/blogs"));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, "projects/marketys/blogs", d.id))));
      emitAlert({ type: "success", message: "Blogs reset to defaults" });
      loadBlogs();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteBlog(id);
      emitAlert({ type: "success", message: "Blog deleted" });
      loadBlogs();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete blog" });
    }
  };

  const handleSaveHero = async () => {
    setSavingHero(true);
    try {
      await setDoc(doc(db, HERO_DOC), { badge: hero.badge, title: hero.title, subtitle: hero.subtitle, bgImage: hero.bgImage });
      emitAlert({ type: "success", message: "Hero section saved" });
    } catch {
      emitAlert({ type: "error", message: "Failed to save hero" });
    }
    setSavingHero(false);
  };

  const filtered = blogs.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage marketys blog posts</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={handleReset} />
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add Blog
          </button>
        </div>
      </div>

      {/* ── Hero Section Editor ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <button onClick={() => setHeroOpen(!heroOpen)} className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition">
          <div className="flex items-center gap-3">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <span className="font-semibold text-gray-900">Blog Page Hero</span>
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${heroOpen ? "rotate-180" : ""}`} />
        </button>
        {heroOpen && (
          <div className="border-t border-gray-100 px-6 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                <input value={hero.badge} onChange={(e) => setHero({ ...hero, badge: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Background Image</label>
                <ImageUpload section="blog-hero" onUpload={(url) => setHero({ ...hero, bgImage: url })} />
                {hero.bgImage && <img src={hero.bgImage} alt="" className="mt-2 h-20 w-full rounded-lg object-cover" />}
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-xs text-gray-400">(HTML allowed)</span></label>
                <input value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
                <textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} rows={2} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveHero} disabled={savingHero} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
                {savingHero ? "Saving..." : "Save Hero"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search blogs..."
          className="h-10 w-full max-w-sm rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FileText className="h-12 w-12 mb-3" />
          <p className="font-medium">No blogs found</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((blog) => (
                <tr key={blog.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{blog.title}</td>
                  <td className="px-4 py-3 text-gray-500">{blog.category}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${blog.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                      {blog.status === "published" ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{blog.date || blog.createdAt?.toDate?.()?.toLocaleDateString?.() || "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(blog)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(blog.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddBlogModal
          existingBlog={editBlog}
          onClose={handleClose}
          onSaved={handleSave}
        />
      )}
    </div>
  );
}
