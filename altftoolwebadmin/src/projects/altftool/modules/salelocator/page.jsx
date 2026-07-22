"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import TabBar from "./components/TabBar";
import SaleHeader from "./components/SalesHeader";
import SalesModal from "./components/SalesModal";
import SalesTable from "./components/SalesTable";
import { deleteSale, fetchSales, parseSalePrice } from "./services/sales.service";

const TABS = [
  "All",
  "Trending Sales",
  "Flash Sales",
  "Deal of the Day",
  "Hero Section",
];

const TAB_TYPE_MAP = {
  "Trending Sales": "trendingSale",
  "Flash Sales": "flashSale",
  "Deal of the Day": "dealOfTheDay",
  "Hero Section": "hero",
};

const TAB_KEY_MAP = {
  All: "all",
  "Trending Sales": "trendingSale",
  "Flash Sales": "flashSale",
  "Deal of the Day": "dealOfTheDay",
  "Hero Section": "hero",
};

function normalizeSale(item = {}) {
  const salePrice = parseSalePrice(item.price ?? item.salePrice);
  const originalPrice = parseSalePrice(item.oldPrice ?? item.originalPrice);

  return {
    ...item,
    salePrice,
    originalPrice,
    discountPercent:
      originalPrice > 0
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : null,
    offerText: item.offerText ?? item.discount ?? null,
    title: item.title ?? item.headline ?? item.label ?? "",
    status: item.status ?? "active",
  };
}

function mapToModalData(item) {
  if (item.type === "flashSale" || item.type === "trendingSale") {
    return {
      ...item,
      price: item.salePrice ? String(item.salePrice) : "",
      oldPrice: item.originalPrice ? String(item.originalPrice) : "",
      discount: item.offerText || "",
      productTitle: item.productTitle || item.title || "",
      image: item.image || "",
      ctaLink: item.ctaLink || "",
    };
  }

  if (item.type === "dealOfTheDay") {
    return {
      ...item,
      image: item.image || "",
      ctaLink: item.link || item.ctaLink || "",
    };
  }

  if (item.type === "hero") {
    return {
      ...item,
      headline: item.headline || item.title || "",
      subtext: item.subtext || item.subtitle || "",
      heroImage: item.heroImage || "",
      ctaLink: item.ctaLink || "",
    };
  }

  return item;
}

function idsFromDeleteTarget(target) {
  const targets = Array.isArray(target) ? target : [target];
  return targets
    .map((entry) => (typeof entry === "object" ? entry?.id : entry))
    .filter(Boolean)
    .map(String);
}

export default function SaleLocator() {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const loadSales = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const records = await fetchSales();
      setSales(records.map(normalizeSale));
    } catch (error) {
      console.error("Unable to load Sale Locator records", error);
      setLoadError("Sale data could not be loaded from Firebase.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const selectedSales = useMemo(() => {
    if (activeTab === "All") return sales;
    const type = TAB_TYPE_MAP[activeTab];
    return type ? sales.filter((item) => item.type === type) : sales;
  }, [activeTab, sales]);

  const activeSales = selectedSales.filter((item) => item.status === "active").length;
  const pricedSales = selectedSales.filter((item) => item.originalPrice > 0);
  const avgDiscount = pricedSales.length
    ? pricedSales.reduce(
        (total, item) => total + Math.max(item.originalPrice - item.salePrice, 0),
        0,
      ) / pricedSales.length
    : 0;
  const avgDiscountPercent = pricedSales.length
    ? pricedSales.reduce(
        (total, item) =>
          total + ((item.originalPrice - item.salePrice) / item.originalPrice) * 100,
        0,
      ) / pricedSales.length
    : 0;
  const nearbyDeals = sales.filter((item) => item.type === "nearby").length;
  const totalSavings = selectedSales.reduce(
    (total, item) => total + Math.max(item.originalPrice - item.salePrice, 0),
    0,
  );

  const handleEdit = useCallback((item) => {
    setEditingItem(mapToModalData(item));
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((target) => {
    setToDelete(target);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    const ids = idsFromDeleteTarget(toDelete);
    if (!ids.length) return;

    setIsDeleting(true);
    try {
      await Promise.all(ids.map(deleteSale));
      setSales((current) => current.filter((item) => !ids.includes(String(item.id))));
      emitAlert({
        type: "success",
        message: ids.length > 1 ? `${ids.length} sales deleted` : "Sale deleted",
      });
      logAuditEvent({
        module: "sale-locator",
        action: ids.length > 1 ? "SALE_BULK_DELETE" : "SALE_DELETE",
        entityType: "sale",
        entityId: ids.length === 1 ? ids[0] : null,
        summary: ids.length > 1 ? `Deleted ${ids.length} sales` : "Deleted a sale",
        changes: { ids },
        route: "/altftool/sale-locator",
      });
    } catch (error) {
      console.error("Unable to delete Sale Locator records", error);
      emitAlert({ type: "error", message: "Delete failed. Please try again." });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setToDelete(null);
    }
  }, [toDelete]);

  const handleSave = useCallback(async () => {
    setIsModalOpen(false);
    setEditingItem(null);
    await loadSales();
  }, [loadSales]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const deleteCount = idsFromDeleteTarget(toDelete).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl space-y-5 px-6 py-7">
        <TabBar tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

        {loadError ? (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {loadError}
            </span>
            <button
              type="button"
              onClick={loadSales}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : null}

        <SaleHeader
          total={selectedSales.length}
          activeSales={activeSales}
          nearbyDeals={nearbyDeals}
          avgDiscount={avgDiscount}
          avgDiscountPercent={avgDiscountPercent}
          totalSavings={totalSavings}
          onCreate={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        />

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-3 text-sm font-medium text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading sales from Firebase...
            </div>
          </div>
        ) : (
          <SalesTable
            data={selectedSales}
            activeTab={TAB_KEY_MAP[activeTab]}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {isModalOpen ? (
          <SalesModal
            onClose={closeModal}
            onSave={handleSave}
            initialData={editingItem}
          />
        ) : null}

        {showDeleteModal ? (
          <DeleteConfirmModal
            title={deleteCount > 1 ? `Delete ${deleteCount} Sales` : "Delete Sale"}
            description={
              deleteCount > 1
                ? `Permanently delete ${deleteCount} selected sales? This cannot be undone.`
                : "Are you sure you want to delete this sale? This action cannot be undone."
            }
            confirmText={isDeleting ? "Deleting..." : "Delete"}
            loading={isDeleting}
            onCancel={() => {
              if (isDeleting) return;
              setShowDeleteModal(false);
              setToDelete(null);
            }}
            onConfirm={confirmDelete}
          />
        ) : null}
      </div>
    </div>
  );
}
