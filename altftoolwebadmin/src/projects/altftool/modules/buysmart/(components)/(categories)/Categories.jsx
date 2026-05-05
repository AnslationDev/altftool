"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import readXlsxFile from "read-excel-file/browser";
import AddCategories from "./AddCategories";
import GetCategories from "./GetCategories";
import { firebaseBuySmartCategoriesSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories";

const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
const MAX_IMPORT_ROWS = 1000;

function normalizeHeader(value, index) {
  const header = String(value || "").trim();
  return header || `column_${index + 1}`;
}

function rowsToObjects(rows) {
  const [headers = [], ...bodyRows] = rows;
  const normalizedHeaders = headers.map(normalizeHeader);

  return bodyRows
    .filter((row) => row.some((cell) => cell !== null && cell !== undefined && cell !== ""))
    .slice(0, MAX_IMPORT_ROWS)
    .map((row) =>
      normalizedHeaders.reduce((record, header, index) => {
        record[header] = row[index] ?? "";
        return record;
      }, {})
    );
}

function Categories() {
  const [active, setActive] = useState(null);
  const [editCategories, setEditCategories] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handleComponent() {
    setEditCategories(null);
    setActive(true);
  }

  // const handleCSVUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   setUploading(true);

  //   Papa.parse(file, {
  //     header: true,
  //     skipEmptyLines: true,
  //     complete: async (results) => {
  //       await firebaseBuySmartCategoriesSource.bulkUpload(results.data);
  //       setUploading(false);
  //       e.target.value = "";
  //     },
  //   });
  // };


  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMPORT_FILE_BYTES) {
      alert("Import file must be 2 MB or smaller.");
      e.target.value = "";
      return;
    }

    const fileType = file.name.split(".").pop().toLowerCase();

    setUploading(true);

    // CSV FILE
    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const rows = results.data.slice(0, MAX_IMPORT_ROWS);
          await firebaseBuySmartCategoriesSource.bulkUpload(rows);

          setUploading(false);
          e.target.value = "";
        },
        error: (err) => {
          console.error("CSV Parse Error:", err);
          setUploading(false);
        },
      });
    }

    // Excel import uses a maintained .xlsx parser; legacy .xls is intentionally not accepted.
    else if (fileType === "xlsx") {
      readXlsxFile(file)
        .then(async (rows) => {
          const jsonData = rowsToObjects(rows);
          await firebaseBuySmartCategoriesSource.bulkUpload(jsonData);
        })
        .catch((error) => {
          console.error("Excel Parse Error:", error);
        })
        .finally(() => {
          setUploading(false);
          e.target.value = "";
        });
    }

    // Unsupported File
    else {
      alert("Only CSV and XLSX files are supported");
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-[55%] mx-[58%] gap-4 rounded-2xl flex justify-center">

        {/* CSV Upload */}
        <label className="btn btn-primary cursor-pointer">
          {uploading ? "Uploading..." : "CSV +"}
          <input
            type="file"
            accept=".csv, .xlsx"
            hidden
            onChange={handleCSVUpload}
          />
        </label>

        <button
          onClick={handleComponent}
          className="btn h-12  btn-primary"
        >
          Add Category Data +
        </button>
      </div>

      {active ? (
        <AddCategories
          setActive={setActive}
          active={active}
          editCategories={editCategories}
          setEditCategories={setEditCategories}
        />
      ) : (
        <GetCategories
          setActive={setActive}
          setEditCategories={setEditCategories}
        />
      )}
    </div>
  );
}

export default Categories;
