"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ShoppingBasket,
  Refrigerator,
  ThermometerSnowflake,
  LayoutDashboard,
  Bell,
  Plus,
  Trash2,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Package,
  Calendar,
  MoreVertical,
  ChevronRight,
  Zap,
  Info,
  Carrot,
  Apple,
  GlassWater,
  UtensilsCrossed,
  Snowflake,
  Cookie,
  Coffee,
  Box,
  Leaf,
  Settings,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Archive,
  History,
  X,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  STORAGE_KEY,
  CATEGORIES,
  UNITS,
  LOCATIONS,
  INITIAL_DATA,
  calculateExpiryStatus,
  getAnalytics,
  loadPantryData,
  savePantryData,
  requestNotificationPermission,
  triggerNotification
} from "./utils/pantryHelpers";

// --- Shared UI Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all overflow-hidden ${className}`}
  >
    {title && (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500 shrink-0">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Pantry Expiry Tracker";

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
        Smart Inventory System Online
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Futuristic kitchen management. Track freshness, reduce waste, and manage your pantry with real-time intelligence.
      </p>
    </motion.div>
  );
};

export default function PantryExpiryTracker() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeTab, setActiveTab] = useState('inventory'); // inventory, dashboard, notifications
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Notification cooldown
  const lastNotifiedRef = useRef({});

  // Initialize
  useEffect(() => {
    const loaded = loadPantryData();
    setData(loaded);
  }, []);

  // Save on change
  useEffect(() => {
    if (data !== INITIAL_DATA) {
      savePantryData(data);
    }
  }, [data]);

  // Expiry Notification Logic
  useEffect(() => {
    if (!data.settings.notificationsEnabled) return;

    const checkExpiries = () => {
      const now = new Date().getTime();
      data.items.forEach(item => {
        if (item.quantity <= 0) return;
        
        const status = calculateExpiryStatus(item.expiryDate, item.quantity);
        if (status.label === "Expiring Soon" || status.label === "Expired") {
          // Notify once per item per session or every 24 hours
          const lastTime = lastNotifiedRef.current[item.id] || 0;
          if (now - lastTime > 1000 * 60 * 60 * 24) {
            triggerNotification(`Pantry Alert: ${item.name}`, {
              body: `${item.name} is ${status.label.toLowerCase()}! (${status.days} days remaining)`,
              icon: "/favicon.ico"
            });
            lastNotifiedRef.current[item.id] = now;
          }
        }
      });
    };

    const interval = setInterval(checkExpiries, 1000 * 60 * 60); // Check every hour
    checkExpiries(); // Check immediately
    
    return () => clearInterval(interval);
  }, [data.items, data.settings.notificationsEnabled]);

  const analytics = useMemo(() => getAnalytics(data.items), [data.items]);

  const filteredItems = useMemo(() => {
    return data.items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => {
      // Sort by expiry date, then name
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  }, [data.items, searchTerm, selectedCategory]);

  const handleAddItem = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0]
    };
    setData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setIsFormOpen(false);
  };

  const handleUpdateItem = (updatedItem) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === updatedItem.id ? updatedItem : item)
    }));
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (id) => {
    if (confirm("Are you sure you want to remove this item?")) {
      setData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const updateQuantity = (id, delta) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, parseFloat(item.quantity) + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    }));
  };

  const toggleNotifications = async () => {
    const enabled = !data.settings.notificationsEnabled;
    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Notification permission denied. Please enable it in browser settings.");
        return;
      }
    }
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, notificationsEnabled: enabled }
    }));
  };

  const getCategoryIcon = (catId) => {
    const cat = CATEGORIES.find(c => c.id === catId);
    if (!cat) return Package;
    switch(catId) {
      case 'vegetables': return Carrot;
      case 'fruits': return Apple;
      case 'dairy': return GlassWater;
      case 'meat': return UtensilsCrossed;
      case 'frozen': return Snowflake;
      case 'snacks': return Cookie;
      case 'beverages': return Coffee;
      case 'pantry': return Box;
      case 'spices': return Leaf;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-blue-500/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar: Navigation & Analytics */}
          <div className="lg:col-span-4 space-y-6">
            <div className="grid grid-cols-3 p-1.5 bg-(--card) border border-(--border) rounded-2xl w-full mb-6 gap-1">
              {[
                { id: 'inventory', icon: ShoppingBasket, label: 'Inventory' },
                { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
                { id: 'notifications', icon: Bell, label: 'Alerts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 min-w-0 ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-(--foreground) hover:bg-blue-500/5'
                  }`}
                >
                  <tab.icon size={18} className="shrink-0" />
                  <span className="text-[9px] font-black uppercase tracking-tighter text-center">{tab.label}</span>
                </button>
              ))}
            </div>

            <GlassCard title="Freshness Pulse" icon={Zap}>
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="text-4xl font-black text-blue-500 mb-2">{analytics.freshnessScore}%</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Overall Freshness</div>
                </div>
                <div className="h-2 w-full bg-blue-500/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.freshnessScore}%` }}
                    className={`h-full shadow-[0_0_10px_rgba(59,130,246,0.5)] ${analytics.freshnessScore > 70 ? 'bg-green-500' : analytics.freshnessScore > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-4">
                  <div className="p-3 rounded-2xl bg-green-500/5 border border-green-500/10 text-center">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Fresh</div>
                    <div className="text-lg font-black text-green-500">{analytics.fresh}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Expiring</div>
                    <div className="text-lg font-black text-amber-500">{analytics.expiringSoon}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/10 text-center">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Expired</div>
                    <div className="text-lg font-black text-red-500">{analytics.expired}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-center">
                    <div className="text-[8px] font-black text-muted-foreground uppercase mb-0.5">Stock Low</div>
                    <div className="text-lg font-black text-blue-500">{analytics.restock}</div>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Categories" icon={Filter}>
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold ${
                    selectedCategory === "all" ? 'bg-blue-600 border-blue-600 text-white' : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Package size={14} />
                    <span>All Items</span>
                  </div>
                  <span className="text-[10px] opacity-60">{data.items.length}</span>
                </button>
                {CATEGORIES.map(cat => {
                  const Icon = getCategoryIcon(cat.id);
                  const count = data.items.filter(i => i.category === cat.id).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold ${
                        selectedCategory === cat.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={14} />
                        <span className="truncate">{cat.label}</span>
                      </div>
                      <span className="text-[10px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Main Area */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'inventory' && (
                <motion.div
                  key="inventory"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* Search & Actions */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500/50" size={18} />
                      <input
                        type="text"
                        placeholder="Search pantry items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-(--card) border border-(--border) rounded-2xl pl-12 pr-4 py-4 text-sm focus:border-blue-500/50 outline-none transition-colors shadow-lg"
                      />
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setIsFormOpen(true);
                      }}
                      className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
                    >
                      <Plus size={20} />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Inventory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    <AnimatePresence>
                      {filteredItems.map((item, index) => {
                        const status = calculateExpiryStatus(item.expiryDate, item.quantity);
                        const CatIcon = getCategoryIcon(item.category);
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                          >
                            <GlassCard className="relative h-full group">
                              <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${status.bg} ${status.color}`}>
                                  <CatIcon size={20} />
                                </div>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditingItem(item);
                                      setIsFormOpen(true);
                                    }}
                                    className="p-2 rounded-xl bg-blue-500/5 text-blue-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-500 hover:text-white"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteItem(item.id)}
                                    className="p-2 rounded-xl bg-red-500/5 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <h4 className="text-base font-black text-(--foreground) truncate">{item.name}</h4>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.location}</p>
                                </div>

                                <div className="flex flex-wrap items-center justify-between p-3 rounded-xl bg-(--background) border border-(--border) gap-2">
                                  <div className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Quantity</div>
                                  <div className="flex items-center gap-3">
                                    <button 
                                      onClick={() => updateQuantity(item.id, -1)}
                                      className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="text-sm font-black text-(--foreground)">{item.quantity} <span className="text-[10px] text-muted-foreground">{item.unit}</span></span>
                                    <button 
                                      onClick={() => updateQuantity(item.id, 1)}
                                      className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                                    >
                                      <Plus size={12} />
                                    </button>
                                  </div>
                                </div>

                                <div className={`flex flex-wrap items-center justify-between p-3 rounded-xl border ${status.bg} ${status.border} gap-2`}>
                                  <div className="flex items-center gap-2">
                                    <Clock size={12} className={status.color} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                                  </div>
                                  <span className="text-[10px] font-bold opacity-80">
                                    {status.days !== undefined ? (status.days < 0 ? `${Math.abs(status.days)}d ago` : `${status.days}d left`) : '---'}
                                  </span>
                                </div>
                              </div>
                            </GlassCard>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {filteredItems.length === 0 && (
                      <div className="col-span-full py-20 text-center">
                        <Archive size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                        <p className="text-sm text-muted-foreground">No items found matching your criteria.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Items", value: analytics.total, icon: ShoppingBasket, color: "text-blue-500" },
                      { label: "Expired", value: analytics.expired, icon: AlertTriangle, color: "text-red-500" },
                      { label: "Expiring Soon", value: analytics.expiringSoon, icon: Clock, color: "text-amber-500" },
                      { label: "Restock Needed", value: analytics.restock, icon: TrendingDown, color: "text-purple-500" }
                    ].map((stat, i) => (
                      <GlassCard key={i} className="flex flex-col items-center justify-center text-center py-8">
                        <div className={`p-4 rounded-3xl bg-blue-500/5 ${stat.color} mb-4`}>
                          <stat.icon size={24} />
                        </div>
                        <div className="text-3xl font-black text-(--foreground) mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                      </GlassCard>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard title="Inventory Distribution" icon={BarChart3}>
                      <div className="space-y-4">
                        {CATEGORIES.map(cat => {
                          const count = data.items.filter(i => i.category === cat.id).length;
                          if (count === 0) return null;
                          const percentage = Math.round((count / data.items.length) * 100);
                          return (
                            <div key={cat.id} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">{cat.label}</span>
                                <span className="text-blue-500">{percentage}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-blue-500/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-blue-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                        {data.items.length === 0 && <p className="text-center text-xs text-muted-foreground py-10">Add items to see distribution.</p>}
                      </div>
                    </GlassCard>

                    <GlassCard title="Location Breakdown" icon={Refrigerator}>
                      <div className="space-y-4">
                        {LOCATIONS.map(loc => {
                          const count = data.items.filter(i => i.location === loc.label).length;
                          if (count === 0) return null;
                          const percentage = Math.round((count / data.items.length) * 100);
                          return (
                            <div key={loc.id} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-muted-foreground">{loc.label}</span>
                                <span className="text-purple-500">{percentage}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-purple-500/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  className="h-full bg-purple-500"
                                />
                              </div>
                            </div>
                          );
                        })}
                        {data.items.length === 0 && <p className="text-center text-xs text-muted-foreground py-10">Add items to see breakdown.</p>}
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GlassCard title="Smart Reminders" icon={Bell}>
                    <div className="space-y-8">
                      <div className="flex items-center justify-between p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-(--foreground) uppercase tracking-widest">Browser Notifications</h4>
                          <p className="text-xs text-muted-foreground">Receive real-time alerts when items are about to expire.</p>
                        </div>
                        <button
                          onClick={toggleNotifications}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${data.settings.notificationsEnabled ? 'bg-blue-600' : 'bg-(--border)'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                          />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Pending Alerts</h5>
                        {data.items.filter(i => {
                          const status = calculateExpiryStatus(i.expiryDate, i.quantity);
                          return status.label === "Expiring Soon" || status.label === "Expired";
                        }).map(item => {
                          const status = calculateExpiryStatus(item.expiryDate, item.quantity);
                          return (
                            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-(--background) border border-(--border)">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-xl ${status.bg} ${status.color}`}>
                                  <AlertTriangle size={16} />
                                </div>
                                <div>
                                  <div className="text-xs font-black text-(--foreground)">{item.name}</div>
                                  <div className={`text-[10px] font-bold ${status.color}`}>{status.label} • {status.days} days remaining</div>
                                </div>
                              </div>
                              <button 
                                onClick={() => setActiveTab('inventory')}
                                className="text-[10px] font-black uppercase text-blue-500 hover:underline"
                              >
                                View Item
                              </button>
                            </div>
                          );
                        })}
                        {data.items.filter(i => {
                          const status = calculateExpiryStatus(i.expiryDate, i.quantity);
                          return status.label === "Expiring Soon" || status.label === "Expired";
                        }).length === 0 && (
                          <div className="py-10 text-center">
                            <CheckCircle2 size={32} className="mx-auto text-green-500/30 mb-2" />
                            <p className="text-xs text-muted-foreground font-medium">All systems green. No upcoming expiries.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFormOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-xl bg-(--background) border border-(--border) rounded-[40px] p-8 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-(--foreground) uppercase tracking-tighter">
                    {editingItem ? 'Update Item' : 'New Pantry Item'}
                  </h3>
                  <button onClick={() => setIsFormOpen(false)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <ItemForm 
                  initialData={editingItem} 
                  onSubmit={editingItem ? handleUpdateItem : handleAddItem} 
                  onCancel={() => setIsFormOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Technical Footer */}
        <div className="pt-24 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-60 hover:opacity-100 transition-opacity">
          {[
            { icon: ShoppingBasket, title: "Smart Inventory", desc: "Digital tracking for every item in your kitchen with precise categorization." },
            { icon: Clock, title: "Expiry Intelligence", desc: "Real-time countdowns and visual alerts based on smart freshness logic." },
            { icon: Bell, title: "Proactive Alerts", desc: "Automated browser notifications to ensure you use ingredients before they expire." }
          ].map((feat, i) => (
            <div key={i} className="flex gap-4">
              <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500 h-fit">
                <feat.icon size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-(--foreground)">{feat.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

const ItemForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    category: "pantry",
    quantity: 1,
    unit: "pcs",
    expiryDate: "",
    location: "Shelf",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 col-span-full">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Product Name</label>
          <input
            autoFocus
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Organic Almond Milk"
            className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Storage Location</label>
          <select
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
          >
            {LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.label}>{loc.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 col-span-full md:col-span-1">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Qty</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Unit</label>
            <select
              value={formData.unit}
              onChange={e => setFormData({ ...formData, unit: e.target.value })}
              className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none"
            >
              {UNITS.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Expiry Date</label>
          <input
            type="date"
            value={formData.expiryDate}
            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
            className="w-full bg-blue-500/5 border border-(--border) rounded-2xl px-5 py-4 text-sm focus:border-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-2xl border border-(--border) text-[10px] font-black uppercase tracking-widest hover:bg-red-500/5 hover:text-red-500 transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
        >
          {initialData ? 'Update Inventory' : 'Add to Pantry'}
        </button>
      </div>
    </form>
  );
};
