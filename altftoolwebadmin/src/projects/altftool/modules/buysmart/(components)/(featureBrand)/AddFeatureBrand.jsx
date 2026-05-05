"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Select from "react-select"
import CountryFlag from "react-country-flag"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useCountry } from "../(hookes)/useCountry"

import { uploadImage } from "@/projects/altftool/modules/buysmart/services/uploadImage"
import { firebaseBuySmartFeatureBrandSource } from "../../services/firebaseBuySmartFeatureBrand"

const defaultForm = {
    category: "",
    country: "",
    status: "active",
    BrandDetail: [
      {
        image: "",
        title: "",
        link: "",
        imageType: "",
        imageFile: null
      }
    ]
  };



function AddFeatureBrand({ setActive, editFeature, setEditFeature }) {

    const [brand, setBrand] = useState([])
    const [imageSize, setImageSize] = useState(null);
    const [categories, setCategories] = useState([])
    const [newCategory, setNewCategory] = useState("")
    const [showCategoryInput, setShowCategoryInput] = useState(false)

    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState(defaultForm)
    const { countryOptions, selectedCountry, handleCountryChange } = useCountry(form, setForm)
    function resetForm() {
        setForm(defaultForm);
        setEditFeature(null);
      }

    function handleChange(e) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }





   

    useEffect(() => {
        if (editFeature) {
          setForm({
            category: editFeature.category || "",
            country: editFeature.country || "",
            status: editFeature.status || "active",
            BrandDetail: editFeature.BrandDetail.map((item) => ({
              title: item.title || "",
              link: item.link || "",
              image: item.image || "",
              imageType: item.imageType || "",
              imageFile: null
            }))
          });
        } else {
          setForm(defaultForm); 
        }
      }, [editFeature]);


    useEffect(() => {

        const unsub = firebaseBuySmartFeatureBrandSource.subscribe((data) => {

            setBrand(data || [])

            const categorydata = (data || []).map((item) => item.category)

            const uniqueCategories = [...new Set(categorydata)]

            setCategories(uniqueCategories)

            setLoading(false)

        })

        return () => unsub && unsub()

    }, [])


    // const handleImageChange = (index, file) => {

    //     if (!file) return

    //     const updated = [...form.BrandDetail]

    //     updated[index].imageFile = file
    //     updated[index].image = URL.createObjectURL(file)

    //     setForm((prev) => ({ ...prev, BrandDetail: updated }))
    // }

    const handleImageChange = (index, file) => {
        if (!file) return;
    
        const img = new window.Image();
        const imageUrl = URL.createObjectURL(file);
    
        img.onload = () => {
            const width = img.width;
            const height = img.height;
    
            const selectedType = form.BrandDetail[index].imageType;
    
            // Square validation
            if (selectedType === "square") {
                if (width !== 1080 || height !== 1080) {
                    alert("Please upload a 1080 x 1080 px square image");
                    return;
                }
            }
    
        
            if (selectedType === "landscape") {
                // you can define your own size
                // example: 1200x600
            }
    
            const updated = [...form.BrandDetail];
            updated[index].imageFile = file;
            updated[index].image = imageUrl;
    
            setForm((prev) => ({
                ...prev,
                BrandDetail: updated
            }));
        };
    
        img.src = imageUrl;
    };

    const handleBrandChange = (index, field, value) => {

        const updated = [...form.BrandDetail]

        updated[index][field] = value

        setForm((prev) => ({ ...prev, BrandDetail: updated }))
    }

    const addBrand = () => {

        setForm((prev) => ({
            ...prev,
            BrandDetail: [
                ...prev.BrandDetail,
                { image: "", title: "", link: "", imageFile: null }
            ]
        }))
    }

    const removeBrand = (index) => {

        const updated = [...form.BrandDetail]

        updated.splice(index, 1)

        setForm((prev) => ({ ...prev, BrandDetail: updated }))
    }


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


    async function handleSubmit(e) {

        e.preventDefault()

        setLoading(true)

        try {

            const uploadedBrands = []

            for (const brand of form.BrandDetail) {

                let imageUrl = brand.image

                if (brand.imageFile) {
                    imageUrl = await uploadImage(brand.imageFile)
                }

                uploadedBrands.push({
                    image: imageUrl,
                    title: brand.title,
                    link: brand.link,
                    imageType: brand.imageType,
                })
            }

            const payload = {
                category: form.category,
                country: form.country,
                status: form.status,
                BrandDetail: uploadedBrands
            }

            if (editFeature) {

                await firebaseBuySmartFeatureBrandSource.update(
                    editFeature.id,
                    payload
                )

            } else {

                await firebaseBuySmartFeatureBrandSource.add(payload)

            }

            setActive(false)
            setEditFeature(null)

        } catch (err) {

            console.error("Error saving feature:", err)

        }

        resetForm();
       setActive(false);

        setLoading(false)
    }

   

    

    return (

        <div className="max-w-6xl mx-auto bg-white rounded-sm shadow-lg border p-10">

            <div className="mb-8 flex justify-between ">
                <div>
                <h2 className="text-3xl font-bold text-gray-800">
                    {editFeature ? "Edit Feature Brand" : "Create Feature Brand"}
                </h2>

                <p className="text-gray-500 mt-2">
                    Configure category, brands, and campaign settings.
                </p>
                </div>
         
                <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setActive(false);
                          }}
                        
                        className=" px-3 h-12 cursor-pointer rounded-sm  border"
                    >
                        Cancel
                    </button>
            </div>


            <form onSubmit={handleSubmit} className="space-y-10">

                <div className="border rounded-sm p-6 space-y-6">

                    {/* CATEGORY */}

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


                    {/* STATUS */}

                    <div>

                        <label className="block text-sm font-semibold">
                            Status
                        </label>

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="mt-2 w-full rounded-sm border p-3"
                        >

                            <option value="active">Active</option>
                            <option value="paused">Paused</option>

                        </select>

                    </div>


                    {/* COUNTRY */}

                    <div>

                        <label className="block text-sm font-semibold">
                            Country
                        </label>

                        <Select
                            options={countryOptions}
                            value={selectedCountry}
                            onChange={handleCountryChange}
                        />

                    </div>

                </div>


                {/* BRAND SECTION */}

                <div className="border rounded-sm p-6 space-y-6">

                    <div className="flex justify-between items-center">

                        <h3 className="text-lg font-semibold">
                            Feature Brands
                        </h3>

                        <button
                            type="button"
                            onClick={addBrand}
                            className="flex items-center gap-2 px-4 py-2 bg-black text-white"
                        >

                            <Plus size={16} />
                            Add Brand

                        </button>

                    </div>


                    {form.BrandDetail.map((brand, index) => (

                        <fieldset
                            key={index}
                            className="border rounded-md p-5 bg-gray-50 space-y-4"
                        >

                            <legend className="text-sm font-semibold text-gray-700 px-2">
                                Brand {index + 1}
                            </legend>

                            <div className="grid gap-4">

                                <select
                                    value={brand.imageType}
                                    onChange={(e) =>
                                        handleBrandChange(index, "imageType", e.target.value)
                                    }
                                    className="w-full border cursor-pointer rounded-sm p-3 bg-white"
                                >
                                    <option value="">Select image type</option>
                                    <option value="square">
                                        Square Image — 1080 x 1080
                                    </option>
                                    <option value="landscape">
                                        Landscape
                                    </option>
                                </select>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                                    className="border rounded-md p-2 bg-white"
                                />

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4" >
                                    <input
                                        type="text"
                                        placeholder="Enter brand name"
                                        value={brand.title}
                                        onChange={(e) => handleBrandChange(index, "title", e.target.value)}
                                        className="border rounded-md p-3"
                                    />

                                    <input
                                        type="text"
                                        placeholder="https://brand.com"
                                        value={brand.link}
                                        onChange={(e) => handleBrandChange(index, "link", e.target.value)}
                                        className="border rounded-md p-3"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => removeBrand(index)}
                                        className="bg-black text-white rounded-md flex items-center justify-center"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>



                            </div>

                        </fieldset>

                    ))}

                </div>


                {/* PREVIEW */}

                <div className="border rounded-sm p-6 bg-gray-50">

                    <h3 className="text-lg font-semibold mb-4">
                        Preview
                    </h3>

                    <div className="grid grid-cols-4 gap-4">

                        {form.BrandDetail.map((brand, index) => (

                            <div key={index} className="border rounded-sm p-4 text-center bg-white">

                                {brand.image && (

                                    <Image
                                        src={brand.image}
                                        width={80}
                                        height={80}
                                        alt="brand"
                                    />

                                )}

                                <p className="mt-2 font-semibold">
                                    {brand.title || "Brand Title"}
                                </p>

                            </div>

                        ))}

                    </div>

                </div>


                {/* BUTTONS */}

                <div className="flex justify-end gap-4">

                    <button
                        type="button"
                        onClick={() => {
                            resetForm();
                            setActive(false);
                          }}
                        // onClick={() => setActive(false)}
                        className="px-6 cursor-pointer rounded-sm py-3 border"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-sm cursor-pointer bg-black text-white flex items-center gap-2"
                    >

                        {loading && <Loader2 size={16} className="animate-spin" />}

                        Save 

                    </button>

                </div>

            </form>

        </div>
    )
}

export default AddFeatureBrand