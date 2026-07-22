import React from "react";
import { FileText, Download, Printer, Share2 } from "lucide-react";
import Papa from "papaparse";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ExportTools({ logs }) {
  const exportCSV = () => {
    if (logs.length === 0) return;
    const csv = Papa.unparse(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `symptom_diary_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = async () => {
    if (logs.length === 0) return;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Symptom Diary Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    let startY = 40;

    const chartsEl = document.getElementById("dashboard-charts");
    if (chartsEl) {
      try {
        const canvas = await html2canvas(chartsEl, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdfWidth = doc.internal.pageSize.getWidth();
        const pdfHeight = doc.internal.pageSize.getHeight();
        const margin = 14;
        const imgWidth = pdfWidth - (margin * 2);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, "PNG", margin, startY, imgWidth, imgHeight);
        startY += imgHeight + 10;

        if (startY > pdfHeight - 20) {
          doc.addPage();
          startY = 20;
        }
      } catch (err) {
        console.error("Error capturing charts:", err);
      }
    }

    const tableColumn = ["Date", "Symptom", "Category", "Severity", "Trigger", "Medication"];

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    let currentY = startY;
    let colWidth = [30, 40, 30, 20, 30, 30];
    let currentX = 14;

    tableColumn.forEach((col, i) => {
      doc.text(col, currentX, currentY);
      currentX += colWidth[i];
    });
    currentY += 8;

    doc.setFont("helvetica", "normal");
    logs.forEach(log => {
      currentX = 14;
      const row = [
        log.date,
        log.symptom,
        log.category,
        String(log.severity),
        log.trigger,
        log.medication || "-"
      ];
      row.forEach((colText, i) => {
        let text = (colText || "").toString();
        if (text.length > 20) text = text.substring(0, 18) + "..";
        doc.text(text, currentX, currentY);
        currentX += colWidth[i];
      });
      currentY += 8;
      if (currentY > pdfHeight - 20) {
        doc.addPage();
        currentY = 20;
      }
    });

    doc.save(`symptom_diary_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="bg-(--card) p-8 rounded-3xl border border-(--border) shadow-xl space-y-6 no-print overflow-hidden">
      <div className="flex items-center justify-between border-b border-(--border) pb-6">
        <h3 className="text-sm font-black text-(--foreground) uppercase tracking-widest flex items-center gap-3">
          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Download size={18} className="text-blue-600" />
          </div>
          Export Health Reports
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={exportPDF}
          className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm group"
        >
          <FileText size={18} className="group-hover:scale-110 transition-transform" /> Save PDF
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-3 py-4 bg-green-50 dark:bg-green-900/10 text-green-600 border border-green-100 dark:border-green-900/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all shadow-sm group"
        >
          <Download size={18} className="group-hover:scale-110 transition-transform" /> Save CSV
        </button>
        <button
          onClick={printReport}
          className="flex items-center justify-center gap-3 py-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 border border-blue-100 dark:border-blue-900/20 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-sm group"
        >
          <Printer size={18} className="group-hover:scale-110 transition-transform" /> Print Log
        </button>
      </div>
    </div>
  );
}
