"use client";

import React, { useEffect, useState } from "react";
import { heroBannerService } from "../../firebaseService/heroBanner.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function AddHeroBanner({ setActive, editData, setEditData }) {
  const [form, setForm] = useState({
    title: "",
    image: "",
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
        await heroBannerService.update(editData.id, form);
      } else {
        await heroBannerService.add(form);
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
    <div className="border border-[var(--border)] rounded-lg p-6 bg-[var(--surface)] shadow-md space-y-5">

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
          className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--danger)] hover:text-[var(--danger-foreground)]"
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
          className="mt-1 border border-[var(--border)] bg-[var(--surface)] p-3 w-full rounded focus:outline-none focus:[box-shadow:var(--focus-ring)] focus:border-[var(--primary)]"
        />
      </div>

      {/* IMAGE UPLOAD */}
      <div>
        <label className="text-sm font-medium">Upload Image</label>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 w-full border border-[var(--border)] p-3 rounded bg-[var(--surface-soft)]"
        />

        {uploading && (
          <p className="text-sm text-[var(--primary)] mt-1">Uploading image...</p>
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
        className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded hover:bg-[var(--primary-hover)] transition"
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

export default AddHeroBanner;