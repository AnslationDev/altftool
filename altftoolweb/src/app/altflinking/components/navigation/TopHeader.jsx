/**
 * Master Enterprise Silicon Valley SaaS Top Header Navigation Component
 * Location: src/app/altflinking/components/navigation/TopHeader.jsx
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Globe,
  PanelLeftClose,
  PanelLeft,
  Menu,
  ShieldCheck,
  ShoppingBag,
  User,
  Settings,
  CreditCard,
  Building2,
} from "lucide-react";

export default function TopHeader({
  sidebarCollapsed,
  setSidebarCollapsed,
  onToggleMobileDrawer,
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  onOpenSearch,
  cartCount = 0,
  onOpenCart,
  onOpenAuth,
  userSession,
  onLogout,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  // useMounted: prevent SSR/client hydration mismatch on userSession-conditional rendering
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const notificationsList = [
    { id: 1, title: "Backlink Live & Verified", desc: "techradar-insights.com verified dofollow link", time: "10m ago" },
    { id: 2, title: "New Order Received", desc: "Guest post request on saasgrowthjournal.io", time: "1h ago" },
    { id: 3, title: "Escrow Payment Released", desc: "$240.00 transferred to your payout wallet", time: "3h ago" },
  ];

  // Listen for Cmd+K or Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenSearch]);

  const getSectionTitle = () => {
    switch (activeTab) {
      case "landing":
        return "Overview";
      case "marketplace":
        return "Marketplace Directory";
      case "buyer":
        return "Buyer Portal";
      case "publisher":
        return "Publisher Studio";
      case "admin":
        return "Admin Console";
      case "tools":
        return "SEO Tools";
      case "categories":
        return "Niche Categories";
      case "guest-posts":
        return "Guest Posts";
      case "link-insertions":
        return "Link Insertions";
      case "campaigns":
        return "Campaigns";
      case "orders":
        return "Orders Execution";
      case "analytics":
        return "Analytics";
      case "wallet":
        return "Publisher Wallet";
      case "messages":
        return "Messages";
      case "settings":
        return "Settings";
      case "contact":
        return "Contact & Sales";
      default:
        return "Backlink Marketplace";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-3 sm:px-5 backdrop-blur-xl transition-all shadow-xs">

      {/* Left Cluster: Sidebar Toggle & Breadcrumb */}
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Desktop Sidebar Toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-indigo-600 transition"
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <PanelLeft className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>

        {/* Mobile Drawer Toggle */}
        <button
          onClick={onToggleMobileDrawer}
          className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600 "
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Active Route Breadcrumb */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">ALTFTool /</span>
          <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate flex items-center gap-1.5">
            {getSectionTitle()}
            <span className="hidden xl:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </h1>
        </div>
      </div>

      {/* Center Section: Global Command-K Search Bar */}
      <div className="hidden md:flex flex-1 max-w-sm mx-4">
        <div
          onClick={onOpenSearch}
          className="relative w-full cursor-pointer flex items-center gap-2 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs text-slate-500 hover:border-indigo-400 dark:hover:border-slate-200 transition"
        >
          <Search className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span className="truncate text-xs">Search 1,400+ websites, DR 50+...</span>
          <kbd className="hidden lg:inline-flex items-center rounded border border-slate-300 bg-white px-1 py-0.2 font-mono text-[9px] font-semibold text-slate-600 ml-auto shrink-0">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Cluster: High-Priority Actions Only */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

        {/* Mobile Search Button */}
        <button
          onClick={onOpenSearch}
          className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600 "
        >
          <Search className="h-3.5 w-3.5" />
        </button>

        {/* Multi-Domain Cart Drawer Trigger */}
        {onOpenCart && (
          <button
            onClick={onOpenCart}
            className="relative flex h-8 items-center gap-1 px-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-600/25 transition"
            title="View Bulk Backlink Cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-xs">Cart</span>
            {cartCount > 0 && (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-black text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        )}



        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 dark:hover:text-indigo-600 transition"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xl z-50 space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-900 ">Notifications</span>
                <button
                  onClick={() => setUnreadCount(0)}
                  className="text-[10px] font-semibold text-indigo-600 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {notificationsList.map((n) => (
                  <div key={n.id} className="p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                    <p className="text-xs font-semibold text-slate-900 ">{n.title}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{n.desc}</p>
                    <span className="text-[9px] text-slate-500 font-mono">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher: Renamed "Publisher" Segmented Button */}
        <button
          onClick={() => setActiveTab("publisher")}
          className={`h-8 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${activeTab === "publisher"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-600/25"
            }`}
          title="Switch to Publisher Studio"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Publisher</span>
        </button>

        {/* User Profile / Auth Button — wrapped in mounted guard to prevent SSR hydration mismatch */}
        {!mounted ? (
          // Consistent placeholder rendered on BOTH server and client initial pass
          <div className="h-8 w-20 rounded-lg bg-slate-100 animate-pulse shrink-0" />
        ) : !userSession ? (
          <button
            onClick={onOpenAuth}
            className="altf-btn-primary h-8 px-3.5 text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0"
          >
            <User className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        ) : (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 p-1 text-left hover:border-indigo-400 transition"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-[10px]">
                {userSession.name ? userSession.name.substring(0, 2).toUpperCase() : "US"}
              </div>
              <span className="text-xs font-bold text-slate-900 hidden xl:inline max-w-[90px] truncate">
                {userSession.name || "User"}
              </span>
              <ChevronDown className="h-3 w-3 text-slate-500 hidden xl:block" />
            </button>

            {/* Profile Popover Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl z-50 space-y-1">
                <div className="p-2 border-b border-slate-200 ">
                  <p className="text-xs font-bold text-slate-900 truncate">{userSession.name}</p>
                  <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="h-3 w-3 inline shrink-0" />
                    {userSession.role} Account
                  </p>
                </div>

                <button
                  onClick={() => { setActiveTab("buyer"); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Buyer Portal</span>
                </button>

                <button
                  onClick={() => { setActiveTab("publisher"); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Globe className="h-3.5 w-3.5 text-cyan-500" />
                  <span>Publisher Studio</span>
                </button>

                <button
                  onClick={() => { setActiveTab("wallet"); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Wallet</span>
                </button>

                <button
                  onClick={() => { setActiveTab("settings"); setShowProfileMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:hover:text-indigo-600 hover:bg-slate-100 rounded-lg flex items-center gap-2"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-500" />
                  <span>Account Settings</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                    className="w-full text-left px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg flex items-center gap-2 border-t border-slate-200 pt-2 mt-1"
                  >
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
