"use client";

import React, { useState, useEffect } from "react";
import { Table, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, Eye } from "lucide-react";

export default function ToolHome() {
  const [rows, setRows] = useState(4);
  const [cols, setCols] = useState(3);
  const [padding, setPadding] = useState(10);
  const [borderWidth, setBorderWidth] = useState(1);
  const [theme, setTheme] = useState("zebra"); // 'zebra' | 'minimal' | 'dark' | 'teal'

  const [tableData, setTableData] = useState([
    ["Product Name", "Category", "Price"],
    ["Premium Coffee", "Beverage", "$14.99"],
    ["Organic Green Tea", "Beverage", "$9.50"],
    ["Dark Chocolate", "Snack", "$4.99"]
  ]);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Synchronize 2D array when rows/cols size updates
  useEffect(() => {
    setTableData((prev) => {
      const nextData = [];
      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          if (prev[r] && prev[r][c] !== undefined) {
            row.push(prev[r][c]);
          } else {
            row.push(r === 0 ? `Header ${c + 1}` : `Cell ${r}-${c + 1}`);
          }
        }
        nextData.push(row);
      }
      return nextData;
    });
  }, [rows, cols]);

  const updateCell = (rowIndex, colIndex, value) => {
    const updated = tableData.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? value : cell));
      }
      return row;
    });
    setTableData(updated);
  };

  const getThemeStyles = () => {
    switch (theme) {
      case "minimal":
        return `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n.custom-table th,\n.custom-table td {\n  padding: ${padding}px;\n  border-bottom: ${borderWidth}px solid #e2e8f0;\n}\n.custom-table th {\n  font-weight: 700;\n  color: #475569;\n}`;
      case "dark":
        return `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n  background-color: #0f172a;\n  color: #f8fafc;\n  text-align: left;\n}\n.custom-table th,\n.custom-table td {\n  padding: ${padding}px;\n  border: ${borderWidth}px solid #334155;\n}\n.custom-table th {\n  background-color: #1e293b;\n  font-weight: 700;\n}`;
      case "teal":
        return `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n.custom-table th,\n.custom-table td {\n  padding: ${padding}px;\n  border: ${borderWidth}px solid #99f6e4;\n}\n.custom-table th {\n  background-color: #0d9488;\n  color: #ffffff;\n  font-weight: 700;\n}\n.custom-table tr:nth-child(even) {\n  background-color: #f0fdfa;\n}`;
      case "zebra":
      default:
        return `.custom-table {\n  width: 100%;\n  border-collapse: collapse;\n  text-align: left;\n}\n.custom-table th,\n.custom-table td {\n  padding: ${padding}px;\n  border: ${borderWidth}px solid #e2e8f0;\n}\n.custom-table th {\n  background-color: #f1f5f9;\n  font-weight: 700;\n  color: #334155;\n}\n.custom-table tr:nth-child(even) {\n  background-color: #f8fafc;\n}`;
    }
  };

  const getHtmlString = () => {
    if (tableData.length === 0) return "";
    let head = "";
    let body = "";

    // The first row is rendered as table header (thead)
    const headerRow = tableData[0];
    if (headerRow) {
      head += "  <thead>\n    <tr>\n";
      headerRow.forEach((cell) => {
        head += `      <th>${cell}</th>\n`;
      });
      head += "    </tr>\n  </thead>\n";
    }

    // Remaining rows form tbody
    if (tableData.length > 1) {
      body += "  <tbody>\n";
      tableData.slice(1).forEach((row) => {
        body += "    <tr>\n";
        row.forEach((cell) => {
          body += `      <td>${cell}</td>\n`;
        });
        body += "    </tr>\n";
      });
      body += "  </tbody>\n";
    }

    return `<table class="custom-table">\n${head}${body}</table>`;
  };

  const handleCopy = async () => {
    try {
      const code = `<!-- HTML Table Structure -->\n${getHtmlString()}\n\n/* CSS Styling */\n${getThemeStyles()}`;
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const fullContent = `<!DOCTYPE html>\n<html>\n<head>\n<style>\n${getThemeStyles()}\n</style>\n</head>\n<body>\n${getHtmlString()}\n</body>\n</html>`;
    const textBlob = new Blob([fullContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "custom-table.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Table className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    HTML Table Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Developer, Layout
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Generate semantic HTML markup tables. Define grid sizing, choose zebra or minimal theme stylesheets, type data in real-time, and download complete source files.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["HTML5 Table", "CSS Styled", "Editable Cells"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Table Editor Box (Full Width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Eye size={14} className="text-primary" />
            Table Editor (Type content directly in cell inputs)
          </span>

          {/* Display Area */}
          <div className="w-full rounded-xl border border-border bg-slate-950 p-4 transition-all overflow-auto">
            <table className="w-full border-collapse text-left text-xs text-white">
              <thead>
                <tr>
                  {tableData[0]?.map((cell, cIdx) => (
                    <th key={cIdx} className="p-2 border border-slate-800 bg-slate-900 font-bold">
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(0, cIdx, e.target.value)}
                        className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-1 focus:ring-primary rounded p-1 font-bold"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 1 ? "bg-slate-900/50" : ""}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2 border border-slate-850">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rIdx + 1, cIdx, e.target.value)}
                          className="w-full bg-transparent border-none text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary rounded p-1"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
            
            <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
              <Sliders size={14} className="text-primary" />
              Table Configuration Properties
            </span>

            <div className="space-y-4">
              
              {/* Rows and Cols */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={rows}
                    onChange={(e) => setRows(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={cols}
                    onChange={(e) => setCols(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Padding */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Cell Padding</span>
                  <span className="text-primary font-mono">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="24"
                  value={padding}
                  onChange={(e) => setPadding(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Border Width */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-foreground font-semibold">
                  <span>Border Width</span>
                  <span className="text-primary font-mono">{borderWidth}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(parseInt(e.target.value))}
                  className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Design Preset */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-foreground uppercase">Design Theme Preset</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none"
                >
                  <option value="zebra">Classic Zebra Stripe</option>
                  <option value="minimal">Minimal Gridless</option>
                  <option value="dark">Charcoal Slate Dark</option>
                  <option value="teal">Corporate Teal Accent</option>
                </select>
              </div>

            </div>

          </div>

          {/* Generated Markup & CSS Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated Markup & Styles
              </span>
              
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy Source"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download file"}
                </button>
              </div>
            </div>

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-3 select-all max-h-[260px] overflow-y-auto leading-relaxed scrollbar-thin">
              <div>
                <div className="text-primary font-bold mb-1">&lt;!-- HTML --&gt;</div>
                <pre className="whitespace-pre">{getHtmlString()}</pre>
              </div>
              <div>
                <div className="text-primary font-bold mb-1">/* CSS Styles */</div>
                <pre className="whitespace-pre">{getThemeStyles()}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
