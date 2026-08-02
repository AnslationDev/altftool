"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Gift, Wallet, Plus, Trash2, Edit2, X, Check, PieChart as PieChartIcon,
  AlertCircle, Search, Filter, Download, Printer, Calendar, Clock,
  ArrowUpDown, CheckCircle, Package, Truck, XCircle
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from "recharts";
import toast, { Toaster } from "react-hot-toast";

const generateId = () => Math.random().toString(36).substr(2, 9);

// Parses a "YYYY-MM-DD" string (as produced by <input type="date">) into a
// local-midnight Date instead of letting `new Date(string)` treat it as UTC
// midnight, which silently shifts the calendar date by a day in timezones
// west of UTC and skews day-diff math in timezones east of UTC.
const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const STATUSES = ["Planned", "Purchased", "Wrapped", "Shipped", "Delivered", "Cancelled"];
const PRIORITIES = ["High", "Medium", "Low"];
const CATEGORIES = ["Electronics", "Clothing", "Toys", "Books", "Gift Card", "Experience", "Other"];

const STATUS_COLORS = {
  "Planned": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  "Purchased": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "Wrapped": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Shipped": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Delivered": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Cancelled": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const CHART_COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b', '#ec4899'];

export default function GiftBudgetTracker() {
  // State
  const [totalBudget, setTotalBudget] = useState(1000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(1000);

  const [gifts, setGifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  // Filters & Search & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [occasionFilter, setOccasionFilter] = useState("All");
  const [sortBy, setSortBy] = useState("recentlyAdded"); // recentlyAdded, highestSpending, upcomingDelivery, alphabetical

  // Form State
  const [formData, setFormData] = useState({
    giftName: "",
    recipientName: "",
    occasion: "",
    budgetAmount: "",
    actualSpendingAmount: "",
    purchaseDate: "",
    deliveryDate: "",
    category: "Other",
    priority: "Medium",
    status: "Planned",
    notes: "",
    timelineNotes: []
  });

  const [newTimelineNote, setNewTimelineNote] = useState("");

  // Load from local storage
  useEffect(() => {
    const savedBudget = localStorage.getItem("giftBudgetTracker_budget_v2");
    const savedGifts = localStorage.getItem("giftBudgetTracker_gifts_v2");

    if (savedBudget) {
      setTotalBudget(Number(savedBudget));
      setTempBudget(Number(savedBudget));
    }
    if (savedGifts) {
      try {
        setGifts(JSON.parse(savedGifts));
      } catch (e) {
        console.error("Failed to parse gifts from local storage");
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("giftBudgetTracker_budget_v2", totalBudget.toString());
    localStorage.setItem("giftBudgetTracker_gifts_v2", JSON.stringify(gifts));
  }, [totalBudget, gifts]);

  // Derived State
  const { totalPlanned, totalActual, remainingBudget, completedGifts, pendingGifts, upcomingDeliveries } = useMemo(() => {
    let planned = 0;
    let actual = 0;
    let completed = 0;
    let pending = 0;
    let upcoming = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    gifts.forEach(g => {
      planned += (Number(g.budgetAmount) || 0);
      actual += (Number(g.actualSpendingAmount) || 0);

      if (g.status === "Delivered") {
        completed++;
      } else if (g.status !== "Cancelled") {
        pending++;

        if (g.deliveryDate) {
          const dDate = parseLocalDate(g.deliveryDate);
          const diffTime = dDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 7) {
            upcoming++;
          }
        }
      }
    });

    const remaining = totalBudget - actual;
    return {
      totalPlanned: planned,
      totalActual: actual,
      remainingBudget: remaining,
      completedGifts: completed,
      pendingGifts: pending,
      upcomingDeliveries: upcoming
    };
  }, [gifts, totalBudget]);

  const budgetPercentage = Math.min((totalActual / totalBudget) * 100, 100) || 0;
  const isOverBudget = remainingBudget < 0;
  const isWarningBudget = remainingBudget >= 0 && budgetPercentage >= 90;

  // Options for filters
  const occasionsList = ["All", ...Array.from(new Set(gifts.map(g => g.occasion).filter(Boolean)))];

  // Filtering & Sorting
  const filteredAndSortedGifts = useMemo(() => {
    let result = [...gifts];

    // Search
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(g =>
        (g.recipientName || "").toLowerCase().includes(lowerQ) ||
        (g.giftName || "").toLowerCase().includes(lowerQ) ||
        (g.occasion || "").toLowerCase().includes(lowerQ)
      );
    }

    // Filters
    if (statusFilter !== "All") result = result.filter(g => g.status === statusFilter);
    if (priorityFilter !== "All") result = result.filter(g => g.priority === priorityFilter);
    if (occasionFilter !== "All") result = result.filter(g => g.occasion === occasionFilter);

    // Sort
    result.sort((a, b) => {
      if (sortBy === "highestSpending") return (Number(b.actualSpendingAmount) || 0) - (Number(a.actualSpendingAmount) || 0);
      if (sortBy === "upcomingDelivery") {
        if (!a.deliveryDate) return 1;
        if (!b.deliveryDate) return -1;
        return parseLocalDate(a.deliveryDate) - parseLocalDate(b.deliveryDate);
      }
      if (sortBy === "alphabetical") return (a.recipientName || "").localeCompare(b.recipientName || "");
      // recentlyAdded (assuming id generation implies order roughly, or just order in array which is natural, we'll just reverse)
      // Since we push to end, reverse array gives recently added if we assume array order.
      return 0; // Handled by reversing after if recentlyAdded
    });

    if (sortBy === "recentlyAdded") {
      result.reverse();
    }

    return result;
  }, [gifts, searchQuery, statusFilter, priorityFilter, occasionFilter, sortBy]);


  // Chart Data
  const occasionChartData = useMemo(() => {
    const dataMap = {};
    gifts.forEach(g => {
      const occ = g.occasion || "Uncategorized";
      if (!dataMap[occ]) dataMap[occ] = 0;
      dataMap[occ] += (Number(g.actualSpendingAmount) || 0);
    });
    return Object.keys(dataMap).map(key => ({ name: key, value: dataMap[key] }));
  }, [gifts]);

  const categoryChartData = useMemo(() => {
    const dataMap = {};
    gifts.forEach(g => {
      const cat = g.category || "Other";
      if (!dataMap[cat]) dataMap[cat] = 0;
      dataMap[cat] += (Number(g.actualSpendingAmount) || 0);
    });
    return Object.keys(dataMap).map(key => ({ name: key, value: dataMap[key] })).filter(d => d.value > 0);
  }, [gifts]);


  // Handlers
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    setTotalBudget(Number(tempBudget));
    setIsEditingBudget(false);
    toast.success("Budget updated");
  };

  const handleCloseBudgetModal = () => {
    setIsEditingBudget(false);
  };

  const handleOpenModal = (gift = null) => {
    if (gift) {
      setEditingGift(gift);
      setFormData({
        giftName: gift.giftName || "",
        recipientName: gift.recipientName || "",
        occasion: gift.occasion || "",
        budgetAmount: gift.budgetAmount == null ? "" : String(gift.budgetAmount),
        actualSpendingAmount: gift.actualSpendingAmount == null ? "" : String(gift.actualSpendingAmount),
        purchaseDate: gift.purchaseDate || "",
        deliveryDate: gift.deliveryDate || "",
        category: gift.category || "Other",
        priority: gift.priority || "Medium",
        status: gift.status || "Planned",
        notes: gift.notes || "",
        timelineNotes: gift.timelineNotes || []
      });
    } else {
      setEditingGift(null);
      setFormData({
        giftName: "", recipientName: "", occasion: "", budgetAmount: "",
        actualSpendingAmount: "", purchaseDate: "", deliveryDate: "",
        category: "Other", priority: "Medium", status: "Planned", notes: "", timelineNotes: []
      });
    }
    setNewTimelineNote("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGift(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTimelineNote = () => {
    if (!newTimelineNote.trim()) return;
    const dateStr = new Date().toLocaleString();
    setFormData(prev => ({
      ...prev,
      timelineNotes: [...prev.timelineNotes, { date: dateStr, note: newTimelineNote.trim() }]
    }));
    setNewTimelineNote("");
  };

  const handleDeleteTimelineNote = (index) => {
    setFormData(prev => ({
      ...prev,
      timelineNotes: prev.timelineNotes.filter((_, i) => i !== index)
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.recipientName || !formData.giftName || !formData.budgetAmount) return;

    const newGift = {
      id: editingGift ? editingGift.id : generateId(),
      ...formData,
      budgetAmount: Number(formData.budgetAmount),
      actualSpendingAmount: formData.actualSpendingAmount ? Number(formData.actualSpendingAmount) : 0,
    };

    if (editingGift) {
      setGifts((prev) => prev.map((g) => (g.id === editingGift.id ? newGift : g)));
      toast.success("Gift updated successfully");
    } else {
      setGifts((prev) => [...prev, newGift]);
      toast.success("Gift added successfully");
    }

    handleCloseModal();
  };

  const handleDeleteGift = (id) => {
    if(window.confirm("Are you sure you want to delete this gift?")) {
      setGifts((prev) => prev.filter((g) => g.id !== id));
      toast.success("Gift deleted");
    }
  };

  const exportCSV = () => {
    if(gifts.length === 0) {
      toast.error("No gifts to export");
      return;
    }
    const headers = ["Recipient", "Gift Name", "Occasion", "Category", "Priority", "Status", "Budget ($)", "Actual Spent ($)", "Purchase Date", "Delivery Date"];
    const escapeCSVValue = (value) => {
      let str = String(value ?? "");
      // Neutralize formula-trigger characters so a name/notes value like
      // `=HYPERLINK(...)` doesn't execute as a live formula when the CSV
      // is opened in Excel/Sheets (CSV/Formula Injection, CWE-1236).
      if (/^[=+\-@]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };
    const rows = gifts.map(g => [
      escapeCSVValue(g.recipientName),
      escapeCSVValue(g.giftName),
      escapeCSVValue(g.occasion),
      escapeCSVValue(g.category),
      escapeCSVValue(g.priority),
      escapeCSVValue(g.status),
      Number(g.budgetAmount) || 0,
      Number(g.actualSpendingAmount) || 0,
      escapeCSVValue(g.purchaseDate),
      escapeCSVValue(g.deliveryDate)
    ]);

    const csvContent = "\uFEFF"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    try {
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "gift_budget_tracker_export.csv";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Exported CSV successfully");
    } catch (error) {
      console.error("Failed to export CSV", error);
      toast.error("CSV export failed. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-7xl space-y-8 animate-fade-up print:max-w-full">
      <Toaster position="top-right" />

      {/* Header & Dashboard */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-lg print:border-none print:shadow-none">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.4fr_0.9fr] lg:p-8">
          <div className="space-y-5">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-lg shadow-[var(--primary)]/10">
              <Gift className="w-6 h-6 text-[var(--primary)]" />
            </div>
            <div>
              <h1 className="heading text-[var(--foreground)]">
                Gift Budget Tracker
              </h1>
              <p className="description mt-4 max-w-2xl text-[var(--muted-foreground)]">
                Track gift spending, manage budgets per recipient, and keep delivery details organized in one polished dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.12em]">
                  Total Budget
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--card-foreground)]">
                  ${totalBudget.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setTempBudget(totalBudget);
                  setIsEditingBudget(true);
                }}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
                aria-label="Edit Budget"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            </div>
            <p className="description text-[var(--muted-foreground)]">
              Update your total gift fund any time so the dashboard reflects the latest spending plan.
            </p>
            <div className="rounded-2xl bg-[var(--card)] p-4 border border-[var(--border)]">
              <div className="flex items-center justify-between gap-3 text-sm text-[var(--muted-foreground)]">
                <span>Used</span>
                <span>{budgetPercentage.toFixed(1)}%</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--muted)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget
                      ? "bg-red-500"
                      : isWarningBudget
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                <span>${totalActual.toLocaleString()} spent</span>
                <span>${remainingBudget.toLocaleString()} remaining</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span>${totalPlanned.toLocaleString()} planned across all gifts</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--background)] px-5 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-[var(--card)] p-5 border border-[var(--border)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-[var(--muted-foreground)]">Remaining Budget</p>
              <p className={`mt-3 text-2xl font-semibold ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                ${remainingBudget.toLocaleString()}
              </p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] p-5 border border-[var(--border)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-[var(--muted-foreground)]">Total Gifts</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--card-foreground)]">{gifts.length}</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] p-5 border border-[var(--border)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-[var(--muted-foreground)]">Completed</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--card-foreground)]">{completedGifts}</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] p-5 border border-[var(--border)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-[var(--muted-foreground)]">Pending</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--card-foreground)]">{pendingGifts}</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] p-5 border border-[var(--border)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-sm text-[var(--muted-foreground)]">Due ≤ 7d</p>
              <p className="mt-3 text-2xl font-semibold text-[var(--card-foreground)]">{upcomingDeliveries}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* Smart Alerts */}
        {isOverBudget && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-700 dark:text-red-400 text-sm">Budget Exceeded!</h4>
              <p className="text-red-600 dark:text-red-300 text-sm mt-1">You have spent ${Math.abs(remainingBudget).toLocaleString()} more than your total budget.</p>
            </div>
          </div>
        )}
        {isWarningBudget && !isOverBudget && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm dark:border-amber-900/50 dark:bg-amber-900/20">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-700 dark:text-amber-400 text-sm">Approaching Budget Limit</h4>
              <p className="text-amber-600 dark:text-amber-300 text-sm mt-1">You have used {budgetPercentage.toFixed(1)}% of your budget. Only ${remainingBudget.toLocaleString()} left.</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-2">
             <div className={`p-3 rounded-lg ${
              isOverBudget
                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
            }`}>
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Remaining Budget</p>
              <p className={`text-xl font-bold ${isOverBudget ? 'text-red-500' : 'text-emerald-500'}`}>
                ${remainingBudget.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Total Gifts</p>
              <p className="text-lg font-bold text-[var(--card-foreground)]">{gifts.length}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Completed</p>
              <p className="text-lg font-bold text-[var(--card-foreground)]">{completedGifts}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Pending</p>
              <p className="text-lg font-bold text-[var(--card-foreground)]">{pendingGifts}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)]">Due {'<='}7d</p>
              <p className="text-lg font-bold text-[var(--card-foreground)]">{upcomingDeliveries}</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span className="flex flex-wrap items-center gap-2 text-[var(--muted-foreground)]">
              Budget Usage
              <span className="font-medium text-[var(--card-foreground)]">
                ${totalActual.toLocaleString()} / ${totalBudget.toLocaleString()}
              </span>
            </span>
            <span className="font-medium text-[var(--card-foreground)]">
              {budgetPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[var(--muted)] rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-red-500"
                  : isWarningBudget
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
            >
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      {gifts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
           <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
              <h3 className="subheading mb-6 flex items-center gap-2 text-[var(--card-foreground)]">
                <PieChartIcon className="w-5 h-5 text-rose-500" />
                Spending by Category
              </h3>
              <div className="h-64">
                {categoryChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `$${value}`} contentStyle={{ borderRadius: '8px', backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
                    No actual spending data yet.
                  </div>
                )}
              </div>
           </div>

           <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
              <h3 className="subheading mb-6 flex items-center gap-2 text-[var(--card-foreground)]">
                <PieChartIcon className="w-5 h-5 text-rose-500" />
                Occasion-wise Expenses
              </h3>
              <div className="h-64">
                {occasionChartData.some(d => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={occasionChartData.filter(d => d.value > 0)}>
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                      <RechartsTooltip formatter={(value) => `$${value}`} cursor={{fill: 'var(--muted)'}} contentStyle={{ borderRadius: '8px', backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)' }} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--muted-foreground)]">
                    No actual spending data yet.
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Gift List Section */}
      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-lg">
        <div className="flex flex-col gap-4 border-b border-[var(--border)] p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="subheading text-[var(--card-foreground)]">
              Gift List ({filteredAndSortedGifts.length})
            </h2>
            <p className="description mt-2 text-[var(--muted-foreground)]">
              Filter, sort, and manage gift plans from one clean dashboard.
            </p>
          </div>
            <div className="flex flex-wrap items-center gap-3 print:hidden">
              <button
                type="button"
                onClick={exportCSV}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--card-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-medium text-[var(--card-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-md"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                type="button"
                onClick={() => handleOpenModal()}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
              >
                <Plus className="w-4 h-4" />
                Add Gift
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid grid-cols-1 gap-3 border-b border-[var(--border)] bg-[var(--background)] p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5 print:hidden">
            <div className="relative col-span-1 sm:col-span-2 lg:col-span-2">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search recipient, gift, occasion..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] pl-11 pr-4 text-sm text-[var(--card-foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] pl-4 pr-9 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="All">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={occasionFilter}
                onChange={(e) => setOccasionFilter(e.target.value)}
                aria-label="Filter by occasion"
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] pl-4 pr-9 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                {occasionsList.map(o => <option key={o} value={o}>{o === 'All' ? 'All Occasions' : o}</option>)}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort gifts by"
                className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--card)] pl-4 pr-9 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="recentlyAdded">Recently Added</option>
                <option value="highestSpending">Highest Spending</option>
                <option value="upcomingDelivery">Upcoming Delivery</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>

        {gifts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-[var(--muted-foreground)] opacity-50" />
            </div>
            <h3 className="text-lg font-medium text-[var(--card-foreground)] mb-1">
              No gifts added yet
            </h3>
            <p className="text-[var(--muted-foreground)] max-w-sm mx-auto">
              Start by adding your first gift to track budget and delivery status.
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-6 inline-flex h-11 items-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--card-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] print:hidden"
            >
              Add Your First Gift
            </button>
          </div>
        ) : filteredAndSortedGifts.length === 0 ? (
          <div className="p-12 text-center text-[var(--muted-foreground)]">
            No gifts match your current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium">Recipient / Gift</th>
                  <th className="px-4 py-3 font-medium">Status / Dates</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Actual</th>
                  <th className="px-4 py-3 font-medium text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredAndSortedGifts.map((gift) => {
                  const variance = (Number(gift.budgetAmount) || 0) - (Number(gift.actualSpendingAmount) || 0);
                  const isOver = variance < 0;

                  return (
                    <tr key={gift.id} className="transition-colors hover:bg-[var(--muted)]/40">
                      <td className="px-4 py-4">
                        <div className="font-bold text-[var(--card-foreground)]">
                          {gift.recipientName}
                        </div>
                        <div className="text-sm font-medium text-rose-600 dark:text-rose-400">
                          {gift.giftName}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
                          <span className="rounded-lg bg-[var(--muted)] px-2 py-1">{gift.occasion || 'General'}</span>
                          {gift.priority === 'High' && <span className="text-red-500 font-medium">★ High Priority</span>}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mb-1.5 ${STATUS_COLORS[gift.status] || STATUS_COLORS['Planned']}`}>
                          {gift.status}
                        </div>
                        {gift.deliveryDate && (
                          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <Truck className="w-3 h-3" /> {parseLocalDate(gift.deliveryDate).toLocaleDateString()}
                          </div>
                        )}
                        {!gift.deliveryDate && gift.purchaseDate && (
                           <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {parseLocalDate(gift.purchaseDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-[var(--card-foreground)] font-medium">
                        ${Number(gift.budgetAmount).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-[var(--card-foreground)]">
                          ${gift.actualSpendingAmount ? Number(gift.actualSpendingAmount).toLocaleString() : "0"}
                        </div>
                        {gift.actualSpendingAmount ? (
                           <span className={`text-xs font-medium ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isOver ? '-' : '+'}${Math.abs(variance).toLocaleString()}
                          </span>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(gift)}
                            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-900/20"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGift(gift.id)}
                            className="rounded-lg p-2 text-[var(--muted-foreground)] transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm animate-fade-up sm:p-6 print:hidden">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl border-b border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:px-6">
              <h3 className="subheading text-[var(--card-foreground)]">
                {editingGift ? "Edit Gift Details" : "Add New Gift"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 p-5 sm:p-6 lg:p-8">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Core Info */}
                <div className="space-y-5">
                  <h4 className="subheading border-b border-[var(--border)] pb-3 text-[var(--card-foreground)]">General Info</h4>

                  <div>
                    <label htmlFor="gift-recipientName" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                      Recipient Name *
                    </label>
                    <input
                      id="gift-recipientName"
                      type="text"
                      name="recipientName"
                      value={formData.recipientName}
                      onChange={handleFormChange}
                      placeholder="e.g. Jane Doe"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="gift-giftName" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                      Gift Name *
                    </label>
                    <input
                      id="gift-giftName"
                      type="text"
                      name="giftName"
                      value={formData.giftName}
                      onChange={handleFormChange}
                      placeholder="e.g. Wireless Headphones"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gift-budgetAmount" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                        Budget ($) *
                      </label>
                      <input
                        id="gift-budgetAmount"
                        type="number"
                        name="budgetAmount"
                        value={formData.budgetAmount}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="gift-actualSpendingAmount" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                        Actual ($)
                      </label>
                      <input
                        id="gift-actualSpendingAmount"
                        type="number"
                        name="actualSpendingAmount"
                        value={formData.actualSpendingAmount}
                        onChange={handleFormChange}
                        min="0"
                        step="0.01"
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                     <div>
                      <label htmlFor="gift-occasion" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Occasion</label>
                      <input
                        id="gift-occasion"
                        type="text"
                        name="occasion"
                        value={formData.occasion}
                        onChange={handleFormChange}
                        placeholder="e.g. Birthday"
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                    <div>
                      <label htmlFor="gift-category" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Category</label>
                      <select
                        id="gift-category"
                        name="category"
                        value={formData.category}
                        onChange={handleFormChange}
                        className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tracking Info */}
                <div className="space-y-5">
                  <h4 className="subheading border-b border-[var(--border)] pb-3 text-[var(--card-foreground)]">Tracking & Dates</h4>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gift-status" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Status</label>
                      <select
                        id="gift-status"
                        name="status"
                        value={formData.status}
                        onChange={handleFormChange}
                        className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="gift-priority" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Priority</label>
                      <select
                        id="gift-priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleFormChange}
                        className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="gift-purchaseDate" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Purchase Date</label>
                      <input
                        id="gift-purchaseDate"
                        type="date"
                        name="purchaseDate"
                        value={formData.purchaseDate}
                        onChange={handleFormChange}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] [color-scheme:light] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:opacity-80 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                    <div>
                      <label htmlFor="gift-deliveryDate" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">Delivery Date</label>
                      <input
                        id="gift-deliveryDate"
                        type="date"
                        name="deliveryDate"
                        value={formData.deliveryDate}
                        onChange={handleFormChange}
                        className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] [color-scheme:light] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] dark:[color-scheme:dark] dark:[&::-webkit-calendar-picker-indicator]:opacity-80 dark:[&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="gift-notes" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">General Notes</label>
                    <textarea
                      id="gift-notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleFormChange}
                      rows="2"
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Progress Notes / Timeline */}
              <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-5">
                <h4 className="subheading mb-4 text-[var(--card-foreground)]">Progress Timeline Notes</h4>

                <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                  {formData.timelineNotes.length === 0 ? (
                    <p className="text-xs text-[var(--muted-foreground)] italic">No progress notes added yet.</p>
                  ) : (
                    formData.timelineNotes.map((note, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-2 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                        <div>
                          <span className="text-[10px] text-[var(--muted-foreground)] block mb-0.5">{note.date}</span>
                          <span className="text-[var(--card-foreground)]">{note.note}</span>
                        </div>
                        <button type="button" onClick={() => handleDeleteTimelineNote(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Courier dispatched..."
                    value={newTimelineNote}
                    onChange={(e) => setNewTimelineNote(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTimelineNote(); } }}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all placeholder:text-[var(--input-placeholder)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTimelineNote}
                    className="min-h-11 rounded-xl bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition-all hover:bg-[var(--primary-hover)] whitespace-nowrap"
                  >
                    Add Note
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-medium text-[var(--card-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                >
                  <Check className="w-4 h-4" />
                  {editingGift ? "Save Changes" : "Add Gift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {isEditingBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 backdrop-blur-sm animate-fade-up sm:p-6 print:hidden">
          <div className="w-full max-w-md overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-3xl border-b border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:px-6">
              <h3 className="subheading text-[var(--card-foreground)]">
                Edit Total Budget
              </h3>
              <button
                onClick={handleCloseBudgetModal}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                aria-label="Close budget modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBudgetSubmit} className="space-y-6 p-5 sm:p-6 lg:p-8">
              <div>
                <label htmlFor="gift-totalBudget" className="block text-sm font-medium text-[var(--card-foreground)] mb-1">
                  Total Budget ($) *
                </label>
                <input
                  id="gift-totalBudget"
                  type="number"
                  name="totalBudget"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  min="0"
                  step="0.01"
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--card-foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
                <p className="description mt-2 text-[var(--muted-foreground)]">
                  Update your total gift fund any time so the dashboard reflects the latest spending plan.
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseBudgetModal}
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-5 text-sm font-medium text-[var(--card-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--primary-hover)]"
                >
                  <Check className="w-4 h-4" />
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
