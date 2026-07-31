"use client";

import React, { useState, useEffect } from "react";
import { Card, Tabs } from "@altftool/ui";
import SleepForm from "../components/SleepForm";
import SleepDashboard from "../components/SleepDashboard";
import EducationalSection from "../components/EducationalSection";

const STORAGE_KEY = "altftool_sleep_logs";

export default function SleepTrackerHome() {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  // Both the load and save effects run on mount, so without this flag the
  // save effect's first run would persist the initial empty `logs` before
  // the load effect's setLogs has been reflected in a render, overwriting
  // previously saved data. Setting it via state (not a ref) matters: the
  // load effect's setLogs/setHasLoaded calls are batched into one render,
  // so by the time hasLoaded flips true, `logs` has already updated too —
  // a ref mutated directly in the load effect would still race, since the
  // save effect's `logs` closure stays stale within that same commit.
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLogs(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load sleep logs", e);
    } finally {
      setHasLoaded(true);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error("Failed to save sleep logs", e);
    }
  }, [logs, hasLoaded]);

  const handleAddLog = (newLog) => {
    const logWithId = {
      ...newLog,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLogs((prev) => [logWithId, ...prev]);
    setActiveTab("dashboard");
  };

  const handleDeleteLog = (id) => {
    setLogs((prev) => prev.filter((log) => log.id !== id));
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "log", label: "Log Sleep" },
    { key: "education", label: "Learn" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Sleep Tracking & Analyzer</h1>
        <p className="text-base text-(--muted-foreground)">
          Track your sleep habits, calculate your sleep score, and get personalized recommendations.
          <br />
          <span className="text-sm italic mt-1 block">Not a medical diagnostic tool. Data is saved locally.</span>
        </p>
      </header>

      <main>
        <Card className="p-6 shadow-sm md:p-8">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {activeTab === "dashboard" && (
            <SleepDashboard logs={logs} onDelete={handleDeleteLog} onGoToLog={() => setActiveTab("log")} />
          )}

          {activeTab === "log" && (
            <SleepForm onSave={handleAddLog} />
          )}

          {activeTab === "education" && (
            <EducationalSection />
          )}
        </Card>
      </main>
    </div>
  );
}
