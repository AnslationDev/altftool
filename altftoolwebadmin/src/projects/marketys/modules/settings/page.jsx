"use client";

import { useState, useEffect } from "react";
import { Settings as SettingsIcon, FileText, Search, Pencil, RefreshCw, Layout, Menu } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { collection, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AddPageModal from "./components/AddPageModal";
import EditFooterModal from "./components/EditFooterModal";
import EditHeaderModal from "./components/EditHeaderModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/pages";

const PAGE_DEFAULTS = [
  { id: "how", title: "How It Works", slug: "/how-it-works" },
  { id: "privacy", title: "Privacy Policy", slug: "/privacy-policy" },
  { id: "terms", title: "Terms & Conditions", slug: "/terms-and-conditions" },
  { id: "support", title: "Support", slug: "/support" },
  { id: "disclaimer", title: "Disclaimer", slug: "/disclaimer" },
];

export default function MarketysSettings() {
  const [pages, setPages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [editPageId, setEditPageId] = useState(null);
  const [editPageData, setEditPageData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFooterModal, setShowFooterModal] = useState(false);
  const [showHeaderModal, setShowHeaderModal] = useState(false);

  const loadPages = async () => {
    const result = [];
    for (const def of PAGE_DEFAULTS) {
      try {
        const snap = await getDoc(doc(db, COLLECTION, def.id));
        const data = snap.exists() ? snap.data() : null;
        result.push({ ...def, saved: !!data, data });
      } catch {
        result.push({ ...def, saved: false, data: null });
      }
    }
    setPages(result);
    setLoaded(true);
  };

  if (!loaded) loadPages();

  const handleEdit = async (pageId) => {
    setEditPageId(pageId);
    try {
      const snap = await getDoc(doc(db, COLLECTION, pageId));
      setEditPageData(snap.exists() ? { id: pageId, ...snap.data() } : null);
    } catch {
      setEditPageData(null);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditPageId(null);
    setEditPageData(null);
  };

  const handleSaved = () => {
    loadPages();
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage site settings and footer pages</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={async () => {
            try {
              await Promise.all(PAGE_DEFAULTS.map((p) => deleteDoc(doc(db, COLLECTION, p.id)).catch(() => {})));
              await deleteDoc(doc(db, "projects/marketys/footer", "config")).catch(() => {});
              await deleteDoc(doc(db, "projects/marketys/header", "config")).catch(() => {});
              emitAlert({ type: "success", message: "All settings reset to defaults" });
              loadPages();
            } catch {
              emitAlert({ type: "error", message: "Reset failed" });
            }
          }} />
          <button onClick={() => loadPages()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pages..." className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((page) => (
          <div key={page.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${page.saved ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{page.title}</h3>
                  <p className="text-xs text-gray-400">{page.slug}</p>
                  {page.saved && (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 mt-1">
                      Saved to Firestore
                    </span>
                  )}
                  {!page.saved && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600 mt-1">
                      Using defaults
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => handleEdit(page.id)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition">
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer & Header Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Layout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Footer</h3>
                <p className="text-xs text-gray-400">Manage footer links, social, contact</p>
              </div>
            </div>
            <button onClick={() => setShowFooterModal(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                <Menu className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Header / Navbar</h3>
                <p className="text-xs text-gray-400">Manage nav links, logo, CTA button</p>
              </div>
            </div>
            <button onClick={() => setShowHeaderModal(true)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-amber-600 transition">
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <AddPageModal
          pageId={editPageId}
          existingPage={editPageData}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
      {showFooterModal && (
        <EditFooterModal
          onClose={() => setShowFooterModal(false)}
          onSaved={() => setShowFooterModal(false)}
        />
      )}
      {showHeaderModal && (
        <EditHeaderModal
          onClose={() => setShowHeaderModal(false)}
          onSaved={() => setShowHeaderModal(false)}
        />
      )}
    </div>
  );
}
