"use client";

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy", error);
    return false;
  }
};

const downloadBlob = (content, type, fileName) => {
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

export const makeElementReport = (element) => {
  if (!element) return "";
  return [
    `${element.name} (${element.symbol})`,
    `Atomic number: ${element.atomicNumber}`,
    `Atomic mass: ${element.atomicMass}`,
    `Category: ${element.groupBlock}`,
    `State: ${element.standardState}`,
    `Group: ${element.group || "N/A"}`,
    `Period: ${element.period || "N/A"}`,
    `Electron configuration: ${element.electronicConfiguration || "N/A"}`,
    `Density: ${element.density || "N/A"} g/cm3`,
    `Melting point: ${element.meltingPoint || "N/A"} K`,
    `Boiling point: ${element.boilingPoint || "N/A"} K`,
    `Discovered: ${element.yearDiscovered || "Unknown"}`,
  ].join("\n");
};

export const downloadJSON = (data, fileName = "periodic-table-report.json") => {
  downloadBlob(JSON.stringify(data, null, 2), "application/json", fileName);
};

export const downloadTXT = (element, fileName = "element-report.txt") => {
  downloadBlob(makeElementReport(element), "text/plain", fileName);
};
