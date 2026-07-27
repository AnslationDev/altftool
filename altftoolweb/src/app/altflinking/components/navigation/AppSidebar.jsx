/**
 * Master Premium Silicon Valley SaaS App Sidebar Component
 * Location: src/app/altflinking/components/navigation/AppSidebar.jsx
 */

"use client";

import React from "react";
import {
  LayoutGrid,
  Store,
  Globe,
  FileEdit,
  Link2,
  Repeat,
  Target,
  ShoppingCart,
  Wallet,
  MessageSquare,
  BookOpen,
  HelpCircle,
  Settings,
  ShieldCheck,
  X,
  FolderTree,
  UserCheck,
  TrendingUp,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Mail,
} from "lucide-react";

export default function AppSidebar({
  activeTab,
  setActiveTab,
  collapsed = false,
  setSidebarCollapsed,
  mobileOpen = false,
  onCloseMobile = () => { },
}) {
  const sections = [
    {
      title: "MARKETPLACE",
      items: [
        { id: "landing", label: "Dashboard", icon: LayoutGrid },
        { id: "marketplace", label: "Marketplace", icon: Store, badge: "1.4k+" },
        { id: "publisher", label: "Websites", icon: Globe },
        { id: "categories", label: "Categories", icon: FolderTree },
        { id: "guest-posts", label: "Guest Posts", icon: FileEdit },
        { id: "link-insertions", label: "Link Insertions", icon: Link2 },
        { id: "link-exchange", label: "Link Exchange", icon: Repeat, badge: "New" },
      ],
    },
    {
      title: "CAMPAIGNS & ORDERS",
      items: [
        { id: "campaigns", label: "Campaigns", icon: Target },
        { id: "orders", label: "Orders", icon: ShoppingCart, badge: "3" },
        { id: "buyer", label: "Buyer Portal", icon: UserCheck },
        { id: "analytics", label: "Analytics", icon: TrendingUp },
      ],
    },
    {
      title: "USER & ACCOUNT",
      items: [
        { id: "wallet", label: "Wallet", icon: Wallet },
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
    {
      title: "SUPPORT & RESOURCES",
      items: [
        { id: "tools", label: "SEO Tools", icon: BookOpen },
        { id: "help", label: "Help Center", icon: HelpCircle },
        { id: "contact", label: "Contact Us", icon: Mail },
      ],
    },
  ];

  const renderContent = (isMobile = false) => (
    <div className="flex h-full flex-col justify-between py-3 px-2.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">

      {/* Edge-to-Edge Brand Header Lockup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-2 pt-1">
          <div
            className="flex cursor-pointer items-center gap-2.5 group"
            onClick={() => {
              setActiveTab("landing");
              if (isMobile) onCloseMobile();
            }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white font-black text-xs shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200">
              <Link2 className="h-4.5 w-4.5" />
            </div>

            {(!collapsed || isMobile) && (
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                  ALTFTool
                </span>
                <span className="text-[9px] font-bold tracking-wider text-indigo-600 uppercase mt-0.5 flex items-center gap-1">
                  PREMIUM MARKETPLACE
                  <Sparkles className="h-2.5 w-2.5 text-amber-400 inline" />
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Icon */}
          {!isMobile && setSidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white transition"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
          )}

          {/* Mobile Drawer Close Icon */}
          {isMobile && (
            <button onClick={onCloseMobile} className="text-slate-500 hover:text-slate-700 dark:hover:text-indigo-600 p-1.5">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Horizontal Divider */}
        <div className="h-px w-full bg-slate-200 my-1" />

        {/* Section Navigation Items */}
        <nav className="space-y-4">
          {sections.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {(!collapsed || isMobile) && (
                <p className="px-2.5 mt-3 mb-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase font-mono">
                  {sec.title}
                </p>
              )}

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        if (isMobile) onCloseMobile();
                      }}
                      title={collapsed && !isMobile ? item.label : undefined}
                      className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 h-9.5 ${isActive
                          ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-indigo-600 font-extrabold border border-indigo-200/50 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 dark:hover:bg-white hover:text-slate-900 dark:hover:text-indigo-600"
                        }`}
                    >
                      {/* Active Left Pill Bar Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 shadow-md shadow-indigo-500/50" />
                      )}

                      <div className="flex items-center gap-2.5 min-w-0 pl-1">
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? "text-indigo-600" : "text-slate-500 group-hover:text-slate-700"
                          }`}
                        />
                        {(!collapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>

                      {(!collapsed || isMobile) && item.badge && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold transition-transform group-hover:scale-105 ${item.badge === "New"
                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 flex items-center gap-1"
                              : item.badge === "3"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                                : "bg-slate-100 text-slate-600 border border-slate-200 "
                            }`}
                        >
                          {item.badge === "New" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Edge-to-Edge Sidebar Footer User Lockup */}
      {(!collapsed || isMobile) && (
        <div className="pt-3 mt-4 border-t border-slate-200 ">
          <div className="altf-user-card flex items-center gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-200 shadow-sm hover:border-indigo-400 transition-all">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white font-extrabold text-xs shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/30">
              AT
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs font-black text-slate-900 truncate leading-none">
                Altf SEO Agency
              </p>
              <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                <span className="truncate">Verified Account</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Edge-to-Edge Sticky Sidebar */}
      <aside
        className={`hidden md:flex flex-col sticky top-0 h-screen shrink-0 border-r border-slate-200 bg-white transition-all duration-300 z-30 ${collapsed ? "w-16" : "w-64"
          }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Slide-Out Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-white backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="relative w-64 max-w-[80vw] bg-white border-r border-slate-200 shadow-2xl z-50">
            {renderContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
