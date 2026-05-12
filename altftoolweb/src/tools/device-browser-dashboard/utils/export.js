const safeJson = (data) => JSON.stringify(data, null, 2);

const triggerDownload = (content, fileName, type) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatSection = (title, rows) => {
  const lines = [`${title.toUpperCase()}`, "-".repeat(title.length)];
  rows.forEach(([label, value]) => {
    lines.push(`${label}: ${value || "N/A"}`);
  });
  return lines.join("\n");
};

export const createTextReport = (data) => {
  const sections = [
    formatSection("Summary", [
      ["Status", data.summary?.status],
      ["Scanned At", data.summary?.scannedAt],
      ["Compatibility Score", `${data.scores?.compatibility || 0}%`],
      ["Security Score", `${data.scores?.security || 0}%`],
      ["Fingerprint Surface", `${data.fingerprint?.label || "N/A"} (${data.scores?.fingerprint || 0}/100)`],
    ]),
    formatSection("Device", Object.entries(data.device || {})),
    formatSection("Browser", Object.entries(data.browser || {})),
    formatSection("Screen", Object.entries(data.screen || {})),
    formatSection("Network", Object.entries(data.network || {})),
    formatSection("Security", Object.entries(data.security || {})),
    formatSection("Storage", Object.entries(data.storage || {})),
    formatSection("Media Devices", Object.entries(data.media || {})),
  ];

  const capabilities = (data.capabilities || [])
    .map((item) => `${item.supported ? "[yes]" : "[no]"} ${item.label} - ${item.detail}`)
    .join("\n");
  const permissions = (data.permissions || [])
    .map((item) => `${item.label}: ${item.status}`)
    .join("\n");
  const signals = (data.fingerprint?.signals || [])
    .map((item) => `${item.label}: ${item.detail}`)
    .join("\n");

  return [
    "DEVICE & BROWSER DASHBOARD REPORT",
    "=================================",
    "",
    ...sections,
    "CAPABILITIES",
    "------------",
    capabilities || "No capabilities scanned.",
    "",
    "PERMISSIONS",
    "-----------",
    permissions || "No permissions scanned.",
    "",
    "FINGERPRINT SIGNALS",
    "-------------------",
    signals || "No fingerprint signals detected.",
  ].join("\n\n");
};

export const downloadJSON = (data, fileName = "device-browser-dashboard-report.json") => {
  triggerDownload(safeJson(data), fileName, "application/json");
};

export const downloadTXT = (data, fileName = "device-browser-dashboard-report.txt") => {
  triggerDownload(createTextReport(data), fileName, "text/plain");
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
