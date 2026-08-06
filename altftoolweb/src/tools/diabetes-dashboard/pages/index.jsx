"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, Tabs, Alert } from "@altftool/ui";
import UserProfile from "../components/UserProfile";
import LogEntryForm from "../components/LogEntryForm";
import Dashboard from "../components/Dashboard";
import EducationalSection from "../components/EducationalSection";

const PROFILE_KEY = "altftool_diabetes_profile";
const LOGS_KEY = "altftool_diabetes_logs";

// How long the "Profile saved successfully" confirmation stays mounted on the
// Profile tab before we auto-navigate to the Dashboard. Must be long enough
// for a user to actually read it -- see the note on handleSaveProfile below.
const PROFILE_SAVED_NAVIGATE_DELAY_MS = 1400;

export default function DiabetesDashboardHome() {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [storageError, setStorageError] = useState(null);
  const saveNavigateTimeoutRef = useRef(null);

  // Load from local storage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(PROFILE_KEY);
      if (savedProfile) setProfile(JSON.parse(savedProfile));

      const savedLogs = localStorage.getItem(LOGS_KEY);
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.error("Failed to load diabetes data", e);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (saveNavigateTimeoutRef.current) clearTimeout(saveNavigateTimeoutRef.current);
    };
  }, []);

  // Any manual tab change (including the user clicking a tab themselves)
  // cancels a pending post-save auto-navigation, so we never yank a user
  // back to the Dashboard tab away from wherever they've since clicked.
  const changeTab = (key) => {
    if (saveNavigateTimeoutRef.current) {
      clearTimeout(saveNavigateTimeoutRef.current);
      saveNavigateTimeoutRef.current = null;
    }
    setActiveTab(key);
  };

  // Persist to localStorage and surface a visible error instead of silently
  // losing data when the write throws (quota exceeded, private browsing,
  // storage disabled, etc). React state has already been updated by the
  // caller by this point, so without this the UI looks like the save
  // succeeded even though nothing was written to disk.
  const persist = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setStorageError(null);
      return true;
    } catch (e) {
      console.error(`Failed to save diabetes data (${key})`, e);
      setStorageError(
        "Your last change couldn't be saved to this browser's storage (it may be full, or private browsing is blocking it). It's only kept in this tab for now -- please export or note it down before you close or reload the page."
      );
      return false;
    }
  };

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    persist(PROFILE_KEY, newProfile);
    // Delay the tab switch so UserProfile's own "Profile saved successfully"
    // confirmation actually gets painted to the screen before we navigate
    // away from it. Switching synchronously unmounts UserProfile (and its
    // success Alert) in the very same React commit that sets it visible.
    if (saveNavigateTimeoutRef.current) clearTimeout(saveNavigateTimeoutRef.current);
    saveNavigateTimeoutRef.current = setTimeout(() => {
      saveNavigateTimeoutRef.current = null;
      setActiveTab("dashboard");
    }, PROFILE_SAVED_NAVIGATE_DELAY_MS);
  };

  const handleAddLog = (newLog) => {
    const updatedLogs = [
      {
        ...newLog,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      },
      ...logs,
    ];
    setLogs(updatedLogs);
    persist(LOGS_KEY, updatedLogs);
    changeTab("dashboard");
  };

  const handleDeleteLog = (id) => {
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    persist(LOGS_KEY, updatedLogs);
  };

  const tabs = [
    { key: "dashboard", label: "Dashboard" },
    { key: "log", label: "Log Reading" },
    { key: "profile", label: "Profile" },
    { key: "education", label: "Education" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Diabetes Management Dashboard</h1>
        <p className="text-base text-(--muted-foreground)">
          Monitor your blood glucose readings, track your lifestyle habits, and estimate your HbA1c.
          <br />
          <span className="text-sm italic mt-1 block">Not a medical device. Data is saved locally.</span>
        </p>
      </header>

      <main>
        {storageError && (
          <Alert tone="danger" title="Storage error" className="mb-6">
            {storageError}
          </Alert>
        )}

        <Card className="p-6 shadow-sm md:p-8">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={changeTab}
            className="mb-6"
          />

          {activeTab === "dashboard" && (
            <Dashboard
              logs={logs}
              profile={profile}
              onDelete={handleDeleteLog}
              onGoToLog={() => changeTab("log")}
              onGoToProfile={() => changeTab("profile")}
            />
          )}

          {activeTab === "log" && (
            <LogEntryForm onSave={handleAddLog} />
          )}

          {activeTab === "profile" && (
            <UserProfile initialProfile={profile} onSave={handleSaveProfile} />
          )}

          {activeTab === "education" && (
            <EducationalSection />
          )}
        </Card>
      </main>
    </div>
  );
}
