"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  PackageCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Store,
  Tag,
  ArrowRight,
  Info,
  RefreshCcw,
  History,
  Archive,
  CreditCard,
  MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RETURN_STATUSES,
  PRODUCT_CATEGORIES,
  calculateRemainingDays,
  getUrgencyLevel,
  formatCurrency,
  formatDate
} from "./utils/returnUtils";

// --- Shared Components ---

const GlassCard = ({ children, className = "", delay = 0, hover = true }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-6 backdrop-blur-md shadow-xl transition-all ${hover ? 'hover:border-blue-500/30' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Return Deadline Tracker";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Intelligent Return Engine Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Monitor return windows, track refund status, and never miss an expiry date again with cinematic precision.
      </p>
    </motion.div>
  );
};

const StatusBadge = ({ status }) => {
  const config = RETURN_STATUSES[status] || RETURN_STATUSES.AVAILABLE;
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${config.bg} ${config.color} ${config.border} flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
      {config.label}
    </span>
  );
};

const UrgencyBadge = ({ days }) => {
  const urgency = getUrgencyLevel(days);
  let color = "text-blue-500 bg-blue-500/10 border-blue-500/20";
  let icon = <Clock size={12} />;

  if (urgency === 'expired') {
    color = "text-rose-500 bg-rose-500/10 border-rose-500/20";
    icon = <AlertCircle size={12} />;
  } else if (urgency === 'high') {
    color = "text-orange-500 bg-orange-500/10 border-orange-500/20";
    icon = <AlertCircle size={12} />;
  } else if (urgency === 'medium') {
    color = "text-amber-500 bg-amber-500/10 border-amber-500/20";
  }

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${color}`}>
      {icon}
      {urgency === 'expired' ? 'Expired' : `${days} Days Left`}
    </div>
  );
};

// --- Main App ---

export default function ReturnDeadlineTracker() {
  const [returns, setReturns] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    store: "",
    category: "Electronics",
    orderDate: "",
    deliveryDate: "",
    returnDeadline: "",
    price: "",
    status: "AVAILABLE",
    refundAmount: "",
    notes: ""
  });

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("return_tracker_data");
    if (saved) {
      try {
        setReturns(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("return_tracker_data", JSON.stringify(returns));
  }, [returns]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData(item);
      setEditingId(item.id);
    } else {
      setFormData({
        name: "",
        store: "",
        category: "Electronics",
        orderDate: "",
        deliveryDate: "",
        returnDeadline: "",
        price: "",
        status: "AVAILABLE",
        refundAmount: "",
        notes: ""
      });
      setEditingId(null);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.returnDeadline) {
      showToast("Please fill in required fields", "error");
      return;
    }

    if (editingId) {
      setReturns(returns.map(r => r.id === editingId ? { ...formData, id: editingId } : r));
      showToast("Return record updated");
    } else {
      const newReturn = { ...formData, id: Date.now() };
      setReturns([newReturn, ...returns]);
      showToast("New return added to tracker");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setReturns(returns.filter(r => r.id !== id));
    showToast("Record removed", "warning");
  };

  const filteredReturns = useMemo(() => {
    return returns.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.store.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      // Sort by urgency
      const daysA = calculateRemainingDays(a.returnDeadline);
      const daysB = calculateRemainingDays(b.returnDeadline);
      return daysA - daysB;
    });
  }, [returns, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: returns.length,
      active: returns.filter(r => calculateRemainingDays(r.returnDeadline) >= 0 && r.status !== 'REFUNDED').length,
      urgent: returns.filter(r => {
        const d = calculateRemainingDays(r.returnDeadline);
        return d >= 0 && d <= 3;
      }).length,
      pendingRefunds: returns.filter(r => r.status === 'REFUND_PENDING').length,
      totalValue: returns.reduce((acc, curr) => acc + (parseFloat(curr.price) || 0), 0)
    };
  }, [returns]);

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Active Returns", value: stats.active, icon: PackageCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Urgent Deadlines", value: stats.urgent, icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Pending Refunds", value: stats.pendingRefunds, icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Total Asset Value", value: formatCurrency(stats.totalValue), icon: DollarSign, color: "text-blue-500", bg: "bg-blue-500/10" },
          ].map((stat, i) => (
            <GlassCard key={i} className="!p-5 overflow-hidden" delay={i * 0.1}>
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shrink-0`}>
                  <stat.icon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">{stat.label}</p>
                  <p className="text-sm sm:text-base font-black text-(--foreground) whitespace-nowrap leading-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Control Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Search products or stores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-(--card) border border-(--border) rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-all backdrop-blur-md"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-(--card) border border-(--border) rounded-2xl pl-11 pr-10 py-3 text-sm focus:border-blue-500/50 outline-none appearance-none cursor-pointer transition-all backdrop-blur-md"
              >
                <option value="ALL">All Statuses</option>
                {Object.entries(RETURN_STATUSES).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="w-full md:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={18} />
            <span>Track New Return</span>
          </button>
        </div>

        {/* Returns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredReturns.length > 0 ? filteredReturns.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: idx * 0.05 }}
              >
                <GlassCard className="relative h-full flex flex-col group overflow-hidden">
                  {/* Decorative background pulse */}
                  <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-opacity group-hover:opacity-20 ${RETURN_STATUSES[item.status]?.color.replace('text-', 'bg-')}`} />

                  <div className="flex flex-col gap-4 mb-6 relative z-10">
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag size={12} className="text-blue-500" />
                          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest truncate">{item.category}</span>
                        </div>
                        <h3 className="text-xl font-black text-(--foreground) truncate leading-tight mb-1" title={item.name}>{item.name}</h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          <Store size={14} />
                          <span className="truncate">{item.store}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <UrgencyBadge days={calculateRemainingDays(item.returnDeadline)} />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                    <div className="p-3 rounded-2xl bg-(--background)/50 border border-(--border) min-w-0 overflow-hidden">
                      <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1 truncate">Total Price</div>
                      <div className="text-base sm:text-lg font-mono font-black text-blue-500 truncate" title={formatCurrency(item.price)}>
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-(--background)/50 border border-(--border) min-w-0 overflow-hidden">
                      <div className="text-[8px] font-black text-muted-foreground uppercase tracking-wider mb-1 truncate">Deadline</div>
                      <div className="text-xs sm:text-sm font-bold text-(--foreground) truncate">{formatDate(item.returnDeadline)}</div>
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mb-6 relative z-10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Journey Progress</span>
                      <span className="text-[10px] font-bold text-blue-500">{item.status === 'REFUNDED' ? 'COMPLETED' : 'IN PROGRESS'}</span>
                    </div>
                    <div className="h-1.5 w-full bg-(--background) rounded-full overflow-hidden border border-(--border) flex">
                      <div
                        className={`h-full transition-all duration-1000 ${item.status === 'REFUNDED' ? 'bg-blue-500 w-full' : 'bg-blue-500 w-1/2 animate-pulse'}`}
                      />
                    </div>
                  </div>

                  {item.notes && (
                    <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 relative z-10 group-hover:bg-blue-500/10 transition-colors">
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-black text-blue-500 uppercase">
                        <MessageSquare size={12} />
                        Notes & Intelligence
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed italic">"{item.notes}"</p>
                    </div>
                  )}

                  <div className="mt-auto pt-6 border-t border-(--border) flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
                        className="p-2.5 rounded-xl bg-(--card) border border-(--border) text-muted-foreground hover:text-blue-500 hover:border-blue-500/30 transition-all"
                        title="Edit Record"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2.5 rounded-xl bg-(--card) border border-(--border) text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 transition-all"
                        title="Delete Record"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {item.status === 'REFUND_PENDING' && (
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-500 animate-pulse">
                        <RefreshCcw size={14} className="animate-spin" />
                        <span>Awaiting Refund</span>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            )) : (
              <motion.div
                className="col-span-full py-20 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-6 relative">
                  <PackageCheck size={48} className="text-blue-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/5 animate-ping" />
                </div>
                <h3 className="text-2xl font-black text-(--foreground) mb-2">No returns tracked yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Add your first purchased product to start monitoring return windows and refund progress automatically.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="mt-8 px-8 py-3 rounded-full border border-blue-500/30 text-blue-500 font-bold hover:bg-blue-500/10 transition-all"
                >
                  Get Started
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informational Footer */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="!p-8 border-t-4 border-t-blue-500">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <History size={24} />
            </div>
            <h4 className="text-lg font-bold mb-3">Consumer Rights</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Most online platforms offer 14-30 day return windows. Tracking these ensures you never lose money on faulty or unwanted products.
            </p>
          </GlassCard>
          <GlassCard className="!p-8 border-t-4 border-t-blue-500">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <CreditCard size={24} />
            </div>
            <h4 className="text-lg font-bold mb-3">Refund Monitoring</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Refunds can take 5-10 business days to reflect in your account. Mark items as "Refund Pending" to keep an eye on your cash flow.
            </p>
          </GlassCard>
          <GlassCard className="!p-8 border-t-4 border-t-purple-500">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6">
              <Info size={24} />
            </div>
            <h4 className="text-lg font-bold mb-3">Zero Data Storage</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your return intelligence remains private. All data is stored locally in your browser and never leaves your device.
            </p>
          </GlassCard>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-(--card) border border-(--border) w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-(--foreground)">{editingId ? 'Edit Return' : 'New Return Record'}</h2>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Intelligence Input Required</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                  >
                    <XCircle size={24} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Product Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Sony WH-1000XM5"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Store / Platform</label>
                      <input
                        type="text"
                        placeholder="e.g. Amazon, Best Buy"
                        value={formData.store}
                        onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Price</label>
                        <input
                          type="number"
                          placeholder="0.00"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
                        >
                          {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Return Deadline *</label>
                      <input
                        type="date"
                        value={formData.returnDeadline}
                        onChange={(e) => setFormData({ ...formData, returnDeadline: e.target.value })}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Current Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none appearance-none cursor-pointer"
                      >
                        {Object.entries(RETURN_STATUSES).map(([key, val]) => (
                          <option key={key} value={key}>{val.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Intelligence Notes</label>
                      <textarea
                        placeholder="Add pickup info, support cases, or tracking IDs..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                        className="w-full bg-(--background) border border-(--border) rounded-2xl px-5 py-3 text-sm focus:border-blue-500/50 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-muted text-muted-foreground font-black text-xs uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>{editingId ? 'Update Intelligence' : 'Deploy Tracker'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-8 left-1/2 px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl z-[100] flex items-center gap-2 border ${toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
              toast.type === 'warning' ? 'bg-amber-500 border-amber-400 text-white' :
                'bg-blue-600 border-blue-500 text-white'
              }`}
          >
            {toast.type === 'error' ? <XCircle size={14} /> :
              toast.type === 'warning' ? <AlertCircle size={14} /> :
                <CheckCircle2 size={14} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
