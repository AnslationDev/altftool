"use client";

import React, { useEffect, useState } from "react";
import { allBrandService } from "../../firebaseService/allBrand.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function BrandEditForm({ editData, setActive, categories }) {
  const [form, setForm] = useState({
    name: "",
    logo: "",
    link: "",
    categoryId: "",
  });

  const [file, setFile] = useState(null); // ✅ NEW
  const [loading, setLoading] = useState(false); // ✅ optional UX

  // ✅ prefill
  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name || "",
        logo: editData.logo || "",
        link: editData.link || "",
        categoryId: editData.categoryId || "",
      });
    }
  }, [editData]);

  // ✅ text change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // ✅ get file
  };

  // ✅ submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      let logoUrl = form.logo;

      // 🔥 if new file selected → upload
      if (file) {
        logoUrl = await uploadImage(file);
      }

      const updatedData = {
        ...form,
        logo: logoUrl,
      };

      // 🔥 SAME CATEGORY
      if (form.categoryId === editData.categoryId) {
        await allBrandService.update(
          editData.categoryId,
          editData.id,
          updatedData
        );
      } 
      // 🔥 CATEGORY CHANGE
      else {
        await allBrandService.add(form.categoryId, updatedData);

        await allBrandService.remove(
          editData.categoryId,
          editData.id
        );
      }

      setActive(false);
    } catch (err) {
      console.error("Update error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow bg-white max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-4">Edit Brand</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* CATEGORY */}
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* NAME */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Brand Name"
          className="w-full border p-2 rounded"
        />

        {/* 🔥 FILE INPUT */}
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full border p-2 rounded"
        />

        {/*  PREVIEW */}
        {form.logo && (
          <img
            src={form.logo}
            alt="preview"
            className="w-16 h-16 object-contain"
          />
        )}

        {/* LINK */}
        <input
          type="text"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="Brand Link"
          className="w-full border p-2 rounded"
        />

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {loading ? "Uploading..." : "Update"}
          </button>

          <button
            type="button"
            onClick={() => setActive(false)}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default BrandEditForm;
