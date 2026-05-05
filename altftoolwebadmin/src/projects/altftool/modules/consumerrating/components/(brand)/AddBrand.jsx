"use client";

import React, { useEffect, useState } from "react";
import { categoryService } from "../../firebaseService/category.service";
import { subCategoryService } from "../../firebaseService/subcategory.service";
import { brandService } from "../../firebaseService/brand.service";
import { useCountry } from "../../../buysmart/(components)/(hookes)/useCountry";
import Select from "react-select"
import { uploadImage } from "../../../buysmart/services/uploadImage";
import SvgIconField from "../SvgIconField";

function AddBrand({ setActive, editBrand, setEditBrand }) {
    const [form, setForm] = useState({
        categoryId: "",
        subCategoryId: "",
    });

    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);


    const [brands, setBrands] = useState([
        {
            name: "",
            heading: "",
            description: "",
            rating: "",
            ranking:"",
            brandLink: "",
            country: "",
            image: [],
            specification: [''],
            logo: "",
            additionalBenifit: [{ id: Date.now(), icon: "", text: "" }],
            feature: [{ id: Date.now(), icon: "", heading: "", description: "" }]

        },
    ]);
    
    const { countryOptions } = useCountry({}, () => { });

    const [loading, setLoading] = useState(false);

    // ================= CATEGORY =================
    useEffect(() => {
        const unsub = categoryService.subscribe(setCategories);
        return () => unsub();
    }, []);

    // ================= SUBCATEGORY =================
    useEffect(() => {
        if (!form.categoryId) {
            setSubCategories([]);
            return;
        }

        const unsub = subCategoryService.subscribe(
            form.categoryId,
            setSubCategories
        );

        return () => unsub();
    }, [form.categoryId]);

    // ================= HANDLE CHANGE =================
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    useEffect(() => {
        if (!editBrand) return;
      
        setForm({
          categoryId: editBrand.categoryId,
          subCategoryId: editBrand.subCategoryId,
        });
      
        setBrands([
          {
            name: editBrand.name || "",
            heading: editBrand.heading || "",
            description: editBrand.description || "",
            rating: editBrand.rating || "",
            ranking:editBrand.ranking || "",
            brandLink: editBrand.brandLink || "",
            country: editBrand.country || "",
            image: editBrand.images || [], // ⚠️ important
            specification: editBrand.specification || [""],
            logo: editBrand.logo || "",
            additionalBenifit: editBrand.additionalBenefit || [
              { id: Date.now(), icon: "", text: "" }
            ],
            feature: editBrand.feature || [
              { id: Date.now(), icon: "", heading: "", description: "" }
            ]
          }
        ]);
      
      }, [editBrand]);

    //   logo
    // const handleLogoUpload = async (i, file) => {
    //     const url = await uploadImage(file);
    //     const updated = [...brands];
    //     updated[i].logo = url;
    //     setBrands(updated);
    // };

    // previewImage
    const getLogoPreview = (brand) => {
        if (!brand.logo) return null;

        // if uploaded (firebase url)
        if (typeof brand.logo === "string") return brand.logo;

        // if file (local preview)
        return URL.createObjectURL(brand.logo);
    };
    const handleLogoUpload = (i, file) => {
        const updated = [...brands];
        updated[i].logo = file; // store file first
        setBrands(updated);
    };




    const handleImagesUpload = (i, files) => {
        if (files.length < 4 || files.length > 6) {
            return alert("Upload 4 to 6 images");
        }

        const updated = [...brands];
        updated[i].image = Array.from(files); // store FILES, not URLs
        setBrands(updated);
    };

    const getImagePreview = (img) => {
        if (!img) return null;

        // already uploaded (url)
        if (typeof img === "string") return img;

        // local file
        return URL.createObjectURL(img);
    };
    const addSpecification = (i) => {
        const updated = [...brands];
        updated[i].specification.push("");
        setBrands(updated);
    };

    const updateSpecification = (i, si, value) => {
        const updated = [...brands];
        updated[i].specification[si] = value;
        setBrands(updated);
    };

    // ================= BENEFITS =================
    const addBenefit = (i) => {
        const updated = [...brands];
        updated[i].additionalBenifit.push({
            id: Date.now(),
            icon: "",
            text: "",
        });
        setBrands(updated);
    };

    const updateBenefit = (i, bi, key, value) => {
        const updated = [...brands];
        updated[i].additionalBenifit[bi][key] = value;
        setBrands(updated);
    };

    // ================= FEATURES =================
    const addFeature = (i) => {
        const updated = [...brands];
        updated[i].feature.push({
            id: Date.now(),
            icon: "",
            heading: "",
            description: "",
        });
        setBrands(updated);
    };

    const updateFeature = (i, fi, key, value) => {
        const updated = [...brands];
        updated[i].feature[fi][key] = value;
        setBrands(updated);
    };

    // ================= BRAND ADD =================
    const addBrandField = () => {
        setBrands((prev) => [
            ...prev,
            {
                name: "",
                heading: "",
                description: "",
                rating: "",
                ranking:"",
                brandLink: "",
                country: "",
                image: [],
                specification: [''],
                logo: "",
                additionalBenifit: [{ id: Date.now(), icon: "", text: "" }],
                feature: [{ id: Date.now(), icon: "", heading: "", description: "" }]
            },
        ]);
    };

    // ================= BRAND CHANGE =================
    // const handleBrandChange = (index, key, value) => {
    //     const updated = [...brands];
    //     updated[index][key] = value;
    //     setBrands(updated);
    // };
    const handleBrandChange = (index, key, value) => {
        const updated = [...brands];
    
        if (key === "ranking") {
            let newRank = Number(value);
            if (!newRank || newRank < 1) return;
    
            const current = updated[index];
    
            // remove current
            const others = updated.filter((_, i) => i !== index);
    
            // shift others
            const shifted = others.map((b) => {
                if (Number(b.ranking) >= newRank) {
                    return { ...b, ranking: Number(b.ranking) + 1 };
                }
                return b;
            });
    
            // rebuild list
            const finalList = [...shifted];
            finalList.splice(index, 0, { ...current, ranking: newRank });
    
            setBrands(finalList);
            return;
        }
    
        updated[index][key] = value;
        setBrands(updated);
    };

    // ================= REMOVE BRAND =================
    const removeBrand = (index) => {
        const updated = brands.filter((_, i) => i !== index);
        setBrands(updated);
    };

    const handleSubmit = async () => {
        if (!form.categoryId || !form.subCategoryId) {
            return alert("Select category & subcategory");
        }
    
        try {
            setLoading(true);
    
            for (const brand of brands) {
                if (!brand.name.trim()) continue;
    
                // 🔥 SHIFT EXISTING DATA FIRST
                await brandService.shiftRankings(
                    form.categoryId,
                    form.subCategoryId,
                    brand.ranking,
                    editBrand?.id
                );
    
                // upload logo
                let logoUrl = "";
                if (brand.logo instanceof File) {
                    logoUrl = await uploadImage(brand.logo);
                } else {
                    logoUrl = brand.logo || "";
                }
    
                // upload images
                let imageUrls = [];
                if (brand.image?.length) {
                    for (let img of brand.image) {
                        if (img instanceof File) {
                            const url = await uploadImage(img);
                            imageUrls.push(url);
                        } else {
                            imageUrls.push(img);
                        }
                    }
                }
    
                const payload = {
                    name: brand.name,
                    heading: brand.heading,
                    description: brand.description,
                    rating: Number(brand.rating || 0),
                    ranking: Number(brand.ranking || 0),
                    brandLink: brand.brandLink || "",
                    country: brand.country || "IN",
    
                    logo: logoUrl,
                    images: imageUrls,
    
                    specification: brand.specification || [],
                    additionalBenefit: brand.additionalBenifit || [],
                    feature: brand.feature || [],
    
                    categoryId: form.categoryId,
                    subCategoryId: form.subCategoryId,
                };
    
                if (editBrand) {
                    await brandService.update(editBrand.id, payload);
                } else {
                    await brandService.add(payload);
                }
            }
    
            alert(editBrand ? "Brand Updated ✅" : "Brand Added ✅");
    
            setEditBrand(null);
            setActive(false);
    
        } catch (err) {
            console.error(err);
            alert("Error ❌");
        } finally {
            setLoading(false);
        }
    };

   
    // const handleSubmit = async () => {
    //     if (!form.categoryId || !form.subCategoryId) {
    //       return alert("Select category & subcategory");
    //     }
      
    //     try {
    //       setLoading(true);
      
    //       for (const brand of brands) {
    //         if (!brand.name.trim()) continue;
      
    //         // upload logo
    //         let logoUrl = "";
    //         if (brand.logo instanceof File) {
    //           logoUrl = await uploadImage(brand.logo);
    //         } else {
    //           logoUrl = brand.logo || "";
    //         }
      
    //         // upload images
    //         let imageUrls = [];
    //         if (brand.image?.length) {
    //           for (let img of brand.image) {
    //             if (img instanceof File) {
    //               const url = await uploadImage(img);
    //               imageUrls.push(url);
    //             } else {
    //               imageUrls.push(img);
    //             }
    //           }
    //         }
      
    //         const payload = {
    //           name: brand.name,
    //           heading: brand.heading,
    //           description: brand.description,
    //           rating: Number(brand.rating || 0),
    //           ranking:Number(brand.ranking || 0 ), 
    //           brandLink: brand.brandLink || "",
    //           country: brand.country || "IN",
      
    //           logo: logoUrl,
    //           images: imageUrls,
      
    //           specification: brand.specification || [],
    //           additionalBenefit: brand.additionalBenifit || [],
    //           feature: brand.feature || [],
      
    //           categoryId: form.categoryId,
    //           subCategoryId: form.subCategoryId,
    //         };
      
    //         // ✅ EDIT MODE
    //         if (editBrand) {
    //           await brandService.update(editBrand.id, payload);
    //         } else {
    //           await brandService.add(payload);
    //         }
    //       }
      
    //       alert(editBrand ? "Brand Updated ✅" : "Brand Added ✅");
      
    //       setEditBrand(null);
    //       setActive(false);
      
    //     } catch (err) {
    //       console.error(err);
    //       alert("Error ❌");
    //     } finally {
    //       setLoading(false);
    //     }
    //   };
    return (
        <div className="p-6 space-y-6">
            <div className="flex  justify-between" >
                <div>
                    <h2 className="text-xl font-bold">Add Brand Details</h2>
                </div>
                <button
                    type="button"
                    onClick={() => {

                        setActive(false);
                    }}
                    className=" px-2 py-2 border rounded-sm cursor-pointer hover:bg-red-700 hover:text-white transition"
                >
                    Cancel
                </button>
            </div>


            {/* ================= CATEGORY ================= */}
            <div>
                <label>Category</label>
                <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    className="w-full border p-2"
                >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* ================= SUBCATEGORY ================= */}
            {form.categoryId && (
                <div>
                    <label>Subcategory</label>
                    <select
                        name="subCategoryId"
                        value={form.subCategoryId}
                        onChange={handleChange}
                        className="w-full border p-2"
                    >
                        <option value="">Select Subcategory</option>
                        {subCategories.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                                {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* ================= BRANDS ================= */}
            {form.subCategoryId && (
                <div className="space-y-4 ">
                    <h3 className="font-semibold">Brands</h3>

                    {brands.map((brand, index) => (

                        <div
                            key={index}
                            className="border p-4 bg-[#fbfbfb] w-full rounded space-y-2"
                        >
                            <div className="flex justify-between" >
                             <div className="text-blue-600 text-xl" >#Brand {index+1}</div>
                             <div
                            onClick={() => removeBrand(index)}
                             className="cursor-pointer text-red-500" >Delete</div>
                            </div>
                            

                            <div className="flex w-full gap-5 justify-between" >
                                <div className="w-1/2" >
                                    <label htmlFor="brand_name">Brand Name </label>
                                    <input
                                        placeholder="Brand Name"
                                        className="w-full mt-2 rounded-sm  border p-2"
                                        value={brand.name}
                                        required
                                        id="brand_name"
                                        onChange={(e) =>
                                            handleBrandChange(index, "name", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-1/2" >
                                    <label htmlFor="brand_title">Brand Title</label>
                                    <input
                                        placeholder="Brand Title"
                                        className="w-full mt-2 rounded-sm border p-2"
                                        value={brand.heading}
                                        required
                                        onChange={(e) =>
                                            handleBrandChange(index, "heading", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            {/* Brand description */}
                            <div>
                                <label htmlFor="brand_des">Brand Description</label>
                                <textarea
                                    placeholder="Brand Description"
                                    className="w-full rounded-sm mt-2 border p-2"
                                    value={brand.description}
                                    id="brand_des"
                                    onChange={(e) =>
                                        handleBrandChange(index, "description", e.target.value)
                                    }
                                />

                            </div>

                            {/* brand Link $ rating */}
                            <div className="flex gap-10 justify-between" >
                                <div className="w-1/2" >
                                    <label htmlFor="Brand_link">Brand Link</label>
                                    <input
                                        placeholder="Brand Link"
                                        className="w-full mt-2 rounded-sm border p-2"
                                        value={brand.brandLink}
                                        required
                                        onChange={(e) =>
                                            handleBrandChange(index, "brandLink", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label htmlFor="brand_rating">Rating</label>
                                    <input
                                        placeholder="Brand Rating"
                                        type="number"
                                        className="w-full mt-2 rounded-sm border p-2"
                                        value={brand.rating}
                                        id="brand_rating"
                                        required
                                        onChange={(e) =>
                                            handleBrandChange(index, "rating", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="w-1/3" >
                                <label htmlFor="brand_rank">Brand Rank</label>
                                    <input
                                        placeholder="Brand Ranking"
                                        type="number"
                                          min="1"
                                        className="w-full mt-2 rounded-sm border p-2"
                                        value={brand.ranking}
                                        id="brand_rank"
                                        required
                                        onChange={(e) =>
                                            handleBrandChange(index, "ranking", e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex gap-10 justify-between" >
                                <div className="w-1/2">
                                    <label htmlFor="Brand_logo">Brand Logo</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        placeholder="Brand logo"
                                        className="w-full mt-2 mb-2 rounded-sm border p-2"
                                        required
                                        onChange={(e) =>
                                            handleLogoUpload(index, e.target.files[0])
                                        }
                                    />
                                    {getLogoPreview(brand) && (
                                        <img
                                            src={getLogoPreview(brand)}
                                            alt="logo preview"
                                            className="h-20 w-20 object-cover rounded border"
                                        />
                                    )}
                                </div>

                                <div className="w-1/2" >
                                    <label htmlFor="">Brand Image Min 4</label>
                                    <input
                                        type="file"
                                        className="w-full mt-2 rounded-sm border p-2"
                                        multiple
                                        onChange={(e) =>
                                            handleImagesUpload(index, e.target.files)
                                        }

                                    />
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {brand.image?.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={getImagePreview(img)}
                                                alt="preview"
                                                className="h-20 w-20 object-cover rounded border"
                                            />
                                        ))}
                                    </div>
                                </div>



                            </div>


                            <div className="mt-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Country <span className="text-red-600">*</span>
                                </label>

                                <Select
                                    options={countryOptions}
                                    value={countryOptions.find(opt => opt.value === brand.country) || null}
                                    onChange={(opt) => handleBrandChange(index, "country", opt?.value)}
                                    placeholder="country"
                                    isSearchable
                                />
                            </div>

                            <div>
                                <label >Specification</label>
                                <div>
                                    {brand.specification.map((spec, si) => (
                                        <input
                                            key={si}
                                            className="border p-2 w-full mb-2 mt-2"
                                            value={spec}
                                            onChange={(e) => updateSpecification(index, si, e.target.value)}
                                        />
                                    ))}
                                    <div className="flex justify-end" >
                                    <button
                                        className="rounded-sm px-5 py-2 cursor-pointer bg-blue-600 text-white"
                                        onClick={() => addSpecification(index)}>+ Add</button>
                                    </div>
                                   
                                </div>

                            </div>

                            {/* BENEFITS */}
                            <div className="my-10 " >
                                <h4 className=" my-2" >Additional Benefits</h4>
                                {brand.additionalBenifit.map((b, bi) => (
                                    <div key={b.id} className=" border p-2">
                                        <div className="flex my-4 justify-between" >
                                            <div className="text-xl text-blue-600" ># Benifit {bi +1}</div>
                                            <div className="text-red-500" >Delete</div>
                                        </div>
                                        <div>
                                            <input
                                                placeholder="Text"
                                                value={b.text}
                                                className="border p-2 w-full mb-2"

                                                onChange={(e) =>
                                                    updateBenefit(index, bi, "text", e.target.value)
                                                }
                                            />
                                        </div>
                                        
                                        <SvgIconField
                                            label="Icon"
                                            value={b.icon}
                                            onChange={(val) => updateBenefit(index, bi, "icon", val)}
                                        />
                                    </div>
                                ))}
                                <div className="flex justify-end">
                                <button
                                    className="rounded-sm border cursor-pointer my-3 p-3 bg-blue-600 text-white"
                                    onClick={() => addBenefit(index)}>+ Add Benefit</button>
                                </div>
                                
                            </div>

                            {/* FEATURES */}
                            <div>
                                <h4>Features</h4>
                                {brand.feature.map((f, fi) => (
                                    <div key={f.id} className="border p-2 mb-2">
                                         <div className="flex my-4 justify-between" >
                                            <div className="text-xl text-blue-600" ># Feature {fi +1}</div>
                                            <div className="text-red-500" >Delete</div>
                                        </div>

                                        <input
                                            placeholder="Heading"
                                            value={f.heading}
                                            className="border p-2 w-full mb-2"
                                            required
                                            onChange={(e) =>
                                                updateFeature(index, fi, "heading", e.target.value)
                                            }
                                        />
                                        <textarea
                                            placeholder="Description"
                                            value={f.description}
                                            className="border p-2 w-full mb-2"
                                            required
                                            onChange={(e) =>
                                                updateFeature(index, fi, "description", e.target.value)
                                            }
                                        />
                                        <SvgIconField
                                            label="Icon"
                                            value={f.icon}
                                            onChange={(val) => updateFeature(index, fi, "icon", val)}
                                        />
                                    </div>
                                ))}
                                <div className="flex justify-end " >
                                <button
                                    className="rounded-sm border cursor-pointer  p-3 bg-blue-600 text-white"
                                    onClick={() => addFeature(index)}>+ Add Feature</button>
                                </div>
                              

                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addBrandField}
                        className="bg-blue-600 rounded-sm text-white px-4 py-2"
                    >
                        + Add More Brand
                    </button>
                </div>
            )}

            {/* ================= SUBMIT ================= */}
            <div className="flex gap-3 justify-end" >
                <div>
                <button
                    type="button"
                    onClick={() => {

                        setActive(false);
                    }}
                    className=" px-2 py-2 border rounded-sm cursor-pointer hover:bg-red-700 hover:text-white transition"
                >
                    Cancel
                </button>
                </div>
                <div>
                <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-black cursor-pointer rounded-sm text-white px-6 py-2"
            >
                {loading ? "Saving..." : "Save Brands"}
            </button>
                </div>
            </div>
           

        </div>
    );
}

export default AddBrand;