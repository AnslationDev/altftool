"use client";

import React, { useState, useEffect } from "react";
import { firebaseBuySmartHeroSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartHero";
import { Loader2 } from "lucide-react";
import { uploadImage } from "@/projects/altftool/modules/buysmart/services/uploadImage";
import Image from "next/image";
import { useCountry } from "./(hookes)/useCountry";
import Select from "react-select"

const defaultForm = {
  image: "",
  title: "",
  link: "",
  ctaText: "",
  ctaColor: "#ffffff",
  ctaBgColor: "#000000",
  status: "active",
  imageType: "",
  country: "india"
};

function AddHeroBanner({ setActive, editHero, setEditHero }) {

  const [form, setForm] = useState(defaultForm);

  function resetForm() {
    setForm(defaultForm);
    setImageFile(null);
    setImageSize(null);
    setImageError("");
    setEditHero(null);
  }

  const { countryOptions, selectedCountry, handleCountryChange } = useCountry(form, setForm)

  const [imageFile, setImageFile] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  const [imageError, setImageError] = useState("");
  const [loading, setLoading] = useState(false);

  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : form.image;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }


  // useEffect(() => {
  //   if (editHero) {
  //     setForm({
  //       image: editHero.image || "",
  //       title: editHero.title || "",
  //       link: editHero.link || "",
  //       ctaText: editHero.ctaText || "",
  //       ctaColor: editHero.ctaColor || "#ffffff",
  //       ctaBgColor: editHero.ctaBgColor || "#000000",
  //       status: editHero.status || "active",
  //       imageType: editHero.imageType || "",
  //       country: editHero.country || "india"
  //     });

  //     if (editHero.imageWidth && editHero.imageHeight) {
  //       setImageSize({
  //         width: editHero.imageWidth,
  //         height: editHero.imageHeight,
  //       });
  //     }
  //   }
  // }, [editHero]);


  useEffect(() => {
    if (editHero) {
      setForm({
        image: editHero.image || "",
        title: editHero.title || "",
        link: editHero.link || "",
        ctaText: editHero.ctaText || "",
        ctaColor: editHero.ctaColor || "#ffffff",
        ctaBgColor: editHero.ctaBgColor || "#000000",
        status: editHero.status || "active",
        imageType: editHero.imageType || "",
        country: editHero.country || "india"
      });

      if (editHero.imageWidth && editHero.imageHeight) {
        setImageSize({
          width: editHero.imageWidth,
          height: editHero.imageHeight,
        });
      }
    } else {
      setForm(defaultForm); 
      setImageFile(null);
      setImageSize(null);
    }
  }, [editHero]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      let error = "";



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

    let imageUrl = editHero?.image || "";

    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const payload = {
      image: imageUrl,
      title: form.title,
      link: form.link,
      ctaText: form.ctaText,
      ctaColor: form.ctaColor,
      ctaBgColor: form.ctaBgColor,
      status: form.status,
      imageType: form.imageType,
      country: form.country,
      imageWidth: imageSize?.width || null,
      imageHeight: imageSize?.height || null,
      updatedAt: Date.now(),

    };

    if (editHero) {
      await firebaseBuySmartHeroSource.update(editHero.id, payload);
    } else {
      await firebaseBuySmartHeroSource.add({
        ...payload,
        createdAt: Date.now(),
      });
    }

    setForm({
      image: "",
      title: "",
      link: "",
      ctaText: "",
      imageHeight: "",
      imageWidth: "",
      ctaColor: "#ffffff",
      ctaBgColor: "#000000",
      status: "active",
      imageType: "",
      country: "india"
    });

    resetForm();
    setLoading(false);
    setActive(false);

    
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-sm shadow-lg border p-10">

      <div className="mb-8 flex justify-between ">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {editHero ? "Edit Hero Banner" : "Create Hero Banner"}
          </h2>
          <p className="text-gray-500 mt-2">
            Configure banner image, CTA, and campaign status.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setActive(false);
          }}
          className="px-3 h-12 border rounded-sm cursor-pointer hover:bg-red-700 hover:text-white transition"
        >
          Cancel
        </button>

      </div>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* IMAGE SECTION */}
        <div className="grid grid-cols-2 gap-8 border rounded-xl p-6 bg-gray-50">

          {/* Image Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Image Layout Type <span className="text-red-600 font-extrabold " >*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Choose layout before uploading image.
            </p>

            <select
              name="imageType"
              value={form.imageType}
              onChange={handleChange}
              className="w-full border relative  cursor-pointer rounded-sm p-3 bg-white  "
            >
              <option value="">Select image type</option>
              <option value="portrait">
                Portrait — Img W-250px && H-420px
              </option>
              <option value="landscape">
                Landscape
              </option>
            </select>
          </div>

          {/* Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Banner Image <span className="text-red-600 font-extrabold " >*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {form.imageType && form.imageType == "portrait" ? "Upload Landscape image W- 700 - 800px and H-420" : "Upload Portrait image W-250 and H-420"}
            </p>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required={!editHero}
              disabled={!form.imageType}

              className={`w-full border rounded-sm p-3 bg-white focus:ring-2 focus:ring-black
              ${!form.imageType ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
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
              Banner Title <span className="text-red-600 font-extrabold " >*</span>
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

          {/* CTA button */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-4">
              Call To Action (CTA)
            </label>

            <div className="grid grid-cols-3 gap-6">

              <div>
                <label className="text-xs text-gray-500">CTA Text <span className="text-red-600 font-extrabold " >*</span> </label>
                <input
                  name="ctaText"
                  value={form.ctaText}
                  onChange={handleChange}

                  maxLength={20}
                  className="mt-1 w-full border cursor-pointer rounded-sm p-3"
                  placeholder="Shop Now"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Max 50 characters.
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Text Color</label>
                <input
                  type="color"
                  name="ctaColor"
                  value={form.ctaColor}
                  onChange={handleChange}
                  className="mt-1 w-full h-12 rounded-sm  border cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Background Color</label>
                <input
                  type="color"
                  name="ctaBgColor"
                  value={form.ctaBgColor}
                  onChange={handleChange}
                  className="mt-1 w-full h-12 rounded-sm border cursor-pointer"
                />
              </div>
            </div>
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
              <option value="active">Active (Visible to users)</option>
              <option value="paused">Paused (Hidden from users)</option>
            </select>


            <div className="mt-4">
              <label className="block text-sm font-semibold mb-2">
                Country <span className="text-red-600">*</span>
              </label>

              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={handleCountryChange}
                placeholder="Select country"
                isSearchable
                required
              />
            </div>
          </div>
        </div>

        {/*PREVIEW */}
        <div className="border rounded-xl p-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Live Preview
          </h3>

          <div
            className={`relative rounded-xl overflow-hidden shadow-xl border mx-auto ${form.imageType === "landscape"
              ? "w-[750px] h-[420px]"
              : "w-[250px] h-[420px]"
              }`}
          >
            {previewImage ? (
              <Image
                src={previewImage}
                alt="Preview"
                fill
                sizes={form.imageType === "landscape" ? "750px" : "250px"}
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Preview will appear here
              </div>
            )}

            <div className="absolute inset-0 bg-black/40" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                {form.title || "Banner Title"}
              </h2>

              {form.ctaText && (
                <button
                  type="button"
                  style={{
                    backgroundColor: form.ctaBgColor,
                    color: form.ctaColor,
                  }}
                  className="mt-6 px-6 py-3 rounded-sm font-semibold shadow-lg transition hover:scale-105"
                >
                  {form.ctaText}
                </button>
              )}
            </div>
          </div>
        </div>

        {/*  ACTION BUTTONS  */}
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
            {editHero ? "Update Banner" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddHeroBanner;


