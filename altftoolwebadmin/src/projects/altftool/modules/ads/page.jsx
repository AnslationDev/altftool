"use client";

import { useEffect, useMemo, useState } from "react";
import { collection as firestoreCollection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  subscribeAllAds,
  subscribeAdsByPlacement
} from "./services/ads.service";
import { PLACEMENTS, NAV } from "@/config/placements";

import PlacementSidebar from "./components/PlacementSidebar";
import PlacementHeader from "./components/PlacementHeader";
import AdsTable from "./components/AdsTable";
import CreateAdModal from "./components/CreateAdModal";
import OverviewDashboard from "./components/OverviewDashboard";

export default function AdsAdmin() {
  const [activeView, setActiveView] = useState({ type: "overview" });
  const [ads, setAds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Resolved category list for the active placement. null = still loading.
  const [placementCategories, setPlacementCategories] = useState(null);

  // Resolved target options (slugs) for the active placement. null = not applicable / loading.
  const [placementTargets, setPlacementTargets] = useState(null);
  const [targetsLoading, setTargetsLoading] = useState(false);

  /* ── Real-time ads subscription ── */
  useEffect(() => {
    let unsub;
    if (activeView.type === "overview") unsub = subscribeAllAds(setAds);
    if (activeView.type === "placement") unsub = subscribeAdsByPlacement(activeView.key, setAds);
    return () => { if (unsub) unsub(); };
  }, [activeView]);

  /* ── Resolve categories whenever active placement changes ── */
  useEffect(() => {
    if (activeView.type !== "placement") {
      setPlacementCategories(null);
      return;
    }

    const categoryCfg = PLACEMENTS[activeView.key]?.categories;

    if (!categoryCfg) {
      setPlacementCategories([]);
      return;
    }

    if (categoryCfg.type === "static") {
      setPlacementCategories(categoryCfg.values);
      return;
    }

    if (categoryCfg.type === "dynamic") {
      setPlacementCategories(null);

      let cancelled = false;
      getDocs(firestoreCollection(db, "projects", "altftool", categoryCfg.collection))
        .then((snap) => {
          if (cancelled) return;
          const names = snap.docs
            .map((d) => d.data().name)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setPlacementCategories(names);
        })
        .catch((err) => {
          console.error("[AdsAdmin] Failed to fetch dynamic categories:", err);
          if (!cancelled) setPlacementCategories([]);
        });

      return () => { cancelled = true; };
    }
  }, [activeView]);

  /* ── Resolve target options whenever active placement changes ── */
  useEffect(() => {
    if (activeView.type !== "placement") {
      setPlacementTargets(null);
      setTargetsLoading(false);
      return;
    }

    const targetCfg = PLACEMENTS[activeView.key]?.target;

    // No target config → this placement doesn't support targeting
    if (!targetCfg) {
      setPlacementTargets(null);
      setTargetsLoading(false);
      return;
    }

    // Static list (e.g. tool slugs baked into placements.js)
    if (targetCfg.type === "static") {
      setPlacementTargets(targetCfg.values);
      setTargetsLoading(false);
      return;
    }

    if (targetCfg.type === "dynamic") {
      setPlacementTargets(null);
      setTargetsLoading(true);

      let cancelled = false;
      getDocs(firestoreCollection(db, "projects", "altftool", targetCfg.collection))
        .then((snap) => {
          if (cancelled) return;
          const values = snap.docs
            .map((d) => d.data()[targetCfg.field])
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b));
          setPlacementTargets(values);
        })
        .catch((err) => {
          console.error("[AdsAdmin] Failed to fetch target options:", err);
          if (!cancelled) setPlacementTargets([]);
        })
        .finally(() => {
          if (!cancelled) setTargetsLoading(false);
        });

      return () => { cancelled = true; };
    }
  }, [activeView]);

  /* ── Per-placement counts for sidebar badges ── */
  const placementCounts = useMemo(() => {
    const map = {};
    ads.forEach((ad) => (ad.placements || []).forEach((p) => { map[p] = (map[p] || 0) + 1; }));
    return map;
  }, [ads]);

  const activeCount = ads.filter((a) => a.status === "active").length;
  const pausedCount = ads.filter((a) => a.status === "paused").length;

  // True while dynamic categories are being fetched
  const categoriesLoading = activeView.type === "placement"
    && PLACEMENTS[activeView.key]?.categories?.type === "dynamic"
    && placementCategories === null;

  return (
    <>
      <div className="flex h-full bg-gray-50 overflow-hidden">

        {/* Sidebar */}
        <PlacementSidebar
          nav={NAV}
          placements={PLACEMENTS}
          activeView={activeView}
          onSelect={setActiveView}
          counts={placementCounts}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-7 max-w-6xl mx-auto space-y-7">

              {/* Overview */}
              {activeView.type === "overview" && (
                <OverviewDashboard ads={ads} />
              )}

              {/* Placement view */}
              {activeView.type === "placement" && (
                <>
                  <PlacementHeader
                    placementKey={activeView.key}
                    placement={PLACEMENTS[activeView.key]}
                    total={ads.length}
                    activeCount={activeCount}
                    pausedCount={pausedCount}
                    onCreateDisabled={categoriesLoading}
                    onCreate={() => setShowModal(true)}
                  />
                  <AdsTable ads={ads} />
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Create modal — only mount once categories are resolved */}
      {showModal && activeView.key && placementCategories !== null && (
        <CreateAdModal
          placementKey={activeView.key}
          existingAds={ads}
          availableCategories={placementCategories}
          // null → placement doesn't support targeting (field hidden in modal)
          // []  → supports targeting but none loaded yet / empty collection
          // [...] → list of slugs to show in the target dropdown
          availableTargets={placementTargets}
          targetsLoading={targetsLoading}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}