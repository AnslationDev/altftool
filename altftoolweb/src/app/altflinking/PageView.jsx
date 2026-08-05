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
import PlatformArchitectureShowcase from "./components/landing/PlatformArchitectureShowcase";
import MarketplaceCategories from "./components/landing/MarketplaceCategories";
import FeaturedPublishers from "./components/landing/FeaturedPublishers";
import RecentOpportunitiesTable from "./components/landing/RecentOpportunitiesTable";
import WhyChooseAltF from "./components/landing/WhyChooseAltF";
import FeatureHighlights from "./components/landing/FeatureHighlights";
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
import DisputeResolutionModal from "./components/buyer/DisputeResolutionModal";
import CartCheckoutDrawer from "./components/marketplace/CartCheckoutDrawer";
import SubmitListingModal from "./components/publisher/SubmitListingModal";
import AuthLoginModal from "./components/common/AuthLoginModal";
import { LoadingState, EmptyState, ErrorState } from "./components/common/UIStateComponents";

import {
  subscribeToAuthState,
  logoutUser,
} from "./services/firebaseService";

import * as apiClient from "./services/apiClient";

import "./altflinking.css";

import { resolveGuestPostPrice } from "./lib/pricing";
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
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status: "ACCEPTED" } : order))
      );
      showToast("Request accepted. Submit the published URL when it is ready for review.");
    } catch (error) {
      showToast(error.message || "Failed to accept order", "error");
    }
  };

  const handleSubmitLiveLink = async (orderId, liveLinkUrl) => {
    try {
      await apiClient.updateOrderStatus(orderId, "PUBLISHED", { liveLinkUrl });
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId ? { ...order, status: "PUBLISHED", liveLinkUrl } : order
        )
      );
      showToast("Published URL submitted for admin review.");
    } catch (error) {
      showToast(error.message || "Failed to submit published URL", "error");
    }
  };

  // Production data comes only from the authenticated API. API failures must
  // remain visible instead of silently substituting demo inventory or orders.
  const loadData = useCallback(async () => {
    setLoading(true);
    setDataError(null);
    try {
      const sitesData = await apiClient.fetchMarketplaceListings(filters);
      const [ordersData, campaignsData] = userSession
        ? await Promise.all([apiClient.fetchUserOrders(), apiClient.fetchUserCampaigns()])
        : [[], []];

      setWebsites(sitesData || []);
      setOrders(ordersData || []);
      setCampaigns(campaignsData || []);
    } catch (err) {
      console.error("Data load error:", err);
      setDataError(err.message || "Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  }, [filters, userSession]);

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
      const newOrder = await apiClient.placeOrder(orderPayload);
      setOrders((prev) => [newOrder, ...prev]);
      setPreviewSite(null);
      showToast("Order request submitted for admin review.");
      return newOrder;
    } catch (err) {
      showToast(err.message || "Failed to place order", "error");
      return null;
    }
  };

  // Website Submission Handler (Enters PENDING_REVIEW)
  const handleSubmitWebsite = async (sitePayload) => {
    if (!userSession) {
      setAuthModalOpen(true);
      showToast("Please sign in to submit a website", "error");
      return;
    }

    try {
      const newSite = await apiClient.submitWebsiteListing(sitePayload);
      showToast(`Website ${newSite.domain || sitePayload.domain} submitted for admin review.`);
      setWebsites((prev) => [newSite, ...prev]);
      return newSite;
    } catch (error) {
      showToast(error.message || "Failed to submit website", "error");
      throw error;
    }
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
      const newCamp = await apiClient.createCampaign(campPayload);
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
          String(s.domain || "").toLowerCase().includes(q) ||
          String(s.name || "").toLowerCase().includes(q) ||
          String(s.niche || "").toLowerCase().includes(q)
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
      result = result.filter((site) => {
        const price = resolveGuestPostPrice(site);
        return price !== null && price <= filters.maxPrice;
      });
    }

    switch (filters.sortBy) {
      case "dr_desc":
        result.sort((a, b) => b.dr - a.dr);
        break;
      case "traffic_desc":
        result.sort((a, b) => b.traffic - a.traffic);
        break;
      case "price_asc":
        result.sort((a, b) => {
          const aPrice = resolveGuestPostPrice(a);
          const bPrice = resolveGuestPostPrice(b);
          if (aPrice === null) return bPrice === null ? 0 : 1;
          if (bPrice === null) return -1;
          return aPrice - bPrice;
        });
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
          {loading ? (
            <LoadingState
              title="Loading marketplace listings"
              message="Fetching publisher-submitted listings from the ALTFTool service."
            />
          ) : dataError ? (
            <ErrorState
              title="Marketplace service unavailable"
              error={`${dataError}. No demo listings or local order data have been substituted.`}
              onRetry={loadData}
            />
          ) : null}

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

              {/* 3. Marketplace Categories Pills */}
              <MarketplaceCategories
                onSelectCategory={(categoryName) => {
                  setFilters({ ...DEFAULT_FILTERS, niche: categoryName });
                  setActiveTab("marketplace");
                }}
              />

              {/* 4. Featured Publishers Grid (5 Cards) */}
              <FeaturedPublishers
                publishers={websites}
                onSelectSite={(site) => setPreviewSite(site)}
                onExploreMarketplace={() => setActiveTab("marketplace")}
              />

              {/* 5. Recent Backlink Opportunities Table */}
              <RecentOpportunitiesTable
                websites={websites}
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
                      ? "Review publisher-submitted reciprocal-link listings and their stated terms."
                      : "Review approved listings and submit a placement request to the publisher."}
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
                    <EmptyState
                      title="No approved listings found"
                      message="No live marketplace listing matches these filters. Metrics and prices are shown only when supplied on an approved listing."
                      actionLabel="Reset filters"
                      onAction={() => setFilters(DEFAULT_FILTERS)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                      {filteredWebsites.map((site) => (
                        <WebsiteCard
                          key={site.id}
                          site={site}
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
                description="Track placement requests, recorded order statuses, disputes, and campaign budgets."
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
                description="Submit website listings, perform DNS TXT verification, and respond to recorded placement requests."
                onOpenAuth={() => setAuthModalOpen(true)}
              />
            ) : (
              <PublisherDashboard
                websites={websites}
                onSubmitWebsite={handleSubmitWebsite}
                onOpenSubmitModal={() => setSubmitListingOpen(true)}
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
                description="This section is restricted to Platform Administrators and Superadmins for listing and order moderation."
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

      {/* Order Dispute Resolution Modal */}
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
            setOrders((current) =>
              current.map((o) => (o.id === dispute.orderId ? { ...o, status: "DISPUTED" } : o))
            );
            showToast(`Dispute filed for Order ${dispute.orderId} for admin review.`);
          } catch (error) {
            showToast(error.message || "Failed to file dispute", "error");
            throw error;
          }
        }}
      />

      {/* Multi-Domain Cart Checkout Drawer */}
      <CartCheckoutDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveCartItem={(itemId) => setCartItems(cartItems.filter((i) => i.id !== itemId))}
        onCheckout={async ({ items, targetUrl, anchorText }) => {
          if (!userSession) {
            setAuthModalOpen(true);
            throw new Error("Please sign in to submit order requests");
          }
          const results = await Promise.allSettled(
            items.map((item) =>
              apiClient.placeOrder({
                listingId: item.id,
                type: "GUEST_POST",
                targetUrl,
                anchorText,
                campaignName: "Bulk Agency Campaign",
              })
            )
          );

          const createdOrders = results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          const successfulListingIds = new Set(
            results.flatMap((result, index) =>
              result.status === "fulfilled" ? [items[index].id] : []
            )
          );
          const failedCount = results.length - createdOrders.length;

          if (createdOrders.length > 0) {
            setOrders((current) => [...createdOrders, ...current]);
            setCartItems((current) =>
              current.filter((item) => !successfulListingIds.has(item.id))
            );
          }

          if (failedCount > 0) {
            const message = `${createdOrders.length} request${createdOrders.length === 1 ? "" : "s"} submitted; ${failedCount} failed and remain in the cart.`;
            showToast(message, "error");
            throw new Error(message);
          }

          showToast(`${createdOrders.length} order requests submitted for admin review.`);
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
