import React, { useState } from "react";
import { Download, Printer, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ExportPanel = ({ stats, subjects }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadPDF = async () => {
    const element = document.getElementById("analysis-report");
    if (!element) {
      console.error("Export element not found");
      return;
    }

    try {
      setIsGenerating(true);

      // Using dynamic imports for heavy libraries
      const { toPng } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");

      const dataUrl = await toPng(element, {
        cacheBust: true,
        backgroundColor: "white",
        style: {
          borderRadius: "0",
        },
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Exam-Score-Analysis.pdf");

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try again or use the Print button.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-3 items-center justify-center sm:justify-end">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 bg-(--background) border border-(--border) rounded-lg text-xs font-bold text-(--foreground) hover:bg-(--card) transition-all"
      >
        <Printer size={14} /> Print Report
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={downloadPDF}
        disabled={isGenerating}
        className={`flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow-md transition-all ${
          isGenerating ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700"
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Download size={14} /> Download PDF
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ExportPanel;
