"use client";

import { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import TopBar from "./components/TopBar";
import DataTable from "./components/GlobalSearchTable";
import DataModal from "./components/GlobalSearchModel";
import CategoryModel from "./components/CategoryModel";
import { subscribeGlobalSearch, subscribeCategories } from "./service/data.service";

export default function Page() {
  // ── Global Search items (realtime) ──
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ── Categories (realtime) ──
  const [categories, setCategories] = useState([]);

  // ── Modals: null=closed | true=create | object=edit ──
  const [dataModalTarget, setDataModalTarget] = useState(null);
  const [categoryModalTarget, setCategoryModalTarget] = useState(false);

  useEffect(() => {
    // Realtime listener for global search items
    const handleLoadError = () => {
      setLoadError("Search directory data could not be loaded. Check Firebase access and try again.");
      setLoadingItems(false);
    };

    const unsubItems = subscribeGlobalSearch(
      (data) => {
        setItems(data);
        setLoadError("");
        setLoadingItems(false);
      },
      handleLoadError,
    );

    // Realtime listener for categories
    const unsubCats = subscribeCategories(
      (data) => setCategories(data),
      handleLoadError,
    );

    return () => {
      unsubItems();
      unsubCats();
    };
  }, []);

  return (
    <div className="min-h-full bg-page">
      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6">

        <TopBar
          onAddData={() => setDataModalTarget(true)}
          onCreateCategory={() => setCategoryModalTarget(true)}
        />

        {loadError && (
          <div className="flex items-start gap-2 rounded-lg border border-danger bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{loadError}</span>
          </div>
        )}

        {/* Category create modal */}
        {categoryModalTarget && (
          <CategoryModel
            existingCategories={categories}
            onClose={() => setCategoryModalTarget(false)}
          />
        )}

        {/* Global Search items table */}
        {loadingItems ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface py-20 text-sm text-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Loading directory...
          </div>
        ) : (
          <DataTable
            items={items}
            onEdit={(item) => setDataModalTarget(item)}
          />
        )}

        {/* Global Search create/edit modal */}
        {dataModalTarget !== null && (
          <DataModal
            data={dataModalTarget === true ? undefined : dataModalTarget}
            categories={categories}
            onClose={() => setDataModalTarget(null)}
          />
        )}

      </div>
    </div>
  );
}
