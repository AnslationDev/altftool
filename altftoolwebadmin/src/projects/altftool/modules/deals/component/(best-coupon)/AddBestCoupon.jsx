"use client";
import React, { useEffect, useState } from "react";
import { BestCouponService } from "../../firebaseService/UpcomingDeal.service";
import { categoryService } from "../../firebaseService/category.service";
import { uploadImage } from "../../../buysmart/services/uploadImage";
import { allBrandService } from "../../firebaseService/allBrand.service";

function AddBestCoupon({ setActive, editData }) {

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);


  const [form, setForm] = useState({
    name: "",
    logo: "",
    link: "",
    bannerImg: "",
    highestDiscount: "",
    categoryId: "",
    offers: []
  });


  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [offer, setOffer] = useState({
    title: "",
    discount: "",
    code: "",
    type: "coupon",
    startDate: "",
    expireDate: "",
    conditions: []
  });

  const [conditionInput, setConditionInput] = useState("");


  useEffect(() => {
    return categoryService.subscribe(setCategories);
  }, []);

  const selectedCategory = categories.find(c => c.id === form.categoryId);


  // 🔹 fetch brands when category changes
  useEffect(() => {
    if (!form.categoryId) {
      setBrands([]);
      return;
    }

    const unsubscribe = allBrandService.subscribe(
      form.categoryId,
      (data) => {
        setBrands(data);
      }
    );

    return () => unsubscribe();
  }, [form.categoryId]);

  // ================= FILE =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
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

    // ✅ set preview
    setPreview(editData.logo || "");

    // ✅ IMPORTANT: set selected brand AFTER brands load
    setSelectedBrand(editData.brandId || ""); // 👈 YOU WERE MISSING THIS

  }, [editData]);


  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file)); // ✅ FIX
  };
  useEffect(() => {
    if (!brands.length || !editData) return;

    const found = brands.find(b => b.name === editData.name);

    if (found) {
      setSelectedBrand(found.id);
    }
  }, [brands, editData]);

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

    if (editingIndex !== null) {
      // ✅ UPDATE existing offer
      const updated = [...form.offers];
      updated[editingIndex] = offer;

      setForm(prev => ({
        ...prev,
        offers: updated
      }));

      setEditingIndex(null);
    } else {
      // ✅ ADD new offer
      setForm(prev => ({
        ...prev,
        offers: [
          ...prev.offers,
          { ...offer, id: Date.now().toString(), status: "active" }
        ]
      }));
    }

    // reset form
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
  const handleEditOffer = (data, index) => {
    setOffer(data);          
    setEditingIndex(index); 
  };
  const handleRemoveOffer = (index) => {
    if (!confirm("Delete this offer?")) return;

    setForm(prev => ({
      ...prev,
      offers: prev.offers.filter((_, i) => i !== index)
    }));

    if (editingIndex === index) {
      setEditingIndex(null);
      setOffer({
        title: "",
        discount: "",
        code: "",
        type: "coupon",
        startDate: "",
        expireDate: "",
        conditions: []
      });
    }

    if (editingIndex !== null && index < editingIndex) {
      setEditingIndex(prev => prev - 1);
    }
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
      await BestCouponService.update(editData.id, payload);
    } else {
      await BestCouponService.add(payload);
    }

    setActive(false);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Add Best Coupon</h2>
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
          <label className="text-sm font-medium">Brand *</label>
          <select
            value={selectedBrand}
            onChange={(e) => {
              const brandId = e.target.value;
              setSelectedBrand(brandId);
              const selected = brands.find(b => b.id === brandId);

              if (selected) {
                setForm(prev => ({
                  ...prev,
                  brandId: selected.id,
                  name: selected.name,
                  logo: selected.logo,
                  link: selected.link,
                }));

                setPreview(selected.logo);
              }
            }}
            className="border p-3 w-full rounded"
          >
            <option value="">Select Brand</option>

            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Highest Discount</label>
          <input
            value={form.highestDiscount}
            onChange={(e) => setForm({ ...form, highestDiscount: e.target.value })}
            className="border p-2 w-full rounded"
          />
        </div>


      </div>



      <div>
        <label className="text-sm font-medium">Brand Bannner</label>

        <div className="flex items-center gap-4 mt-2">
          <input
            className="border p-2 w-full rounded"
            type="file" onChange={handleBannerChange} />

        </div>
        {(bannerPreview || form.bannerImg) && (
          <img
            src={bannerPreview || form.bannerImg}
            className="w-16 h-16 rounded object-cover border"
          />
        )}

      </div>



      {/* ================= OFFERS ================= */}
      <div className="border rounded-xl p-5 space-y-4">

        <h3 className="font-semibold text-lg">Add Offer</h3>

        {/* TYPE */}
        <div>
          <label className="text-sm font-medium">Offer Type</label>
          <select
            value={offer.type}
            onChange={(e) => setOffer({ ...offer, type: e.target.value })}
            className="border p-2 w-full rounded"
          >
            <option value="coupon">Coupon</option>
            <option value="deal">Deal</option>
          </select>
        </div>

        {/* TITLE + DISCOUNT */}
        <div className="grid grid-cols-2 gap-3">

          <input
            placeholder="Title"
            value={offer.title}
            id="title"
            onChange={e => setOffer({ ...offer, title: e.target.value })}
            className="border p-2 rounded"
          />

          <input
            placeholder="Discount"
            value={offer.discount}
            onChange={e => setOffer({ ...offer, discount: e.target.value })}
            className="border p-2 rounded"
          />
        </div>

        {/* CODE */}
        {offer.type == "coupon" &&
          <div><input
            placeholder="Coupon Code"
            value={offer.code}
            onChange={e => setOffer({ ...offer, code: e.target.value })}
            className="border p-2 w-full rounded"
          /></div>
        }


        {/* DATES */}
        {offer.type == "coupon" && (<div className="grid grid-cols-2 gap-3">
          <input type="date"
          value={offer.startDate}
            onChange={e => setOffer({ ...offer, startDate: e.target.value })}
            className="border p-2 rounded"
          />
          <input type="date"
          value={offer.expireDate}
            onChange={e => setOffer({ ...offer, expireDate: e.target.value })}
            className="border p-2 rounded"
          />
        </div>)}


        {/* CONDITIONS */}
        <div>
          <label className="text-sm font-medium">Conditions</label>

          <div className="flex gap-2 mt-2">
            <input
              value={conditionInput}
              onChange={(e) => setConditionInput(e.target.value)}
              className="border p-2 w-full rounded"
            />
            <button
              onClick={handleAddCondition}
              className="bg-black text-white px-3 rounded"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {offer.conditions.map((c, i) => (
              <span key={i} className="bg-gray-100 px-2 py-1 rounded text-sm flex gap-1">
                {c}
                <button onClick={() => handleRemoveCondition(i)}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* ADD OFFER BUTTON */}
        <button
          onClick={handleAddOffer}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Offer
        </button>

        {/* OFFER LIST */}
        
        <div className="space-y-2">
          {form.offers.map((o, i) => (
            <div key={o.id} className="border p-2 rounded text-sm flex justify-between items-center">

              <div>
                <strong>{o.title}</strong> ({o.type}) - {o.discount}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEditOffer(o, i)}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleRemoveOffer(i)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>

            </div>
          ))}
        </div>
    

      </div>

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

export default AddBestCoupon;