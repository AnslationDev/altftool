"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft, ImageIcon, Settings } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";

export default function ServicesPage() {
  const [servicesData, setServicesData] = useState([]);
  const [viewState, setViewState] = useState("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingItemIdx, setEditingItemIdx] = useState(null);
  const [itemForm, setItemForm] = useState({ title: "", desc: "", image: "" });
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catForm, setCatForm] = useState({ title: "", tagline: "", description: "", image: "", accent: "", features: "" });
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [heroForm, setHeroForm] = useState({ images: "", badge: "", heading: "", description: "" });
  const [isHeadingModalOpen, setIsHeadingModalOpen] = useState(false);
  const [headingForm, setHeadingForm] = useState({ eyebrow: "", title: "", highlight: "", subtitle: "" });
  const [isCatDeleteConfirmOpen, setIsCatDeleteConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState(false);
  const [impactHeadingForm, setImpactHeadingForm] = useState({ eyebrow: "", title: "", highlight: "", subtitle: "" });
  const [impactCards, setImpactCards] = useState([]);
  const [isImpactCardModalOpen, setIsImpactCardModalOpen] = useState(false);
  const [editingImpactCard, setEditingImpactCard] = useState(null);
  const [impactCardForm, setImpactCardForm] = useState({ title: "", desc: "", icon: "Target", color: "from-blue-500 to-indigo-500" });
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [isPortfolioItemModalOpen, setIsPortfolioItemModalOpen] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({ title: "", client: "", category: "Digital Marketing", result: "", metric: "", image: "", gradient: "from-brand to-brand-cyan" });

  useEffect(() => {
    const saved = localStorage.getItem("servicesData");
    if (saved) {
      try { setServicesData(JSON.parse(saved)); } catch {}
    }
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await fetch("/api/apexboost/services");
      const json = await res.json();
      if (json.success && Array.isArray(json.services)) {
        setServicesData(json.services);
        localStorage.setItem("servicesData", JSON.stringify(json.services));
      }
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };

  const saveServices = async (updated) => {
    setServicesData(updated);
    localStorage.setItem("servicesData", JSON.stringify(updated));
    try {
      await fetch("/api/apexboost/services", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: updated }),
      });
    } catch (err) {
      console.error("Failed to save services:", err);
    }
  };

  const openItemsView = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setViewState("items");
  };

  const backToCategories = () => {
    setViewState("categories");
    setSelectedCategoryId(null);
  };

  const openAddItem = () => {
    setEditingItem(null);
    setEditingItemIdx(null);
    setItemForm({ title: "", desc: "", image: "" });
    setIsItemModalOpen(true);
  };

  const openEditItem = (item, index) => {
    setEditingItem(item);
    setEditingItemIdx(index);
    setItemForm({ title: item.title, desc: item.desc, image: item.image || "" });
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.title.trim()) return;
    const updated = [...servicesData];
    const catIdx = updated.findIndex(c => c.id === selectedCategoryId);
    if (catIdx === -1) return;

    const newItem = {
      title: itemForm.title,
      desc: itemForm.desc,
      image: itemForm.image,
      icon: "Search",
    };

    if (editingItemIdx !== null) {
      updated[catIdx].items[editingItemIdx] = {
        ...updated[catIdx].items[editingItemIdx],
        ...newItem,
      };
    } else {
      updated[catIdx].items.push(newItem);
    }

    await saveServices(updated);
    setIsItemModalOpen(false);
    setEditingItem(null);
    setEditingItemIdx(null);
  };

  const confirmDeleteItem = async () => {
    if (itemToDelete === null) return;
    const updated = [...servicesData];
    const catIdx = updated.findIndex(c => c.id === selectedCategoryId);
    if (catIdx === -1) return;
    updated[catIdx].items.splice(itemToDelete, 1);
    await saveServices(updated);
    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const openAddCategory = () => {
    setEditingCategory(null);
    setCatForm({
      title: "",
      tagline: "",
      description: "",
      image: "",
      accent: "from-brand to-brand-cyan",
      features: "",
    });
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCatForm({
      title: cat.title,
      tagline: cat.tagline,
      description: cat.description,
      image: cat.image || "",
      accent: cat.accent || "",
      features: Array.isArray(cat.features) ? cat.features.join("\n") : "",
    });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!catForm.title.trim()) return;
    const updated = [...servicesData];
    
    const newCatData = {
      title: catForm.title,
      tagline: catForm.tagline,
      description: catForm.description,
      image: catForm.image,
      accent: catForm.accent,
      features: catForm.features.split("\n").map(f => f.trim()).filter(Boolean),
    };

    if (editingCategory) {
      const catIdx = updated.findIndex(c => c.id === editingCategory.id);
      if (catIdx !== -1) {
        updated[catIdx] = { ...updated[catIdx], ...newCatData };
      }
    } else {
      updated.push({
        id: catForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ...newCatData,
        items: []
      });
    }

    await saveServices(updated);
    setIsCatModalOpen(false);
    setEditingCategory(null);
  };

  const confirmDeleteCategory = async () => {
    if (catToDelete === null) return;
    const updated = servicesData.filter(c => c.id !== catToDelete.id);
    await saveServices(updated);
    setIsCatDeleteConfirmOpen(false);
    setCatToDelete(null);
  };

  const loadHeroData = async () => {
    try {
      const res = await fetch("/api/apexboost/data?section=servicesHero");
      const json = await res.json();
      if (json.success && json.data) {
        setHeroForm({
          images: Array.isArray(json.data.images) ? json.data.images.join("\n") : "",
          badge: json.data.badge || "",
          heading: json.data.heading || "",
          description: json.data.description || "",
        });
      }
    } catch (err) {
      console.error("Failed to load hero data:", err);
    }
  };

  const openHeroEditor = () => {
    loadHeroData();
    setIsHeroModalOpen(true);
  };

  const handleSaveHero = async () => {
    const data = {
      images: heroForm.images.split("\n").map(s => s.trim()).filter(Boolean),
      badge: heroForm.badge,
      heading: heroForm.heading,
      description: heroForm.description,
    };
    try {
      await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "servicesHero", data }),
      });
      setIsHeroModalOpen(false);
    } catch (err) {
      console.error("Failed to save hero data:", err);
    }
  };

  const loadHeadingData = async () => {
    try {
      const res = await fetch("/api/apexboost/data?section=servicesHeading");
      const json = await res.json();
      if (json.success && json.data) {
        setHeadingForm({
          eyebrow: json.data.eyebrow || "",
          title: json.data.title || "",
          highlight: json.data.highlight || "",
          subtitle: json.data.subtitle || "",
        });
      }
    } catch (err) {
      console.error("Failed to load heading data:", err);
    }
  };

  const openHeadingEditor = () => {
    loadHeadingData();
    setIsHeadingModalOpen(true);
  };

  const handleSaveHeading = async () => {
    const data = {
      eyebrow: headingForm.eyebrow,
      title: headingForm.title,
      highlight: headingForm.highlight,
      subtitle: headingForm.subtitle,
    };
    try {
      await fetch("/api/apexboost/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "servicesHeading", data }),
      });
      setIsHeadingModalOpen(false);
    } catch (err) {
      console.error("Failed to save heading data:", err);
    }
  };

  const selectedCategory = servicesData.find(c => c.id === selectedCategoryId);

  const openImpactEditor = async () => {
    try {
      const [hRes, cRes] = await Promise.all([
        fetch("/api/apexboost/data?section=marketingImpact"),
        fetch("/api/apexboost/data?section=marketingImpactCards"),
      ]);
      const [hJson, cJson] = await Promise.all([hRes.json(), cRes.json()]);
      if (hJson.success && hJson.data) {
        setImpactHeadingForm({
          eyebrow: hJson.data.eyebrow || "",
          title: hJson.data.title || "",
          highlight: hJson.data.highlight || "",
          subtitle: hJson.data.subtitle || "",
        });
      }
      if (cJson.success && Array.isArray(cJson.data)) setImpactCards(cJson.data);
    } catch (err) { console.error(err); }
    setIsImpactModalOpen(true);
  };

  const handleSaveImpactHeading = async () => {
    const res = await fetch("/api/apexboost/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "marketingImpact", data: {
        eyebrow: impactHeadingForm.eyebrow,
        title: impactHeadingForm.title,
        highlight: impactHeadingForm.highlight,
        subtitle: impactHeadingForm.subtitle,
      }}),
    });
    if (res.ok) emitAlert({ type: "success", title: "Success", message: "Marketing Impact heading saved!" });
    else emitAlert({ type: "error", title: "Error", message: "Failed to save heading." });
  };

  const handleSaveImpactCards = async (cards) => {
    const res = await fetch("/api/apexboost/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "marketingImpactCards", data: cards }),
    });
    return res.ok;
  };

  const openAddImpactCard = () => {
    setEditingImpactCard(null);
    setImpactCardForm({ title: "", desc: "", icon: "Target", color: "from-blue-500 to-indigo-500" });
    setIsImpactCardModalOpen(true);
  };

  const openEditImpactCard = (card, idx) => {
    setEditingImpactCard(idx);
    setImpactCardForm({ ...card });
    setIsImpactCardModalOpen(true);
  };

  const handleSaveImpactCard = async () => {
    const updated = editingImpactCard !== null
      ? impactCards.map((c, i) => i === editingImpactCard ? { ...impactCardForm } : c)
      : [...impactCards, { ...impactCardForm }];
    const ok = await handleSaveImpactCards(updated);
    if (ok) {
      setImpactCards(updated);
      setIsImpactCardModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Card saved!" });
    } else emitAlert({ type: "error", title: "Error", message: "Failed to save card." });
  };

  const handleDeleteImpactCard = async (idx) => {
    const updated = impactCards.filter((_, i) => i !== idx);
    const ok = await handleSaveImpactCards(updated);
    if (ok) {
      setImpactCards(updated);
      emitAlert({ type: "success", title: "Success", message: "Card deleted!" });
    } else emitAlert({ type: "error", title: "Error", message: "Failed to delete card." });
  };

  const openPortfolioEditor = async () => {
    try {
      const res = await fetch("/api/apexboost/data?section=portfolio");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setPortfolioItems(json.data);
    } catch (err) { console.error(err); }
    setIsPortfolioModalOpen(true);
  };

  const handleSavePortfolioItems = async (items) => {
    const res = await fetch("/api/apexboost/data", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "portfolio", data: items }),
    });
    return res.ok;
  };

  const openAddPortfolioItem = () => {
    setEditingPortfolioItem(null);
    setPortfolioForm({ title: "", client: "", category: "Digital Marketing", result: "", metric: "", image: "", gradient: "from-brand to-brand-cyan" });
    setIsPortfolioItemModalOpen(true);
  };

  const openEditPortfolioItem = (item, idx) => {
    setEditingPortfolioItem(idx);
    setPortfolioForm({ ...item });
    setIsPortfolioItemModalOpen(true);
  };

  const handleSavePortfolioItem = async () => {
    const updated = editingPortfolioItem !== null
      ? portfolioItems.map((c, i) => i === editingPortfolioItem ? { ...portfolioForm, id: c.id } : c)
      : [...portfolioItems, { ...portfolioForm, id: Date.now() }];
    const ok = await handleSavePortfolioItems(updated);
    if (ok) {
      setPortfolioItems(updated);
      setIsPortfolioItemModalOpen(false);
      emitAlert({ type: "success", title: "Success", message: "Portfolio item saved!" });
    } else emitAlert({ type: "error", title: "Error", message: "Failed to save item." });
  };

  const handleDeletePortfolioItem = async (idx) => {
    const updated = portfolioItems.filter((_, i) => i !== idx);
    const ok = await handleSavePortfolioItems(updated);
    if (ok) {
      setPortfolioItems(updated);
      emitAlert({ type: "success", title: "Success", message: "Item deleted!" });
    } else emitAlert({ type: "error", title: "Error", message: "Failed to delete item." });
  };

  const catView = viewState === "categories";

  return (
    <div className="space-y-6">
      {/* ─── Categories View ─────────────────────────────────────── */}
      {catView && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Manage Services</h1>
              <p className="text-gray-600 text-sm mt-1">Manage service categories and their sub-items</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openAddCategory}
                className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
              >
                <Plus size={16} />
                Add Pillar/Card
              </button>
              <button
                onClick={openHeadingEditor}
                className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings size={16} />
                Main Heading
              </button>
              <button
                onClick={openHeroEditor}
                className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings size={16} />
                Hero Section
              </button>
              <button
                onClick={openImpactEditor}
                className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings size={16} />
                Marketing Impact
              </button>
              <button
                onClick={openPortfolioEditor}
                className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings size={16} />
                Portfolio / Case Studies
              </button>
            </div>

          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {servicesData.filter(s => !s.deleted).map((service) => (
                <div key={service.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{service.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{service.tagline}</p>
                    <p className="text-xs text-gray-400 mb-4">{service.items?.length || 0} sub-services</p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditCategory(service)}
                          className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm"
                        >
                          <Edit size={14} />
                          Edit Card
                        </button>
                        <button
                          onClick={() => { setCatToDelete(service); setIsCatDeleteConfirmOpen(true); }}
                          className="p-2 border rounded-lg hover:bg-red-50"
                          title="Delete Card"
                        >
                          <Trash2 size={14} className="text-red-600" />
                        </button>
                      </div>
                      <button
                        onClick={() => openItemsView(service.id)}
                        className="w-full flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Settings size={14} />
                        Manage Sub-Services
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {servicesData.filter(s => !s.deleted).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No service categories found</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Items View ──────────────────────────────────────────── */}
      {!catView && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={backToCategories}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  {selectedCategory?.title || "Services"}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Manage sub-services under {selectedCategory?.title}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openEditCategory(selectedCategory)}
                className="flex items-center gap-2 border px-4 py-2 rounded-md text-sm hover:bg-gray-50"
              >
                <Settings size={16} />
                Edit Category
              </button>
              <button
                onClick={openAddItem}
                className="flex items-center gap-2 bg-(--primary) text-white px-4 py-2 rounded-md text-sm hover:opacity-90"
              >
                <Plus size={16} />
                Add Sub-Service
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategory?.items?.map((item, index) => (
                <div key={index} className="border rounded-xl overflow-hidden hover:shadow-lg transition">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
                      <ImageIcon size={32} className="text-gray-300" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.desc}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditItem(item, index)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => { setItemToDelete(index); setIsDeleteConfirmOpen(true); }}
                        className="p-2 border rounded-lg hover:bg-red-50"
                      >
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(selectedCategory?.items?.length || 0) === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No sub-services yet. Click "Add Sub-Service" to create one.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── Delete Confirmation ─────────────────────────────────── */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Delete this sub-service?</h2>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsDeleteConfirmOpen(false); setItemToDelete(null); }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button onClick={confirmDeleteItem} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Item Add/Edit Modal ─────────────────────────────────── */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingItem ? "Edit" : "Add"} Sub-Service</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={itemForm.title} onChange={e => setItemForm({...itemForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={itemForm.desc} onChange={e => setItemForm({...itemForm, desc: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input type="text" value={itemForm.image} onChange={e => setItemForm({...itemForm, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                {itemForm.image && (
                  <div className="mt-2">
                    <img src={itemForm.image} alt="Preview" className="w-full h-32 object-cover rounded-lg" onError={e => { e.target.style.display = "none"; }} />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setIsItemModalOpen(false); setEditingItem(null); setEditingItemIdx(null); }} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveItem} className="bg-(--primary) text-white px-4 py-2 rounded">{editingItem ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero Section Modal ──────────────────────────────────── */}
      {isHeroModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Services Page Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge / Tagline</label>
                <input type="text" value={heroForm.badge} onChange={e => setHeroForm({...heroForm, badge: e.target.value})} placeholder="Full-Funnel Marketing That Delivers Growth" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heading</label>
                <input type="text" value={heroForm.heading} onChange={e => setHeroForm({...heroForm, heading: e.target.value})} placeholder="Services that turn clicks into loyal customers" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={heroForm.description} onChange={e => setHeroForm({...heroForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Images (one URL per line — rotates every 4s)</label>
                <textarea rows={5} value={heroForm.images} onChange={e => setHeroForm({...heroForm, images: e.target.value})} placeholder="https://images.unsplash.com/photo-..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsHeroModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveHero} className="bg-(--primary) text-white px-4 py-2 rounded">Save Hero Section</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Heading Modal ──────────────────────────────────── */}
      {isHeadingModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Services Main Heading Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
                <input type="text" value={headingForm.eyebrow} onChange={e => setHeadingForm({...headingForm, eyebrow: e.target.value})} placeholder="What We Do" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={headingForm.title} onChange={e => setHeadingForm({...headingForm, title: e.target.value})} placeholder="Three pillars of" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Highlight</label>
                <input type="text" value={headingForm.highlight} onChange={e => setHeadingForm({...headingForm, highlight: e.target.value})} placeholder="explosive growth" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle / Description</label>
                <textarea rows={3} value={headingForm.subtitle} onChange={e => setHeadingForm({...headingForm, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsHeadingModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveHeading} className="bg-(--primary) text-white px-4 py-2 rounded">Save Heading</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Category Edit Modal ─────────────────────────────────── */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-6">{editingCategory ? `Edit Card — ${editingCategory.title}` : "Add New Card"}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={catForm.title} onChange={e => setCatForm({...catForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent (Tailwind gradient)</label>
                  <input type="text" value={catForm.accent} onChange={e => setCatForm({...catForm, accent: e.target.value})} placeholder="from-brand to-brand-cyan" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={catForm.tagline} onChange={e => setCatForm({...catForm, tagline: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={4} value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Image URL</label>
                <input type="text" value={catForm.image} onChange={e => setCatForm({...catForm, image: e.target.value})} placeholder="https://images.unsplash.com/..." className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
                {catForm.image && (
                  <div className="mt-2">
                    <img src={catForm.image} alt="Preview" className="w-full h-36 object-cover rounded-lg" onError={e => { e.target.style.display = "none"; }} />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features (one per line)</label>
                <textarea rows={5} value={catForm.features} onChange={e => setCatForm({...catForm, features: e.target.value})} placeholder="Full-funnel strategy&#10;SEO & content engines&#10;Lifecycle email automation" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-(--primary)" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setIsCatModalOpen(false); setEditingCategory(null); }} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveCategory} className="bg-(--primary) text-white px-4 py-2 rounded">Save Category</button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Delete Category Confirmation ─────────────────────────── */}
      {isCatDeleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Delete this pillar/card?</h2>
            <p className="text-sm text-gray-500 mb-6">This will also delete all sub-services inside it.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setIsCatDeleteConfirmOpen(false); setCatToDelete(null); }}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button onClick={confirmDeleteCategory} className="bg-red-600 text-white px-4 py-2 rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Marketing Impact Modal ──────────────────────────────── */}
      {isImpactModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Marketing Impact Section</h2>
              <button onClick={() => setIsImpactModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {/* Heading */}
            <div className="border rounded-xl p-5 mb-6 space-y-4">
              <h3 className="font-semibold text-gray-700">Section Heading</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eyebrow</label>
                  <input type="text" value={impactHeadingForm.eyebrow} onChange={e => setImpactHeadingForm({...impactHeadingForm, eyebrow: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Highlight Word</label>
                  <input type="text" value={impactHeadingForm.highlight} onChange={e => setImpactHeadingForm({...impactHeadingForm, highlight: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={impactHeadingForm.title} onChange={e => setImpactHeadingForm({...impactHeadingForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea rows={3} value={impactHeadingForm.subtitle} onChange={e => setImpactHeadingForm({...impactHeadingForm, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end">
                <button onClick={handleSaveImpactHeading} className="bg-(--primary) text-white px-4 py-2 rounded-lg text-sm">Save Heading</button>
              </div>
            </div>

            {/* Cards */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">Impact Cards</h3>
              <button onClick={openAddImpactCard} className="flex items-center gap-2 bg-(--primary) text-white px-3 py-1.5 rounded-md text-sm">
                <Plus size={14} /> Add Card
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {impactCards.map((card, idx) => (
                <div key={idx} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {card.icon?.[0] || "?"}
                    </div>
                    <h4 className="font-semibold">{card.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{card.desc}</p>
                  <div className="flex gap-2">
                    <button onClick={() => openEditImpactCard(card, idx)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm">
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => handleDeleteImpactCard(idx)} className="p-2 border rounded-lg hover:bg-red-50">
                      <Trash2 size={14} className="text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Impact Card Add/Edit Modal ──────────────────────────── */}
      {isImpactCardModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 my-8 p-6">
            <h2 className="text-xl font-bold mb-5">{editingImpactCard !== null ? "Edit" : "Add"} Impact Card</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input type="text" value={impactCardForm.title} onChange={e => setImpactCardForm({...impactCardForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={impactCardForm.desc} onChange={e => setImpactCardForm({...impactCardForm, desc: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Target / TrendingUp / Users / Zap)</label>
                  <select value={impactCardForm.icon} onChange={e => setImpactCardForm({...impactCardForm, icon: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="Target">Target</option>
                    <option value="TrendingUp">TrendingUp</option>
                    <option value="Users">Users</option>
                    <option value="Zap">Zap</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Gradient</label>
                  <select value={impactCardForm.color} onChange={e => setImpactCardForm({...impactCardForm, color: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="from-blue-500 to-indigo-500">Blue → Indigo</option>
                    <option value="from-purple-500 to-fuchsia-500">Purple → Fuchsia</option>
                    <option value="from-cyan-500 to-blue-500">Cyan → Blue</option>
                    <option value="from-emerald-500 to-teal-500">Emerald → Teal</option>
                    <option value="from-orange-500 to-red-500">Orange → Red</option>
                    <option value="from-pink-500 to-rose-500">Pink → Rose</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsImpactCardModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSaveImpactCard} className="bg-(--primary) text-white px-4 py-2 rounded">Save Card</button>
            </div>
          </div>
        </div>
      )}
      {/* ─── Portfolio Modal ─────────────────────────────────────── */}
      {isPortfolioModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Portfolio / Case Studies</h2>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Portfolio Items</h3>
              <button onClick={openAddPortfolioItem} className="flex items-center gap-2 bg-(--primary) text-white px-3 py-1.5 rounded-md text-sm">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolioItems.map((item, idx) => (
                <div key={idx} className="border rounded-xl overflow-hidden hover:shadow-lg transition flex flex-col">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-32 object-cover" />
                  ) : (
                    <div className={`w-full h-32 bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white text-3xl`}>
                      {item.emoji || "📝"}
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-semibold text-md mb-1">{item.title}</h4>
                    <p className="text-gray-500 text-xs mb-1">{item.client}</p>
                    <p className="text-(--primary) font-semibold text-sm mb-3 mt-auto">{item.result}</p>
                    <div className="flex gap-2">
                      <button onClick={() => openEditPortfolioItem(item, idx)} className="flex-1 flex items-center justify-center gap-2 p-2 border rounded-lg hover:bg-gray-50 text-sm">
                        <Edit size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeletePortfolioItem(idx)} className="p-2 border rounded-lg hover:bg-red-50">
                        <Trash2 size={14} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Portfolio Item Add/Edit Modal ───────────────────────── */}
      {isPortfolioItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 my-8 p-6">
            <h2 className="text-xl font-bold mb-5">{editingPortfolioItem !== null ? "Edit" : "Add"} Portfolio Item</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={portfolioForm.title} onChange={e => setPortfolioForm({...portfolioForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                  <input type="text" value={portfolioForm.client} onChange={e => setPortfolioForm({...portfolioForm, client: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={portfolioForm.category} onChange={e => setPortfolioForm({...portfolioForm, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option>Digital Marketing</option>
                    <option>Advertising</option>
                    <option>Affiliate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color Gradient</label>
                  <select value={portfolioForm.gradient} onChange={e => setPortfolioForm({...portfolioForm, gradient: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
                    <option value="from-brand to-brand-cyan">Brand → Cyan</option>
                    <option value="from-brand-cyan to-brand-purple">Cyan → Purple</option>
                    <option value="from-brand-purple to-brand">Purple → Brand</option>
                    <option value="from-danger to-warning">Danger → Warning</option>
                    <option value="from-success to-brand-cyan">Success → Cyan</option>
                    <option value="from-warning to-brand">Warning → Brand</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result (e.g., +312% Traffic)</label>
                  <input type="text" value={portfolioForm.result} onChange={e => setPortfolioForm({...portfolioForm, result: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metric Details</label>
                  <input type="text" value={portfolioForm.metric} onChange={e => setPortfolioForm({...portfolioForm, metric: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                <input type="text" value={portfolioForm.image} onChange={e => setPortfolioForm({...portfolioForm, image: e.target.value})} placeholder="/portfolio_skincare.png" className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsPortfolioItemModalOpen(false)} className="border px-4 py-2 rounded">Cancel</button>
              <button onClick={handleSavePortfolioItem} className="bg-(--primary) text-white px-4 py-2 rounded">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
