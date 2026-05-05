import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download } from "lucide-react";

import {
  formatINR,
  formatUnits,
} from "../lib/calculateBill";

export function PDFButton({
  appliances,
  summary,
  efficientSummary,
  chartElementId,
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    try {
      const doc = new jsPDF({
        unit: "pt",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 50;
      let y = 40;

      const pdfFormat = (val) => formatINR(val).replace("₹", "Rs. ");

      const biggest = summary.biggestConsumer;
      const monthlySavings = Math.max(0, summary.monthlyCost - efficientSummary.monthlyCost);

      // Header - Modern Design
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 90, 12, 12, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("Electricity bill Report", margin + 25, y + 40);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.line(margin + 25, y + 50, margin + 200, y + 50);

      doc.setFontSize(11);
      doc.text("Household Electricity Cost Estimator & Appliance Analyzer", margin + 25, y + 68);

      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, pageWidth - margin - 140, y + 40);
      //doc.text(`State: ${selectedState}`, pageWidth - margin - 140, y + 55);

      y += 120;

      // Section: Billing Summary with "Cards"
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Billing Summary", margin, y);

      y += 12;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(2);
      doc.line(margin, y, margin + 40, y);

      y += 30;

      // Draw Summary Grid
      const cardWidth = (pageWidth - margin * 2 - 20) / 3;
      const drawCard = (label, value, x, currentY) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, currentY, cardWidth, 50, 8, 8, "F");
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(1);
        doc.roundedRect(x, currentY, cardWidth, 50, 8, 8, "S");

        doc.setTextColor(100, 116, 139);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text(label.toUpperCase(), x + 12, currentY + 18);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(12);
        doc.text(value, x + 12, currentY + 38);
      };

      drawCard("Monthly Units", formatUnits(summary.monthlyUnits), margin, y);
      drawCard("Monthly Bill", pdfFormat(summary.monthlyCost), margin + cardWidth + 10, y);
      drawCard("Yearly Bill", pdfFormat(summary.yearlyCost), margin + (cardWidth + 10) * 2, y);

      y += 65;

      drawCard("Tax Amount", pdfFormat(summary.taxAmount), margin, y);
      drawCard("Savings Possible", pdfFormat(monthlySavings), margin + cardWidth + 10, y);
      drawCard("Biggest Consumer", biggest ? biggest.name : "N/A", margin + (cardWidth + 10) * 2, y);

      y += 90;

      // Section: Appliance Table
      doc.setTextColor(30, 41, 59);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Appliance Details", margin, y);
      y += 12;
      doc.line(margin, y, margin + 40, y);
      y += 20;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, pageWidth - margin * 2, 28, 6, 6, "F");

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(10);
      doc.text("Appliance", margin + 15, y + 18);
      doc.text("Watts", margin + 170, y + 18);
      doc.text("Qty", margin + 230, y + 18);
      doc.text("Usage", margin + 280, y + 18);
      doc.text("Monthly Units", margin + 350, y + 18);
      doc.text("Monthly Cost", margin + 430, y + 18);

      y += 45;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);

      appliances.forEach((appliance, idx) => {
        if (y > 750) {
          doc.addPage();
          y = 50;
        }

        const monthlyUnits = (appliance.wattage * appliance.quantity * appliance.hoursPerDay * 30) / 1000;
        const monthlyCost = monthlyUnits * summary.effectiveCostPerUnit;

        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(margin, y - 15, pageWidth - margin * 2, 25, "F");
        }

        doc.text(appliance.name.slice(0, 25), margin + 15, y);
        doc.text(`${appliance.wattage}W`, margin + 170, y);
        doc.text(`x${appliance.quantity}`, margin + 230, y);
        doc.text(`${appliance.hoursPerDay}h/d`, margin + 280, y);
        doc.text(`${monthlyUnits.toFixed(1)} kWh`, margin + 350, y);
        doc.text(pdfFormat(monthlyCost), margin + 430, y);

        y += 25;
      });

      // Section: Charts
      const chartElement = document.getElementById(chartElementId);
      if (chartElement) {
        if (y > 450) {
          doc.addPage();
          y = 50;
        } else {
          y += 40;
        }

        doc.setTextColor(30, 41, 59);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Analytics Visualization", margin, y);
        y += 12;
        doc.line(margin, y, margin + 40, y);
        y += 30;

        const canvas = await html2canvas(chartElement, {
          backgroundColor: "#ffffff",
          scale: 2,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", margin, y, imgWidth, Math.min(350, imgHeight));
      }

      doc.save("Household-Electricity-cost-estimator.pdf");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-(--primary) px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Download size={17} />
      {loading
        ? "Preparing PDF..."
        : "Download Report"}
    </button>
  );
}