import { jsPDF } from "jspdf";

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

export function slugifyTitle(title) {
  return (title || "api-documentation")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "api-documentation";
}

export function downloadTextFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Plain btoa()/atob() only handle Latin1 (code points <= U+00FF) and throw an
// InvalidCharacterError on anything else — which real API titles/descriptions
// routinely contain (accented letters, em dashes, curly quotes, non-Latin
// scripts). These wrap the spec's UTF-8 bytes so any JSON string round-trips.
export function base64EncodeUnicode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

export function base64DecodeUnicode(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// Encodes the spec into a shareable URL — mirrors SwaggerDocGenerator's own share-link logic.
export function buildShareUrl(spec) {
  const encoded = encodeURIComponent(base64EncodeUnicode(JSON.stringify(spec)));
  return `${window.location.origin}${window.location.pathname}?spec=${encoded}`;
}

export function swaggerToMarkdown(spec) {
  const lines = [];
  lines.push(`# ${spec.info?.title || "API Documentation"}`, "");
  if (spec.info?.description) lines.push(spec.info.description, "");
  lines.push(`**Version:** ${spec.info?.version || "1.0.0"}`);
  if (spec.servers?.[0]?.url) lines.push(`**Base URL:** \`${spec.servers[0].url}\``);
  lines.push("", "---", "");

  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, op]) => {
      lines.push(`## ${method.toUpperCase()} ${path}`, "");
      if (op.summary) lines.push(op.summary, "");
      if (op.description) lines.push(op.description, "");

      if (op.parameters?.length) {
        lines.push(
          "**Parameters:**",
          "",
          "| Name | In | Type | Required | Description |",
          "|------|----|----|----|----|",
        );
        op.parameters.forEach((p) => {
          lines.push(
            `| ${p.name} | ${p.in} | ${p.schema?.type || "string"} | ${p.required ? "Yes" : "No"} | ${p.description || ""} |`,
          );
        });
        lines.push("");
      }

      if (op.requestBody) {
        lines.push("**Request Body:**", "```json", JSON.stringify(op.requestBody, null, 2), "```", "");
      }

      if (op.responses) {
        lines.push("**Responses:**", "");
        Object.entries(op.responses).forEach(([code, res]) => {
          lines.push(`- \`${code}\` — ${res.description || ""}`);
        });
        lines.push("");
      }

      lines.push("---", "");
    });
  });

  return lines.join("\n");
}

export function swaggerToHtml(spec) {
  const endpointsHtml = Object.entries(spec.paths || {})
    .flatMap(([path, methods]) =>
      Object.entries(methods).map(([method, op]) => `
      <section class="endpoint">
        <h2><span class="method ${method}">${escapeHtml(method)}</span> <code>${escapeHtml(path)}</code></h2>
        ${op.summary ? `<p class="summary">${escapeHtml(op.summary)}</p>` : ""}
        ${op.description ? `<p>${escapeHtml(op.description)}</p>` : ""}
        ${op.parameters?.length ? `
          <h3>Parameters</h3>
          <table>
            <thead><tr><th>Name</th><th>In</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
            <tbody>${op.parameters.map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${escapeHtml(p.in)}</td><td>${escapeHtml(p.schema?.type || "string")}</td><td>${p.required ? "Yes" : "No"}</td><td>${escapeHtml(p.description || "")}</td></tr>`).join("")}</tbody>
          </table>` : ""}
        ${op.responses ? `
          <h3>Responses</h3>
          <ul>${Object.entries(op.responses).map(([code, res]) => `<li><strong>${escapeHtml(code)}</strong> — ${escapeHtml(res.description || "")}</li>`).join("")}</ul>` : ""}
      </section>`),
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(spec.info?.title || "API Documentation")}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 860px; margin: 40px auto; padding: 0 20px; color: #111827; line-height: 1.6; }
  h1 { font-size: 2rem; margin-bottom: 4px; }
  .meta { color: #607083; margin-bottom: 24px; }
  .endpoint { border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin-bottom: 20px; }
  .method { display: inline-block; padding: 2px 10px; border-radius: 6px; color: #fff; font-size: .75rem; font-weight: 700; text-transform: uppercase; margin-right: 8px; }
  .method.get { background: #2563eb; } .method.post { background: #16a34a; } .method.put { background: #ca8a04; }
  .method.patch { background: #f97316; } .method.delete { background: #dc2626; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 10px; text-align: left; font-size: .875rem; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
</style>
</head>
<body>
  <h1>${escapeHtml(spec.info?.title || "API Documentation")}</h1>
  <p class="meta">Version ${escapeHtml(spec.info?.version || "1.0.0")}${spec.servers?.[0]?.url ? ` &middot; <code>${escapeHtml(spec.servers[0].url)}</code>` : ""}</p>
  ${spec.info?.description ? `<p>${escapeHtml(spec.info.description)}</p>` : ""}
  ${endpointsHtml}
</body>
</html>`;
}

export function swaggerToPdf(spec) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const lineHeight = 15;
  let y = 50;

  const ensureSpace = (needed = lineHeight) => {
    if (y + needed > pageHeight - 40) {
      doc.addPage();
      y = 50;
    }
  };

  const writeLine = (text, { size = 10, bold = false, color = "#111827" } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const wrapped = doc.splitTextToSize(String(text), pageWidth - marginX * 2);
    wrapped.forEach((line) => {
      ensureSpace();
      doc.text(line, marginX, y);
      y += lineHeight;
    });
  };

  writeLine(spec.info?.title || "API Documentation", { size: 20, bold: true });
  writeLine(`Version ${spec.info?.version || "1.0.0"}`, { size: 10, color: "#607083" });
  if (spec.servers?.[0]?.url) writeLine(spec.servers[0].url, { size: 10, color: "#0d9488" });
  if (spec.info?.description) {
    y += 4;
    writeLine(spec.info.description, { size: 11 });
  }
  y += 8;

  Object.entries(spec.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, op]) => {
      ensureSpace(30);
      y += 6;
      writeLine(`${method.toUpperCase()}  ${path}`, { size: 13, bold: true });
      if (op.summary) writeLine(op.summary, { size: 10 });
      if (op.description) writeLine(op.description, { size: 10, color: "#607083" });

      if (op.parameters?.length) {
        writeLine("Parameters:", { size: 10, bold: true });
        op.parameters.forEach((p) => {
          writeLine(
            `- ${p.name} (${p.in}${p.required ? ", required" : ""}) - ${p.description || p.schema?.type || "string"}`,
            { size: 9 },
          );
        });
      }

      if (op.responses) {
        writeLine("Responses:", { size: 10, bold: true });
        Object.entries(op.responses).forEach(([code, res]) => {
          writeLine(`- ${code} - ${res.description || ""}`, { size: 9 });
        });
      }

      y += 4;
    });
  });

  doc.save(`${slugifyTitle(spec.info?.title)}.pdf`);
}
