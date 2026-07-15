export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function parseCSV(text) {
  return text.split(/[\n,]/).map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
}

export function removeDuplicates(arr) {
  return [...new Set(arr)];
}

export function downloadCSV(data, filename) {
  const csv = data.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
