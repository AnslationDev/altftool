'use client'
import React, { useState, useEffect } from 'react'
import { firebaseBuySmartCategoriesSource } from '@/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories';
import { ImageIcon, Link2, Type, Loader2 } from "lucide-react";
import Select from "react-select";
import { useCountry } from '../(hookes)/useCountry';
import { uploadImage } from "@/projects/altftool/modules/buysmart/services/uploadImage";
import { getBrandLogoUrl } from "@altftool/core/buysmart";

const defaultForm = {
  title: "",
  link: "",
  country: "",
  disc: "",
  discount: "",
  category: "",
  offerType: "deal",
  couponCode: "",
  cashback: "",
  points: "",
  audience: "All shoppers",
  expiresAt: "",
  terms: "",
  verified: true,
  verificationStatus: "verified",
  lastVerifiedAt: "",
  successRate: 100,
  workingVotes: 0,
  failedVotes: 0,
  reviewNote: "",
  exclusive: false,
  featured: false,
  priority: 0,
  img: "",
  status: "active",
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}


function AddCategories({ setActive, setEditCategories, editCategories, active }) {

  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([])
  const [newCategory, setNewCategory] = useState("")
  const [showCategoryInput, setShowCategoryInput] = useState(false)

  const { countryOptions, selectedCountry, handleCountryChange } = useCountry(form, setForm)
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false)


  function resetForm() {
    setForm(defaultForm);
    setImageFile(null);
    setEditCategories(null);
    setNewCategory("");
    setShowCategoryInput(false);
  }



  useEffect(() => {
    if (editCategories) {
      setForm({
        title: editCategories.title || "",
        link: editCategories.link || "",
        country: editCategories.country || "",
        disc: editCategories.disc || "",
        discount: editCategories.discount || "",
        offerType: editCategories.offerType || "deal",
        couponCode: editCategories.couponCode || editCategories.code || "",
        cashback: editCategories.cashback || editCategories.cashBack || "",
        points: editCategories.points || editCategories.reward || "",
        audience: editCategories.audience || "All shoppers",
        expiresAt: editCategories.expiresAt || "",
        terms: editCategories.terms || "",
        verified: editCategories.verified ?? editCategories.verificationStatus === "verified",
        verificationStatus:
          editCategories.verificationStatus || (editCategories.verified ? "verified" : "pending"),
        lastVerifiedAt: editCategories.lastVerifiedAt || "",
        successRate: editCategories.successRate ?? (editCategories.verified ? 100 : 0),
        workingVotes: editCategories.workingVotes || 0,
        failedVotes: editCategories.failedVotes || 0,
        reviewNote: editCategories.reviewNote || "",
        exclusive: editCategories.exclusive || false,
        featured: editCategories.featured || false,
        priority: editCategories.priority || 0,
        img: editCategories.img || editCategories.image || "",
        category: editCategories.category || "",
        status: editCategories.status || "active",
      });
    } else {
      setForm(defaultForm);
      setImageFile(null);
    }
  }, [editCategories]);

  useEffect(() => {
    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {

      const categorydata = (data || [])
        .map((item) => item.category)
        .filter(Boolean);

      const uniqueCategories = [...new Set(categorydata)];

      setCategories(uniqueCategories);

      setLoading(false);
    });

    return () => unsub && unsub();
  }, []);


  function handleChange(e) {
    const { name, value, type, checked } = e.target

    if (name === "verificationStatus") {
      setForm((prev) => ({
        ...prev,
        verificationStatus: value,
        verified: value === "verified",
        lastVerifiedAt:
          value === "verified" && !prev.lastVerifiedAt ? todayInputValue() : prev.lastVerifiedAt,
        successRate: value === "verified" && Number(prev.successRate) === 0 ? 100 : prev.successRate,
      }));
      return;
    }

    if (name === "verified") {
      setForm((prev) => ({
        ...prev,
        verified: checked,
        verificationStatus: checked ? "verified" : "pending",
        lastVerifiedAt: checked && !prev.lastVerifiedAt ? todayInputValue() : prev.lastVerifiedAt,
        successRate: checked && Number(prev.successRate) === 0 ? 100 : prev.successRate,
      }));
      return;
    }

    setForm({ ...form, [name]: type === "checkbox" ? checked : value })
  }

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);


  //   let imageUrl = editCategories?.img || "";

  //   if (imageFile) {
  //     imageUrl = await uploadImage(imageFile);
  //   }

  //   const payload = {
  //     title: form.title,
  //     link: form.link,
  //     country: form.country,
  //     disc: form.disc || "",
  //     discount: form.discount || "",
  //     img: imageUrl || "",
  //     category: form.category || "",
  //     status: form.status || "active",
  //     updatedAt: Date.now(),
  //   }

  //   if (editCategories) {
  //     await firebaseBuySmartCategoriesSource.update(editCategories.id, payload);
  //   } else {
  //     await firebaseBuySmartCategoriesSource.add({ ...payload, createdAt: Date.now(), });
  //   }

  //   resetForm();
  //   setLoading(false);
  //   setActive(false);


  // };

  function addCategory() {

    if (!newCategory.trim()) return

    if (categories.includes(newCategory)) return

    setCategories((prev) => [...prev, newCategory])

    setForm((prev) => ({
      ...prev,
      category: newCategory
    }))

    setNewCategory("")
    setShowCategoryInput(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // ❗ Validation (important)
    if (!imageFile && !form.img && !form.link) {
      alert("Please upload image, provide image URL, or add a CTA link for auto logo fallback");
      return;
    }
  
    setLoading(true);
  
    let imageUrl = editCategories?.img || editCategories?.image || "";
  
    // ✅ If file uploaded → upload
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }
  
    // ✅ If URL provided → use directly
    if (!imageFile && form.img) {
      imageUrl = form.img.trim();
    }
  
    const payload = {
      title: form.title,
      link: form.link,
      country: form.country,
      disc: form.disc || "",
      discount: form.discount || "",
      offerType: form.offerType || "deal",
      couponCode: form.couponCode || "",
      code: form.couponCode || "",
      cashback: form.cashback || "",
      points: form.points || "",
      audience: form.audience || "All shoppers",
      expiresAt: form.expiresAt || "",
      terms: form.terms || "",
      verificationStatus: form.verificationStatus || (form.verified ? "verified" : "pending"),
      verified: form.verificationStatus === "verified",
      lastVerifiedAt: form.lastVerifiedAt || "",
      successRate: Number(form.successRate) || 0,
      workingVotes: Number(form.workingVotes) || 0,
      failedVotes: Number(form.failedVotes) || 0,
      reviewNote: form.reviewNote || "",
      exclusive: !!form.exclusive,
      featured: !!form.featured,
      priority: Number(form.priority) || 0,
      img: imageUrl || "",
      image: imageUrl || "",
      category: form.category || "",
      status: form.status || "active",
      updatedAt: Date.now(),
    };
  
    if (editCategories) {
      await firebaseBuySmartCategoriesSource.update(editCategories.id, payload);
    } else {
      await firebaseBuySmartCategoriesSource.add({
        ...payload,
        createdAt: Date.now(),
      });
    }
  
    resetForm();
    setLoading(false);
    setActive(false);
  };



  const previewImage = imageFile
    ? URL.createObjectURL(imageFile)
    : form.img || getBrandLogoUrl(form);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setImageFile(file);
  
    // clear URL if file selected
    setForm((prev) => ({
      ...prev,
      img: "",
    }));
  };


  useEffect(() => {
    if (!active) {
      resetForm();
    }
  }, [active]);



  return (
    <div className=" bg-white border rounded-xl shadow-sm p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between ">
        <div>
          <h2 className="text-xl font-semibold">Add Categories </h2>
          <p className="text-sm text-gray-500">
            This Categories will appear on the BuySmart Store Section
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setActive(false);
          }}
          className="btn bg-gray-100"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Banner Title
          </label>
          <div className="relative">
            <Type
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="title"
              placeholder="Anslation || Google || Microsoft"
              value={form.title}
              onChange={handleChange}
              required
              maxLength={80}
              className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-black focus:outline-none"
            />

          </div>

        </div>

        <div>

          <label className="block text-sm font-semibold">
            Category
          </label>

          <select
            name="category"
            value={form.category}
            onChange={(e) => {

              if (e.target.value === "add-new") {
                setShowCategoryInput(true)
              } else {
                handleChange(e)
              }

            }}
            className="mt-2 rounded-sm cursor-pointer w-full border p-3"
          >

            <option value="">Select Category</option>

            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}

            <option value="add-new">+ Add Category</option>

          </select>


          {showCategoryInput && (

            <div className="flex gap-2 mt-3">

              <input
                type="text"
                placeholder="Enter new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border rounded-sm p-3 w-full"
              />

              <button
                type="button"
                onClick={addCategory}
                className="bg-black rounded-sm text-white px-4"
              >
                Add
              </button>

            </div>

          )}

        </div>

        {/* discount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Banner Discount
          </label>
          <div className="relative">
            <Type
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="discount"
              placeholder="Big Sale – Up to 50% Off || Optional"
              value={form.discount}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-black focus:outline-none"
            />

          </div>

        </div>

        {/* description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Banner description
          </label>
          <div className="relative">
            <Type
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="disc"
              placeholder="brand description"
              value={form.disc}
              onChange={handleChange}

              className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-black focus:outline-none"
            />

          </div>

        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Offer Type
            </label>
            <select
              name="offerType"
              value={form.offerType}
              onChange={handleChange}
              className="mt-2 w-full cursor-pointer rounded-sm border p-3"
            >
              <option value="deal">Deal</option>
              <option value="coupon">Coupon Code</option>
              <option value="cashback">Cash Back</option>
              <option value="reward">Reward Points</option>
              <option value="student">Student Offer</option>
              <option value="creator">Creator/Affiliate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Coupon / Promo Code
            </label>
            <input
              name="couponCode"
              placeholder="SAVE20"
              value={form.couponCode}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Cash Back
            </label>
            <input
              name="cashback"
              placeholder="5% cash back"
              value={form.cashback}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reward Points
            </label>
            <input
              name="points"
              placeholder="Earn 500 points"
              value={form.points}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Audience
            </label>
            <input
              name="audience"
              placeholder="Students, creators, all shoppers"
              value={form.audience}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Expires At
            </label>
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Priority
            </label>
            <input
              type="number"
              min="0"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Terms
            </label>
            <input
              name="terms"
              placeholder="Minimum order, region, tracking rule"
              value={form.terms}
              onChange={handleChange}
              className="w-full rounded-sm border p-3 focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-gray-50 p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Verification Pipeline</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Verification Status
              </label>
              <select
                name="verificationStatus"
                value={form.verificationStatus}
                onChange={handleChange}
                className="mt-2 w-full cursor-pointer rounded-sm border bg-white p-3"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending QA</option>
                <option value="verified">Verified</option>
                <option value="expired">Expired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Success Rate
              </label>
              <input
                type="number"
                min="0"
                max="100"
                name="successRate"
                value={form.successRate}
                onChange={handleChange}
                className="w-full rounded-sm border bg-white p-3 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Last Verified At
              </label>
              <input
                type="date"
                name="lastVerifiedAt"
                value={form.lastVerifiedAt}
                onChange={handleChange}
                className="w-full rounded-sm border bg-white p-3 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Working Votes
              </label>
              <input
                type="number"
                min="0"
                name="workingVotes"
                value={form.workingVotes}
                onChange={handleChange}
                className="w-full rounded-sm border bg-white p-3 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Failed Votes
              </label>
              <input
                type="number"
                min="0"
                name="failedVotes"
                value={form.failedVotes}
                onChange={handleChange}
                className="w-full rounded-sm border bg-white p-3 focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Review Note
              </label>
              <input
                name="reviewNote"
                placeholder="Checked checkout page, student terms, region..."
                value={form.reviewNote}
                onChange={handleChange}
                className="w-full rounded-sm border bg-white p-3 focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border bg-gray-50 p-4 sm:grid-cols-3">
          {[
            ["verified", "Verified"],
            ["exclusive", "Exclusive"],
            ["featured", "Featured"],
          ].map(([name, label]) => (
            <label key={name} className="flex items-center gap-3 text-sm font-semibold text-gray-700">
              <input
                type="checkbox"
                name={name}
                checked={!!form[name]}
                onChange={handleChange}
                className="h-4 w-4"
              />
              {label}
            </label>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Brand Image Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}

            className={`w-full border rounded-sm p-3 bg-white focus:ring-2 focus:ring-black
            `}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Image URL (Optional if file selected)
          </label>

          <input
            type="text"
            name="img"
            placeholder="https://example.com/image.jpg"
            value={form.img}
            onChange={(e) => {
              setForm({ ...form, img: e.target.value });
              setImageFile(null); // clear file if URL used
            }}
            className="w-full border rounded-sm p-3 focus:ring-2 focus:ring-black"
          />
        </div>

        {/* CTA Link */}
        <div>
          <label className="block text-sm font-medium mb-1">
            CTA Link
          </label>
          <div className="relative">
            <Link2
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="link"
              placeholder="https://buysmart.com/deals"
              value={form.link}
              onChange={handleChange}

              className="w-full pl-10 pr-3 py-2 border rounded-sm focus:ring-2 focus:ring-black focus:outline-none"
            />
          </div>
        </div>



        {/* button  country  */}

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
            />
          </div>
        </div>


        {/* preview card section */}

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Preview</h3>

          <div className="border rounded-lg p-4 flex gap-4 items-center bg-gray-50">

            {previewImage ? (
              <img
                src={previewImage}
                className="w-20 h-20 object-cover rounded-md"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 flex items-center justify-center rounded-md">
                <ImageIcon size={20} />
              </div>
            )}

            <div className="flex-1">
              <h4 className="font-semibold text-lg">
                {form.title || "Banner Title"}
              </h4>

              <p className="text-sm text-gray-600">
                {form.disc || "Banner description"}
              </p>

              <div className="text-sm font-semibold text-green-600 mt-1">
                {form.discount || form.cashback || form.points || "Discount Text"}
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-blue-50 px-2 py-1 font-semibold text-blue-700">
                  {form.offerType}
                </span>
                {form.couponCode ? (
                  <span className="rounded bg-gray-200 px-2 py-1 font-semibold text-gray-700">
                    {form.couponCode}
                  </span>
                ) : null}
                {form.verified ? (
                  <span className="rounded bg-green-50 px-2 py-1 font-semibold text-green-700">
                    Verified
                  </span>
                ) : null}
                <span className="rounded bg-slate-100 px-2 py-1 font-semibold capitalize text-slate-700">
                  {form.verificationStatus}
                </span>
                <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                  {Number(form.successRate) || 0}% success
                </span>
                {form.featured ? (
                  <span className="rounded bg-indigo-50 px-2 py-1 font-semibold text-indigo-700">
                    Featured
                  </span>
                ) : null}
              </div>

              {form.link && (
                <a
                  href={form.link}
                  className="text-xs text-blue-600 underline"
                  target="_blank"
                >
                  {form.link}
                </a>
              )}
            </div>

            <span className="text-xs px-2 py-1 rounded bg-black text-white">
              {form.status}
            </span>

          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 ">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setActive(false);
            }}
            className="btn btn-primary"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading
              ? editCategories
                ? "Updating..."
                : "Saving..."
              : editCategories
                ? "Update Banner"
                : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCategories
