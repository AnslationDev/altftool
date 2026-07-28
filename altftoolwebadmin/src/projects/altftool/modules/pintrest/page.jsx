"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
  UploadCloud,
  Globe,
  CheckCircle2,
} from "lucide-react";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/lib/firebaseStorage";

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
import BulkUploadModal from "./components/BulkUploadModal";
import { EmptyState } from "@/ansets";
import { emitAlert } from "@/lib/alertBus";

export default function PinterestAdmin() {
  const [activeTab, setActiveTab] = useState("pins"); // "pins", "categories", "insights"
  const [pins, setPins] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Bulk upload modal
  const [isBulkOpen, setIsBulkOpen] = useState(false);

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

  // Image upload state (file -> Firebase Storage -> URL)
  const [imageMode, setImageMode] = useState("upload"); // "upload" | "url"
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedName, setUploadedName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Modal / Inline State for Category Form
  const [newCatName, setNewCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Delete Modals
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'pin'|'category', id, name }

  const getPublicBaseUrl = () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
        return "http://localhost:3002";
      }
    }
    return "https://altftool.com";
  };

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

  // Reset the upload widget state
  const resetUploadState = () => {
    setUploading(false);
    setUploadProgress(0);
    setUploadedName("");
    setDragOver(false);
  };

  // Upload a chosen file to Firebase Storage, then store its download URL
  const uploadImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPinFormError("Please choose an image file (JPG, PNG, WebP, GIF).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPinFormError("Image is too large (max 10MB).");
      return;
    }

    setPinFormError("");
    setUploading(true);
    setUploadProgress(0);
    setUploadedName(file.name);

    const path = `projects/altftool/pintrest/${Date.now()}_${file.name.replace(/\s+/g, "-")}`;
    const task = uploadBytesResumable(storageRef(storage, path), file);

    task.on(
      "state_changed",
      (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      (err) => {
        console.error("[pintrest upload] failed:", err);
        setUploading(false);
        setPinFormError(
          err?.code === "storage/unauthorized"
            ? "Storage permission denied. Make sure you are signed in as an active admin."
            : "Upload failed. Please try again."
        );
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          setPinForm((prev) => ({ ...prev, image: url }));
          setUploadProgress(100);
        } catch (err) {
          console.error("[pintrest upload] url error:", err);
          setPinFormError("Could not finalize the upload. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    );
  };

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
    setImageMode("upload");
    resetUploadState();
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
    setImageMode(pin.image ? "url" : "upload");
    resetUploadState();
    setIsPinModalOpen(true);
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    setPinFormError("");

    if (uploading) {
      setPinFormError("Please wait for the image upload to finish.");
      return;
    }
    if (!pinForm.title.trim()) {
      setPinFormError("Title is required.");
      return;
    }
    if (!pinForm.image.trim()) {
      setPinFormError("Please upload an image or paste an image URL.");
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
        emitAlert({ type: "success", message: "Pin updated successfully!" });
      } else {
        await addPin({
          title: pinForm.title.trim(),
          image: pinForm.image.trim(),
          category: pinForm.category,
          likes: Number(pinForm.likes) || 0,
        });
        emitAlert({ type: "success", message: "New pin added successfully!" });
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
        emitAlert({ type: "error", message: "Category already exists!" });
        setSavingCategory(false);
        return;
      }

      await addCategory(newCatName.trim());
      setNewCatName("");
      emitAlert({ type: "success", message: "Category created successfully!" });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Could not create category." });
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
      emitAlert({ type: "success", message: "Category updated successfully!" });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Could not update category." });
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
        emitAlert({ type: "success", message: "Pin deleted successfully." });
      } else if (deleteTarget.type === "category") {
        await deleteCategory(deleteTarget.id);
        emitAlert({ type: "success", message: "Category deleted successfully." });
      }
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: `Could not delete ${deleteTarget.type}.` });
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <AdminDataState
          title="Loading Pinterest board data"
          message="Subscribing to real-time pins and category feeds from Firestore."
        >
          <div className="mt-6 flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-[var(--muted)]" />
          </div>
        </AdminDataState>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-6">
        <AdminDataState
          type="error"
          title="Pinterest Board connection error"
          message={error}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">

        {/* Dashboard Header */}
        <header className="border-b border-[var(--border)] pb-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--primary)]">
                  Altftool Board
                </p>
                <span className="flex items-center gap-1 text-[10px] bg-[var(--primary-soft)] text-[var(--primary)] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  <Sparkles size={8} /> Realtime
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-semibold text-[var(--foreground)]">
                Manage Pinterest Pins & Board
              </h1>
              <p className="mt-1.5 text-sm text-[var(--muted)]">
                Create new pins, organize categories, and track engagement numbers for /altpintrest.
              </p>
            </div>

            {/* Quick Metrics Header Cards */}
            <div className="flex gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">Pins</p>
                <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{stats.totalPins}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">Categories</p>
                <p className="mt-0.5 text-xl font-bold text-[var(--foreground)]">{stats.totalCategories}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 shadow-sm text-center min-w-[90px]">
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase">Total Likes</p>
                <p className="mt-0.5 text-xl font-bold text-[var(--foreground)] flex items-center justify-center gap-1">
                  <Heart size={14} className="fill-[var(--primary)] text-[var(--primary)]" />
                  {stats.totalLikes}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Selection */}
        <div className="border-b border-[var(--border)]">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("pins")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "pins"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              }`}
            >
              <ImageIcon size={16} />
              Pins Management
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "categories"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              }`}
            >
              <Tag size={16} />
              Categories Board
            </button>

            <button
              onClick={() => setActiveTab("insights")}
              className={`flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                activeTab === "insights"
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
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
                  <div className="relative flex-1 bg-[var(--surface)] rounded-lg border border-[var(--border)] focus-within:[box-shadow:var(--focus-ring)] focus-within:border-[var(--primary)] shadow-sm flex items-center px-3">
                    <Search size={16} className="text-[var(--muted)] mr-2 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search pins title, categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-2.5 w-full bg-transparent border-none outline-none text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-[var(--muted)] hover:text-[var(--foreground)] ml-2">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)] shadow-sm"
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsBulkOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--primary)] shadow-sm hover:bg-[var(--primary-soft)] transition"
                  >
                    <UploadCloud size={16} />
                    Bulk Upload
                  </button>
                  <button
                    type="button"
                    onClick={openAddPinModal}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)] transition"
                  >
                    <Plus size={16} />
                    Add New Pin
                  </button>
                </div>
              </div>

              {/* Pins Table / Grid */}
              {filteredPins.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)]">
                  <EmptyState
                    icon={ImageIcon}
                    title="No pins found"
                    description={
                      pins.length === 0
                        ? "Create your first Pinterest pin to display it on the public site."
                        : "Try adjusting your search criteria or category filter."
                    }
                    action={
                      pins.length === 0 ? (
                        <button
                          onClick={openAddPinModal}
                          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-3 py-2 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                        >
                          <Plus size={14} /> Add Pin
                        </button>
                      ) : null
                    }
                  />
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                      <thead className="bg-[var(--surface-soft)] border-b border-[var(--border)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                        <tr>
                          <th className="px-6 py-4">Pin Preview</th>
                          <th className="px-6 py-4">Pin Details</th>
                          <th className="px-6 py-4">Category</th>
                          <th className="px-6 py-4">Likes</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {filteredPins.map((pin) => (
                          <tr key={pin.id} className="hover:bg-[var(--surface-soft)] transition">
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm shrink-0">
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
                              <p className="font-semibold text-[var(--foreground)] line-clamp-1">{pin.title}</p>
                              <p className="mt-1 text-[11px] text-[var(--muted)] font-mono select-all truncate max-w-xs">
                                {pin.image}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-soft)] px-2.5 py-1 text-xs font-medium text-[var(--primary)]">
                                <Tag size={10} />
                                {pin.category || "Other"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex items-center gap-1.5 text-[var(--foreground)] font-medium">
                                <Heart size={14} className="fill-[var(--danger)] text-[var(--danger)]" />
                                {pin.likes || 0}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <a
                                  href={pin.image}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition"
                                  title="Open Original Image"
                                >
                                  <ExternalLink size={14} />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => openEditPinModal(pin)}
                                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] transition"
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
                                  className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] transition"
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
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4 self-start">
                <h3 className="text-sm font-semibold text-[var(--foreground)]">Add New Category</h3>
                <form onSubmit={handleAddCategory} className="space-y-3">
                  <div>
                    <label htmlFor="cat-name" className="block text-xs font-medium text-[var(--muted)] mb-1.5">
                      Category Name
                    </label>
                    <input
                      id="cat-name"
                      type="text"
                      placeholder="e.g. Design, UI Image, Prompts"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingCategory || !newCatName.trim()}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm hover:bg-[var(--primary-hover)] transition disabled:opacity-50"
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
              <div className="md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
                <div className="bg-[var(--surface-soft)] border-b border-[var(--border)] px-5 py-4">
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Active Pinterest Board Categories</h3>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {categories.length === 0 ? (
                    <EmptyState icon={Tag} title="No categories registered yet." />
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-[var(--surface-soft)] transition"
                      >
                        {editingCatId === cat.id ? (
                          <div className="flex gap-2 w-full">
                            <input
                              type="text"
                              value={editingCatName}
                              onChange={(e) => setEditingCatName(e.target.value)}
                              className="flex-1 rounded-lg border border-[var(--primary)] px-3 py-1.5 text-sm focus:outline-none focus:[box-shadow:var(--focus-ring)]"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateCategory(cat.id)}
                              disabled={savingCategory || !editingCatName.trim()}
                              className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditCategory}
                              className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
                                <Tag size={14} />
                              </span>
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">{cat.name}</p>
                                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                                  {stats.pinsPerCat[cat.name] || 0} pins associated
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleStartEditCategory(cat)}
                                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-soft)] transition"
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
                                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger-text)] transition"
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
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Average Pins Engagement</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--primary)]">{stats.avgLikes}</p>
                  <p className="mt-1.5 text-[11px] text-[var(--muted)]">Average likes count per pin</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Most Liked Pin</p>
                  {stats.mostLikedPin ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md border border-[var(--border)] shrink-0 bg-[var(--surface-soft)]">
                        <img
                          src={stats.mostLikedPin.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[var(--foreground)] truncate max-w-[150px]">
                          {stats.mostLikedPin.title}
                        </p>
                        <p className="text-xs text-[var(--danger)] flex items-center gap-1 mt-0.5">
                          <Heart size={10} className="fill-[var(--danger)] text-[var(--danger)]" />
                          {stats.mostLikedPin.likes} likes
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-[var(--muted)] italic">No pins found</p>
                  )}
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Uncategorized Pins</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
                    {stats.pinsPerCat["Other"] || stats.pinsPerCat["uncategorized"] || 0}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[var(--muted)]">Pins without active categories</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Board Health Status</p>
                  <p className="mt-2 text-lg font-bold text-[var(--success-text)] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[var(--success)] animate-ping" />
                    Operational
                  </p>
                  <p className="mt-2 text-[11px] text-[var(--muted)]">Firebase feeds connected successfully</p>
                </div>
              </div>

              {/* Graphical distribution */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-[var(--foreground)] mb-4">Pins Distribution By Category</h3>
                  <div className="space-y-3">
                    {categories.length === 0 ? (
                      <p className="text-[var(--muted)] text-sm italic">No categories loaded.</p>
                    ) : (
                      categories.map((cat) => {
                        const count = stats.pinsPerCat[cat.name] || 0;
                        const pct = stats.totalPins > 0 ? (count / stats.totalPins) * 100 : 0;
                        return (
                          <div key={cat.id} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-[var(--muted)]">
                              <span>{cat.name}</span>
                              <span className="tabular-nums">
                                {count} pins ({pct.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="h-2 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--foreground)]">Pinterest Integration Notes</h3>
                    <p className="mt-2.5 text-xs leading-5 text-[var(--muted)]">
                      The public web client fetches these pins in real time via Firebase sub-contracts. Any modifications
                      you apply in this admin console will immediately propagate to live users viewing `/altpintrest` in their
                      browser.
                    </p>
                    <div className="mt-4 border-t border-[var(--border)] pt-4 space-y-2">
                      <div className="flex justify-between text-xs text-[var(--muted)]">
                        <span>Database Node Path</span>
                        <span className="font-mono text-[var(--muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded">
                          projects/altftool/pintrest
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-[var(--muted)]">
                        <span>Database Rules Match</span>
                        <span className="font-mono text-[var(--muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded">
                          /projects/altftool/*
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <a
                      href={`${getPublicBaseUrl()}/altpintrest`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--foreground)] shadow-sm hover:bg-[var(--surface-soft)] transition"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)] backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-base font-bold text-[var(--foreground)]">
                {editingPin ? `Edit Pinterest Pin: ${editingPin.title}` : "Add New Pinterest Pin"}
              </h3>
              <button
                onClick={() => setIsPinModalOpen(false)}
                className="text-[var(--muted)] hover:text-[var(--foreground)] rounded-lg p-1 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              {pinFormError && (
                <div className="rounded-lg bg-[var(--warning-soft)] p-3 text-xs text-[var(--warning-text)] border border-[var(--warning)]/30">
                  {pinFormError}
                </div>
              )}

              {/* Title input */}
              <div className="space-y-1.5">
                <label htmlFor="pin-title" className="block text-xs font-semibold text-[var(--muted)]">
                  Pin Title
                </label>
                <input
                  id="pin-title"
                  type="text"
                  placeholder="Enter descriptive title for this pin..."
                  value={pinForm.title}
                  onChange={(e) => setPinForm({ ...pinForm, title: e.target.value })}
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
                  required
                />
              </div>

              {/* Pin Image — upload to Storage OR paste a URL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[var(--muted)]">Pin Image</label>
                  <div className="flex gap-1 p-0.5 bg-[var(--surface-soft)] rounded-lg">
                    {[
                      { id: "upload", label: "Upload File", icon: UploadCloud },
                      { id: "url", label: "Paste URL", icon: Globe },
                    ].map((m) => {
                      const MIcon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setImageMode(m.id)}
                          disabled={uploading}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                            imageMode === m.id ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--foreground)]"
                          } disabled:opacity-50`}
                        >
                          <MIcon size={13} /> {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {imageMode === "upload" ? (
                  <>
                    {!pinForm.image && !uploading && (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadImageFile(e.dataTransfer.files[0]); }}
                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
                          dragOver ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-soft)]"
                        }`}
                      >
                        <div className={`grid h-11 w-11 place-items-center rounded-xl transition ${dragOver ? "bg-[var(--primary-soft)]" : "bg-[var(--surface-soft)]"}`}>
                          <UploadCloud size={20} className={dragOver ? "text-[var(--primary)]" : "text-[var(--muted)]"} />
                        </div>
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          Drop image here or <span className="text-[var(--primary)]">browse</span>
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">JPG, PNG, WebP, GIF · max 10MB</p>
                      </div>
                    )}

                    {uploading && (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-[var(--primary)]">
                          <span className="flex items-center gap-2 truncate">
                            <Loader2 size={12} className="animate-spin shrink-0" /> Uploading {uploadedName}
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                          <div className="h-full rounded-full bg-[var(--primary)] transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}

                    {pinForm.image && !uploading && (
                      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                        <div className="relative h-40 bg-[var(--surface-soft)]">
                          <img src={pinForm.image} alt="Preview" className="h-full w-full object-contain" onError={(e) => { e.target.style.opacity = "0.3"; }} />
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                          <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--success-text)]">
                            <CheckCircle2 size={14} /> Image ready
                          </span>
                          <button
                            type="button"
                            onClick={() => { setPinForm((p) => ({ ...p, image: "" })); resetUploadState(); fileInputRef.current?.click(); }}
                            className="rounded-lg border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                          >
                            Replace
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { uploadImageFile(e.target.files[0]); e.target.value = ""; }}
                    />
                  </>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2 space-y-1.5">
                      <input
                        id="pin-image"
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={pinForm.image}
                        onChange={(e) => setPinForm({ ...pinForm, image: e.target.value })}
                        className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
                      />
                      <p className="text-[10px] text-[var(--muted)] leading-normal">
                        Paste a direct image URL. Local paths like `/altpintrest-images/...` also work.
                      </p>
                    </div>
                    <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-2">
                      {pinForm.image ? (
                        <img src={pinForm.image} alt="Preview" className="h-full w-full object-contain rounded" onError={(e) => { e.target.style.display = "none"; }} />
                      ) : (
                        <div className="text-center text-[var(--muted)]">
                          <ImageIcon size={20} className="mx-auto" />
                          <span className="mt-1 block text-[10px]">Live Preview</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Category & Likes inputs */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="pin-category" className="block text-xs font-semibold text-[var(--muted)]">
                    Category Segment
                  </label>
                  <select
                    id="pin-category"
                    value={pinForm.category}
                    onChange={(e) => setPinForm({ ...pinForm, category: e.target.value })}
                    className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
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
                  <label htmlFor="pin-likes" className="block text-xs font-semibold text-[var(--muted)]">
                    Likes Engagement
                  </label>
                  <input
                    id="pin-likes"
                    type="number"
                    min="0"
                    value={pinForm.likes}
                    onChange={(e) => setPinForm({ ...pinForm, likes: Number(e.target.value) || 0 })}
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none focus:[box-shadow:var(--focus-ring)]"
                  />
                </div>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-2.5 border-t border-[var(--border)] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="rounded-lg border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingPin || uploading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition disabled:opacity-50"
                >
                  {(savingPin || uploading) && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? "Uploading…" : "Save Pin Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BULK IMAGE UPLOAD MODAL                                        */}
      {/* ============================================================== */}
      {isBulkOpen && (
        <BulkUploadModal
          categories={categories}
          defaultCategory={selectedCategory !== "All" ? selectedCategory : undefined}
          onClose={() => setIsBulkOpen(false)}
          onUploaded={(count) =>
            emitAlert({ type: "success", message: `${count} image${count > 1 ? "s" : ""} uploaded as pins.` })
          }
        />
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