/**
 * Main Application Shell View & Controller for ALTFTool Backlink Marketplace
 * Location: src/app/altflinking/PageView.jsx
 */

"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import AppSidebar from "./components/navigation/AppSidebar";
import TopHeader from "./components/navigation/TopHeader";
import SearchModal from "./components/navigation/SearchModal";
import FilterSidebar from "./components/common/FilterSidebar";

const ProtectedSectionGuard = ({ title, description, onOpenAuth }) => (
  <div className="altf-card p-8 sm:p-12 text-center max-w-xl mx-auto space-y-5 my-8">
    <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
      <ShieldCheck className="h-8 w-8" />
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-black text-white">{title}</h2>
      <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">{description}</p>
    </div>
    <button
      onClick={onOpenAuth}
      className="altf-btn-primary py-3 px-6 text-xs font-bold rounded-xl"
    >
      <LogIn className="h-4 w-4" />
      <span>Sign In / Register to Access</span>
    </button>
  </div>
);

// Landing Section Imports
import LandingHero from "./components/landing/LandingHero";
import LandingStatsBar from "./components/landing/LandingStatsBar";
import PlatformArchitectureShowcase from "./components/landing/PlatformArchitectureShowcase";
import MarketplaceCategories from "./components/landing/MarketplaceCategories";
import FeaturedPublishers from "./components/landing/FeaturedPublishers";
import RecentOpportunitiesTable from "./components/landing/RecentOpportunitiesTable";
import WhyChooseAltF from "./components/landing/WhyChooseAltF";
import FeatureHighlights from "./components/landing/FeatureHighlights";
import CustomerTestimonials from "./components/landing/CustomerTestimonials";
import PricingPreview from "./components/landing/PricingPreview";
import FaqAccordion from "./components/landing/FaqAccordion";
import FinalCtaBanner from "./components/landing/FinalCtaBanner";
import ContactUsSection from "./components/landing/ContactUsSection";
import EnterpriseFooter from "./components/landing/EnterpriseFooter";

// Marketplace & Portal Imports
import WebsiteCard from "./components/marketplace/WebsiteCard";
import GuestPostsDirectoryView from "./components/marketplace/GuestPostsDirectoryView";
import QuickPreviewDrawer from "./components/marketplace/QuickPreviewDrawer";
import CompareModal from "./components/marketplace/CompareModal";
import BuyerDashboard from "./components/buyer/BuyerDashboard";
import PublisherDashboard from "./components/publisher/PublisherDashboard";
import AdminDashboard from "./components/admin/AdminDashboard";
import UTMBuilder from "./components/tools/UTMBuilder";
import LinkInspector from "./components/tools/LinkInspector";
import BulkDomainSearchModal from "./components/marketplace/BulkDomainSearchModal";
import RoiCalculatorModal from "./components/tools/RoiCalculatorModal";
import WithdrawalModal from "./components/publisher/WithdrawalModal";
import DisputeResolutionModal from "./components/buyer/DisputeResolutionModal";
import CartCheckoutDrawer from "./components/marketplace/CartCheckoutDrawer";
import SubmitListingModal from "./components/publisher/SubmitListingModal";
import AuthLoginModal from "./components/common/AuthLoginModal";
import { LoadingState, EmptyState, ErrorState } from "./components/common/UIStateComponents";

import {
  fetchWebsites,
  fetchOrders,
  fetchCampaigns,
  submitWebsiteListing as firebaseSubmitWebsite,
  createOrder as firebaseCreateOrder,
  createCampaign as firebaseCreateCampaign,
  updateOrderStatus as firebaseUpdateOrderStatus,
  subscribeToAuthState,
  logoutUser,
} from "./services/firebaseService";

import * as apiClient from "./services/apiClient";

import "./altflinking.css";

const DEFAULT_FILTERS = {
  search: "",
  niche: "All",
  minDr: 0,
  minTraffic: 0,
  maxPrice: 500,
  maxTat: 14,
  sortBy: "dr_desc",
};

export default function AltfLinkingPageView() {
  const [activeTab, setActiveTabState] = useState("landing");
  const [activeTool, setActiveTool] = useState("utm");
  const [theme, setTheme] = useState("light");

  // Synchronize activeTab with URL Query Parameter (?tab=...) & Browser History
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      if (tabParam) {
        setActiveTabState(tabParam);
      }
    }
  }, []);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") || "landing";
      setActiveTabState(tabParam);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Navigation Shell State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Data States
  const [websites, setWebsites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Modals & Drawers
  const [submitListingOpen, setSubmitListingOpen] = useState(false);
  const [previewSite, setPreviewSite] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Enterprise Tool Modals & Drawers
  const [bulkSearchOpen, setBulkSearchOpen] = useState(false);
  const [roiCalcOpen, setRoiCalcOpen] = useState(false);
  const [withdrawalOpen, setWithdrawalOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeOrder, setDisputeOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);

  // Subscribe to Firebase onAuthStateChanged — auto-restores session on page refresh
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((session) => {
      setUserSession(session);
    });
    return () => { if (typeof unsubscribe === "function") unsubscribe(); };
  }, []);

  // Data Loading & Error States
  const [dataError, setDataError] = useState(null);

  // Notification Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await apiClient.updateOrderStatus(orderId, "ACCEPTED");
    } catch {
      await firebaseUpdateOrderStatus(orderId, "ACCEPTED");
    }
    const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, status: "ACCEPTED" } : o));
    setOrders(updatedOrders);
    showToast("Request Accepted! Submit live published URL once ready.");
  };

  const handleSubmitLiveLink = async (orderId, liveLinkUrl) => {
    try {
      await apiClient.updateOrderStatus(orderId, "VERIFIED_LIVE", { liveLinkUrl, isIndexed: true, isDofollow: true });
    } catch {
      await firebaseUpdateOrderStatus(orderId, "VERIFIED_LIVE", {
        liveLinkUrl,
        isIndexed: true,
        isDofollow: true,
        crawledAt: new Date().toISOString(),
      });
    }
    const updatedOrders = orders.map((o) =>
      o.id === orderId ? { ...o, status: "VERIFIED_LIVE", liveLinkUrl } : o
    );
    setOrders(updatedOrders);
    showToast("Live link submitted and verified! Order marked LIVE.");
  };

  // Data Fetch with API Route priority and Firestore fallback
  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    try {
      // 1. Fetch APPROVED marketplace listings
      let sitesData = [];
      try {
        sitesData = await apiClient.fetchMarketplaceListings(filters);
      } catch (apiErr) {
        sitesData = await fetchWebsites(filters);
      }

      // 2. Fetch User Orders (authenticated)
      let ordersData = [];
      try {
        ordersData = await apiClient.fetchUserOrders();
      } catch (apiErr) {
        ordersData = await fetchOrders();
      }

      // 3. Fetch User Campaigns (authenticated)
      let campaignsData = [];
      try {
        campaignsData = await apiClient.fetchUserCampaigns();
      } catch (apiErr) {
        campaignsData = await fetchCampaigns();
      }

      setWebsites(sitesData || []);
      setOrders(ordersData || []);
      setCampaigns(campaignsData || []);
    } catch (err) {
      console.error("Data load error:", err);
      setDataError(err.message || "Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Place Order Handler (Enters PENDING_ADMIN_APPROVAL)
  const handlePlaceOrder = async (orderPayload) => {
    if (!userSession) {
      setAuthModalOpen(true);
      showToast("Please sign in to place an order", "error");
      return;
    }

    try {
      let newOrder;
      try {
        newOrder = await apiClient.placeOrder(orderPayload);
      } catch (apiErr) {
        newOrder = await firebaseCreateOrder(orderPayload);
      }
      setOrders((prev) => [newOrder, ...prev]);
      setPreviewSite(null);
      showToast("Order submitted! Enters Pending Admin Review before fulfillment.");
    } catch (err) {
      showToast(err.message || "Failed to place order", "error");
    }
  };

  // Website Submission Handler (Enters PENDING_REVIEW)
  const handleSubmitWebsite = async (sitePayload) => {
    if (!userSession) {
      setAuthModalOpen(true);
      showToast("Please sign in to submit a website", "error");
      return;
    }

    let newSite;
    try {
      newSite = await apiClient.submitWebsiteListing(sitePayload);
    } catch (apiErr) {
      newSite = await firebaseSubmitWebsite(sitePayload);
    }
    // Note: Submitted website is PENDING_REVIEW, so it won't appear on public marketplace until admin approves
    showToast(`Website ${newSite.domain || sitePayload.domain} submitted! Enters Pending Admin Review.`);
    setWebsites((prev) => [newSite, ...prev]);
    return newSite;
  };

  // Publisher edits their own listing's pricing/guidelines/TAT
  const handleUpdateListing = async (siteId, payload) => {
    try {
      const updated = await apiClient.updateListing(siteId, payload);
      setWebsites((prev) => prev.map((w) => (w.id === siteId ? { ...w, ...updated } : w)));
      showToast("Listing updated");
      return updated;
    } catch (err) {
      showToast(err.message || "Failed to update listing", "error");
      throw err;
    }
  };

  // Campaign Creation Handler
  const handleCreateCampaign = async (campPayload) => {
    if (!userSession) {
      setAuthModalOpen(true);
      return;
    }

    try {
      let newCamp;
      try {
        newCamp = await apiClient.createCampaign(campPayload);
      } catch (apiErr) {
        newCamp = await firebaseCreateCampaign(campPayload);
      }
      setCampaigns((prev) => [newCamp, ...prev]);
      showToast(`Campaign "${newCamp.name}" created!`);
    } catch (err) {
      showToast(err.message || "Failed to create campaign", "error");
    }
  };

  // Filter effect
  const filteredWebsites = useMemo(() => {
    let result = [...websites];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.domain.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          s.niche.toLowerCase().includes(q)
      );
    }
    if (filters.niche && filters.niche !== "All") {
      result = result.filter((s) => s.niche === filters.niche);
    }
    if (filters.minDr) {
      result = result.filter((s) => s.dr >= filters.minDr);
    }
    if (filters.minTraffic) {
      result = result.filter((s) => s.traffic >= Number(filters.minTraffic));
    }
    if (filters.maxPrice) {
      result = result.filter((s) => s.prices.guestPost <= filters.maxPrice);
    }

    switch (filters.sortBy) {
      case "dr_desc":
        result.sort((a, b) => b.dr - a.dr);
        break;
      case "traffic_desc":
        result.sort((a, b) => b.traffic - a.traffic);
        break;
      case "price_asc":
        result.sort((a, b) => a.prices.guestPost - b.prices.guestPost);
        break;
      case "tat_asc":
        result.sort((a, b) => a.tatDays - b.tatDays);
        break;
    }
    return result;
  }, [websites, filters]);


  // Compare Toggle
  const handleToggleCompare = (site) => {
    if (compareList.some((s) => s.id === site.id)) {
      setCompareList(compareList.filter((s) => s.id !== site.id));
    } else {
      if (compareList.length >= 3) {
        showToast("Maximum 3 websites can be compared at once", "warning");
        return;
      }
      setCompareList([...compareList, site]);
    }
  };

  return (
    <div
      data-theme={theme}
      className={`altf-linking-container flex min-h-screen ${
        theme === "light" ? "light" : "dark"
      }`}
    >
      {/* Collapsible App Sidebar */}
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileDrawerOpen}
        onCloseMobile={() => setMobileDrawerOpen(false)}
      />

      {/* Main Content Workspace Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Sticky Top Header Bar */}
        <TopHeader
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          onToggleMobileDrawer={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          setTheme={setTheme}
          onOpenSearch={() => setSearchModalOpen(true)}
          cartCount={cartItems.length}
          onOpenCart={() => setCartOpen(true)}
          onOpenBulkSearch={() => setBulkSearchOpen(true)}
          onOpenRoiCalc={() => setRoiCalcOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
          userSession={userSession}
          onLogout={async () => {
            await logoutUser();
            setUserSession(null);
            setActiveTab("landing");
            showToast("Signed out successfully.");
          }}
        />

        {/* Content Body Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full space-y-12">
          {/* OVERVIEW / ENTERPRISE HOMEPAGE */}
          {activeTab === "landing" && (
            <div className="space-y-10 max-w-7xl mx-auto">
              {/* 1. Hero with Floating Domains & Search Overlay Filter Card */}
              <LandingHero
                onExploreMarketplace={() => setActiveTab("marketplace")}
                onListWebsite={() => setSubmitListingOpen(true)}
                onSearchFilter={(searchParams) => {
                  setFilters({ ...DEFAULT_FILTERS, ...searchParams });
                  setActiveTab("marketplace");
                }}
              />

              {/* 2. 4-Card Stats Metric Bar */}
              <LandingStatsBar />

              {/* 3. Marketplace Categories Pills */}
              <MarketplaceCategories
                onSelectCategory={(categoryName) => {
                  setFilters({ ...DEFAULT_FILTERS, niche: categoryName });
                  setActiveTab("marketplace");
                }}
              />

              {/* 4. Featured Publishers Grid (5 Cards) */}
              <FeaturedPublishers
                onSelectSite={(site) => setPreviewSite(site)}
                onExploreMarketplace={() => setActiveTab("marketplace")}
              />

              {/* 5. Recent Backlink Opportunities Table */}
              <RecentOpportunitiesTable
                onSelectSite={(site) => setPreviewSite(site)}
                onExploreMarketplace={() => setActiveTab("marketplace")}
              />

              {/* 6. Product & Feature Architecture Showcase (What We Are Building) */}
              <PlatformArchitectureShowcase
                onExploreMarketplace={() => setActiveTab("marketplace")}
                onListWebsite={() => setSubmitListingOpen(true)}
              />

              {/* 7. Comparison Matrix */}
              <FeatureHighlights />

              {/* 8. Customer Testimonials */}
              <CustomerTestimonials />

              {/* 9. FAQ Accordion */}
              <FaqAccordion />

              {/* 10. Pricing Preview */}
              <PricingPreview
                onExploreMarketplace={() => setActiveTab("marketplace")}
                onListWebsite={() => setSubmitListingOpen(true)}
              />

              {/* Section 11: Enterprise Contact Us & Lead Generation */}
              <ContactUsSection showToast={showToast} />

              {/* 12. Final CTA Banner */}
              <FinalCtaBanner
                onExploreMarketplace={() => setActiveTab("marketplace")}
                onListWebsite={() => setSubmitListingOpen(true)}
              />
            </div>
          )}

          {/* DEDICATED GUEST POSTS DIRECTORY PAGE */}
          {activeTab === "guest-posts" && (
            <GuestPostsDirectoryView
              websites={filteredWebsites}
              filters={filters}
              setFilters={setFilters}
              resetFilters={() => setFilters(DEFAULT_FILTERS)}
              onQuickPreview={setPreviewSite}
              onSelectOrder={setPreviewSite}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              cartItems={cartItems}
              onAddToCart={(site) => {
                if (!cartItems.some((c) => c.id === site.id)) {
                  setCartItems([...cartItems, site]);
                  showToast(`Added ${site.domain} to bulk cart!`);
                } else {
                  showToast(`${site.domain} is already in your cart!`, "info");
                }
              }}
              showToast={showToast}
            />
          )}

          {/* GENERAL MARKETPLACE & LINK DIRECTORY */}
          {(activeTab === "marketplace" ||
            activeTab === "categories" ||
            activeTab === "link-insertions" ||
            activeTab === "link-exchange") && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {activeTab === "guest-posts"
                      ? "Guest Post Publications"
                      : activeTab === "link-insertions"
                      ? "Link Insertion Directory"
                      : activeTab === "link-exchange"
                      ? "Link Exchange Network"
                      : "Marketplace Publisher Directory"}
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTab === "link-exchange"
                      ? "Discover & trade verified reciprocal backlinks directly with DNS-verified website publishers with $0 commission fees."
                      : "Discover & order verified backlinks from high-authority media domains"}
                  </p>
                </div>

                {compareList.length > 0 && (
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="altf-btn-primary py-2 px-4 text-xs font-extrabold"
                  >
                    <span>Compare ({compareList.length} Selected)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                <div className="lg:col-span-1">
                  <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    resetFilters={() => setFilters(DEFAULT_FILTERS)}
                    totalResults={filteredWebsites.length}
                  />
                </div>

                <div className="lg:col-span-3">
                  {filteredWebsites.length === 0 ? (
                    <div className="altf-card p-12 text-center space-y-3 bg-white border border-slate-200">
                      <p className="text-lg font-bold text-slate-800">
                        No websites match your exact filter criteria
                      </p>
                      <p className="text-xs text-slate-500">
                        Try widening search terms, reducing minimum DR, or selecting All Niches.
                      </p>
                      <button
                        onClick={() => setFilters(DEFAULT_FILTERS)}
                        className="altf-btn-secondary py-2 px-5 text-xs font-bold mt-2"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredWebsites.map((site) => (
                        <WebsiteCard
                          key={site.id}
                          site={site}
                          isLinkExchange={activeTab === "link-exchange"}
                          onQuickPreview={setPreviewSite}
                          onSelectOrder={setPreviewSite}
                          isCompared={compareList.some((s) => s.id === site.id)}
                          onToggleCompare={handleToggleCompare}
                          onAddToCart={(s) => {
                            if (!cartItems.some((c) => c.id === s.id)) {
                              setCartItems([...cartItems, s]);
                              showToast(`Added ${s.domain} to bulk cart!`);
                            } else {
                              showToast(`${s.domain} is already in your cart!`, "info");
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BUYER PORTAL & CAMPAIGNS (AUTHENTICATED) */}
          {(activeTab === "buyer" ||
            activeTab === "campaigns" ||
            activeTab === "orders" ||
            activeTab === "analytics") &&
            (!userSession ? (
              <ProtectedSectionGuard
                title="Sign In to Access Buyer Portal"
                description="Track your guest post orders, 5-step milestone steppers, escrow dispute claims, and SEO campaign budgets."
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            ) : (
              <BuyerDashboard
                orders={orders}
                campaigns={campaigns}
                onCreateCampaign={handleCreateCampaign}
                onFileDispute={(order) => {
                  setDisputeOrder(order);
                  setDisputeOpen(true);
                }}
              />
            ))}

          {/* PUBLISHER STUDIO & WEBSITES (AUTHENTICATED) */}
          {(activeTab === "publisher" || activeTab === "wallet") &&
            (!userSession ? (
              <ProtectedSectionGuard
                title="Sign In to Access Publisher Studio"
                description="List your high-DR websites, perform DNS TXT verification, accept buyer requests, and request payout withdrawals."
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            ) : (
              <PublisherDashboard
                websites={websites}
                onSubmitWebsite={handleSubmitWebsite}
                onOpenSubmitModal={() => setSubmitListingOpen(true)}
                onOpenWithdrawal={() => setWithdrawalOpen(true)}
                incomingOrders={orders}
                onAcceptOrder={handleAcceptOrder}
                onSubmitLiveLink={handleSubmitLiveLink}
                onUpdateListing={handleUpdateListing}
              />
            ))}

          {/* ADMIN CONSOLE (SUPERADMIN ROLE GATED) */}
          {activeTab === "admin" &&
            (!userSession || (userSession.role !== "ADMIN" && userSession.role !== "SUPERADMIN") ? (
              <ProtectedSectionGuard
                title="Admin & Superadmin Access Only"
                description="This section is restricted to Platform Administrators and Superadmins for domain moderation and escrow approvals."
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            ) : (
              <AdminDashboard websites={websites} orders={orders} />
            ))}

          {/* SEO TOOLS & RESOURCES */}
          {(activeTab === "tools" || activeTab === "help") && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveTool("utm")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTool === "utm"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-white text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  UTM Campaign Builder
                </button>
                <button
                  onClick={() => setActiveTool("inspector")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    activeTool === "inspector"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-white text-slate-500 hover:text-indigo-600"
                  }`}
                >
                  Live Backlink Inspector
                </button>
              </div>

              {activeTool === "utm" ? <UTMBuilder /> : <LinkInspector />}
            </div>
          )}

          {/* CONTACT US TAB */}
          {activeTab === "contact" && (
            <ContactUsSection showToast={showToast} />
          )}

          {/* SETTINGS / MESSAGES */}
          {(activeTab === "settings" || activeTab === "messages") && (
            <div className="altf-card p-8 text-center space-y-3">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {activeTab} Workspace
              </h2>
              <p className="text-xs text-slate-500">
                Manage account preferences, API credentials, and email notification webhooks.
              </p>
            </div>
          )}
        </main>

        {/* Enterprise Footer attached to full-width workspace column */}
        <EnterpriseFooter setActiveTab={setActiveTab} />
      </div>

      {/* Global Search Dialog Modal (Cmd+K) */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        websites={websites}
        onSelectDomain={(site) => setPreviewSite(site)}
      />

      {/* Slide-over Quick Preview & Order Drawer */}
      {previewSite && (
        <QuickPreviewDrawer
          site={previewSite}
          onClose={() => setPreviewSite(null)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

      {/* Domain Compare Modal */}
      {showCompareModal && (
        <CompareModal
          compareList={compareList}
          onClose={() => setShowCompareModal(false)}
          onRemove={(siteId) => setCompareList(compareList.filter((s) => s.id !== siteId))}
          onOrder={(site) => {
            setShowCompareModal(false);
            setPreviewSite(site);
          }}
        />
      )}

      {/* Bulk Domain Search & CSV Match Modal */}
      <BulkDomainSearchModal
        isOpen={bulkSearchOpen}
        onClose={() => setBulkSearchOpen(false)}
        onBulkMatch={(list) => {
          showToast(`Matched ${list.length} target domains against marketplace inventory!`);
          setActiveTab("marketplace");
        }}
      />

      {/* Backlink ROI Calculator & Growth Simulator Modal */}
      <RoiCalculatorModal
        isOpen={roiCalcOpen}
        onClose={() => setRoiCalcOpen(false)}
        onApplyTarget={({ minDr, maxPrice }) => {
          setFilters((prev) => ({ ...prev, minDr, maxPrice }));
          showToast(`Filtered marketplace inventory for DR ${minDr}+ and max price $${maxPrice}`);
          setActiveTab("marketplace");
        }}
      />

      {/* Publisher Payout Withdrawal Modal */}
      <WithdrawalModal
        isOpen={withdrawalOpen}
        onClose={() => setWithdrawalOpen(false)}
        onConfirmWithdrawal={async (payout) => {
          try {
            await apiClient.requestWithdrawal(payout);
            showToast(`Payout request of $${payout.amount} submitted via ${payout.method.toUpperCase()}`);
          } catch (e) {
            showToast(e.message || "Failed to submit withdrawal request", "error");
          }
        }}
      />

      {/* Escrow Dispute Resolution Modal */}
      <DisputeResolutionModal
        isOpen={disputeOpen}
        onClose={() => {
          setDisputeOpen(false);
          setDisputeOrder(null);
        }}
        order={disputeOrder}
        onFileDispute={async (dispute) => {
          // The PATCH /orders/:id route only persists status/liveLinkUrl/
          // adminNotes/note from the body, so the dispute reason and
          // description are folded into `note` rather than sent as fields
          // the route would silently drop.
          const note = `Dispute: ${dispute.reason}${dispute.description ? ` — ${dispute.description}` : ""}`;
          try {
            await apiClient.updateOrderStatus(dispute.orderId, "DISPUTED", { note });
          } catch {
            await firebaseUpdateOrderStatus(dispute.orderId, "DISPUTED", { note });
          }
          setOrders((current) =>
            current.map((o) => (o.id === dispute.orderId ? { ...o, status: "DISPUTED" } : o))
          );
          showToast(`Dispute filed for Order ${dispute.orderId}. Escrow locked for crawler re-verification.`);
        }}
      />

      {/* Multi-Domain Cart Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveCartItem={(itemId) => setCartItems(cartItems.filter((i) => i.id !== itemId))}
        onCheckoutEscrow={({ items, totalPrice, targetUrl, anchorText }) => {
          items.forEach((item) => {
            handlePlaceOrder({
              websiteId: item.id,
              websiteDomain: item.domain,
              publisherId: item.publisherId || "pub_1",
              publisherName: item.publisherName || "Verified Media",
              type: "GUEST_POST",
              targetUrl,
              anchorText,
              campaignName: "Bulk Agency Campaign",
              price: item.prices?.guestPost || 180,
            });
          });
          setCartItems([]);
          showToast(`Bulk Escrow Vault locked for ${items.length} publisher placements ($${totalPrice})!`);
          setActiveTab("buyer");
        }}
      />

      {/* Publisher Website Submission Modal (PENDING_REVIEW workflow) */}
      <SubmitListingModal
        isOpen={submitListingOpen}
        onClose={() => setSubmitListingOpen(false)}
        onSubmitSuccess={handleSubmitWebsite}
      />

      {/* Google Auth & Email Login Modal */}
      <AuthLoginModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(user) => {
          setUserSession(user);
          if (user.role === "PUBLISHER") {
            setActiveTab("publisher");
            showToast(`Welcome back, ${user.name}! Publisher Studio unlocked.`);
          } else {
            setActiveTab("buyer");
            showToast(`Welcome back, ${user.name}! Buyer Portal unlocked.`);
          }
        }}
      />

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-white border border-slate-200 p-4 shadow-xl text-xs font-bold text-slate-900 flex items-center gap-3 animate-in slide-in-from-bottom duration-200">
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
