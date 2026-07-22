"use client";

import React, { useState, useEffect } from "react";
import { Card, Tabs } from "@altftool/ui";
import UserProfile from "../components/UserProfile";
import LogEntryForm from "../components/LogEntryForm";
import Dashboard from "../components/Dashboard";
import EducationalSection from "../components/EducationalSection";

const PROFILE_KEY = "altftool_diabetes_profile";
const LOGS_KEY = "altftool_diabetes_logs";

export default function DiabetesDashboardHome() {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    setActiveTab("dashboard");
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
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
    setActiveTab("dashboard");
  };

  const handleDeleteLog = (id) => {
    const updatedLogs = logs.filter((log) => log.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updatedLogs));
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
        <Card className="p-6 shadow-sm md:p-8">
          <Tabs
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {activeTab === "dashboard" && (
            <Dashboard
              logs={logs}
              profile={profile}
              onDelete={handleDeleteLog}
              onGoToLog={() => setActiveTab("log")}
              onGoToProfile={() => setActiveTab("profile")}
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
