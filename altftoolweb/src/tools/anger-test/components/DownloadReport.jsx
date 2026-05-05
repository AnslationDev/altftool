"use client";

import { useState } from "react";
import { Download, Share2, Check, Loader2, FileText } from "lucide-react";

const cleanText = (str) =>
  str?.replace(/[\u{1F000}-\u{1FFFF}]|[\u2600-\u27BF]|[^\x00-\x7F]/gu, "").trim();

export default function DownloadReport({ score, levelData, angerType, stressCorrelation }) {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing]         = useState(false);
  const [copied, setCopied]           = useState(false);

  const generatePDF = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth    = doc.internal.pageSize.getWidth();
      const pageHeight   = doc.internal.pageSize.getHeight();
      const margin       = 25;
      const contentWidth = pageWidth - margin * 2;
      const SAFE_BOTTOM  = pageHeight - 20;
      let y = 0;

      // ── Colors ───────────────────────────────────────────────
      const BLACK   = [15,  23,  42 ];
      const DARK    = [51,  65,  85 ];
      const GRAY    = [100, 116, 139];
      const LGRAY   = [203, 213, 225];
      const PRIMARY = [37,  99,  235];
      const WHITE   = [255, 255, 255];

      const scoreColor = (s) => {
        if (s >= 80) return [220, 38,  38 ];
        if (s >= 60) return [234, 88,  12 ];
        if (s >= 40) return [202, 138, 4  ];
        if (s >= 20) return [37,  99,  235];
        return              [22,  163, 74 ];
      };

      // ── Helpers ───────────────────────────────────────────────
      const checkBreak = (needed) => {
        if (y + needed > SAFE_BOTTOM) {
          doc.addPage();
          y = margin;
        }
      };

      const setFont = (size, color, bold = false) => {
        doc.setFontSize(size);
        doc.setTextColor(...color);
        doc.setFont("helvetica", bold ? "bold" : "normal");
      };

      const line = (lx1, ly, lx2, color = LGRAY, lw = 0.3) => {
        doc.setDrawColor(...color);
        doc.setLineWidth(lw);
        doc.line(lx1, ly, lx2, ly);
      };

      const sectionTitle = (title) => {
        checkBreak(14);
        setFont(10, PRIMARY, true);
        doc.text(title, margin, y);
        y += 2;
        line(margin, y, margin + contentWidth, PRIMARY, 0.5);
        y += 6;
      };

      const drawBar = (x, by, w, h, pct, color) => {
        // track
        doc.setFillColor(...LGRAY);
        doc.roundedRect(x, by, w, h, 1, 1, "F");
        // fill
        if (pct > 0) {
          doc.setFillColor(...color);
          doc.roundedRect(x, by, Math.max((w * pct) / 100, 2), h, 1, 1, "F");
        }
      };

      const drawFooter = (p, total) => {
        doc.setPage(p);
        line(margin, pageHeight - 14, margin + contentWidth, LGRAY, 0.3);
        setFont(7, GRAY);
        doc.text(
          "This report is for informational purposes only — not a substitute for professional medical advice.",
          pageWidth / 2, pageHeight - 9, { align: "center" }
        );
        doc.text(`Page ${p} of ${total}`, pageWidth - margin, pageHeight - 9, { align: "right" });
      };

      // ════════════════════════════════════════════════════════
      // PAGE HEADER — letterhead style
      // ════════════════════════════════════════════════════════
      // Top accent line
      doc.setFillColor(...PRIMARY);
      doc.rect(0, 0, pageWidth, 3, "F");

      y = 14;
      setFont(18, BLACK, true);
      doc.text("Anger Assessment Report", margin, y);

      y += 5;
      setFont(9, GRAY);
      const dateStr = new Date().toLocaleDateString("en-US", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      });
      doc.text(`Date: ${dateStr}`, margin, y);

      y += 3;
      line(margin, y, margin + contentWidth, LGRAY, 0.4);
      y += 8;

      // ════════════════════════════════════════════════════════
      // SUMMARY
      // ════════════════════════════════════════════════════════
      sectionTitle("SUMMARY");

      const level        = cleanText(levelData?.level) || "N/A";
      const range        = levelData?.range || "N/A";
      const intensityPct = Math.round((score / 50) * 100);
      const sColor       = scoreColor(intensityPct);
      const angerTypeTxt = cleanText(angerType?.type) || "N/A";
      const angerDesc    = cleanText(angerType?.description) || "";

      // 3 summary rows
      const rows = [
        { label: "Patient Score",  value: `${score} out of 50` },
        { label: "Anger Level",    value: level                 },
        { label: "Score Range",    value: range                 },
        { label: "Anger Type",     value: angerTypeTxt          },
        { label: "Stress Factor",  value: `${stressCorrelation ?? 0}%` },
        { label: "Intensity",      value: `${intensityPct}%`   },
      ];

      rows.forEach(({ label, value }, i) => {
        checkBreak(8);
        const rowBg = i % 2 === 0 ? [248, 250, 252] : WHITE;
        doc.setFillColor(...rowBg);
        doc.rect(margin, y - 4, contentWidth, 8, "F");

        setFont(9, GRAY);
        doc.text(label, margin + 2, y);

        setFont(9, i === 1 ? sColor : BLACK, i <= 1);
        doc.text(value, margin + contentWidth - 2, y, { align: "right" });

        y += 8;
      });

      // Description below summary
      y += 2;
      checkBreak(10);
      setFont(8, GRAY);
      const descLines = doc.splitTextToSize(angerDesc, contentWidth);
      doc.text(descLines, margin, y);
      y += descLines.length * 5 + 6;

      // ════════════════════════════════════════════════════════
      // ANGER & STRESS INTENSITY BARS
      // ════════════════════════════════════════════════════════
      sectionTitle("INTENSITY OVERVIEW");

      const barRows = [
        { label: "Anger Intensity",     pct: intensityPct,          color: sColor      },
        { label: "Stress Contribution", pct: stressCorrelation ?? 0, color: [234,88,12] },
      ];

      barRows.forEach(({ label, pct, color }) => {
        checkBreak(12);
        setFont(9, DARK);
        doc.text(label, margin, y);
        setFont(9, color, true);
        doc.text(`${pct}%`, margin + contentWidth, y, { align: "right" });
        y += 4;
        drawBar(margin, y, contentWidth, 4, pct, color);
        y += 10;
      });

      // ════════════════════════════════════════════════════════
      // TRIGGER IDENTIFICATION
      // ════════════════════════════════════════════════════════
      const rawAnswers = localStorage.getItem("anger-answers");
      const answers    = rawAnswers ? JSON.parse(rawAnswers) : [];

      if (answers.length > 0) {
        const TRIGGER_MAP = [
          { label: "Traffic & Driving",        questionIds: [1, 10] },
          { label: "Work Pressure",            questionIds: [2]     },
          { label: "Criticism & Feedback",     questionIds: [3]     },
          { label: "Delays & Waiting",         questionIds: [4]     },
          { label: "Unexpected Problems",      questionIds: [5]     },
          { label: "Relationship Conflicts",   questionIds: [6]     },
          { label: "Broken Trust & Promises",  questionIds: [7]     },
          { label: "Impulse & Physical Anger", questionIds: [8]     },
        ];

        const triggers = TRIGGER_MAP.map((t) => {
          const relevant = answers.filter((a) => t.questionIds.includes(a.questionId));
          const total    = relevant.reduce((s, a) => s + a.value, 0);
          const pct      = Math.min(Math.round((total / (t.questionIds.length * 5)) * 100), 100);
          return { ...t, pct };
        }).sort((a, b) => b.pct - a.pct);

        sectionTitle("TOP ANGER TRIGGERS");

        triggers.forEach(({ label, pct }, i) => {
          checkBreak(12);
          setFont(9, DARK);
          doc.text(`${i + 1}. ${label}`, margin, y);
          const tColor = scoreColor(pct);
          setFont(9, tColor, true);
          doc.text(`${pct}%`, margin + contentWidth, y, { align: "right" });
          y += 4;
          drawBar(margin, y, contentWidth, 3, pct, tColor);
          y += 9;
        });
      }

      // ════════════════════════════════════════════════════════
      // PERSONALIZED SUGGESTIONS
      // ════════════════════════════════════════════════════════
      if (levelData?.suggestions?.length) {
        sectionTitle("PERSONALIZED SUGGESTIONS");
        levelData.suggestions.forEach((s, i) => {
          const cleaned = cleanText(s) || s;
          const lines   = doc.splitTextToSize(`${i + 1}.  ${cleaned}`, contentWidth - 4);
          const rowH    = lines.length * 5 + 4;
          checkBreak(rowH);
          // left accent bar
          doc.setFillColor(...PRIMARY);
          doc.rect(margin, y - 4, 1.5, rowH - 1, "F");
          setFont(9, DARK);
          doc.text(lines, margin + 4, y);
          y += rowH;
        });
        y += 4;
      }

      // ════════════════════════════════════════════════════════
      // TIPS
      // ════════════════════════════════════════════════════════
      const tipSections = [
        { title: "IMMEDIATE ACTIONS",    key: "immediate", accent: [22,  163, 74 ] },
        { title: "LONG-TERM STRATEGIES", key: "longTerm",  accent: [37,  99,  235] },
        { title: "LIFESTYLE CHANGES",    key: "lifestyle", accent: [124, 58,  237] },
      ];

      tipSections.forEach(({ title, key, accent }) => {
        const tips = levelData?.tips?.[key];
        if (!tips?.length) return;
        sectionTitle(title);
        tips.forEach((tip, i) => {
          const cleaned = cleanText(tip) || tip;
          const lines   = doc.splitTextToSize(`${i + 1}.  ${cleaned}`, contentWidth - 4);
          const rowH    = lines.length * 5 + 4;
          checkBreak(rowH);
          doc.setFillColor(...accent);
          doc.rect(margin, y - 4, 1.5, rowH - 1, "F");
          setFont(9, DARK);
          doc.text(lines, margin + 4, y);
          y += rowH;
        });
        y += 4;
      });

      // ── Footers ───────────────────────────────────────────────
      const totalPages = doc.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) drawFooter(p, totalPages);

      doc.save(`Anger-Report-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

const handleShare = async () => {
  setSharing(true);
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // ── Reuse same PDF generation logic ──
    const pageWidth    = doc.internal.pageSize.getWidth();
    const pageHeight   = doc.internal.pageSize.getHeight();
    const margin       = 25;
    const contentWidth = pageWidth - margin * 2;
    const SAFE_BOTTOM  = pageHeight - 20;
    let y = 0;

    const BLACK   = [15,  23,  42 ];
    const GRAY    = [100, 116, 139];
    const LGRAY   = [203, 213, 225];
    const PRIMARY = [37,  99,  235];
    const DARK    = [51,  65,  85 ];

    const scoreColor = (s) => {
      if (s >= 80) return [220, 38,  38];
      if (s >= 60) return [234, 88,  12];
      if (s >= 40) return [202, 138, 4 ];
      if (s >= 20) return [37,  99, 235];
      return              [22,  163, 74];
    };

    const checkBreak = (needed) => {
      if (y + needed > SAFE_BOTTOM) { doc.addPage(); y = margin; }
    };
    const setFont = (size, color, bold = false) => {
      doc.setFontSize(size);
      doc.setTextColor(...color);
      doc.setFont("helvetica", bold ? "bold" : "normal");
    };
    const line = (lx1, ly, lx2, color = LGRAY, lw = 0.3) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(lw);
      doc.line(lx1, ly, lx2, ly);
    };
    const sectionTitle = (title) => {
      checkBreak(14);
      setFont(10, PRIMARY, true);
      doc.text(title, margin, y);
      y += 2;
      line(margin, y, margin + contentWidth, PRIMARY, 0.5);
      y += 6;
    };
    const drawBar = (x, by, w, h, pct, color) => {
      doc.setFillColor(...LGRAY);
      doc.roundedRect(x, by, w, h, 1, 1, "F");
      if (pct > 0) {
        doc.setFillColor(...color);
        doc.roundedRect(x, by, Math.max((w * pct) / 100, 2), h, 1, 1, "F");
      }
    };

    // Header
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageWidth, 3, "F");
    y = 14;
    setFont(18, BLACK, true);
    doc.text("Anger Assessment Report", margin, y);
    y += 5;
    setFont(9, GRAY);
    doc.text(`Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}`, margin, y);
    y += 3;
    line(margin, y, margin + contentWidth, LGRAY, 0.4);
    y += 8;

    // Summary
    const level        = cleanText(levelData?.level) || "N/A";
    const range        = levelData?.range || "N/A";
    const intensityPct = Math.round((score / 50) * 100);
    const sColor       = scoreColor(intensityPct);

    sectionTitle("SUMMARY");
    const rows = [
      { label: "Patient Score", value: `${score} out of 50` },
      { label: "Anger Level",   value: level                },
      { label: "Score Range",   value: range                },
      { label: "Anger Type",    value: cleanText(angerType?.type) || "N/A" },
      { label: "Stress Factor", value: `${stressCorrelation ?? 0}%` },
      { label: "Intensity",     value: `${intensityPct}%`  },
    ];
    rows.forEach(({ label, value }, i) => {
      checkBreak(8);
      doc.setFillColor(...(i % 2 === 0 ? [248, 250, 252] : [255, 255, 255]));
      doc.rect(margin, y - 4, contentWidth, 8, "F");
      setFont(9, GRAY);
      doc.text(label, margin + 2, y);
      setFont(9, i === 1 ? sColor : BLACK, i <= 1);
      doc.text(value, margin + contentWidth - 2, y, { align: "right" });
      y += 8;
    });
    y += 4;

    // Bars
    sectionTitle("INTENSITY OVERVIEW");
    [
      { label: "Anger Intensity",     pct: intensityPct,           color: sColor       },
      { label: "Stress Contribution", pct: stressCorrelation ?? 0, color: [234, 88, 12]},
    ].forEach(({ label, pct, color }) => {
      checkBreak(12);
      setFont(9, DARK); doc.text(label, margin, y);
      setFont(9, color, true); doc.text(`${pct}%`, margin + contentWidth, y, { align: "right" });
      y += 4; drawBar(margin, y, contentWidth, 3, pct, color); y += 9;
    });

    // Triggers
    const rawAnswers = localStorage.getItem("anger-answers");
    const answers    = rawAnswers ? JSON.parse(rawAnswers) : [];
    if (answers.length > 0) {
      const TRIGGER_MAP = [
        { label: "Traffic & Driving",        questionIds: [1, 10] },
        { label: "Work Pressure",            questionIds: [2]     },
        { label: "Criticism & Feedback",     questionIds: [3]     },
        { label: "Delays & Waiting",         questionIds: [4]     },
        { label: "Unexpected Problems",      questionIds: [5]     },
        { label: "Relationship Conflicts",   questionIds: [6]     },
        { label: "Broken Trust & Promises",  questionIds: [7]     },
        { label: "Impulse & Physical Anger", questionIds: [8]     },
      ];
      const triggers = TRIGGER_MAP.map((t) => {
        const relevant = answers.filter((a) => t.questionIds.includes(a.questionId));
        const total    = relevant.reduce((s, a) => s + a.value, 0);
        const pct      = Math.min(Math.round((total / (t.questionIds.length * 5)) * 100), 100);
        return { ...t, pct };
      }).sort((a, b) => b.pct - a.pct);

      sectionTitle("TOP ANGER TRIGGERS");
      triggers.forEach(({ label, pct }, i) => {
        checkBreak(12);
        setFont(9, DARK); doc.text(`${i + 1}. ${label}`, margin, y);
        const tColor = scoreColor(pct);
        setFont(9, tColor, true); doc.text(`${pct}%`, margin + contentWidth, y, { align: "right" });
        y += 4; drawBar(margin, y, contentWidth, 3, pct, tColor); y += 9;
      });
    }

    // Suggestions
    if (levelData?.suggestions?.length) {
      sectionTitle("PERSONALIZED SUGGESTIONS");
      levelData.suggestions.forEach((s, i) => {
        const lines = doc.splitTextToSize(`${i + 1}.  ${cleanText(s) || s}`, contentWidth - 4);
        const rowH  = lines.length * 5 + 4;
        checkBreak(rowH);
        doc.setFillColor(...PRIMARY);
        doc.rect(margin, y - 4, 1.5, rowH - 1, "F");
        setFont(9, DARK); doc.text(lines, margin + 4, y);
        y += rowH;
      });
      y += 4;
    }

    // Tips
    [
      { title: "IMMEDIATE ACTIONS",    key: "immediate", accent: [22,  163, 74 ] },
      { title: "LONG-TERM STRATEGIES", key: "longTerm",  accent: [37,  99,  235] },
      { title: "LIFESTYLE CHANGES",    key: "lifestyle", accent: [124, 58,  237] },
    ].forEach(({ title, key, accent }) => {
      const tips = levelData?.tips?.[key];
      if (!tips?.length) return;
      sectionTitle(title);
      tips.forEach((tip, i) => {
        const lines = doc.splitTextToSize(`${i + 1}.  ${cleanText(tip) || tip}`, contentWidth - 4);
        const rowH  = lines.length * 5 + 4;
        checkBreak(rowH);
        doc.setFillColor(...accent);
        doc.rect(margin, y - 4, 1.5, rowH - 1, "F");
        setFont(9, DARK); doc.text(lines, margin + 4, y);
        y += rowH;
      });
      y += 4;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(...LGRAY); doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 14, margin + contentWidth, pageHeight - 14);
      setFont(7, GRAY);
      doc.text("This report is for informational purposes only — not a substitute for professional medical advice.", pageWidth / 2, pageHeight - 9, { align: "center" });
      doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 9, { align: "right" });
    }

    // ✅ Convert PDF to blob and share as FILE
    const pdfBlob = doc.output("blob");
    const fileName = `Anger-Report-${new Date().toISOString().split("T")[0]}.pdf`;
    const pdfFile = new File([pdfBlob], fileName, { type: "application/pdf" });

    // ✅ Check if browser supports sharing files
    if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      await navigator.share({
        title: "My Anger Assessment Report",
        text: "Here is my Anger Assessment Report.",
        files: [pdfFile],
      });
    } else {
      // ✅ Fallback — auto download the PDF if file sharing not supported
      const url = URL.createObjectURL(pdfBlob);
      const a   = document.createElement("a");
      a.href    = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }

  } catch (err) {
    console.error("Share failed:", err);
  } finally {
    setSharing(false);
  }
};

  return (
    <div className="bg-(--card) rounded-2xl p-6 mb-6 border-2 border-(--border)">

      {/* Header */}
      <h3 className="subheading flex items-start gap-2 mb-4 leading-tight">
        <FileText size={22} className="text-(--primary) mt-0.5 shrink-0" />
        Download Your Report
      </h3>

      <p className="description text-sm mb-6">
        Save a professional PDF report or share your results with others.
      </p>

      {/* Preview */}
      <div className="bg-(--background) rounded-xl border-2 border-(--border) p-4 mb-6">
        <p className="description text-xs font-semibold uppercase mb-3">Report Includes</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Overall Score & Level",
            "Anger Type Analysis",
            "Top Anger Triggers",
            "Stress Correlation",
            "Personalized Suggestions",
            "Immediate Actions",
            "Long-term Strategies",
            "Lifestyle Changes",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                <Check size={10} className="text-white" />
              </span>
              <span className="font-secondary text-sm text-(--foreground)">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={generatePDF}
          disabled={downloading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-(--primary) text-white rounded-xl font-secondary font-semibold transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:opacity-60 cursor-pointer"
        >
          {downloading
            ? <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
            : <><Download size={18} /> Download PDF Report</>}
        </button>

        <button
          onClick={handleShare}
          disabled={sharing}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-(--primary) text-(--primary) rounded-xl font-secondary font-semibold transition-all duration-300 hover:bg-(--primary)/10 disabled:opacity-60 cursor-pointer"
        >
          {sharing
            ? <><Loader2 size={18} className="animate-spin" /> Sharing...</>
            : copied
            ? <><Check size={18} className="text-green-500" /> Copied to Clipboard!</>
            : <><Share2 size={18} /> Share Results</>}
        </button>
      </div>

      <p className="description text-xs text-center mt-3">
        PDF is generated locally — your data never leaves your device.
      </p>
    </div>
  );
}