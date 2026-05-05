"use client";

import React, { useEffect, useState } from "react";
import { trendingService } from "../../firebaseService/Trending.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";


function AddSaving({ setActive, editData, setEditData }) {
  const [form, setForm] = useState({
    title: "",
    image: "",
    link:"",
    description:"",
    price:"",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // PREFILL (EDIT MODE)
  useEffect(() => {
    if (!editData) return;

    setForm({
      title: editData.title || "",
      image: editData.image || "",
      description: editData.description || "",
      link: editData.link || "",
      price:editData.price || "",
      status: editData.status || "active",
    });
  }, [editData]);

  // HANDLE TEXT CHANGE
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  //  IMAGE UPLOAD HANDLER (🔥 MAIN FIX)
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const url = await uploadImage(file);

      setForm((prev) => ({
        ...prev,
        image: url,
      }));

    } catch (err) {
      console.error(err);
      alert("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  //  SUBMIT
  const handleSubmit = async () => {
    if (!form.title || !form.image) {
      return alert("Title & Image required");
    }

    try {
      setLoading(true);

      if (editData) {
        await trendingService .update(editData.id, form);
      } else {
        await trendingService .add(form);
      }

      setActive(false);
      setEditData(null);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 bg-white shadow-md space-y-5">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {editData ? "Edit Hero Banner" : "Add Hero Banner"}
        </h2>

        <button
          onClick={() => {
            setActive(false);
            setEditData(null);
          }}
          className="px-3 py-1 border rounded hover:bg-red-500 hover:text-white"
        >
          Cancel
        </button>
      </div>

      {/* TITLE */}
      <div>
        <label className="text-sm font-medium">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter banner title"
          className="mt-1 border p-3 w-full rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Price</label>
        <input
        type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Enter banner title"
          className="mt-1 border p-3 w-full rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Enter banner title"
          className="mt-1 border p-3 w-full rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Link</label>
        <input
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="Enter banner Link"
          className="mt-1 border p-3 w-full rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div>
        <label className="text-sm font-medium">Upload Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 w-full border p-3 rounded bg-gray-50"
        />

        {uploading && (
          <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
        )}
      </div>

      {/* IMAGE PREVIEW */}
      {form.image && (
        <div className="mt-2">
          <p className="text-sm mb-1">Preview:</p>
          <img
            src={form.image}
            alt="preview"
            className="h-40 w-full object-cover rounded border"
          />
        </div>
      )}

      {/* STATUS */}
      <div>
        <label className="text-sm font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="mt-1 border p-3 w-full rounded"
        >
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading || uploading}
        className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
      >
        {loading
          ? "Saving..."
          : editData
          ? "Update Banner"
          : "Add Banner"}
      </button>
    </div>
  );
}

export default AddSaving;