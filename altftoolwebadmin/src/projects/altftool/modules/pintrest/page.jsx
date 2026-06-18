"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  Tag,
  BarChart3,
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Heart,
  ExternalLink,
  PlusCircle,
  X,
  Sparkles,
} from "lucide-react";

import {
  subscribePins,
  subscribeCategories,
  addPin,
  updatePin,
  deletePin,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./services/pinterest.service";

import AdminDataState from "@/components/admin/AdminDataState";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

export default function PinterestAdmin() {
  const [activeTab, setActiveTab] = useState("pins"); // "pins", "categories", "insights"
  const [pins, setPins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State for Pin Form
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [editingPin, setEditingPin] = useState(null); // null = add, object = edit
  const [pinForm, setPinForm] = useState({
    title: "",
    image: "",
    category: "",
    likes: 0,
  });
  const [pinFormError, setPinFormError] = useState("");
  const [savingPin, setSavingPin] = useState(false);

  // Modal / Inline State for Category Form
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'pin'|'category', id, name }

  // Status Alerts
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);
    setError("");

    const unsubCategories = subscribeCategories(
      (catData) => {
        setCategories(catData || []);
      },
      (err) => {
        console.error("Categories subscription failed:", err);
        setError("Could not establish subscription to categories.");
      }
    );

    const unsubPins = subscribePins(
      (pinData) => {
        const mappedPins = (pinData || []).map((pin) => ({
          ...pin,
          image: pin.image || pin.img || pin.logo || "",
          category: pin.category || pin.Category || "Other",
        }));
        setPins(mappedPins);
        setLoading(false);
      },
      (err) => {
        console.error("Pins subscription failed:", err);
        setError("Could not establish subscription to pins.");
        setLoading(false);
      }
    );

    return () => {
      unsubCategories && unsubCategories();
      unsubPins && unsubPins();
    };
  }, []);

  // Alert auto-dismissal
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showNotification = (type, message) => {
    setAlert({ type, message });
  };

  // Memoized insights/stats
  const stats = useMemo(() => {
    const totalPins = pins.length;
    const totalCategories = categories.length;
    const totalLikes = pins.reduce((sum, pin) => sum + (Number(pin.likes) || 0), 0);
    const avgLikes = totalPins > 0 ? (totalLikes / totalPins).toFixed(1) : "0.0";

    let mostLikedPin = null;
    if (totalPins > 0) {
      mostLikedPin = [...pins].sort((a, b) => (b.likes || 0) - (a.likes || 0))[0];
    }

    // Pins per category map
    const pinsPerCat = {};
    pins.forEach((pin) => {
      const cat = pin.category || "Other";
      pinsPerCat[cat] = (pinsPerCat[cat] || 0) + 1;
    });

    return {
      totalPins,
      totalCategories,
      totalLikes,
      avgLikes,
      mostLikedPin,
      pinsPerCat,
    };
  }, [pins, categories]);

  // Filter & Search pins
  const filteredPins = useMemo(() => {
    return pins.filter((pin) => {
      const matchesSearch =
        (pin.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pin.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" ||
        (pin.category || "Other").toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [pins, searchQuery, selectedCategory]);

  // Form handling
  const openAddPinModal = () => {
    setEditingPin(null);
    setPinForm({
      title: "",
      image: "",
      category: categories[0]?.name || "Other",
      likes: 0,
    });
    setPinFormError("");
    setIsPinModalOpen(true);
  };

  const openEditPinModal = (pin) => {
    setEditingPin(pin);
    setPinForm({
      title: pin.title || "",
      image: pin.image || "",
      category: pin.category || categories[0]?.name || "Other",
      likes: pin.likes || 0,
    });
    setPinFormError("");
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    setPinFormError("");

    if (!pinForm.title.trim()) {
      setPinFormError("Title is required.");
      return;
    }
    if (!pinForm.image.trim()) {
      setPinFormError("Image URL is required.");
      return;
    }

    setSavingPin(true);
    try {
      if (editingPin) {
        await updatePin(editingPin.id, {
          title: pinForm.title.trim(),
          image: pinForm.image.trim(),
          category: pinForm.category,
          likes: Number(pinForm.likes) || 0,
        });
        showNotification("success", "Pin updated successfully!");
      } else {
        await addPin({
          title: pinForm.title.trim(),
          image: pinForm.image.trim(),
          category: pinForm.category,
          likes: Number(pinForm.likes) || 0,
        });
        showNotification("success", "New pin added successfully!");
      }
      setIsPinModalOpen(false);
    } catch (err) {
      console.error(err);
      setPinFormError("Error saving pin. Please try again.");
    } finally {
      setSavingPin(false);
    }
  };

  // Category Actions
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setSavingCategory(true);
    try {
      // Check if duplicate
      const isDuplicate = categories.some(
        (c) => c.name.toLowerCase() === newCatName.trim().toLowerCase()
      );
      if (isDuplicate) {
        showNotification("error", "Category already exists!");
        setSavingCategory(false);
        return;
      }

      await addCategory(newCatName.trim());
      setNewCatName("");
      showNotification("success", "Category created successfully!");
    } catch (err) {
      console.error(err);
      showNotification("error", "Could not create category.");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleStartEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setEditingCatName(cat.name);
  };

  const handleCancelEditCategory = () => {
    setEditingCatId(null);
    setEditingCatName("");
  };

  const handleUpdateCategory = async (id) => {
    if (!editingCatName.trim()) return;

    setSavingCategory(true);
    try {
      await updateCategory(id, editingCatName.trim());
      setEditingCatId(null);
      setEditingCatName("");
      showNotification("success", "Category updated successfully!");
    } catch (err) {
      console.error(err);
      showNotification("error", "Could not update category.");
    } finally {
      setSavingCategory(false);
    }
  };

  // Deletion logic
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      if (deleteTarget.type === "pin") {
        await deletePin(deleteTarget.id);
        showNotification("success", "Pin deleted successfully.");
      } else if (deleteTarget.type === "category") {
        await deleteCategory(deleteTarget.id);
        showNotification("success", "Category deleted successfully.");
      }
    } catch (err) {
      console.error(err);
      showNotification("error", `Could not delete ${deleteTarget.type}.`);
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminDataState
          title="Loading Pinterest board data"
          message="Subscribing to real-time pins and category feeds from Firestore."
        >
          <div className="mt-6 flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
          </div>
        </AdminDataState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <AdminDataState
          type="error"
          title="Pinterest Board connection error"
          message={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        
        {/* Toast Alert Notification */}
        {alert && (
          <div
            className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-lg transition-transform duration-300 border ${
              alert.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                alert.type === "success" ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <p className="text-sm font-semibold">{alert.message}</p>
            <button
              onClick={() => setAlert(null)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Dashboard Header */}
        <header className="border-b border-gray-200 pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
                  Altftool Board
                </p>
                <span className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  <Sparkles size={8} /> Realtime
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-gray-900">
                Manage Pinterest Pins & Board
              </h1>
              <p className="mt-1.5 text-sm text-gray-500">
                Create new pins, organize categories, and track engagement numbers for /altpintrest.
              </p>
            </div>
            
            {/* Quick Metrics Header Cards */}
            <div className="flex gap-4">
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Pins</p>
                <p className="mt-0.5 text-xl font-bold text-gray-900">{stats.totalPins}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Categories</p>
                <p className="mt-0.5 text-xl font-bold text-gray-900">{stats.totalCategories}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-gray-400 uppercase">Total Likes</p>
                <p className="mt-0.5 text-xl font-bold text-gray-900 flex items-center justify-center gap-1">
                  <Heart size={14} className="fill-indigo-500 text-indigo-500" />
                  {stats.totalLikes}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("pins")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "pins"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <ImageIcon size={16} />
              Pins Management
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "categories"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <Tag size={16} />
              Categories Board
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "insights"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <BarChart3 size={16} />
              Board Insights
            </button>
          </nav>
        </div>

        {/* Main Content Areas */}
        <main className="min-h-[50vh]">
          {/* ============================================================== */}
          {/* 1. PINS TAB                                                    */}
          {/* ============================================================== */}
          {activeTab === "pins" && (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search and filter inputs */}
                <div className="flex flex-col sm:flex-row gap-2.5 flex-1 max-w-xl">
                  <div className="relative flex-1 bg-white rounded-lg border border-gray-300 focus-within:ring-1 focus-within:ring-indigo-500 shadow-sm flex items-center px-3">
                    <Search size={16} className="text-gray-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search pins title, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-2.5 w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-gray-600 ml-2">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add Pin Button */}
                <button
                  type="button"
                  onClick={openAddPinModal}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                >
                  <Plus size={16} />
                  Add New Pin
                </button>
              </div>

              {/* Pins Table / Grid */}
              {filteredPins.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-sm font-semibold text-gray-900">No pins found</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {pins.length === 0
                      ? "Create your first Pinterest pin to display it on the public site."
                      : "Try adjusting your search criteria or category filter."}
                  </p>
                  {pins.length === 0 && (
                    <button
                      onClick={openAddPinModal}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <Plus size={14} /> Add Pin
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        <tr>
                          <th className="px-6 py-4">Pin Preview</th>
                          <th className="px-6 py-4">Pin Details</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Likes</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredPins.map((pin) => (
                          <tr key={pin.id} className="hover:bg-gray-50/50 transition">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-gray-200 bg-gray-100 shadow-sm shrink-0">
                                <img
                                  src={pin.image || "/placeholder.png"}
                                  alt={pin.title}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.src = "/placeholder.png";
                                  }}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-semibold text-gray-950 line-clamp-1">{pin.title}</p>
                              <p className="mt-1 text-[11px] text-gray-400 font-mono select-all truncate max-w-xs">
                                {pin.image}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                                <Tag size={10} />
                                {pin.category || "Other"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                <Heart size={14} className="fill-rose-500 text-rose-500" />
                                {pin.likes || 0}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <a
                                  href={pin.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
                                  title="Open Original Image"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => openEditPinModal(pin)}
                                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                                  title="Edit Pin"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget({
                                      type: "pin",
                                      id: pin.id,
                                      name: pin.title,
                                    })
                                  }
                                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                                  title="Delete Pin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. CATEGORIES TAB                                              */}
          {/* ============================================================== */}
          {activeTab === "categories" && (
            <div className="grid gap-6 md:grid-cols-3">
              {/* Category creation pane */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4 self-start">
                <h3 className="text-sm font-semibold text-gray-900">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label htmlFor="cat-name" className="block text-xs font-medium text-gray-500 mb-1.5">
                      Category Name
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      placeholder="e.g. Design, UI Image, Prompts"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingCategory || !newCatName.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition disabled:opacity-50"
                  >
                    {savingCategory ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <PlusCircle size={16} />
                    )}
                    Create Category
                  </button>
                </form>
              </div>

              {/* Categories list */}
              <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-4">
                  <h3 className="text-sm font-semibold text-gray-900">Active Pinterest Board Categories</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {categories.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 text-sm">No categories registered yet.</div>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition"
                      >
                        {editingCatId === cat.id ? (
                          <div className="flex gap-2 w-full">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="flex-1 rounded-lg border border-indigo-500 px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(cat.id)}
                              disabled={savingCategory || !editingCatName.trim()}
                              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditCategory}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                                <Tag size={14} />
                              </span>
                              <div>
                                <p className="font-semibold text-gray-950">{cat.name}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">
                                  {stats.pinsPerCat[cat.name] || 0} pins associated
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(cat)}
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
                                title="Rename Category"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    type: "category",
                                    id: cat.id,
                                    name: cat.name,
                                  })
                                }
                                className="p-1.5 rounded-lg border border-gray-200 bg-white text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
                                title="Delete Category"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. INSIGHTS TAB                                                */}
          {/* ============================================================== */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              {/* Stat grid widgets */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Pins Engagement</p>
                  <p className="mt-2 text-3xl font-bold text-indigo-600">{stats.avgLikes}</p>
                  <p className="mt-1.5 text-[11px] text-gray-400">Average likes count per pin</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Most Liked Pin</p>
                  {stats.mostLikedPin ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md border border-gray-200 shrink-0 bg-gray-100">
                        <img
                          src={stats.mostLikedPin.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">
                          {stats.mostLikedPin.title}
                        </p>
                        <p className="text-xs text-rose-600 flex items-center gap-1 mt-0.5">
                          <Heart size={10} className="fill-rose-500 text-rose-500" />
                          {stats.mostLikedPin.likes} likes
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400 italic">No pins found</p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Uncategorized Pins</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {stats.pinsPerCat["Other"] || stats.pinsPerCat["uncategorized"] || 0}
                  </p>
                  <p className="mt-1.5 text-[11px] text-gray-400">Pins without active categories</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Board Health Status</p>
                  <p className="mt-2 text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Operational
                  </p>
                  <p className="mt-2 text-[11px] text-gray-400">Firebase feeds connected successfully</p>
                </div>
              </div>

              {/* Graphical distribution */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Pins Distribution By Category</h3>
                  <div className="space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-gray-400 text-sm italic">No categories loaded.</p>
                    ) : (
                      categories.map((cat) => {
                        const count = stats.pinsPerCat[cat.name] || 0;
                        const pct = stats.totalPins > 0 ? (count / stats.totalPins) * 100 : 0;
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-gray-600">
                              <span>{cat.name}</span>
                              <span className="tabular-nums">
                                {count} pins ({pct.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Pinterest Integration Notes</h3>
                    <p className="mt-2.5 text-xs leading-5 text-gray-500">
                      The public web client fetches these pins in real time via Firebase sub-contracts. Any modifications
                      you apply in this admin console will immediately propagate to live users viewing `/altpintrest` in their
                      browser.
                    </p>
                    <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Database Node Path</span>
                        <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                          projects/altftool/pintrest
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Database Rules Match</span>
                        <span className="font-mono text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded">
                          /projects/altftool/*
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <a
                      href="http://localhost:3002/altpintrest"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition"
                    >
                      View Public Pinterest Board
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* PIN CREATION / EDITING MODAL                                   */}
      {/* ============================================================== */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingPin ? `Edit Pinterest Pin: ${editingPin.title}` : "Add New Pinterest Pin"}
              </h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              {pinFormError && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
                  {pinFormError}
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label htmlFor="pin-title" className="block text-xs font-semibold text-gray-600">
                  Pin Title
                </label>
                <input
                  id="pin-title"
                  type="text"
                  placeholder="Enter descriptive title for this pin..."
                  value={pinForm.title}
                  onChange={(e) => setPinForm({ ...pinForm, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Image URL with live preview */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <label htmlFor="pin-image" className="block text-xs font-semibold text-gray-600">
                    Image URL
                  </label>
                  <input
                    id="pin-image"
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={pinForm.image}
                    onChange={(e) => setPinForm({ ...pinForm, image: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Provide a valid direct URL. For local mock testing, paths like `/altpintrest-images/...` are supported.
                  </p>
                </div>
                
                {/* Visual Preview panel */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-2 h-28 relative">
                  {pinForm.image ? (
                    <img
                      src={pinForm.image}
                      alt="Preview"
                      className="h-full w-full object-contain rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <ImageIcon size={20} className="mx-auto" />
                      <span className="text-[10px] mt-1 block">Live Preview</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Category & Likes inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="pin-category" className="block text-xs font-semibold text-gray-600">
                    Category Segment
                  </label>
                  <select
                    id="pin-category"
                    value={pinForm.category}
                    onChange={(e) => setPinForm({ ...pinForm, category: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.length === 0 && <option value="Other">Other</option>}
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="pin-likes" className="block text-xs font-semibold text-gray-600">
                    Likes Engagement
                  </label>
                  <input
                    id="pin-likes"
                    type="number"
                    min="0"
                    value={pinForm.likes}
                    onChange={(e) => setPinForm({ ...pinForm, likes: Number(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2.5 border-t border-gray-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPin}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {savingPin && <Loader2 size={14} className="animate-spin" />}
                  Save Pin Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION DIALOG                                     */}
      {/* ============================================================== */}
      {deleteTarget && (
        <DeleteConfirmModal
          title={`Delete ${deleteTarget.type === "pin" ? "Pinterest Pin" : "Board Category"}`}
          description={`Are you sure you want to delete "${deleteTarget.name}"? This action modifies production data immediately on Firebase.`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}