"use client";

import { useMemo, useState, useEffect } from "react";

import SettingsContent from "./components/SettingsContent";
import SettingsSidebar from "./components/SettingsSidebar";
import { settingsData } from "./data/settingData";
import { useAds } from "@/ads/AdsProvider";
import AdCard from "@/ads/layouts/settingsupport/AdCardSupport";



export default function SettingSupportPage() {
  const [activeId, setActiveId] = useState("window-update");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const ads = useAds({ placement: "settingsupport" });

const sidebarAds = useMemo(() => {
  if (!ads.length) return [];
  return ads.slice(0, 4);
}, [ads]);

  const resolvedActiveId = settingsData.some((setting) => setting.id === activeId)
    ? activeId
    : settingsData[0]?.id;

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  // Handle sidebar toggle for mobile
  const handleSelect = (id) => {
    setActiveId(id);
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Handle opening sidebar
  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  // Handle closing sidebar
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen section">


      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Sidebar for Desktop — sticky so it stays in view while content scrolls */}
        <div className="hidden md:block md:w-72 shrink-0">
          <div className="sticky top-0 h-screen overflow-y-auto">
            <SettingsSidebar
              activeId={resolvedActiveId}
              onSelect={handleSelect}
              onClose={handleCloseSidebar}
            />
          </div>
        </div>


        {/* Sidebar for Mobile/Tablet - Slide in from left */}
        <div
          className={`
            md:hidden
            fixed inset-y-0 left-0 top-16 bottom-0 z-50 w-72
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          style={{ top: '62', paddingTop: '0' }}
        >
          <SettingsSidebar
            activeId={resolvedActiveId}
            onSelect={handleSelect}
            onClose={handleCloseSidebar}
          />
        </div>

        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300"
            onClick={handleCloseSidebar}
            aria-hidden="true"
          />
        )}

        {/* Content - This container allows scrolling */}
        <div className="flex flex-1 min-w-0">
  
  {/* Main Content */}
  <main className="flex-1 min-w-0">
    <SettingsContent
      activeId={resolvedActiveId}
      onOpenSidebar={handleOpenSidebar}
    />
  </main>

  {/* Right Ads (Desktop only) */}
  {sidebarAds.length > 0 && (
    <aside className="hidden lg:block w-80 shrink-0 pl-6">
      <div className="sticky top-20 space-y-4 flex flex-col ">
        {sidebarAds.map((ad, i) => (
          <AdCard key={`support-ad-${i}`} ad={ad} />
        ))}
      </div>
    </aside>
  )}

</div>

      </div>

    </div>
  );
};
