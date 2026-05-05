"use client";

import React, { useEffect, useState } from "react";
import { topCouponService } from "../../firebaseService/topCoupon.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function AddCoupon({ setActive, editData, setEditData }) {

  const [form, setForm] = useState({
    name: "",
    image: "",
    logo: "",
    description: "",
    discount: "",
    link: "",
    code: "",
    status: "active"
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState("");

  // ✅ PREFILL
  useEffect(() => {
    if (!editData) return;
  
    setForm({
      name: editData.name || "",
      image: editData.image || "",
      logo: editData.logo || "",
      description: editData.description || "",
      discount: editData.discount || "",
      link: editData.link || "",
      code: editData.code || "",
      status: editData.status || "active"
    });
  
  }, [editData]);

  // ✅ HANDLE CHANGE
  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ✅ IMAGE UPLOAD (COMMON)
  const handleUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(field);

      const url = await uploadImage(file);

      setForm(prev => ({
        ...prev,
        [field]: url
      }));

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading("");
    }
  };

  
  const handleSubmit = async () => {
    if (!form.name || !form.image || !form.code) {
      return alert("Required fields missing");
    }
  
    try {
      setLoading(true);
  
      const payload = {
        brandname: form.name,
        brandimage: form.image,
        brandlogo: form.logo,
        description: form.description,
        discount: form.discount,
        link: form.link,
        code: form.code,
        status: form.status,
      };
  
      if (editData) {
        await topCouponService.update(editData.id, payload);
      } else {
        await topCouponService.add(form);
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
    <div className="bg-white p-6 rounded-xl shadow space-y-5">

      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">
          {editData ? "Edit Coupon" : "Add Coupon"}
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

      {/* BRAND NAME */}
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Brand Name"
        className="border p-3 w-full rounded"
      />

      {/* DESCRIPTION */}
      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="border p-3 w-full rounded"
      />

      {/* DISCOUNT */}
      <input
        name="discount"
        value={form.discount}
        onChange={handleChange}
        placeholder="Discount (e.g. 50%)"
        className="border p-3 w-full rounded"
      />

      {/* LINK */}
      <input
        name="link"
        value={form.link}
        onChange={handleChange}
        placeholder="Affiliate Link"
        className="border p-3 w-full rounded"
      />

      {/* CODE */}
      <input
        name="code"
        value={form.code}
        onChange={handleChange}
        placeholder="Coupon Code"
        className="border p-3 w-full rounded"
      />

      <div className="flex justify-between" >
        {/* BRAND IMAGE */}
      <div>
        <label className="" >Brand Image</label> <br />
        <input 
        type="file"
        className="border  p-2 cursor-pointer rounded-sm"
         onChange={(e) => handleUpload(e, "image")} />

        {uploading === "image" && <p>Uploading...</p>}

        {form.image && (
          <img src={form.image} className="h-24 mt-2 rounded" />
        )}
      </div>
       {/* LOGO */}
       <div>
        <label>Brand Logo</label> <br />
        <input 
         className="border p-2 cor  rounded-sm"
         type="file" onChange={(e) => handleUpload(e, "logo")} />

        {uploading === "logo" && <p>Uploading...</p>}

        {form.logo && (
          <img src={form.logo} className="h-16 mt-2 rounded" />
        )}
      </div>
      </div>

      
     

     

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

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-black text-white py-3 rounded"
      >
        {loading ? "Saving..." : editData ? "Update Coupon" : "Add Coupon"}
      </button>

    </div>
  );
}

export default AddCoupon;