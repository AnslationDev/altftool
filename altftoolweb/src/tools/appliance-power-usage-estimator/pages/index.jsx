"use client";

import React, { useState, useEffect, useMemo } from "react";
import Header from "../components/Header";
import SummaryDashboard from "../components/SummaryDashboard";
import ApplianceForm from "../components/ApplianceForm";
import ApplianceList from "../components/ApplianceList";
import ApplianceAnalytics from "../components/ApplianceAnalytics";
import SmartInsights from "../components/SmartInsights";
import Charts from "../components/Charts";
import { exportToPDF, exportToCSV } from "../components/ExportTools";
import { calculateTotals } from "../utils/calculations";
import { loadFromStorage, saveToStorage, clearStorage } from "../utils/storage";
import { Toaster, toast } from "react-hot-toast";

export default function ToolHome() {
  const [appliances, setAppliances] = useState([]);
  const [electricityRate, setElectricityRate] = useState("8.0");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      setAppliances(savedData.appliances || []);
      setElectricityRate(savedData.rate || "8.0");
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveToStorage({ appliances, rate: electricityRate });
    }
  }, [appliances, electricityRate, isLoaded]);

  const handleAddAppliance = (appliance) => {
    setAppliances((prev) => [appliance, ...prev]);
    toast.success("Appliance added successfully!");
  };

  const handleRemoveAppliance = (id) => {
    setAppliances((prev) => prev.filter((app) => app.id !== id));
    toast.error("Appliance removed");
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all data?")) {
      setAppliances([]);
      setElectricityRate("8.0");
      clearStorage();
      toast.success("All data reset");
    }
  };

  const totals = useMemo(
    () => calculateTotals(appliances, electricityRate),
    [appliances, electricityRate]
  );

  const handlePDF = () => {
    toast.promise(exportToPDF("estimator-main-content", totals), {
      loading: "Preparing PDF...",
      success: "PDF downloaded!",
      error: "Could not generate PDF",
    });
  };

  const handleCSV = () => {
    exportToCSV(appliances, electricityRate);
    toast.success("CSV downloaded!");
  };

  return (
    <div className="px-4 py-8 bg-(--dealspage-background) min-h-screen">
      <Toaster position="bottom-right" />

      <Header onReset={handleReset} onExportPDF={handlePDF} onExportCSV={handleCSV} />

      <main id="estimator-main-content" className="max-w-2xl mx-auto space-y-10 pb-24">
        {/* Dashboard Section */}
        <section className="animate-fade-up">
          <SummaryDashboard totals={totals} />
        </section>

        <div className="flex flex-col gap-8 items-start">
          {/* Form Section */}
          <section className="w-full animate-fade-up no-print">
            <ApplianceForm
              onAdd={handleAddAppliance}
              electricityRate={electricityRate}
              setElectricityRate={setElectricityRate}
            />
          </section>

          {/* List Section */}
          <section className="w-full animate-fade-up">
            <ApplianceList
              appliances={appliances}
              rate={electricityRate}
              onRemove={handleRemoveAppliance}
            />
          </section>
        </div>

        {/* Analytics & Charts Section */}
        {appliances.length > 0 && (
          <>
            <section className="animate-fade-up">
              <ApplianceAnalytics
                appliances={appliances}
                rate={electricityRate}
                totalMonthlyCost={totals.totalMonthlyCost}
              />
            </section>

            <section className="animate-fade-up">
              <Charts appliances={appliances} rate={electricityRate} />
            </section>

            <section className="animate-fade-up">
              <h2 className="text-2xl font-black text-(--foreground) mb-6 px-2">Smart Insights</h2>
              <SmartInsights appliances={appliances} rate={electricityRate} />
            </section>
          </>
        )}
      </main>

      <style jsx global>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.5s ease-out forwards;
        }
        @media print {
          .no-print { display: none !important; }
          .bg-(--dealspage-background) { background: white !important; }
        }
      `}</style>
    </div>
  );
}
