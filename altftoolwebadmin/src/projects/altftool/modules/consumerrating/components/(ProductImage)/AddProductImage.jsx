"use client";

import React, { useEffect, useState } from "react";
import { productImageService } from "../../firebaseService/productImage.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function AddProductImage({ setActive, editData, setEditData }) {
  const [form, setForm] = useState({
    title: "",
    image: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // PREFILL
  useEffect(() => {
    if (!editData) return;

    setForm({
      title: editData.title || "",
      image: editData.image || "",
      status: editData.status || "active",
    });
  }, [editData]);

  //  TEXT CHANGE
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  //  IMAGE UPLOAD
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadImage(file);

      setForm(prev => ({
        ...prev,
        image: url
      }));
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  //  SUBMIT
  const handleSubmit = async () => {
    if (!form.title || !form.image) {
      return alert("All fields required");
    }

    try {
      setLoading(true);

      if (editData) {
        await productImageService.update(editData.id, form);
      } else {
        await productImageService.add(form);
      }

      setActive(false);
      setEditData(null);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-5">

      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">
          {editData ? "Edit Product Image" : "Add Product Image"}
        </h2>

        <button
          onClick={() => {
            setActive(false);
            setEditData(null);
          }}
          className="border px-3 py-1 rounded"
        >
          Cancel
        </button>
      </div>

      {/* TITLE */}
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Enter title"
        className="border p-3 w-full rounded"
      />

      {/* IMAGE */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="border p-3 w-full rounded bg-gray-50"
      />

      {uploading && <p className="text-blue-500">Uploading...</p>}

      {/* PREVIEW */}
      {form.image && (
        <img
          src={form.image}
          className="h-40 w-full object-cover rounded"
        />
      )}

      {/* STATUS */}
      <select
        name="status"
        value={form.status}
        onChange={handleChange}
        className="border p-3 w-full rounded"
      >
        <option value="active">Active</option>
        <option value="paused">Paused</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={loading || uploading}
        className="bg-blue-600 text-white w-full py-3 rounded"
      >
        {loading
          ? "Saving..."
          : editData
          ? "Update"
          : "Add Product Image"}
      </button>
    </div>
  );
}

export default AddProductImage;