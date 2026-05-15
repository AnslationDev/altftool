import React, { useState, useMemo } from "react";
import {
  normalizeColumnNames,
  trimAllValues,
  replaceNoneWithEmpty,
  removeDuplicates,
  dropLowQualityColumns,
  fillMissingNumericWithMedian,
  fillMissingCategoricalWithMode,
  convertToCSV,
} from "../utils/cleanData";

const CleanPanel = ({ data, columnTypes, analysis, onDataCleaned }) => {
  const [previewData, setPreviewData] = useState(null);
  const [droppedColumns, setDroppedColumns] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [operations, setOperations] = useState({
    normalizeNames: false,
    trim: false,
    removeNone: false,
    removeDups: false,
    dropLow: false,
    fillNumeric: false,
    fillCategorical: false,
  });

  // Summary of issues from analysis
  const issuesSummary = useMemo(() => {
    if (!analysis) return [];
    const items = [];
    if (analysis.totalMissing > 0) {
      const colsWithMissing = Object.entries(analysis.columns)
        .filter(([, col]) => col.nullCount > 0)
        .map(([name]) => name);
      items.push({
        type: 'missing',
        message: `${analysis.totalMissing} missing value(s) across ${colsWithMissing.length} column(s): ${colsWithMissing.join(', ')}`,
        columns: colsWithMissing,
      });
    }
    if (analysis.duplicateCount > 0) {
      items.push({
        type: 'duplicates',
        message: `${analysis.duplicateCount} duplicate row(s) found`,
      });
    }
    // Constant columns
    const constantCols = Object.entries(analysis.columns)
      .filter(([, col]) => col.uniqueCount === 1)
      .map(([name]) => name);
    if (constantCols.length) {
      items.push({
        type: 'constant',
        message: `Constant column(s): ${constantCols.join(', ')}`,
        columns: constantCols,
      });
    }
    // High missing columns
    const highMissingCols = Object.entries(analysis.columns)
      .filter(([, col]) => col.nullPercent > 80)
      .map(([name]) => name);
    if (highMissingCols.length) {
      items.push({
        type: 'highMissing',
        message: `Column(s) with >80% missing: ${highMissingCols.join(', ')}`,
        columns: highMissingCols,
      });
    }
    return items;
  }, [analysis]);

  const toggleOp = (key) => {
    setOperations(prev => ({ ...prev, [key]: !prev[key] }));
    setShowPreview(false);
  };

  const atLeastOne = Object.values(operations).some(Boolean);

  const handlePreview = () => {
    let workingData = [...data];
    let dropped = [];
    if (operations.normalizeNames) workingData = normalizeColumnNames(workingData);
    if (operations.trim) workingData = trimAllValues(workingData);
    if (operations.removeNone) workingData = replaceNoneWithEmpty(workingData);
    if (operations.removeDups) workingData = removeDuplicates(workingData);
    if (operations.dropLow) {
      const result = dropLowQualityColumns(workingData, columnTypes, analysis);
      workingData = result.data;
      dropped = result.dropped;
    }
    if (operations.fillNumeric) workingData = fillMissingNumericWithMedian(workingData, columnTypes);
    if (operations.fillCategorical) workingData = fillMissingCategoricalWithMode(workingData, columnTypes);
    setDroppedColumns(dropped);
    setPreviewData(workingData);
    setShowPreview(true);
  };

  const handleApply = () => {
    if (previewData) {
      onDataCleaned(previewData);
      setShowPreview(false);
      setPreviewData(null);
    }
  };

  const handleDownload = () => {
    if (!previewData || !previewData.length) return;
    const csvString = convertToCSV(previewData);
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "datlens_cleaned.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="subheading">Cleaning Operations</h3>

      {/* Issues summary */}
      {issuesSummary.length > 0 && (
        <div className="bg-[var(--muted)] rounded-xl p-4 text-sm space-y-2">
          <p className="font-semibold text-[var(--foreground)]">Detected issues:</p>
          {issuesSummary.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-[var(--foreground)]">
              <span className="text-[var(--primary)] mt-0.5">•</span>
              <span>{item.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Operation checkboxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.normalizeNames} onChange={() => toggleOp("normalizeNames")} className="accent-[var(--primary)]" />
          Normalize column names (lowercase, underscores)
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.trim} onChange={() => toggleOp("trim")} className="accent-[var(--primary)]" />
          Trim whitespace from all text
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.removeNone} onChange={() => toggleOp("removeNone")} className="accent-[var(--primary)]" />
          Replace "None" strings with empty values
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.removeDups} onChange={() => toggleOp("removeDups")} className="accent-[var(--primary)]" />
          Remove duplicate rows
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.dropLow} onChange={() => toggleOp("dropLow")} className="accent-[var(--primary)]" />
          Drop low‑quality columns (constant / &gt;80% missing)
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.fillNumeric} onChange={() => toggleOp("fillNumeric")} className="accent-[var(--primary)]" />
          Fill missing numbers with median
        </label>
        <label className="flex items-center gap-3 text-[var(--foreground)] cursor-pointer bg-[var(--muted)] rounded-lg px-3 py-2">
          <input type="checkbox" checked={operations.fillCategorical} onChange={() => toggleOp("fillCategorical")} className="accent-[var(--primary)]" />
          Fill missing categories with most frequent value
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handlePreview}
          disabled={!atLeastOne}
          className="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview
        </button>
        {showPreview && previewData && (
          <>
            <button onClick={handleApply} className="btn-primary px-4 py-2 text-sm">
              Apply to dataset
            </button>
            <button onClick={handleDownload} className="btn-secondary px-4 py-2 text-sm">
              Download CSV
            </button>
          </>
        )}
      </div>

      {droppedColumns.length > 0 && (
        <p className="text-xs text-[var(--muted-foreground)]">
          ⚠️ Dropped columns: {droppedColumns.join(", ")}
        </p>
      )}

      {/* Preview table */}
      {showPreview && previewData && (
        <div className="border border-[var(--border)] rounded-lg overflow-auto max-h-60">
          <table className="min-w-full text-xs">
            <thead className="bg-[var(--muted)] sticky top-0">
              <tr>
                {Object.keys(previewData[0] || {}).map(col => (
                  <th key={col} className="px-2 py-1 text-left text-[var(--foreground)]">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map(col => (
                    <td key={col} className="px-2 py-1 text-[var(--foreground)]">{String(row[col] ?? "")}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {previewData.length > 10 && (
            <p className="px-2 py-1 text-xs text-[var(--muted-foreground)]">
              Showing first 10 of {previewData.length} rows.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CleanPanel;