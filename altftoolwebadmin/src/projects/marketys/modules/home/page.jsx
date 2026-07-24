"use client";

import { useState, useEffect } from "react";
import { Home as HomeIcon, Pencil, RefreshCw } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import EditHomeModal from "./components/EditHomeModal";
import ResetButton from "../../components/ResetButton";

const COLLECTION = "projects/marketys/home";
const DOC_ID = "config";

export default function MarketysHome() {
  const [homeData, setHomeData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false);

  const loadHome = async () => {
    try {
      const snap = await getDoc(doc(db, COLLECTION, DOC_ID));
      setHomeData(snap.exists() ? snap.data() : null);
    } catch {
      setHomeData(null);
    } finally {
      setLoaded(true);
    }
  };

  if (!loaded) loadHome();

  const handleReset = async () => {
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {});
      emitAlert({ type: "success", message: "Home page reset to defaults" });
      loadHome();
    } catch {
      emitAlert({ type: "error", message: "Reset failed" });
    }
  };

  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
            <p className="text-sm text-gray-500 mt-1">Manage hero, features, process, testimonials, pricing and more</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(false)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Back to Summary
            </button>
          </div>
        </div>
        <EditHomeModal existingData={homeData} onClose={() => setEditing(false)} onSaved={() => { loadHome(); setEditing(false); }} inline />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Home Page</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hero, features, process, testimonials, pricing and more</p>
        </div>
        <div className="flex items-center gap-2">
          <ResetButton onReset={handleReset} />
          <button onClick={() => loadHome()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <button onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition">
            <Pencil className="h-4 w-4" /> Edit Home Page
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Hero"
          saved={!!homeData?.hero?.headline}
          subtitle={homeData?.hero?.subtitle ? `${homeData.hero.subtitle.slice(0, 60)}...` : "Default content"} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Stats"
          saved={!!homeData?.stats}
          subtitle={`${homeData?.stats?.length || 3} stats counters`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Partners"
          saved={!!homeData?.partners}
          subtitle={`${homeData?.partners?.length || 12} partner logos`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Features"
          saved={!!homeData?.features}
          subtitle={`${homeData?.features?.length || 3} service sections`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Process"
          saved={!!homeData?.process}
          subtitle={`${homeData?.process?.length || 4} process steps`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Testimonials"
          saved={!!homeData?.testimonials}
          subtitle={`${homeData?.testimonials?.length || 4} client reviews`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Pricing"
          saved={!!homeData?.pricing}
          subtitle={`${homeData?.pricing?.length || 3} pricing plans`} />
        <SummaryCard icon={<HomeIcon className="h-5 w-5" />} title="Blog / CTA"
          saved={!!homeData?.blogSection}
          subtitle="Blog section heading + bottom CTA" />
      </div>

      <div className={`rounded-xl border p-6 text-center ${homeData ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
        <p className={`text-sm font-semibold ${homeData ? "text-green-700" : "text-amber-700"}`}>
          {homeData ? "Home page config saved to Firestore" : "Using default content. Click 'Edit Home Page' to customize."}
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, saved, subtitle }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${saved ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
