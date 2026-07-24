"use client";

import { useState, useEffect } from "react";
import { Plus, Star, Search, Pencil, Trash2, Sparkles, Settings } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import AddReviewModal from "./components/AddReviewModal";
import EditReviewsHeroModal from "./components/EditReviewsHeroModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/reviews";
const HERO_COLLECTION = "projects/marketys/reviews-page";
const HERO_DOC = "config";

const HERO_INITIAL = {
  hero: {
    badge: "Verified platform reviews",
    title: "Real Reviews from Real Marketers",
    description: "Compare tools with honest insights, user feedback, and measurable outcomes.",
    stats: [
      { value: "4.8/5", label: "Average Rating", sub: "Across top marketing tools" },
      { value: "100%", label: "Verified Reviews", sub: "Every review is checked for trust" },
      { value: "Weekly", label: "Updated Weekly", sub: "Fresh insights on new deals" },
    ],
    featuredReview: {
      quote: "MarketyDeals saved us over $1,200 on our marketing stack this year. The verified ratings and direct discounts make it the ultimate resource for growth teams.",
      author: "Alex J.",
      role: "Growth Director @ SaaS Metrics",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80",
    },
  },
};

const FALLBACK_REVIEWS = [
  { id: "semrush", title: "Semrush Review", category: "SEO & Research", rating: 5, summary: "Semrush is the backbone of our digital marketing workflow.", author: "Alex J.", role: "Growth Marketer", result: "+38%", resultLabel: "organic traffic" },
  { id: "canva", title: "Canva Pro Review", category: "Design & Content", rating: 5, summary: "Canva Pro empowers our entire creative pipeline.", author: "Nina P.", role: "Content Strategist", result: "10x", resultLabel: "faster content creation" },
  { id: "hubspot", title: "HubSpot Review", category: "Marketing", rating: 5, summary: "An all-in-one CRM and automated outbound suite.", author: "Jordan M.", role: "Digital Founder", result: "+22%", resultLabel: "lead conversion" },
  { id: "ahrefs", title: "Ahrefs Review", category: "SEO & Research", rating: 5, summary: "Ahrefs provides the most accurate backlink index on the market.", author: "Daniel F.", role: "SEO Specialist", result: "+51%", resultLabel: "domain authority growth" },
  { id: "mailchimp", title: "Mailchimp Review", category: "Email Marketing", rating: 5, summary: "Mailchimp's segmentation features run perfectly on autopilot.", author: "Sandra O.", role: "eCommerce Owner", result: "+40%", resultLabel: "email revenue" },
  { id: "shopify", title: "Shopify Review", category: "eCommerce", rating: 5, summary: "Shopify is the easiest ecommerce checkout platform to scale.", author: "Nina V.", role: "DTC Founder", result: "3x", resultLabel: "revenue in 90 days" },
  { id: "hostinger", title: "Hostinger Review", category: "Hosting", rating: 5, summary: "Hostinger offers amazing server load performance.", author: "Sarah K.", role: "Agency Owner", result: "99.99%", resultLabel: "server uptime" },
  { id: "figma", title: "Figma Review", category: "Design & Content", rating: 5, summary: "Figma is our centerpiece for UI design.", author: "Elena V.", role: "Lead UI Designer", result: "+45%", resultLabel: "hand-off efficiency" },
  { id: "notion", title: "Notion Plus Review", category: "Productivity", rating: 5, summary: "Notion connects our docs, roadmaps, and wikis in one hub.", author: "Liam N.", role: "Project Manager", result: "100%", resultLabel: "centralized documentation" },
];

export default function MarketysReviews() {
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [heroData, setHeroData] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [editReview, setEditReview] = useState(null);

  const loadReviews = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReviews(docs.length > 0 ? docs : FALLBACK_REVIEWS);
    } catch {
      setReviews(FALLBACK_REVIEWS);
    }
    try {
      const heroSnap = await getDoc(doc(db, HERO_COLLECTION, HERO_DOC));
      setHeroData(heroSnap.exists() ? heroSnap.data() : HERO_INITIAL);
    } catch {
      setHeroData(HERO_INITIAL);
    } finally {
      setLoaded(true);
    }
  };

  if (!loaded) loadReviews();

  const handleSave = () => loadReviews();
  const handleEdit = (r) => { setEditReview(r); setShowModal(true); };
  const handleAdd = () => { setEditReview(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditReview(null); };

  const handleReset = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id))));
      emitAlert({ type: "success", message: "Reviews reset to defaults" });
      loadReviews();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      emitAlert({ type: "success", message: "Review deleted" });
      loadReviews();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete review" });
    }
  };

  const filtered = reviews.filter((r) =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tool reviews and ratings</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={handleReset} />
          <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reviews..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      {heroData && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Hero Section</h3>
                <p className="text-xs text-gray-500 mt-0.5">{heroData.hero?.title || "..."} | {heroData.hero?.badge || "..."}</p>
              </div>
            </div>
            <button onClick={() => setShowHeroModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
              <Settings className="h-3.5 w-3.5" /> Edit Hero
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Author</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-500">{r.category}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{r.author}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(r)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(r.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showHeroModal && (
        <EditReviewsHeroModal
          existingData={heroData}
          onClose={() => setShowHeroModal(false)}
          onSaved={() => { loadReviews(); setShowHeroModal(false); }}
        />
      )}
      {showModal && (
        <AddReviewModal existingReview={editReview} onClose={handleClose} onSaved={handleSave} />
      )}
    </div>
  );
}
