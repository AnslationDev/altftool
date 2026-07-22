"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import SymptomForm from "../components/SymptomForm";
import Dashboard from "../components/Dashboard";
import Timeline from "../components/Timeline";
import Filters from "../components/Filters";
import ExportTools from "../components/ExportTools";
import Features from "../components/Features";
import { getLogs, addLog, deleteLog } from "../utils/storage";
import { calculateStats, getChartData, getSmartInsights } from "../utils/analytics";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function ToolHome() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    category: "All",
    severity: "all",
    sortBy: "newest"
  });

  useEffect(() => {
    setLogs(getLogs());
  }, []);

  const handleAddLog = (newLog) => {
    const updatedLogs = addLog(newLog);
    setLogs(updatedLogs);
    toast.success("Symptom logged successfully!");
  };

  const handleDeleteLog = (id) => {
    if (confirm("Are you sure you want to delete this log entry?")) {
      const updatedLogs = deleteLog(id);
      setLogs(updatedLogs);
      toast.error("Entry deleted");
    }
  };

  const filteredLogs = useMemo(() => {
    return logs
      .filter(log => {
        const matchesSearch = log.symptom.toLowerCase().includes(filters.search.toLowerCase());
        const matchesCategory = filters.category === "All" || log.category === filters.category;
        const matchesSeverity = filters.severity === "all" ||
          (filters.severity === "mild" && log.severity <= 3) ||
          (filters.severity === "moderate" && log.severity >= 4 && log.severity <= 7) ||
          (filters.severity === "severe" && log.severity >= 8);

        return matchesSearch && matchesCategory && matchesSeverity;
      })
      .sort((a, b) => {
        if (filters.sortBy === "newest") return b.id - a.id;
        if (filters.sortBy === "oldest") return a.id - b.id;
        if (filters.sortBy === "severityHigh") return b.severity - a.severity;
        if (filters.sortBy === "severityLow") return a.severity - b.severity;
        return 0;
      });
  }, [logs, filters]);

  const stats = useMemo(() => calculateStats(logs), [logs]);
  const chartData = useMemo(() => getChartData(logs), [logs]);
  const insights = useMemo(() => getSmartInsights(logs), [logs]);

  return (
    <div className="px-4 py-8 bg-(--dealspage-background) min-h-screen">
      <Toaster position="bottom-right" />

      <Header />

      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Main Form Section */}
        <section className="no-print">
          <SymptomForm onAdd={handleAddLog} />
        </section>

        {/* Analytics Section */}
        {logs.length > 0 && (
          <section className="animate-fade-up">
            <Dashboard stats={stats} chartData={chartData} insights={insights} />
          </section>
        )}

        {/* History & Filtering Section */}
        {logs.length > 0 && (
          <section className="space-y-8 animate-fade-up">
            <div className="flex flex-col gap-6">
              <Filters
                filters={filters}
                onFilterChange={setFilters}
                onReset={() => setFilters({ search: "", category: "All", severity: "all", sortBy: "newest" })}
              />
              <ExportTools logs={filteredLogs} />
            </div>

            <Timeline
              logs={filteredLogs}
              onDelete={handleDeleteLog}
            />
          </section>
        )}

        {/* Empty State */}
        {logs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-(--card) rounded-3xl border border-(--border) border-dashed"
          >
            <Activity className="w-16 h-16 text-(--muted-foreground)/20 mx-auto mb-4" />
            <p className="text-(--muted-foreground) font-bold uppercase tracking-widest text-sm">
              No entries found. Start by logging your first symptom above.
            </p>
          </motion.div>
        )}
      </div>

      <Features />

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .max-w-6xl { max-width: 100% !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
