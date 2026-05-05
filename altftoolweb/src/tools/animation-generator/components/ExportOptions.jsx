import React from "react";

export default function ExportOptions({ exportFormat, setExportFormat }) {
  return (
    <div className="mt-3 p-4 bg-(--card) rounded-lg shadow-card border border-(--border)">
      <p className="font-semibold mb-2 text-(--foreground)">Export Code</p>

      <select
        value={exportFormat}
        onChange={(e) => setExportFormat(e.target.value)}
        className="w-full p-2 rounded-lg border border-(--border) bg-(--card) text-(--foreground) shadow-sm hover:bg-(--muted) focus:outline-none focus:ring-2 focus:ring-(--primary)"
      >
        <option value="css">CSS</option>
        <option value="react">React</option>
        <option value="tailwind">Tailwind</option>
        <option value="framer">Framer Motion</option>
      </select>
    </div>
  );
}