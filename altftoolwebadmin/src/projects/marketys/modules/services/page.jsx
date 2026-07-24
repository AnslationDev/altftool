"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, Search, Pencil, Trash2, Eye, EyeOff, Settings, Sparkles } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import AddServiceSectionModal from "./components/AddServiceSectionModal";
import EditServicesHeroModal from "./components/EditServicesHeroModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/services";

const CATEGORY_LABELS = {
  "digital-marketing": "Digital Marketing",
  "affiliate-marketing": "Affiliate Marketing",
  "paid-advertisement": "Paid Ads",
};

const FALLBACK_SERVICES = [
  { id: "seo", title: "Search Engine Optimization (SEO)", subtitle: "Organic Traffic Engine", category: "digital-marketing", order: 1, active: true },
  { id: "email", title: "Email & CRM Automation", subtitle: "Customer Retention Hub", category: "digital-marketing", order: 2, active: true },
  { id: "social", title: "Social Media Strategy", subtitle: "Brand Presence & Authority", category: "digital-marketing", order: 3, active: true },
  { id: "analytics", title: "Analytics & ROI Strategy", subtitle: "Attribution Data Accuracy", category: "digital-marketing", order: 4, active: true },
  { id: "cro", title: "Conversion Rate Optimization (CRO)", subtitle: "Funnel Conversion Scaling", category: "digital-marketing", order: 5, active: true },
  { id: "contentMktg", title: "Authority Content Marketing", subtitle: "Brand Leadership", category: "digital-marketing", order: 6, active: true },
  { id: "subAffiliate", title: "Sub-Affiliate Network Management", subtitle: "Performance Partnerships", category: "affiliate-marketing", order: 7, active: true },
  { id: "mediaPartner", title: "Direct Media Partnerships", subtitle: "Editorial Integrations", category: "affiliate-marketing", order: 8, active: true },
  { id: "commissionOpt", title: "Custom Commission Structuring", subtitle: "Margin Optimization", category: "affiliate-marketing", order: 9, active: true },
  { id: "partnerAcq", title: "Premium Partner Acquisition", subtitle: "Ambassador Recruitment", category: "affiliate-marketing", order: 10, active: true },
  { id: "creatorAmbassador", title: "Influencer Affiliate Networks", subtitle: "Creator Referral Scaling", category: "affiliate-marketing", order: 11, active: true },
  { id: "editorialPR", title: "Editorial PR & Review Syndication", subtitle: "Digital PR Placements", category: "affiliate-marketing", order: 12, active: true },
  { id: "googleSearch", title: "Google Search & PMAX Ads", subtitle: "High-Intent PPC Interception", category: "paid-advertisement", order: 13, active: true },
  { id: "metaFunnels", title: "Meta Ad Funnels (FB & IG)", subtitle: "Visual Disruption Strategy", category: "paid-advertisement", order: 14, active: true },
  { id: "tiktokUgc", title: "TikTok & UGC Campaigns", subtitle: "Viral Content Commerce", category: "paid-advertisement", order: 15, active: true },
  { id: "linkedinLead", title: "LinkedIn Lead Generation", subtitle: "B2B Pipeline Growth", category: "paid-advertisement", order: 16, active: true },
  { id: "youtubeAds", title: "YouTube Video Advertising", subtitle: "Pre-Roll & In-Stream", category: "paid-advertisement", order: 17, active: true },
  { id: "programmaticNative", title: "Programmatic & Native Ads", subtitle: "AI Display Placements", category: "paid-advertisement", order: 18, active: true },
];

const HERO_COLLECTION = "projects/marketys/services-page";
const HERO_DOC = "config";

const HERO_INITIAL = {
  hero: { badge: "CAPABILITIES DIRECTORY", title: "Channels Designed for", highlight: "Scale & Profit", description: "Expand your company's potential...", bgImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80" },
  stats: [
    { end: 50, prefix: "$", suffix: "M+", label: "Client Spend Managed", color: "text-blue-400" },
    { end: 3, suffix: ".8x", label: "Average Campaign ROAS", color: "text-cyan-400" },
    { end: 99, suffix: ".8%", label: "Attribution Accuracy", color: "text-indigo-400" },
  ],
};

export default function MarketysServices() {
  const [services, setServices] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState(null);
  const [heroData, setHeroData] = useState(null);
  const [showHeroModal, setShowHeroModal] = useState(false);

  const loadServices = async () => {
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 99) - (b.order || 99));
      setServices(data.length > 0 ? data : FALLBACK_SERVICES);
    } catch {
      setServices(FALLBACK_SERVICES);
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

  useEffect(() => { if (!loaded) loadServices(); }, [loaded]);

  const handleSave = () => loadServices();
  const handleEdit = (s) => { setEditService(s); setShowModal(true); };
  const handleAdd = () => { setEditService(null); setShowModal(true); };
  const handleClose = () => { setShowModal(false); setEditService(null); };

  const handleDelete = async (id) => {
    if (!confirm("Delete this service?")) return;
    try {
      await deleteDoc(doc(db, COLLECTION, id));
      emitAlert({ type: "success", message: "Service deleted" });
      loadServices();
    } catch {
      emitAlert({ type: "error", message: "Failed to delete" });
    }
  };

  const filtered = services.filter((s) =>
    s.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all service listings (18 services across 3 categories)</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={async () => {
            try {
              const snap = await getDocs(collection(db, COLLECTION));
              await Promise.all(snap.docs.map((d) => deleteDoc(doc(db, COLLECTION, d.id))));
              await setDoc(doc(db, HERO_COLLECTION, HERO_DOC), HERO_INITIAL);
              emitAlert({ type: "success", message: "Services reset to defaults" });
              loadServices();
            } catch {
              emitAlert({ type: "error", message: "Reset failed" });
            }
          }} />
          <button onClick={handleAdd} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Plus className="h-4 w-4" /> Add Service
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
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
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{s.title}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {CATEGORY_LABELS[s.category] || s.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.active !== false ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      <Eye className="h-3 w-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      <EyeOff className="h-3 w-3" /> Hidden
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(s)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-red-600 transition"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showHeroModal && (
        <EditServicesHeroModal
          existingData={heroData}
          onClose={() => setShowHeroModal(false)}
          onSaved={() => { loadServices(); setShowHeroModal(false); }}
        />
      )}
      {showModal && (
        <AddServiceSectionModal existingService={editService} onClose={handleClose} onSaved={handleSave} />
      )}
    </div>
  );
}
