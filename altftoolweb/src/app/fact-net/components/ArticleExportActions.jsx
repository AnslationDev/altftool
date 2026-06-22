"use client";

import { FileText, Printer } from "lucide-react";

function createText(article) {
  return [
    article.title,
    "",
    article.description,
    "",
    ...article.facts.map((fact, index) => `${index + 1}. ${fact}`),
  ].join("\n");
}

export default function ArticleExportActions({ article }) {
  function downloadTxt() {
    const blob = new Blob([createText(article)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${article.slug}-facts.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function printPdf() {
    const printWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!printWindow) {
      window.print();
      return;
    }

    const facts = article.facts
      .map((fact, index) => `<li><strong>#${String(index + 1).padStart(2, "0")}</strong> ${fact}</li>`)
      .join("");

    printWindow.document.write(`<!doctype html>
      <html>
        <head>
          <title>${article.title}</title>
          <style>
            body { font-family: Inter, Arial, sans-serif; padding: 32px; color: #111827; line-height: 1.6; }
            h1 { font-size: 34px; line-height: 1.1; margin: 0 0 12px; }
            p { color: #4b5563; }
            li { margin: 0 0 14px; page-break-inside: avoid; }
            strong { color: #2563eb; }
          </style>
        </head>
        <body>
          <h1>${article.title}</h1>
          <p>${article.description}</p>
          <ol>${facts}</ol>
        </body>
      </html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="fn-sidebar-actions">
      <button type="button" className="fn-button fn-button-primary" onClick={printPdf}>
        <Printer className="fn-icon" />
        Download as PDF
      </button>
      <button type="button" className="fn-button" onClick={downloadTxt}>
        <FileText className="fn-icon" />
        Export TXT
      </button>
    </div>
  );
}
