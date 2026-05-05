import React, { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";

const FileUploader = ({ onFileUpload }) => {
  const [manualCsv, setManualCsv] = useState("");
  const [fileName, setFileName] = useState("");
  const [inputMode, setInputMode] = useState(null); // 'file' | 'manual' | null
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (inputMode === "manual" && manualCsv.trim()) {
      alert("Please clear the manual CSV input before uploading a file.");
      e.target.value = "";
      return;
    }

    setFileName(file.name);
    setInputMode("file");

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvText = event.target.result;
      onFileUpload(csvText);
    };
    reader.readAsText(file);
  };

  const handleManualChange = (e) => {
    const value = e.target.value;

    if (inputMode === "file" && fileName) {
      alert("Please clear the uploaded file before entering manual CSV.");
      return;
    }

    setManualCsv(value);

    if (!inputMode) setInputMode("manual");
    if (value.trim() === "") setInputMode(null);

    // Always call onFileUpload — even empty string to clear state
    onFileUpload(value);
  };

  const handleClearFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setFileName("");
    setInputMode(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onFileUpload("");
  };

  const handleClearManual = () => {
    setManualCsv("");
    setInputMode(null);
    onFileUpload("");
  };

  return (
    <div className="mb-6 space-y-5">
      {/* File Upload Zone */}
      <div>
        <label className="block text-(--foreground) text-xl font-bold mb-3">
          Upload CSV File
        </label>

        <label
          htmlFor="csv-upload"
          className={`flex flex-col items-center justify-center w-full h-32 sm:h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
            ${inputMode === "manual"
              ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed pointer-events-none"
              : "border-(--border) hover:border-(--secondary) bg-(--card) hover:bg-(--hover)"
            }`}
        >
          {fileName ? (
            <div className="flex flex-col items-center gap-1 px-4 w-full">
              <FileText className="w-7 h-7 text-blue-600 shrink-0" />
              <p className="text-sm font-medium text-(--primary) truncate max-w-[85%] text-center">
                {fileName}
              </p>
              <button
                onClick={handleClearFile}
                className="mt-1 flex items-center gap-1 text-xs text-(--foreground)"
              >
                <X size={12} /> Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Upload className="w-7 h-7 text-(--foreground)" />
              <p className="text-ml font-medium text-(--foreground)">
                Click to upload CSV
              </p>
              <p className="text-xs text-(--secondary)">Only .csv files supported</p>
            </div>
          )}

          <input
            id="csv-upload"
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={inputMode === "manual"}
          />
        </label>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-(--border)" />
        <span className="text-xs text-(--secondary) font-medium whitespace-nowrap">OR</span>
        <div className="flex-1 h-px bg-(--border)" />
      </div>

      {/* Manual Paste Zone */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-(--foreground) text-xl font-bold">
            Paste CSV Data
          </label>
          {manualCsv && (
            <button
              onClick={handleClearManual}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        <textarea
          rows={6}
          value={manualCsv}
          onChange={handleManualChange}
          disabled={inputMode === "file"}
          placeholder={`name,age,city\nJohn,25,Delhi\nJane,30,Mumbai`}
          className={`w-full px-3 py-2 bg-(--card) border border-(--border) rounded-md text-(--foreground) text-sm resize-y min-h-30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
            ${inputMode === "file"
              ? "opacity-50 cursor-not-allowed"
              : "cursor-text"
            }`}
        />
        <p className="text-xl text-(--secondary) mt-1">
          First row should be headers (e.g. name,age,city)
        </p>
      </div>
    </div>
  );
};

export default FileUploader;