"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { normalizeHeader } from "../utils/helpers";

/* ================= HELPERS ================= */

const parseCSV = (text) => {
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader,
  });
  return data;
};

const cleanLeads = (rows) => {
  const seenEmails = new Set();
  const cleaned = [];
  let duplicates = 0;
  let invalid = 0;

  rows.forEach(r => {
    const name = r.name?.trim();
    const email = r.email?.trim().toLowerCase();
    const phone = r.phone?.trim();
    const company = r.company?.trim();

    if (!email) {
      invalid++;
      return;
    }

    if (seenEmails.has(email)) {
      duplicates++;
      return;
    }

    seenEmails.add(email);

    cleaned.push({
      Name: name || "",
      Email: email,
      Phone: phone || "",
      Company: company || ""
    });
  });

  return { cleaned, duplicates, invalid };
};

const downloadCSV = (data) => {
  if (!data.length) return;

  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "cleaned_leads.csv";
  a.click();

  // Release the blob URL once the download has been handed off.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

/* ================= COMPONENT ================= */

export default function CsvLeadCleaner() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);
    setFileName(f.name);
    setResult(null);
    setError(null);
  };

  const handleProcess = () => {
    if (!file) {
      alert("Please choose a CSV file first");
      return;
    }

    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        const cleanedResult = cleanLeads(rows);

        setResult({
          total: rows.length,
          ...cleanedResult
        });
      } catch (err) {
        setResult(null);
        setError("We couldn't parse that file. Make sure it's a valid CSV and try again.");
      }
    };
    reader.onerror = () => {
      setResult(null);
      setError("We couldn't read that file. Please choose a valid CSV file and try again.");
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">

      {/* Choose File */}
      <input
        type="file"
        accept=".csv"
        ref={fileRef}
        onChange={handleFileChange}
        className="hidden"
        aria-label="CSV file"
      />

      <div
        onClick={() => fileRef.current.click()}
        role="button"
        tabIndex={0}
        aria-label="Choose CSV file to upload"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            fileRef.current.click();
          }
        }}
        className="
          border-2 border-dashed border-(--border)
          bg-(--card)
          rounded-2xl h-40
          flex flex-col justify-center items-center
          cursor-pointer
          transition-all duration-300
          hover:border-(--primary)
          hover:bg-(--primary)/5
          focus-visible:outline-none
          focus-visible:ring-[3px]
          focus-visible:ring-(--primary)
          text-center
          shadow-sm
        "
      >
        <p className="text-lg font-semibold text-(--primary)">
          Choose CSV File
        </p>
        <p className="text-sm text-(--muted-foreground) mt-2">
          {fileName}
        </p>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        className="
          w-full
          bg-(--primary)
          text-(--primary-foreground)
          py-3 rounded-xl
          font-semibold
          shadow-md hover:shadow-lg
          transition-all duration-300
          hover:opacity-90
        "
      >
        Process CSV
      </button>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="
            rounded-2xl
            border border-(--danger)
            bg-(--danger-soft)
            p-5 text-center
            shadow-sm
          "
        >
          <p className="text-sm font-medium text-(--foreground)">{error}</p>
        </div>
      )}

      {/* RESULT SECTION */}
      {result && (
        <div className="space-y-8" role="status" aria-live="polite">
          <p className="sr-only">
            Processing complete: {result.cleaned.length} rows cleaned, {result.duplicates} duplicates removed, {result.invalid} invalid rows out of {result.total} total.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Stat title="Total Rows" value={result.total} />
            <Stat title="Cleaned Rows" value={result.cleaned.length} />
            <Stat title="Duplicates Removed" value={result.duplicates} />
            <Stat title="Invalid Rows" value={result.invalid} />
          </div>

          {/* Preview Table */}
          <div className="
            border border-(--border)
            bg-(--card)
            rounded-2xl
            overflow-x-auto
            shadow-md
          ">
            <table className="min-w-full text-sm">
              <thead className="bg-(--muted)">
                <tr>
                  <th className="p-3 text-left font-semibold">Name</th>
                  <th className="p-3 text-left font-semibold">Email</th>
                  <th className="p-3 text-left font-semibold">Phone</th>
                  <th className="p-3 text-left font-semibold">Company</th>
                </tr>
              </thead>
              <tbody>
                {result.cleaned.slice(0, 5).map((r, i) => (
                  <tr key={i} className="border-t border-(--border)">
                    <td className="p-3">{r.Name}</td>
                    <td className="p-3 text-(--primary)">{r.Email}</td>
                    <td className="p-3">{r.Phone}</td>
                    <td className="p-3">{r.Company || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Download */}
          {result.cleaned.length > 0 ? (
            <button
              onClick={() => downloadCSV(result.cleaned)}
              className="
                w-full
                bg-green-600
                text-white
                py-3 rounded-xl
                font-semibold
                shadow-md hover:shadow-lg
                transition-all duration-300
                hover:bg-green-700
              "
            >
              Download Cleaned CSV
            </button>
          ) : (
            <div
              role="status"
              className="
                w-full
                border border-(--border)
                bg-(--muted)
                text-(--muted-foreground)
                py-3 rounded-xl
                font-medium
                text-center
                text-sm
              "
            >
              No valid rows to export — check that your file has a recognized email column (email, email address, or e-mail).
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= STAT BOX ================= */

const Stat = ({ title, value }) => (
  <div className="
    bg-(--card)
    border border-(--border)
    rounded-xl
    p-5 text-center
    shadow-sm
  ">
    <p className="text-xs text-(--muted-foreground)">
      {title}
    </p>
    <p className="text-2xl font-bold mt-2 text-(--foreground)">
      {value}
    </p>
  </div>
);
