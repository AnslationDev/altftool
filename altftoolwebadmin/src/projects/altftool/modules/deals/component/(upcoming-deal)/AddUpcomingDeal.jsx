"use client";
import React, { useEffect, useState } from "react";
import { UpcomingDealService } from "../../firebaseService/UpcomingDeal.service";
import { categoryService } from "../../firebaseService/category.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";

function AddUpcomingDeal({ setActive, editData }) {

  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    name: "",
    logo: "",
    link: "",
    bannerImg:"",
    highestDiscount: "",
    categoryId: "",
    offers: []
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");

  // const [offer, setOffer] = useState({
  //   title: "",
  //   discount: "",
  //   code: "",
  //   type: "coupon",
  //   startDate: "",
  //   expireDate: "",
  //   conditions: []
  // });

  const [conditionInput, setConditionInput] = useState("");

  // ================= FETCH CATEGORY =================
  useEffect(() => {
    return categoryService.subscribe(setCategories);
  }, []);

  const selectedCategory = categories.find(c => c.id === form.categoryId);

  // ================= FILE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };


  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file)); // ✅ preview
  };

  useEffect(() => {
    if (!editData) return;
  
    setForm({
      name: editData.name || "",
      logo: editData.logo || "",
      bannerImg: editData.bannerImg || "",
      highestDiscount: editData.highestDiscount || "",
      link: editData.link || "",
      categoryId: editData.categoryId || "",
      offers: editData.offers || [],
      status: editData.status || "active",
    });
  
    // ✅ preview set
    setPreview(editData.logo || "");
  }, [editData]);

  // ================= CONDITIONS =================
  const handleAddCondition = () => {
    if (!conditionInput) return;

    setOffer(prev => ({
      ...prev,
      conditions: [...prev.conditions, conditionInput]
    }));

    setConditionInput("");
  };

  const handleRemoveCondition = (index) => {
    setOffer(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  // ================= ADD OFFER =================
  const handleAddOffer = () => {
    if (!offer.title) return;

    setForm(prev => ({
      ...prev,
      offers: [
        ...prev.offers,
        { ...offer, id: Date.now().toString(), status: "active" }
      ]
    }));

    setOffer({
      title: "",
      discount: "",
      code: "",
      type: "coupon",
      startDate: "",
      expireDate: "",
      conditions: []
    });
  };

const handleSubmit = async () => {
    if (!form.name || !form.categoryId) {
      alert("Required fields missing");
      return;
    }
  
    let imageUrl = form.logo;
   let bannerUrl = form.bannerImg;
  
   if (logoFile) {
    imageUrl = await uploadImage(logoFile);
  }
  
  if (bannerFile) {
    bannerUrl = await uploadImage(bannerFile);
  }
  
    const selectedCategory = categories.find(
      c => c.id === form.categoryId
    );
  
    const payload = {
      ...form,
      logo: imageUrl,
      bannerImg: bannerUrl,
      categoryName: selectedCategory?.name || ""
    };
  
    if (editData) {
      await UpcomingDealService.update(editData.id, payload);
    } else {
      await UpcomingDealService.add(payload);
    }
  
    setActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Brand</h2>
        <button onClick={() => setActive(false)} className="text-gray-500 text-sm">
          Cancel
        </button>
      </div>

      {/* ================= CATEGORY ================= */}
      <div className="space-y-2">
        <label className="font-medium text-sm">Category *</label>

        <select
          value={form.categoryId}
          onChange={(e) =>
            setForm({ ...form, categoryId: e.target.value })
          }
          className="border p-3 w-full rounded"
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* ✅ SHOW CATEGORY NAME */}
        {selectedCategory && (
          <div className="text-sm text-green-600">
            Selected: <strong>{selectedCategory.name}</strong>
          </div>
        )}
      </div>

      {/* ================= BRAND INFO ================= */}
      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="text-sm font-medium">Brand Name *</label>
          <input
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Highest Discount</label>
          <input
            value={form.highestDiscount}
            onChange={(e) => setForm({...form, highestDiscount: e.target.value})}
            className="border p-2 w-full rounded"
          />
        </div>

      </div>

      {/* ================= LOGO ================= */}
      <div>
        <label className="text-sm font-medium">Brand Logo *</label>

        <div className="flex items-center gap-4 mt-2">
          <input
           className="border p-2 w-full rounded"
           type="file" onChange={handleFileChange} />
          

          {preview && (
            <img
              src={preview}
              className="w-16 h-16 rounded object-cover border"
            />
          )}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Brand Bannner</label>

        <div className="flex items-center gap-4 mt-2">
          <input
           className="border p-2 w-full rounded"
           type="file" onChange={handleBannerChange} />
           {(bannerPreview || form.bannerImg) && (
  <img
    src={bannerPreview || form.bannerImg}
    className="w-20 h-12 object-cover border rounded"
  />
)}
          
        </div>
      </div>

      {/* ================= LINK ================= */}
      <div>
        <label className="text-sm font-medium">Website URL</label>
        <input
          value={form.link}
          onChange={(e) => setForm({...form, link: e.target.value})}
          className="border p-2 w-full rounded"
        />
      </div>

      {/* ================= OFFERS ================= */}
     

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full bg-green-600 text-white py-3 rounded font-medium"
      >
        Save Brand
      </button>
      

    </div>
  );
}

export default AddUpcomingDeal;