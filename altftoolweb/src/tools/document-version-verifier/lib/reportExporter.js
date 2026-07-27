import { saveAs } from "file-saver";

export function exportToJson(data, filename = "document-version-audit-report.json") {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  saveAs(blob, filename);
}

export function exportToCsv(data, filename = "document-version-diff.csv") {
  const rows = data.diffRows || [];
  let csvContent = "Line A,Line B,Type,Original Text,Updated Text\n";

  rows.forEach((row) => {
    const lineA = row.beforeLine || "";
    const lineB = row.afterLine || "";
    const type = row.type || "equal";
    const beforeText = `"${(row.before || "").replace(/"/g, '""')}"`;
    const afterText = `"${(row.after || "").replace(/"/g, '""')}"`;
    csvContent += `${lineA},${lineB},${type},${beforeText},${afterText}\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  saveAs(blob, filename);
}

export function exportToTxt(data, filename = "document-version-summary.txt") {
  let content = "=====================================================\n";
  content += "      DOCUMENT VERSION VERIFIER AUDIT REPORT         \n";
  content += "=====================================================\n\n";
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Original Document: ${data.docA?.name || "Document A"}\n`;
  content += `Updated Document:  ${data.docB?.name || "Document B"}\n\n`;

  content += "--- VERSION PREDICTION ---\n";
  content += `Status: ${data.versionAI?.status || "N/A"}\n`;
  content += `Recommended Latest Version: ${data.versionAI?.newerDoc || "N/A"}\n`;
  content += `Confidence: ${data.versionAI?.confidence || 0}%\n\n`;

  content += "--- SIMILARITY METRICS ---\n";
  content += `Overall Similarity: ${data.similarity?.overallSimilarity || 0}%\n`;
  content += `Cosine Similarity:  ${data.similarity?.cosineScore || 0}%\n`;
  content += `Jaccard Distance:    ${data.similarity?.jaccardScore || 0}%\n\n`;

  content += "--- SECURITY & TAMPERING ---\n";
  content += `Tampering Risk Score: ${data.security?.tamperScore || 0} / 100\n`;
  content += `Risk Level: ${data.security?.riskLevel || "Low"}\n`;
  if (data.security?.flags?.length) {
    content += "Flags:\n";
    data.security.flags.forEach((f) => (content += ` - ${f}\n`));
  }
  content += "\n";

  content += "--- AI INSIGHTS ---\n";
  if (data.versionAI?.aiInsights?.length) {
    data.versionAI.aiInsights.forEach((i) => (content += ` - ${i}\n`));
  }

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  saveAs(blob, filename);
}

export function exportToHtml(data, filename = "document-version-report.html") {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document Version Audit Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 900px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #4f46e5; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-weight: bold; font-size: 12px; background: #e0e7ff; color: #4338ca; }
    .risk-high { background: #fee2e2; color: #991b1b; }
    .risk-low { background: #dcfce7; color: #166534; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; text-align: left; }
    th { background: #f1f5f9; }
    .added { background: #dcfce7; }
    .removed { background: #fee2e2; }
    .changed { background: #fef9c3; }
  </style>
</head>
<body>
  <h1>Document Version Audit Report</h1>
  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>

  <div class="card">
    <h2>Version Prediction</h2>
    <p><strong>Original:</strong> ${data.docA?.name || "Document A"}</p>
    <p><strong>Updated:</strong> ${data.docB?.name || "Document B"}</p>
    <p><strong>Recommended Version:</strong> <span class="badge">${data.versionAI?.newerDoc || "N/A"}</span></p>
    <p><strong>Confidence:</strong> ${data.versionAI?.confidence || 0}%</p>
  </div>

  <div class="card">
    <h2>Security & Tampering Analysis</h2>
    <p><strong>Tampering Score:</strong> ${data.security?.tamperScore || 0} / 100</p>
    <p><strong>Risk Level:</strong> <span class="badge ${data.security?.tamperScore > 30 ? 'risk-high' : 'risk-low'}">${data.security?.riskLevel || 'Low'}</span></p>
  </div>

  <div class="card">
    <h2>AI Insights</h2>
    <ul>
      ${(data.versionAI?.aiInsights || []).map((insight) => `<li>${insight}</li>`).join('')}
    </ul>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  saveAs(blob, filename);
}

export async function exportToPdf(data, filename = "document-version-audit-report.pdf") {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text("DOCUMENT VERSION AUDIT REPORT", 40, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleString()} (100% Private Local Browser Verification)`, 40, 68);

    doc.setDrawColor(226, 232, 240);
    doc.line(40, 78, 555, 78);

    let y = 100;

    // Summary Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, y, 515, 90, 8, 8, "FD");

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Version Prediction & Lineage", 55, y + 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Original Copy:  ${data.docA?.name || "Document A"}`, 55, y + 45);
    doc.text(`Updated Copy:   ${data.docB?.name || "Document B"}`, 55, y + 60);
    doc.text(`Recommended:    ${data.versionAI?.newerDoc || "N/A"} (${data.versionAI?.confidence || 0}% Confidence)`, 55, y + 75);

    y += 110;

    // KPI Matrix
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(40, y, 515, 70, 8, 8, "FD");

    doc.setFont("helvetica", "bold");
    doc.text(`Overall Similarity: ${data.similarity?.overallSimilarity || 0}%`, 55, y + 25);
    doc.text(`Tampering Risk: ${data.security?.riskLevel || "Low"} (${data.security?.tamperScore || 0}/100)`, 220, y + 25);
    doc.text(`Hash Match: ${data.security?.hashesIdentical ? "Exact Match" : "Modified"}`, 400, y + 25);

    doc.setFont("helvetica", "normal");
    doc.text(`Words Added: ${data.diffSummary?.additions || 0}`, 55, y + 50);
    doc.text(`Words Removed: ${data.diffSummary?.removals || 0}`, 220, y + 50);
    doc.text(`Words Changed: ${data.diffSummary?.changes || 0}`, 400, y + 50);

    y += 90;

    // AI Insights
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("AI Executive Summary", 40, y);
    y += 15;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    (data.versionAI?.aiInsights || []).forEach((insight) => {
      doc.text(`• ${insight}`, 50, y);
      y += 16;
    });

    doc.save(filename);
  } catch (err) {
    console.error("PDF generation error:", err);
    // Fallback to HTML download if PDF generation encounters browser issues
    exportToHtml(data, filename.replace(".pdf", ".html"));
  }
}
