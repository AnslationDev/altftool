"use client";

import { useState, useRef } from "react";
import { Timer, BarChart2, Settings, ChevronRight } from "lucide-react";
import FocusTimer from "./FocusTimer";
import { useFocusStats } from "../hooks/useFocusStats";
import AnalyticsDashboard from "./AnalyticsDashboard";
import NotificationSettings from "./NotificationSettings";
import AutoLoop from "./AutoLoop";

const TABS = [
  { id: "timer", label: "Timer", icon: <Timer size={15} /> },
  { id: "analytics", label: "Analytics", icon: <BarChart2 size={15} /> },
  { id: "settings", label: "Settings", icon: <Settings size={15} /> },
];

export default function FocusTabs() {
  const [activeTab, setActiveTab] = useState("timer");
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);
  const [showArrow, setShowArrow] = useState(true);
  const [autoLoop, setAutoLoop] = useState(false);
  const {
    todayStats,
    totalSessions,
    addSession,
    streak,
    resetStreak,
    addDistraction,
    getAllStats,
  } = useFocusStats();

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    setShowArrow(!atEnd);
  };

  return (
    <div className="w-full bg-(--card) rounded-xl overflow-hidden">
      {/* TAB BAR */}
      <div className="border-b border-(--border) w-full">
        {/* MOBILE — 2 tabs visible, 3rd scrollable */}
        <div className="flex sm:hidden relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex w-full no-scrollbar"
            style={{ overflowX: "auto", scrollbarWidth: "none" }}
          >
            {TABS.map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{ minWidth: "50%", flexShrink: 0 }}
                className={`py-3 px-3 font-medium transition whitespace-nowrap text-sm flex items-center justify-center gap-1 border-none cursor-pointer bg-transparent
                  ${
                    activeTab === id
                      ? "text-(--primary) border-b-2 border-(--primary)"
                      : "text-(--muted-foreground)"
                  }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          {showArrow && (
            <div className="absolute right-0 top-0 h-full flex items-center pointer-events-none w-8 bg-gradient-to-r from-transparent to-(--card)">
              <ChevronRight
                size={16}
                className="ml-auto mr-1 text-(--muted-foreground)"
              />
            </div>
          )}
        </div>

        {/* DESKTOP — all 3 equal width */}
        <div className="hidden sm:flex w-full">
          {TABS.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-4 px-3 font-medium transition whitespace-nowrap text-base flex items-center justify-center gap-2 border-none cursor-pointer bg-transparent
                ${
                  activeTab === id
                    ? "text-(--primary) border-b-2 border-(--primary)"
                    : "text-(--muted-foreground) hover:text-(--foreground)"
                }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="p-4">
        <div className={activeTab === "timer" ? "block" : "hidden"}>
          <FocusTimer
            onSessionComplete={(minutes) => addSession(minutes)}
            onDistraction={() => addDistraction()}
            autoLoop={autoLoop}
            persistedStreak={streak}
            onResetStreak={resetStreak}
          />
        </div>

        <div className={activeTab === "analytics" ? "block" : "hidden"}>
          <AnalyticsDashboard
            todayStats={todayStats}
            getAllStats={getAllStats}
            totalSessions={totalSessions}
          />
        </div>

        <div className={activeTab === "settings" ? "block" : "hidden"}>
          <div className="flex flex-col gap-4">
            <h2 className="subheading">Settings</h2>
            <NotificationSettings />
            <AutoLoop autoLoop={autoLoop} setAutoLoop={setAutoLoop} />
          </div>
        </div>
      </div>
    </div>
  );
}
