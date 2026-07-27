"use client";
import React, { useState, useCallback, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import TabBar from "./components/TabBar";
import SaleHeader from "./components/SalesHeader";
import SalesModal from "./components/SalesModal";
import SalesTable from "./components/SalesTable";
import { logAuditEvent } from "@/lib/auditClient";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { deleteSale } from "./services/sales.service";

/* ── tiny in-page alert helper (swap with your toast lib if you have one) ── */
function emitAlert({ type, message }) {
  console[type === "error" ? "error" : "log"](`[${type}] ${message}`);
  // Replace with: toast.success(message) / toast.error(message) etc.
}

/* ════════════════════════════════════════
   Constants
════════════════════════════════════════ */
const TABS = ["All", "Trending Sales", "Flash Sales", "Deal of the Day", "Hero Section"];

// Maps tab label → Firestore `type` field value
const TAB_TYPE_MAP = {
  "Trending Sales":  "trendingSale",
  "Flash Sales":     "flashSale",
  "Deal of the Day": "dealOfTheDay",
  "Hero Section":    "hero",
};

// Maps tab label → activeTab key passed to SalesTable
const TAB_KEY_MAP = {
  "All":             "all",
  "Trending Sales":  "trendingSale",
  "Flash Sales":     "flashSale",
  "Deal of the Day": "dealOfTheDay",
  "Hero Section":    "hero",
};

/* ════════════════════════════════════════
   Helpers
════════════════════════════════════════ */
const parsePrice = (price) => {
  if (!price) return 0;
  if (typeof price === "number") return price;
  return Number(String(price).replace(/[^0-9]/g, ""));
};

/**
 * Normalises raw Firestore docs into a flat shape the table can consume.
 * Keeps ALL original fields and layers computed fields on top.
 */
const normaliseItem = (doc) => {
  const data = doc; // already spread as { id, ...doc.data() }
  const salePrice     = parsePrice(data.price ?? data.salePrice);
  const originalPrice = parsePrice(data.oldPrice ?? data.originalPrice);

  return {
    ...data,
    // Computed pricing
    salePrice,
    originalPrice,
    discountPercent:
      originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : null,
    offerText: data.offerText ?? data.discount ?? null,
    // Unified title for sorting / search fallback
    title: data.title ?? data.headline ?? data.label ?? "",
    // Default status
    status: data.status ?? "active",
  };
};

/**
 * Converts a normalised item back to the shape SalesModal expects.
 */
const mapToModalData = (item) => {
  const { type } = item;

  if (type === "flashSale" || type === "trendingSale") {
    return {
      ...item,
      price:        item.salePrice     ? `₹${item.salePrice}`     : "",
      oldPrice:     item.originalPrice ? `₹${item.originalPrice}` : "",
      discount:     item.offerText ?? "",
      productTitle: item.productTitle  ?? item.title ?? "",
      image:        item.image         ?? "",
      ctaLink:      item.ctaLink       ?? "https://example.com",
    };
  }
  if (type === "dealOfTheDay") {
    return {
      ...item,
      image:   item.image ?? "",
      // SalesModal for DOTD expects `ctaLink`, but Firestore stores `link`
      ctaLink: item.link  ?? item.ctaLink ?? "",
    };
  }
  if (type === "hero") {
    return {
      ...item,
      headline:  item.headline  ?? item.title    ?? "",
      subtext:   item.subtext   ?? item.subtitle ?? "",
      heroImage: item.heroImage ?? "",
      ctaLink:   item.ctaLink   ?? "",
    };
  }
  // nearby / unknown — pass through as-is
  return item;
};

/* ════════════════════════════════════════
   SaleLocator (page)
════════════════════════════════════════ */
export default function SaleLocator() {

  /* ── core state ── */
  const [sales,       setSales]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [activeTab,   setActiveTab]   = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  /* ── selection state ── */
  const [selectedRows, setSelectedRows] = useState([]);

  /* ── delete state ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete,        setToDelete]        = useState(null); // string | string[]

  /* ══════════════════════════════════════
     Firebase — load all sales once
  ══════════════════════════════════════ */
  const loadSales = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(
        collection(db, "projects", "altftool", "sales")
      );
      const docs = snapshot.docs.map((doc) =>
        normaliseItem({ id: doc.id, ...doc.data() })
      );
      setSales(docs);
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to load sales" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSales(); }, [loadSales]);

  /* ── Reset selection whenever the tab changes ── */
  useEffect(() => { setSelectedRows([]); }, [activeTab]);

  /* ══════════════════════════════════════
     Derived data — filter by active tab
     (SalesTable also does its own search
      filter internally, same as ExtensionsTable)
  ══════════════════════════════════════ */
  const filteredSales = React.useMemo(() => {
    if (activeTab === "All") return sales;
    const typeValue = TAB_TYPE_MAP[activeTab];
    return typeValue ? sales.filter((item) => item.type === typeValue) : sales;
  }, [sales, activeTab]);

  /* ══════════════════════════════════════
     Stats (for SaleHeader)
  ══════════════════════════════════════ */
  const activeSales = filteredSales.filter((i) => i.status === "active").length;
  const nearbyDeals = sales.filter((i) => i.type === "nearby").length;

  const avgDiscountPercent = filteredSales.length > 0
    ? filteredSales.reduce((acc, item) => {
        if (!item.originalPrice || item.originalPrice === 0) return acc;
        return acc + ((item.originalPrice - item.salePrice) / item.originalPrice) * 100;
      }, 0) / filteredSales.length
    : 0;

  const avgDiscount = filteredSales.length > 0
    ? filteredSales.reduce((acc, i) => acc + (i.originalPrice - i.salePrice), 0) / filteredSales.length
    : 0;

  const totalSavings = filteredSales.reduce(
    (acc, i) => acc + (i.originalPrice - i.salePrice), 0
  );

  /* ══════════════════════════════════════
     Selection handlers
     (mirrors ExtensionsTable's approach:
      all selection is owned by the page)
  ══════════════════════════════════════ */
  const toggleSelect = useCallback((id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  /**
   * toggleSelectAll — no argument needed.
   * Selects all currently filtered rows, or clears if all already selected.
   * The "Clear selection" button in SalesTable's bulk bar also calls this
   * (it passes no args), which correctly falls through to the empty-array branch.
   */
  const toggleSelectAll = useCallback(() => {
    setSelectedRows((prev) =>
      prev.length === filteredSales.length
        ? []
        : filteredSales.map((d) => d.id)
    );
  }, [filteredSales]);

  /* ══════════════════════════════════════
     Edit handlers
  ══════════════════════════════════════ */
  const handleEdit = useCallback((item) => {
    setEditingItem(mapToModalData(item));
    setIsModalOpen(true);
  }, []);

  const handleSave = useCallback((_newSale) => {
    setIsModalOpen(false);
    setEditingItem(null);
    loadSales(); // re-fetch from Firestore after save
  }, [loadSales]);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  /* ══════════════════════════════════════
     Delete — single OR bulk (same modal)
     onDelete(id)       → single delete
     onDelete([id, …])  → bulk delete
  ══════════════════════════════════════ */
  const handleDelete = useCallback((idOrIds) => {
    setToDelete(idOrIds);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!toDelete) return;

    const ids    = Array.isArray(toDelete) ? toDelete : [toDelete];
    const isBulk = ids.length > 1;

    try {
      await Promise.all(ids.map((id) => deleteSale(id)));

      emitAlert({
        type:    "success",
        message: isBulk ? `${ids.length} sales deleted` : "Sale deleted",
      });

      logAuditEvent({
        module:     "sales",
        action:     isBulk ? "SALE_BULK_DELETE" : "SALE_DELETE",
        entityType: "sale",
        entityId:   isBulk ? null : ids[0],
        summary:    isBulk
          ? `Bulk deleted ${ids.length} sales`
          : `Deleted sale ${ids[0]}`,
        changes: isBulk ? { ids } : { id: ids[0] },
        route:   "/sales",
      });

      // Clear selection only on bulk; single deletes don't affect other rows
      if (isBulk) setSelectedRows([]);

      loadSales();
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Delete failed. Please try again." });
    } finally {
      setToDelete(null);
      setShowDeleteModal(false);
    }
  }, [toDelete, loadSales]);

  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setToDelete(null);
  }, []);

  /* ══════════════════════════════════════
     Render
  ══════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

        <TabBar
          tabs={TABS}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <SaleHeader
          total={filteredSales.length}
          activeSales={activeSales}
          nearbyDeals={nearbyDeals}
          avgDiscount={avgDiscount}
          avgDiscountPercent={avgDiscountPercent}
          totalSavings={totalSavings}
          onCreate={() => { setEditingItem(null); setIsModalOpen(true); }}
        />

        {/*
          Key props explained:
          - data           → already filtered by tab (type), SalesTable handles search internally
          - selected       → owned by page, same pattern as ExtensionsTable
          - toggleSelect   → page-level handler
          - toggleSelectAll→ page-level handler (no args needed)
          - activeTab      → the short key ("all"|"flashSale"|…) for column-set + search logic
          - onEdit         → opens modal with mapped data
          - onDelete       → single id or id[] → opens confirm modal
        */}
        <SalesTable
          data={filteredSales}
          selected={selectedRows}
          toggleSelect={toggleSelect}
          toggleSelectAll={toggleSelectAll}
          activeTab={TAB_KEY_MAP[activeTab]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {isModalOpen && (
          <SalesModal
            onClose={handleModalClose}
            onSave={handleSave}
            initialData={editingItem}
          />
        )}

        {showDeleteModal && (
          <DeleteConfirmModal
            title={
              Array.isArray(toDelete)
                ? `Delete ${toDelete.length} Sales`
                : "Delete Sale"
            }
            description={
              Array.isArray(toDelete)
                ? `Permanently delete ${toDelete.length} selected sales? This cannot be undone.`
                : "Are you sure you want to delete this sale? This action cannot be undone."
            }
            onCancel={cancelDelete}
            onConfirm={confirmDelete}
          />
        )}

      </div>
    </div>
  );
}