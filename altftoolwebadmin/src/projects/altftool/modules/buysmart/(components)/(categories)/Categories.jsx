"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import AddCategories from "./AddCategories";
import GetCategories from "./GetCategories";
import { firebaseBuySmartCategoriesSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories";
import * as XLSX from "xlsx";

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

    const fileType = file.name.split(".").pop().toLowerCase();

    setUploading(true);

    // CSV FILE
    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          console.log("CSV Data:", results.data);

          await firebaseBuySmartCategoriesSource.bulkUpload(results.data);

          setUploading(false);
          e.target.value = "";
        },
        error: (err) => {
          console.error("CSV Parse Error:", err);
          setUploading(false);
        },
      });
    }

    //  EXCEL FILE (.xlsx / .xls)
    else if (fileType === "xlsx" || fileType === "xls") {
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);

          const workbook = XLSX.read(data, { type: "array" });

          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            defval: "", // avoid undefined
          });

          console.log("Excel Data:", jsonData);

          await firebaseBuySmartCategoriesSource.bulkUpload(jsonData);

          setUploading(false);
          e.target.value = "";
        } catch (error) {
          console.error("Excel Parse Error:", error);
          setUploading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    }

    // Unsupported File
    else {
      alert("Only CSV, XLSX, XLS files are supported");
      setUploading(false);
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
            accept=".csv, .xlsx, .xls"
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