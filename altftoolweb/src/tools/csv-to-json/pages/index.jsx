"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import JSONOutput from "../components/JSONOutput";
import ActionButtons from "../components/ActionButton";
import Features from "../components/Features";

// ─── DATA INSIGHTS COMPONENT ───────────────────────────
const DataInsights = ({ data }) => {
  if (!data || data.length === 0) return null;
  const headers = Object.keys(data[0]);
  const totalRows = data.length;
  let missingCount = 0;
  const uniqueSet = new Set();
  const colTypes = {};
  headers.forEach(header => {
    let isNumber = true;
    data.forEach(row => {
      const val = String(row[header] || "").trim();
      if (!val) missingCount++;
      if (val) uniqueSet.add(val);
      if (isNaN(val) && val !== "") isNumber = false;
    });
    colTypes[header] = isNumber ? "Number" : "String";
  });
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-fade-up">
      <div className="p-3 border border-(--border) rounded-lg bg-gray-50/50 text-center">
        <p className="text-[15px] uppercase font-bold text-(--secondary)">Total Rows</p>
        <p className="text-xl font-extrabold">{totalRows}</p>
      </div>
      <div className={`p-3 border rounded-lg text-center ${missingCount > 0 ? "border-red-200 bg-red-50" : "border-(--border) bg-gray-50/50"}`}>
        <p className={`text-[15px] uppercase font-bold ${missingCount > 0 ? "text-red-500" : "text-(--secondary)"}`}>Issues Found 🔴</p>
        <p className={`text-xl font-extrabold ${missingCount > 0 ? "text-red-600" : ""}`}>{missingCount}</p>
      </div>
      <div className="p-3 border border-(--border) rounded-lg bg-gray-50/50 text-center">
        <p className="text-[15px] uppercase font-bold text-(--secondary)">Unique Entries</p>
        <p className="text-xl font-extrabold ">{uniqueSet.size}</p>
      </div>
      <div className="p-3 border border-(--border) rounded-lg bg-gray-50/50 overflow-hidden text-center">
        <p className="text-[15px] uppercase font-bold text-(--secondary)">Column Detect</p>
        <p className="text-xl font-extrabold">{headers.slice(0, 2).map(h => `${h}: ${colTypes[h]}`).join(", ")}...</p>
      </div>
    </div>
  );
};

// ─── CSV Parser ──────────────────────────────────────────────────
function parseCSV(csvText) {
  if (!csvText || typeof csvText !== "string" || !csvText.trim()) return [];
  const normalized = csvText.trim().replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 1) return [];
  const parseLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; } 
        else { inQuotes = !inQuotes; }
      } else if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; } 
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  };
  const headers = parseLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && values[0] === "")) continue;
    const row = {};
    headers.forEach((header, idx) => { row[header] = values[idx] !== undefined ? values[idx] : ""; });
    rows.push(row);
  }
  return rows;
}

// ─── EDITABLE TABLE WITH PAGINATION ────────────────────────
const EditableTable = ({ data, setData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (!data || data.length === 0) return null;

  const headers = Object.keys(data[0]);
  const totalPages = Math.ceil(data.length / rowsPerPage);
  
  // Logic to get current rows
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);

  const handleCellChange = (rowIndex, key, value) => {
    const actualIndex = indexOfFirstRow + rowIndex;
    const updated = [...data];
    updated[actualIndex][key] = value;
    setData(updated);
  };

  const deleteRow = (idx) => {
    const actualIndex = indexOfFirstRow + idx;
    setData(data.filter((_, i) => i !== actualIndex));
  };

  const addRow = () => {
    const newRow = {};
    headers.forEach(h => newRow[h] = "");
    setData([...data, newRow]);
  };

  return (
    <div className="my-6 border border-(--border) rounded-lg bg-white shadow-sm overflow-hidden">
      {/* View Controls */}
      <div className="p-3 border-b border-(--border) bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
           <span className="text-[15px] font-bold text-gray-400 uppercase">Show</span>
           <select 
             value={rowsPerPage} 
             onChange={(e) => {setRowsPerPage(Number(e.target.value)); setCurrentPage(1);}}
             className="text-ml border border-(--border) rounded px-1 py-0.5 outline-none font-bold text-(--secondary)"
           >
             {[10, 20, 30, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
           </select>
           <span className="text-[15px] font-bold text-gray-400 uppercase">rows</span>
        </div>
        <p className="text-[15px] font-bold text-(--secondary) uppercase tracking-widest">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-ml text-left">
          <thead className="bg-gray-50 text-(--secondary) uppercase font-bold text-[15px] tracking-wider">
            <tr>
              {headers.map((h) => <th key={h} className="px-4 py-3 border-b border-(--border)">{h}</th>)}
              <th className="px-4 py-3 border-b border-(--border)">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border)">
            {currentRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50">
                {headers.map((h) => {
                  const isEmpty = !String(row[h] || "").trim();
                  return (
                    <td key={h} className="px-3 py-2">
                      <input
                        type="text"
                        value={row[h]}
                        placeholder={isEmpty ? "Missing..." : ""}
                        onChange={(e) => handleCellChange(rowIndex, h, e.target.value)}
                        className={`w-full bg-transparent border rounded px-2 py-1 outline-none transition-all duration-200 ${isEmpty ? "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:ring-1 focus:ring-red-400" : "border-transparent focus:ring-1 focus:ring-blue-400 text-gray-600"}`}
                      />
                    </td>
                  );
                })}
                <td className="px-4 py-2 text-center">
                  <button onClick={() => deleteRow(rowIndex)} className="text-red-300 hover:text-red-500 transition-colors font-bold">✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-(--border) bg-gray-50/20 flex flex-wrap justify-between items-center gap-4">
        <button onClick={addRow} className="text-[15px] font-bold bg-white border border-(--border) px-3 py-1.5 rounded-md hover:bg-gray-50 transition shadow-sm text-gray-500">+ ADD ROW</button>
        
        <div className="flex items-center gap-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-3 py-1 border rounded text-ml font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition bg-gray-50"
          >
            Prev
          </button>
          
          <div className="flex gap-1">
             {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => setCurrentPage(i+1)}
                  className={`w-7 h-7 text-ml font-bold rounded border ${currentPage === i+1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white text-gray-400'}`}
                >
                  {i+1}
                </button>
             ))}
             {totalPages > 5 && <span className="text-gray-400">...</span>}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-3 py-1 border rounded text-ml font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN TOOL HOME ─────────────────────────────
export default function ToolHome() {
  const [csvData, setCsvData] = useState([]);
  const [jsonData, setJsonData] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [useMockAPI, setUseMockAPI] = useState(false);
  const [isMinified, setIsMinified] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback((fileContent) => {
    if (!fileContent || !fileContent.trim()) { setCsvData([]); setJsonData(""); return; }
    setCsvData(parseCSV(fileContent));
    setJsonData("");
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => handleFileUpload(event.target.result);
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const pastedText = e.clipboardData.getData("text");
      if (pastedText && pastedText.includes(",") && pastedText.length > 5) {
        handleFileUpload(pastedText);
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [handleFileUpload]);

  const handleConvert = () => {
    if (csvData.length === 0) return;
    let processedData = csvData;
    if (useMockAPI) {
      processedData = csvData.map((row, index) => ({
        id: `uuid-${Math.random().toString(36).substr(2, 9)}`,
        ...row,
        mock_email: `${index + 1}@mockapi.dev`,
        createdAt: new Date().toISOString()
      }));
    }
    const output = isMinified ? JSON.stringify(processedData) : JSON.stringify(processedData, null, 2);
    setJsonData(output);
  };

  const handleDownload = () => {
    if (!jsonData) return;
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = isMinified ? "minified_data.json" : "pretty_data.json";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleClear = () => { setCsvData([]); setJsonData(""); setResetKey((prev) => prev + 1); };

  return (
    <div className={`min-h-screen py-10 px-4 transition-all duration-300 ${isDragging ? "bg-blue-50/80" : "bg-(--background)"}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      <div className="max-w-4xl mx-auto w-full pointer-events-none">
        <div className="flex flex-col items-center justify-center mb-10 pointer-events-auto">
          <h1 className="heading mb-4 text-center mt-[-30]">CSV to JSON </h1>
          <p className="description text-(--secondary) text-2xl mt-2 text-center">Upload, analyze, edit, and convert with ease.</p>
        </div>

        <div className={`shadow-xl p-6 lg:p-10 bg-(--background) border-2 rounded-2xl transition-all pointer-events-auto ${isDragging ? "border-blue-400 border-dashed scale-[1.01] shadow-2xl" : "border-(--border)"}`}>
          
          <div className="flex flex-wrap items-center justify-end gap-6 mb-6">
            {/* Minify Toggle */}
            <div className="flex items-center gap-3">
              <span className={`text-[11px] font-semibold uppercase transition ${!isMinified ? 'text-blue-600' : 'text-gray-400'}`}>Pretty</span>
              <button onClick={() => setIsMinified(!isMinified)} className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${isMinified ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${isMinified ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-[11px] font-semibold uppercase transition ${isMinified ? 'text-blue-600' : 'text-gray-400'}`}>Minify</span>
            </div>

            {/* Mock API Toggle */}
            <div className="flex items-center gap-3 border-l pl-6 border-(--border)">
              <span className={`text-[11px] font-semibold uppercase transition ${!useMockAPI ? 'text-purple-600' : 'text-gray-400'}`}>Normal</span>
              <button onClick={() => setUseMockAPI(!useMockAPI)} className={`relative w-12 h-6 rounded-full transition-all duration-300 shadow-inner ${useMockAPI ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${useMockAPI ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-[11px] font-semibold uppercase transition ${useMockAPI ? 'text-purple-600' : 'text-gray-400'}`}>Mock API</span>
            </div>
          </div>

          <FileUploader key={resetKey} onFileUpload={handleFileUpload} fileInputRef={fileInputRef} />

          {csvData.length > 0 && (
            <>
              <DataInsights data={csvData} />
              <EditableTable data={csvData} setData={setCsvData} />
              <div className="flex flex-col gap-4">
                <ActionButtons onConvert={handleConvert} onDownload={handleDownload} onClear={handleClear} hasData={true} />
              </div>
              <JSONOutput jsonData={jsonData} />
            </>
          )}

          {csvData.length === 0 && (
            <div className="flex justify-end mt-4">
              <ActionButtons onConvert={handleConvert} onDownload={handleDownload} onClear={handleClear} hasData={false} />
            </div>
          )}
        </div>
        <div className="mt-10 pointer-events-auto"><Features /></div>
      </div>
    </div>
  );
}
