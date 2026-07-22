import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { formatCurrency, formatUnits, calculateApplianceMetrics } from "../utils/calculations";

export const exportToPDF = async (elementId, totals) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save("Appliance-Power-Report.pdf");
};

export const exportToCSV = (appliances, rate) => {
  const headers = ["Appliance", "Wattage", "Quantity", "Hours/Day", "Monthly Units (kWh)", "Monthly Cost (INR)"];
  const rows = appliances.map(app => {
    const metrics = calculateApplianceMetrics(app, rate);
    return [
      app.name,
      app.wattage,
      app.quantity,
      app.hoursPerDay,
      metrics.monthlyUnits.toFixed(2),
      metrics.monthlyCost.toFixed(2)
    ];
  });

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "Appliance-Power-Summary.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExportTools() {
  return null; // Logic-only component for now, or could have UI
}
