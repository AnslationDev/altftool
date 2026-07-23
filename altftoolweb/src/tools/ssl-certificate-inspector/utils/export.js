"use client";

function statusLabel(status = "") {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function buildTextReport(results = []) {
  let text = "SSL CERTIFICATE INSPECTOR STUDIO REPORT\n";
  text += "=======================================\n";
  text += `Generated: ${new Date().toISOString()}\n\n`;

  results.forEach((result, index) => {
    text += `${index + 1}. ${result.host || result.input}\n`;
    text += "-".repeat(String(result.host || result.input || "").length + 3) + "\n";

    if (result.error) {
      text += `Error: ${result.error.message}\n\n`;
      return;
    }

    text += `HTTPS Enabled: ${result.https?.enabled ? "Yes" : "No"}\n`;
    text += `SSL Status: ${statusLabel(result.validation?.status)}\n`;
    text += `Security Grade: ${result.validation?.grade || "N/A"}\n`;
    text += `TLS Version: ${result.tls?.version || "N/A"}\n`;
    text += `Cipher: ${result.tls?.standardName || result.tls?.cipher || "N/A"}\n`;
    text += `Common Name: ${result.certificate?.commonName || "N/A"}\n`;
    text += `Issuer: ${result.certificate?.issuerName || "N/A"}\n`;
    text += `Issued: ${result.certificate?.validFrom || "N/A"}\n`;
    text += `Expires: ${result.certificate?.validTo || "N/A"}\n`;
    text += `Days Remaining: ${result.validation?.daysRemaining ?? "N/A"}\n`;
    text += `HTTP to HTTPS Redirect: ${result.redirect?.redirectsToHttps ? "Yes" : "No"}\n`;
    text += `DNS: ${(result.dns || []).map((item) => item.address).join(", ") || "N/A"}\n`;
    text += `SAN Names: ${(result.certificate?.subjectAltNames || []).join(", ") || "N/A"}\n`;
    text += `Fingerprint SHA256: ${result.certificate?.fingerprint256 || "N/A"}\n`;

    if (result.validation?.warnings?.length) {
      text += `Warnings: ${result.validation.warnings.join(" | ")}\n`;
    }

    if (result.chain?.length) {
      text += "Certificate Chain:\n";
      [...result.chain].reverse().forEach((cert, chainIndex) => {
        text += `  ${chainIndex + 1}. ${cert.issuerName} -> ${cert.commonName}\n`;
      });
    }

    text += "\n";
  });

  return text;
}

function downloadBlob(content, type, fileName) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(results, fileName = "ssl-certificate-report.json") {
  downloadBlob(
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        results,
      },
      null,
      2
    ),
    "application/json",
    fileName
  );
}

export function downloadTXT(results, fileName = "ssl-certificate-report.txt") {
  downloadBlob(buildTextReport(results), "text/plain", fileName);
}

export async function downloadPDF(results, fileName = "ssl-certificate-report.pdf") {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 44;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  const lines = doc.splitTextToSize(buildTextReport(results), width);
  let y = margin;

  doc.setFont("courier", "normal");
  doc.setFontSize(9);

  lines.forEach((line) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 12;
  });

  doc.save(fileName);
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy SSL report", err);
    return false;
  }
}
