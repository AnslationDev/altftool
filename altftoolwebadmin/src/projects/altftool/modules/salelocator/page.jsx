"use client";
import React, {useState, useCallback} from "react";
import TabBar from "./components/TabBar";
import SaleData from "./data/saleData.json";
import SaleHeader from "./components/SalesHeader";
import SalesModal from "./components/SalesModal";
import SalesTable from "./components/SalesTable";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function SaleLocator() {
  const TABS = [
    "All",
    "Trending Sales",
    "Flash Sales",
    "Deal of the Day",
    "Hero Section"
  ];

  const parsePrice = (price) => {
    if (!price) return 0;

    // already a number
    if (typeof price === "number") return price;

    // string like "₹1,16,200"
    if (typeof price === "string") {
      return Number(price.replace(/[^0-9]/g, ""));
    }

    return 0;
  };
  const normalizeProducts = (products = [], type) =>
    products.map((item) => {
      const salePrice = parsePrice(item.price || item.salePrice);
      const originalPrice = parsePrice(item.oldPrice || item.originalPrice);

      return {
        ...item,
        type,
        salePrice,
        originalPrice,
        discountPercent:
          originalPrice > 0
            ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
            : null,
        offerText: item.offerText || item.discount || null,
        title: item.title || item.headline || item.label,
        status: "active"
      };
    });

  const salesDataMap = {
    "All": normalizeProducts([
      ...SaleData.trendingSales.products,
      ...SaleData.flashSales.products,
      
    ], "all"),

    "Trending Sales": normalizeProducts(SaleData.trendingSales.products, "trendingSale"),

    "Flash Sales": normalizeProducts(SaleData.flashSales.products, "flashSale"),

    "Deal of the Day": SaleData.dealOfDay.map(item => ({
      ...item,
      type: "dealOfTheDay"
    })), // keep separate (different UI)

    "Hero Section": [{
      ...SaleData.hero,
      type: "hero",
      id: "hero-1"
    }], // don't pass object to table
  };

  const TAB_KEY_MAP = {
    "All": "all",
    "Trending Sales": "trendingSale",
    "Flash Sales": "flashSale",
    "Deal of the Day": "dealOfTheDay",
    "Hero Section": "hero",
  };

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("All");
  const [editingItem, setEditingItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const selectedSales = salesDataMap[activeTab] || [];

  const activeSales = selectedSales.filter(item => item.status === "active").length;
  const avgDiscount = selectedSales.length > 0
    ? selectedSales.reduce((acc, item) => acc + (item.originalPrice - item.salePrice), 0) / selectedSales.length
    : 0;

  const avgDiscountPercent =
    selectedSales.length > 0
      ? selectedSales.reduce((acc, item) => {
          if (!item.originalPrice) return acc;
          return acc + ((item.originalPrice - item.salePrice) / item.originalPrice) * 100;
        }, 0) / selectedSales.length
      : 0;

  const nearbyDeals = SaleData.nearbyDeals.filter(d => d.type === "nearby").length;

  const totalSavings = selectedSales.reduce((acc, item) => {
    return acc + (item.originalPrice - item.salePrice);
  }, 0);

  const mapToModalData = (item) => {
    if (item.type === "flashSale" || item.type === "trendingSale") {
      return {
        ...item,
        price: item.salePrice ? `₹${item.salePrice}` : "",
        oldPrice: item.originalPrice ? `₹${item.originalPrice}` : "",
        discount: item.offerText || "",
        productTitle: item.productTitle || item.title || "",
        image: item.image || "",
        ctaLink: item.ctaLink || "https://example.com",
      };
    }

    if (item.type === "dealOfTheDay") {
      return {
        ...item,
        image: item.image || "",
        ctaLink: item.link || "",
      };
    }

    if (item.type === "hero") {
      return {
        ...item,
        headline: item.headline || item.title,
        subtext: item.subtext || item.subtitle,
        heroImage: item.heroImage || "",
      };
    }

    return item;
  };

  const handleEdit = useCallback((item) => {
    const mapped = mapToModalData(item);
    setEditingItem(mapped);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((idOrIds) => {
    setToDelete(idOrIds);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = () => {
    // TODO: update state when you make data dynamic

    setShowDeleteModal(false);
    setToDelete(null);
  };

  const handleSave = (newSale) => {
    // TODO: update your state / data source
    // Example (if you later store in state):
    // setSales(prev => [...prev, newSale]);
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

      <TabBar
        tabs={TABS}
        activeTab={activeTab}
        setActiveTab={setActiveTab} 
      />

      <SaleHeader
        total={selectedSales.length}
        activeSales={activeSales}
        nearbyDeals={nearbyDeals}
        avgDiscount={avgDiscount}
        avgDiscountPercent={avgDiscountPercent}
        totalSavings={totalSavings}
        onCreate={() => { setEditingItem(null); setIsModalOpen(true); }}
      />

      <SalesTable 
        data={selectedSales} 
        activeTab={TAB_KEY_MAP[activeTab]} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <SalesModal onClose={() => { setIsModalOpen(false); setEditingItem(null); }} 
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
          onCancel={() => {
            setShowDeleteModal(false);
            setToDelete(null);
          }}
          onConfirm={confirmDelete}
        />
      )}

    </div>
    </div>
  );
}
