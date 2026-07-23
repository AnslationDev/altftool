"use client";

import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from "docx";

export function exportAs(conversation, format, options = {}) {
  switch (format) {
    case "json":
      return exportJSON(conversation);
    case "markdown":
      return exportMarkdown(conversation, options);
    case "html":
      return exportHTML(conversation, options);
    case "txt":
      return exportTXT(conversation);
    case "csv":
      return exportCSV(conversation);
    case "pdf":
      return exportPDF(conversation, options);
    case "docx":
      return exportDOCX(conversation, options);
    default:
      return exportMarkdown(conversation, options);
  }
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "chat-export";
}

function exportJSON(conversation) {
  const data = JSON.stringify(conversation, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  saveAs(blob, `${sanitizeFileName(conversation.title)}.json`);
}

function exportMarkdown(conversation, options = {}) {
  const { preserveHeadings = true, preserveLists = true } = options;
  let md = `# ${conversation.title}\n\n`;
  if (conversation.createdAt) {
    md += `*Exported: ${new Date(conversation.createdAt).toLocaleString()}*\n\n`;
  }
  md += `---\n\n`;

  for (const msg of conversation.messages) {
    const role = msg.role === "user" ? "**User**" : "**Assistant**";
    md += `> ${role}\n\n`;
    if (preserveHeadings) {
      md += msg.content + "\n\n";
    } else {
      md += msg.content.replace(/^#{1,6}\s+/gm, "") + "\n\n";
    }
    if (msg.codeBlocks?.length) {
      for (const cb of msg.codeBlocks) {
        md += `\`\`\`${cb.language}\n${cb.code}\n\`\`\`\n\n`;
      }
    }
    if (msg.tables?.length) {
      for (const table of msg.tables) {
        md += `| ${table.headers.join(" | ")} |\n`;
        md += `| ${table.headers.map(() => "---").join(" | ")} |\n`;
        for (const row of table.data) {
          md += `| ${row.join(" | ")} |\n`;
        }
        md += "\n";
      }
    }
    md += `---\n\n`;
  }
  const blob = new Blob([md], { type: "text/markdown" });
  saveAs(blob, `${sanitizeFileName(conversation.title)}.md`);
}

function exportHTML(conversation, options = {}) {
  const theme = options.theme || "light";
  const bgColor = theme === "dark" ? "#1a1a2e" : "#ffffff";
  const textColor = theme === "dark" ? "#e0e0e0" : "#1a1a2e";
  const userBg = theme === "dark" ? "#2d2d2d" : "#f7f7f8";
  const assistantBg = theme === "dark" ? "#1e1e1e" : "#ffffff";
  const codeBg = theme === "dark" ? "#0d0d0d" : "#f4f4f5";

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHTML(conversation.title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: ${bgColor}; color: ${textColor}; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  h1 { font-size: 1.8rem; border-bottom: 2px solid #10A37F; padding-bottom: 0.5rem; }
  .message { margin: 1.5rem 0; padding: 1rem; border-radius: 12px; }
  .message.user { background: ${userBg}; }
  .message.assistant { background: ${assistantBg}; border: 1px solid #e2e8f0; }
  .role { font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #10A37F; margin-bottom: 0.5rem; }
  .timestamp { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; }
  pre { background: ${codeBg}; border-radius: 8px; padding: 1rem; overflow-x: auto; margin: 0.75rem 0; }
  code { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.875rem; }
  table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: ${userBg}; font-weight: 600; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
</style>
</head>
<body>
<h1>${escapeHTML(conversation.title)}</h1>`;

  if (conversation.createdAt) {
    html += `<p style="color: #94a3b8; font-size: 0.875rem;">Exported: ${new Date(conversation.createdAt).toLocaleString()}</p>`;
  }

  for (const msg of conversation.messages) {
    html += `<div class="message ${msg.role}">`;
    html += `<div class="role">${msg.role === "user" ? "User" : "Assistant"}</div>`;
    html += `<div class="content">${escapeHTML(msg.content).replace(/\n/g, "<br>")}</div>`;
    if (msg.codeBlocks?.length) {
      for (const cb of msg.codeBlocks) {
        html += `<pre><code class="language-${escapeHTML(cb.language)}">${escapeHTML(cb.code)}</code></pre>`;
      }
    }
    if (msg.tables?.length) {
      for (const table of msg.tables) {
        html += "<table><thead><tr>";
        for (const h of table.headers) html += `<th>${escapeHTML(h)}</th>`;
        html += "</tr></thead><tbody>";
        for (const row of table.data) {
          html += "<tr>";
          for (const cell of row) html += `<td>${escapeHTML(cell)}</td>`;
          html += "</tr>";
        }
        html += "</tbody></table>";
      }
    }
    if (msg.timestamp) {
      html += `<div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>`;
    }
    html += "</div>";
  }

  html += `\n</body>\n</html>`;
  const blob = new Blob([html], { type: "text/html" });
  saveAs(blob, `${sanitizeFileName(conversation.title)}.html`);
}

function exportTXT(conversation) {
  let text = `${conversation.title}\n`;
  text += `${"=".repeat(conversation.title.length)}\n\n`;
  if (conversation.createdAt) {
    text += `Exported: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
  }
  for (const msg of conversation.messages) {
    const label = msg.role === "user" ? "User" : "Assistant";
    text += `--- ${label} ---\n`;
    text += msg.content + "\n";
    if (msg.codeBlocks?.length) {
      for (const cb of msg.codeBlocks) {
        text += `\n[Code (${cb.language})]\n${cb.code}\n`;
      }
    }
    text += "\n";
  }
  const blob = new Blob([text], { type: "text/plain" });
  saveAs(blob, `${sanitizeFileName(conversation.title)}.txt`);
}

function exportCSV(conversation) {
  let csv = "Role,Content,Timestamp\n";
  for (const msg of conversation.messages) {
    const role = msg.role === "user" ? "User" : "Assistant";
    const content = `"${(msg.content || "").replace(/"/g, '""')}"`;
    const ts = msg.timestamp || "";
    csv += `${role},${content},"${ts}"\n`;
  }
  const blob = new Blob([csv], { type: "text/csv" });
  saveAs(blob, `${sanitizeFileName(conversation.title)}.csv`);
}

function exportPDF(conversation, options = {}) {
  const pageSize = options.pageSize || "a4";
  const orientation = options.orientation || "portrait";
  const dark = options.darkTheme || false;
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: pageSize,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = options.margins || 20;
  const textColor = dark ? "#e0e0e0" : "#1a1a2e";
  const primaryColor = "#10A37F";
  let y = margin;

  doc.setFontSize(22);
  doc.setTextColor(dark ? "#ffffff" : "#1a1a2e");
  doc.text(conversation.title, pageWidth / 2, y, { align: "center" });
  y += 10;

  if (conversation.createdAt) {
    doc.setFontSize(10);
    doc.setTextColor("#94a3b8");
    doc.text(`Exported: ${new Date(conversation.createdAt).toLocaleString()}`, pageWidth / 2, y, { align: "center" });
    y += 8;
  }

  doc.setDrawColor(dark ? "#333333" : "#e2e8f0");
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  for (const msg of conversation.messages) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    const label = msg.role === "user" ? "User" : "Assistant";
    doc.setFontSize(11);
    doc.setTextColor(primaryColor);
    doc.setFont(undefined, "bold");
    doc.text(label, margin, y);
    y += 6;
    doc.setFont(undefined, "normal");
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    const lines = doc.splitTextToSize(msg.content || "", pageWidth - 2 * margin);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 4.5;
    }
    y += 4;
  }
  doc.save(`${sanitizeFileName(conversation.title)}.pdf`);
}

async function exportDOCX(conversation, options = {}) {
  const children = [];

  children.push(
    new Paragraph({
      text: conversation.title,
      heading: HeadingLevel.HEADING_1,
      alignment: "center",
      spacing: { after: 200 },
    })
  );

  if (conversation.createdAt) {
    children.push(
      new Paragraph({
        text: `Exported: ${new Date(conversation.createdAt).toLocaleString()}`,
        alignment: "center",
        spacing: { after: 400 },
        style: "Normal",
      })
    );
  }

  children.push(
    new Paragraph({
      children: [new TextRun({ text: "", size: 1 })],
      spacing: { after: 200 },
      borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" } },
    })
  );

  for (const msg of conversation.messages) {
    const label = msg.role === "user" ? "User" : "Assistant";
    const isUser = msg.role === "user";

    children.push(
      new Paragraph({
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({
            text: label,
            bold: true,
            color: "10A37F",
            size: 22,
          }),
        ],
      })
    );

    const content = msg.content || "";
    const paragraphs = content.split("\n\n");
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) continue;
      if (/^#{1,6}\s/.test(trimmed)) {
        const level = trimmed.match(/^#{1,6}/)[0].length;
        const text = trimmed.replace(/^#{1,6}\s*/, "");
        const headingLevel = Math.min(level, 6);
        children.push(
          new Paragraph({
            text,
            heading: `Heading${headingLevel}`,
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: trimmed, size: 20 })],
            spacing: { after: 100 },
          })
        );
      }
    }

    if (msg.codeBlocks?.length) {
      for (const cb of msg.codeBlocks) {
        children.push(
          new Paragraph({
            spacing: { before: 200, after: 50 },
            children: [
              new TextRun({
                text: `[Code: ${cb.language}]`,
                bold: true,
                size: 16,
                color: "607083",
              }),
            ],
          })
        );
        const codeLines = cb.code.split("\n");
        for (const line of codeLines) {
          children.push(
            new Paragraph({
              spacing: { after: 0 },
              indent: { left: 400 },
              children: [
                new TextRun({
                  text: line,
                  font: "Courier New",
                  size: 16,
                  color: "333333",
                }),
              ],
            })
          );
        }
      }
    }

    if (msg.tables?.length) {
      for (const table of msg.tables) {
        const docxTable = new Table({
          rows: [
            new TableRow({
              children: table.headers.map(
                (h) =>
                  new TableCell({
                    children: [new Paragraph({ text: h, bold: true })],
                    width: { size: 100 / table.headers.length, type: WidthType.PERCENTAGE },
                  })
              ),
            }),
            ...table.data.map(
              (row) =>
                new TableRow({
                  children: row.map(
                    (cell) =>
                      new TableCell({
                        children: [new Paragraph({ text: cell })],
                      })
                  ),
                })
            ),
          ],
        });
        children.push(docxTable);
      }
    }
  }

  const doc = new Document({
    title: conversation.title,
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFileName(conversation.title)}.docx`);
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
}

export function printConversation(conversation) {
  const printWindow = window.open("", "_blank");
  let html = `<!DOCTYPE html><html><head><title>${escapeHTML(conversation.title)}</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
  h1 { color: #10A37F; }
  .msg { margin: 1rem 0; padding: 1rem; border-left: 3px solid #10A37F; }
  .role { font-weight: bold; color: #10A37F; }
  pre { background: #f4f4f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #ddd; padding: 0.5rem; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>${escapeHTML(conversation.title)}</h1>`;
  for (const msg of conversation.messages) {
    html += `<div class="msg"><div class="role">${msg.role === "user" ? "User" : "Assistant"}</div>
<div>${escapeHTML(msg.content).replace(/\n/g, "<br>")}</div></div>`;
  }
  html += "</body></html>";
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}
