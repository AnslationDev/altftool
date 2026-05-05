

"use client";

import React, { useState, useEffect } from "react";

import { Loader2 } from "lucide-react";
import { uploadImage } from "@/projects/altftool/modules/buysmart/services/uploadImage";
import { firebaseBuySmartTrendingSource } from '@/projects/altftool/modules/buysmart/services/firebaseBuySmartTrending';
import Image from "next/image";
import Select from "react-select"
import { useCountry } from "../(hookes)/useCountry";


const defaultForm = {
  image: "",
  title: "",
  link: "",
  status: "active",
  country: "india"
};




function AddTrending({ setActive, editTrending, setEditTrending }) {
  const [form, setForm] = useState(defaultForm);

  const { countryOptions, selectedCountry, handleCountryChange } = useCountry(form, setForm)

  const [imageFile, setImageFile] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setForm(defaultForm);
    setImageFile(null);
    setImageSize(null);
    setImageError("");
    setEditTrending(null);
  }

  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }


 
  useEffect(() => {
    if (editTrending) {
      setForm({
        image: editTrending.image || "",
        title: editTrending.title || "",
        link: editTrending.link || "",
        status: editTrending.status || "active",
        country: editTrending.country || "india"
      });

      if (editTrending.imageWidth && editTrending.imageHeight) {
        setImageSize({
          width: editTrending.imageWidth,
          height: editTrending.imageHeight,
        });
      }
    } else {
      setForm(defaultForm); 
      setImageFile(null);
      setImageSize(null);
    }
  }, [editTrending]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      let error = "";

      // if (height !== 420 && width < 700 || width > 800) {
      //   error = "please fixed image size minmum 700 to 800px width.";
      // } 

      if (error) {
        setImageError(error);
        setImageFile(null);
        setImageSize(null);
        return;
      }

      setImageError("");
      setImageSize({ width, height });
      setImageFile(file);
    };

    img.src = objectUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (imageError) return;

    setLoading(true);

    let imageUrl = editTrending?.image || "";

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = {
      image: imageUrl,
      title: form.title,
      link: form.link,
      status: form.status,
      country: form.country,
      imageWidth: imageSize?.width || null,
      imageHeight: imageSize?.height || null,
      updatedAt: Date.now(),

    };

    if (editTrending) {
      await firebaseBuySmartTrendingSource.update(editTrending.id, payload);
    } else {
      await firebaseBuySmartTrendingSource.add({
        ...payload,
        createdAt: Date.now(),
      });
    }

    resetForm();
    setLoading(false);
    setActive(false);




  };



  return (
    <div className="max-w-6xl mx-auto bg-white rounded-sm shadow-lg border p-10">

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {editTrending ? "Edit Trending Banner" : "Create Trending Banner"}
        </h2>
        <p className="text-gray-500 mt-2">
          Configure banner image, CTA, and campaign status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* IMAGE SECTION */}
        <div className="grid grid-cols-2 gap-8 border rounded-xl p-6 bg-gray-50">

          {/* Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Banner Image <span className="text-red-600 font-extrabold " >*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Height must be 420px. Width (700px to 800px )
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editTrending}
              className="w-full border rounded-sm p-3 bg-white cursor-pointer focus:ring-2 focus:ring-black"
            />

            {imageError && (
              <p className="text-red-500 text-sm mt-2">{imageError}</p>
            )}

            {imageSize && (
              <p className="text-green-600 text-sm mt-2">
                Uploaded Size: {imageSize.width}px × {imageSize.height}px
              </p>
            )}
          </div>


        </div>

        {/* banner detail and title */}

        <div className="border rounded-sm p-6 space-y-6">

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Store Banner Title <span className="text-red-600 font-extrabold " >*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={50}

              className="mt-2 w-full border rounded-sm p-3 cursor-pointer "
              placeholder="Summer Sale - Up to 50% Off"
            />
            <p className="text-xs text-gray-400 mt-1">
              Max 50 characters.
            </p>
          </div>


          {/* Link */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              CTA Redirect Link <span className="text-red-600 font-extrabold " >*</span>
            </label>
            <input
              name="link"
              value={form.link}
              onChange={handleChange}

              className="mt-2 w-full border rounded-sm p-3 cursor-pointer"
              placeholder="https://example.com"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Campaign Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full border rounded-sm p-3 cursor-pointer "
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </select>
            <div className="mt-4" >
              <label className="block text-sm font-semibold mb-2">
                Country <span className="text-red-600">*</span>
              </label>
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={handleCountryChange}
                placeholder="Select country"
                isSearchable
                className="rounded-sm   "
                required
              />
            </div>
          </div>
        </div>


        {/* preview section */}
        <div className="border rounded-xl p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Live Preview
          </h3>

          <div
            className={`relative rounded-xl overflow-hidden shadow-xl border mx-auto w-full h-96 `}
          >
            {previewImage && (
              <Image
                src={previewImage}
                alt="Preview"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                {form.title || "Banner Title"}
              </h2>
              <h2 className="absolute top-4 py-1 left-4 px-4 bg-green-500 rounded-lg text-white " >
                {form.status}
              </h2>
              <p className="absolute top-4  right-4 px-4 bg-green-500 rounded-lg text-white " >{form.country}</p>
            </div>
          </div>
        </div>


        {/* ACTION BUTTONS  */}
        <div className="flex justify-end gap-4 cursor-pointer">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActive(false);
            }}
            className="px-6 py-3 border rounded-sm cursor-pointer hover:bg-red-700 hover:text-white transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || imageError}
            className={`px-6 py-3 rounded-sm text-white cursor-pointer flex items-center gap-2 transition ${loading || imageError
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
              }`}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {editTrending ? "Update Banner" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddTrending;


