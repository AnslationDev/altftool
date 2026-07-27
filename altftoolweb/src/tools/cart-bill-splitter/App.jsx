"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Users,
  UserPlus,
  CreditCard,
  DollarSign,
  TrendingUp,
  ChevronRight,
  RefreshCw,
  Info,
  Check,
  Share2,
  ArrowRight,
  PieChart,
  Settings,
  Receipt,
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  HelpCircle,
  Package,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calculateTotals,
  calculateSettlement,
  formatCurrency
} from "./lib";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all break-words ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Cart Bill Splitter";

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
        Real-time Split Engine Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Effortlessly divide shopping expenses, handle shared items, and settle group bills with surgical precision.
      </p>
    </motion.div>
  );
};

// --- Main App ---

export default function CartBillSplitter() {
  // State
  const [users, setUsers] = useState([
    { id: "1", name: "You", paid: 0 },
    { id: "2", name: "Friend 1", paid: 0 }
  ]);
  const [items, setItems] = useState([
    { id: "i1", name: "Groceries", price: 50.00, ownerIds: ["1", "2"], splitType: "equal", splits: {} }
  ]);
  const [charges, setCharges] = useState([
    { id: "c1", name: "Delivery Fee", value: 5.00, type: "fixed" },
    { id: "c2", name: "Service Tax", value: 5, type: "percentage" }
  ]);
  const [currency, setCurrency] = useState("USD");
  const [toastMsg, setToastMsg] = useState("");
  const [copied, setCopied] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart_bill_splitter_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.items) setItems(parsed.items);
        if (parsed.charges) setCharges(parsed.charges);
        if (parsed.currency) setCurrency(parsed.currency);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    const state = { users, items, charges, currency };
    localStorage.setItem("cart_bill_splitter_state", JSON.stringify(state));
  }, [users, items, charges, currency]);

  // Calculations
  const userBreakdowns = useMemo(() => calculateTotals(users, items, charges), [users, items, charges]);
  const settlements = useMemo(() => calculateSettlement(userBreakdowns), [userBreakdowns]);
  const totalBill = useMemo(() => userBreakdowns.reduce((acc, u) => acc + u.total, 0), [userBreakdowns]);

  // Handlers
  const addUser = () => {
    const newUser = { id: Date.now().toString(), name: `User ${users.length + 1}`, paid: 0 };
    setUsers([...users, newUser]);
  };

  const removeUser = (id) => {
    if (users.length <= 1) return;
    setUsers(users.filter(u => u.id !== id));
    setItems(items.map(item => ({
      ...item,
      ownerIds: item.ownerIds.filter(oid => typeof oid === 'string' ? oid !== id : oid.id !== id)
    })));
  };

  const updateUser = (id, field, value) => {
    setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: `Item ${items.length + 1}`,
      price: 0,
      ownerIds: users.map(u => u.id),
      splitType: "equal",
      category: "General",
      splits: {}
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // If switching to percentage/quantity, pre-populate splits
        if (field === 'splitType' && value !== 'equal') {
          const newSplits = { ...item.splits };
          item.ownerIds.forEach(oid => {
            if (!newSplits[oid]) {
              newSplits[oid] = value === 'percentage' ? (100 / (item.ownerIds.length || 1)).toFixed(1) : 1;
            }
          });
          updated.splits = newSplits;
        }
        return updated;
      }
      return item;
    }));
  };

  const addCharge = () => {
    const newCharge = { id: Date.now().toString(), name: "New Fee", value: 0, type: "fixed" };
    setCharges([...charges, newCharge]);
  };

  const removeCharge = (id) => {
    setCharges(charges.filter(c => c.id !== id));
  };

  const updateCharge = (id, field, value) => {
    setCharges(charges.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetAll = () => {
    if (window.confirm("Are you sure you want to reset everything?")) {
      setUsers([{ id: "1", name: "You", paid: 0 }]);
      setItems([]);
      setCharges([]);
      localStorage.removeItem("cart_bill_splitter_state");
    }
  };

  const copySettlement = () => {
    if (settlements.length === 0) return;
    const text = settlements.map(s => `${s.from} pays ${s.to}: ${formatCurrency(s.amount, currency)}`).join("\n");
    navigator.clipboard.writeText(`Bill Settlement Summary:\nTotal Bill: ${formatCurrency(totalBill, currency)}\n\n${text}`);
    setToastMsg("Settlement Copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleItemOwner = (itemId, userId) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isOwner = item.ownerIds.includes(userId);
        let newOwnerIds = isOwner
          ? item.ownerIds.filter(id => id !== userId)
          : [...item.ownerIds, userId];

        // Also update splits object
        const newSplits = { ...item.splits };
        if (isOwner) {
          delete newSplits[userId];
        } else if (item.splitType !== "equal") {
          if (item.splitType === "percentage") {
            newSplits[userId] = (100 / (newOwnerIds.length || 1)).toFixed(1);
          } else if (item.splitType === "quantity") {
            newSplits[userId] = 1;
          } else if (item.splitType === "exact") {
            newSplits[userId] = (item.price / (newOwnerIds.length || 1)).toFixed(2);
          }
        }

        return { ...item, ownerIds: newOwnerIds, splits: newSplits };
      }
      return item;
    }));
  };

  const updateItemSplitValue = (itemId, userId, value) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          splits: { ...item.splits, [userId]: value }
        };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-primary/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Management */}
          <div className="lg:col-span-4 space-y-6">

            {/* User Management */}
            <GlassCard title="Participants" icon={Users} headerActions={
              <button onClick={addUser} className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                <UserPlus size={18} />
              </button>
            }>
              <div className="space-y-4">
                <AnimatePresence>
                  {users.map((user, idx) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group p-4 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={user.name}
                            onChange={(e) => updateUser(user.id, "name", e.target.value)}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm font-bold text-(--foreground) outline-none"
                            placeholder="Name"
                          />
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-muted-foreground uppercase font-black">Paid:</span>
                            <div className="flex items-center text-[10px] font-mono">
                              <span className="text-muted-foreground mr-0.5">$</span>
                              <input
                                type="number"
                                value={user.paid}
                                onChange={(e) => updateUser(user.id, "paid", parseFloat(e.target.value) || 0)}
                                className="bg-transparent border-none p-0 focus:ring-0 w-16 text-blue-500 font-bold outline-none"
                              />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeUser(user.id)}
                          className="p-2 opacity-0 group-hover:opacity-100 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </GlassCard>

            {/* Global Charges */}
            <GlassCard title="Taxes & Fees" icon={Receipt} headerActions={
              <button onClick={addCharge} className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                <Plus size={18} />
              </button>
            }>
              <div className="space-y-3">
                {charges.map((charge) => (
                  <div key={charge.id} className="grid grid-cols-12 gap-2 items-center p-3 rounded-xl bg-(--background) border border-(--border)">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={charge.name}
                        onChange={(e) => updateCharge(charge.id, "name", e.target.value)}
                        className="w-full bg-transparent border-none p-0 text-xs font-bold text-(--foreground) outline-none"
                        placeholder="Fee Name"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        value={charge.value}
                        onChange={(e) => updateCharge(charge.id, "value", parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-none p-0 text-xs font-mono font-bold text-blue-500 text-right outline-none"
                      />
                    </div>
                    <div className="col-span-3">
                      <button
                        onClick={() => updateCharge(charge.id, "type", charge.type === "fixed" ? "percentage" : "fixed")}
                        className="w-full text-[9px] font-black uppercase py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20"
                      >
                        {charge.type === "fixed" ? currency : "%"}
                      </button>
                    </div>
                    <div className="col-span-1">
                      <button onClick={() => removeCharge(charge.id)} className="text-red-500/50 hover:text-red-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                {charges.length === 0 && (
                  <div className="text-center py-4 text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-50">
                    No extra charges
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Config & Reset */}
            <GlassCard title="Settings" icon={Settings}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Currency</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["USD", "EUR", "GBP", "INR"].map(cur => (
                      <button
                        key={cur}
                        onClick={() => setCurrency(cur)}
                        className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${currency === cur
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/50"
                          }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  className="w-full py-3 px-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  Reset Session
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Main Dashboard */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <GlassCard className="!p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                    <Receipt size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Total Bill</div>
                    <div className="text-sm font-bold text-(--foreground) truncate">
                      {formatCurrency(totalBill, currency)}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="!p-4 border-l-4 border-l-green-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-500">
                    <Wallet size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Total Paid</div>
                    <div className="text-sm font-bold text-(--foreground) truncate">
                      {formatCurrency(users.reduce((acc, u) => acc + (u.paid || 0), 0), currency)}
                    </div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="!p-4 border-l-4 border-l-amber-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                    <ArrowLeftRight size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Transactions</div>
                    <div className="text-sm font-bold text-(--foreground) truncate">
                      {settlements.length} Pending
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Cart Items */}
            <GlassCard title="Cart Items" icon={ShoppingCart} headerActions={
              <button onClick={addItem} className="px-4 py-2 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20">
                <Plus size={14} /> Add Item
              </button>
            }>
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-lg font-bold text-(--foreground) outline-none"
                                placeholder="Item Name"
                              />
                              <div className="flex items-center gap-2 mt-1">
                                <select
                                  value={item.category || "General"}
                                  onChange={(e) => updateItem(item.id, "category", e.target.value)}
                                  className="bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-blue-500/20 outline-none cursor-pointer"
                                >
                                  {["General", "Food", "Drink", "Groceries", "Entertainment", "Travel"].map(cat => (
                                    <option key={cat} value={cat} className="bg-(--card) text-(--foreground)">{cat}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="p-2 text-red-500/50 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                            <div className="sm:col-span-1 lg:col-span-5 p-3 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-colors group">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Item Price</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-blue-500">{currency}</span>
                                <input
                                  type="number"
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                                  className="w-full bg-transparent border-none p-0 text-base font-mono font-bold text-(--foreground) outline-none"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                            <div className="sm:col-span-1 lg:col-span-7 p-3 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/30 transition-colors group">
                              <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1 block">Split Method</label>
                              <div className="relative">
                                <select
                                  value={item.splitType}
                                  onChange={(e) => updateItem(item.id, "splitType", e.target.value)}
                                  className="w-full bg-transparent border-none p-0 text-sm font-bold text-(--foreground) outline-none cursor-pointer appearance-none pr-8"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right -4px center',
                                    backgroundSize: '1.2em'
                                  }}
                                >
                                  <option value="equal" className="bg-(--card) text-(--foreground)">⚖️ Equal Split</option>
                                  <option value="percentage" className="bg-(--card) text-(--foreground)">📈 Percentage</option>
                                  <option value="quantity" className="bg-(--card) text-(--foreground)">📦 Quantity</option>
                                  <option value="exact" className="bg-(--card) text-(--foreground)">💰 Exact Amount</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="md:w-52 space-y-3 border-t md:border-t-0 md:border-l border-(--border) pt-4 md:pt-0 md:pl-6">
                          <label className="text-[10px] font-black text-muted-foreground uppercase flex items-center justify-between">
                            <span>Owners ({item.ownerIds.length})</span>
                            <button
                              onClick={() => {
                                const allIds = users.map(u => u.id);
                                const isAll = item.ownerIds.length === users.length;
                                updateItem(item.id, "ownerIds", isAll ? [] : allIds);
                                if (item.splitType !== "equal") {
                                  const newSplits = {};
                                  if (!isAll) {
                                    allIds.forEach(id => {
                                      newSplits[id] = item.splitType === "percentage" ? (100 / allIds.length).toFixed(1) : 1;
                                    });
                                  }
                                  updateItem(item.id, "splits", newSplits);
                                }
                              }}
                              className="text-blue-500 hover:underline"
                            >
                              {item.ownerIds.length === users.length ? "None" : "All"}
                            </button>
                          </label>
                          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar p-1">
                            {users.map(user => {
                              const isOwner = item.ownerIds.includes(user.id);
                              return (
                                <div key={user.id} className="space-y-1">
                                  <button
                                    onClick={() => toggleItemOwner(item.id, user.id)}
                                    className={`w-full px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border text-left flex justify-between items-center ${isOwner
                                      ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-900/20"
                                      : "bg-(--card) border-(--border) text-muted-foreground hover:border-blue-500/50"
                                      }`}
                                  >
                                    <span>{user.name}</span>
                                    {isOwner && item.splitType === "equal" && <Check size={12} />}
                                  </button>
                                  {isOwner && item.splitType !== "equal" && (
                                    <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 ml-2">
                                      <span className="text-[9px] font-black text-blue-500 uppercase">
                                        {item.splitType === "percentage" ? "%" : item.splitType === "quantity" ? "Qty" : currency}
                                      </span>
                                      <input
                                        type="number"
                                        value={item.splits[user.id] || ""}
                                        onChange={(e) => updateItemSplitValue(item.id, user.id, e.target.value)}
                                        className="w-full bg-transparent border-none p-0 text-[10px] font-mono font-bold text-blue-500 outline-none"
                                        placeholder="0"
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length === 0 && (
                  <div className="text-center py-20 bg-(--background) rounded-3xl border border-dashed border-(--border)">
                    <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart size={32} className="text-blue-500/30" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">Your cart is empty. Add items to start splitting.</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Individual Payable Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard title="Individual Breakdown" icon={PieChart}>
                <div className="space-y-4">
                  {userBreakdowns.map((u, idx) => (
                    <div key={u.id} className="p-4 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/20 transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-(--foreground)">{u.name}</span>
                        <span className="text-sm font-mono font-black text-blue-500">{formatCurrency(u.total, currency)}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground uppercase tracking-wider">Subtotal</span>
                          <span className="font-mono">{formatCurrency(u.subtotal, currency)}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground uppercase tracking-wider">Fees & Taxes</span>
                          <span className="font-mono">{formatCurrency(u.charges, currency)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-(--card) rounded-full overflow-hidden mt-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(u.total / (totalBill || 1)) * 100}%` }}
                            className="h-full bg-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard title="Settlement Roadmap" icon={ArrowLeftRight} headerActions={
                <button onClick={copySettlement} className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                  <Share2 size={18} />
                </button>
              }>
                <div className="space-y-4">
                  {settlements.length > 0 ? settlements.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-4 rounded-2xl bg-(--background) border border-(--border) border-l-4 border-l-blue-500"
                    >
                      <div className="flex-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">From</div>
                        <div className="text-sm font-bold text-(--foreground)">{s.from}</div>
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <div className="text-blue-500 font-mono font-black text-sm">{formatCurrency(s.amount, currency)}</div>
                        <ArrowRight size={14} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">To</div>
                        <div className="text-sm font-bold text-(--foreground)">{s.to}</div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                        <Check size={24} className="text-green-500" />
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">All Settled</p>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* Bottom FAQ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
              <div className="space-y-2">
                <h4 className="font-bold text-blue-500 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <HelpCircle size={16} />
                  How is tax distributed?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Taxes and global fees are distributed proportionally based on each person's individual subtotal. This ensures that someone buying a small item doesn't pay an equal share of a large delivery fee.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-blue-500 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <HelpCircle size={16} />
                  What is Settlement Logic?
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Our engine minimizes the total number of transactions required to settle the bill. It calculates the net balance for each person and matches creditors with debtors efficiently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
