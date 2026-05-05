"use client";
import React, { useEffect, useState } from "react";
import { categoryService } from "../../firebaseService/category.service";
import { subCategoryService } from "../../firebaseService/subcategory.service";
import { faqService } from "../../firebaseService/faq.service";
import SvgIconField from "../../components/SvgIconField";

function AddCategory({ setActive , editData , setEditData }) {

  const [form, setForm] = useState({
    categoryId: "",
    subCategoryId: "",
    icon: "",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // CATEGORY ADD
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // SUBCATEGORY ADD
  const [showSubInput, setShowSubInput] = useState(false);
  const [newSubCategory, setNewSubCategory] = useState("");
  

  // FAQ STATE
  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [editingFaqId, setEditingFaqId] = useState(null);

  // ================= CATEGORY =================
  useEffect(() => {
    return categoryService.subscribe(setCategories);
  }, []);

  // ================= SUBCATEGORY =================
  useEffect(() => {
    if (!form.categoryId) return;
    return subCategoryService.subscribe(form.categoryId, setSubCategories);
  }, [form.categoryId]);

  // ================= FAQ =================
  useEffect(() => {
    if (!form.categoryId || !form.subCategoryId) return;

    return faqService.subscribe(
      form.categoryId,
      form.subCategoryId,
      setFaqs
    );
  }, [form.categoryId, form.subCategoryId]);

  // ================= ADD CATEGORY =================
  const handleAddCategory = async () => {
    if (!newCategory) return;

    const res = await categoryService.add({ name: newCategory });

    setForm(prev => ({ ...prev, categoryId: res.id }));
    setNewCategory("");
    setShowCatInput(false);
  };

  // ================= ADD SUBCATEGORY =================
  const handleAddSubCategory = async () => {
    if (!newSubCategory) return;

    const res = await subCategoryService.add({
      name: newSubCategory,
      categoryId: form.categoryId,
      icon: form.icon, 
    });

    setForm(prev => ({
      ...prev,
      subCategoryId: res.id,
      icon: "" 
    }));

    setNewSubCategory("");
   
    setShowSubInput(false);
  };

  // prefill data
  useEffect(() => {
    if (!editData) return;
  
    setForm({
      categoryId: editData.categoryId || "",
      subCategoryId: editData.id || "",
      icon: editData.icon || "",
    });
  
    //  preload FAQs
    if (editData.faqs) {
      setFaqs(editData.faqs);
    }
  
  }, [editData]);

  // ================= FAQ CRUD =================
  const handleAddFaq = async () => {
    if (!faqForm.question || !faqForm.answer) return;

    await faqService.add({
      ...faqForm,
      categoryId: form.categoryId,
      subCategoryId: form.subCategoryId,
    });

    setFaqForm({ question: "", answer: "" });
  };

  const handleUpdateFaq = async () => {
    await faqService.update(editingFaqId, faqForm);

    setEditingFaqId(null);
    setFaqForm({ question: "", answer: "" });
  };

  const handleDeleteFaq = async (id) => {
    if (!confirm("Delete FAQ?")) return;
    await faqService.remove(id);
  };

  const handleEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
    });
  };

  return (
    <div className="p-6 space-y-6 bg-white rounded-xl shadow">

      {/* HEADER */}
      <div className="flex justify-between">
        <h2 className="text-xl font-bold">Category + FAQ Manager</h2>
        <button onClick={() => setActive(false)} className="border px-3 py-1">
          Cancel
        </button>
      </div>

      {/* ================= CATEGORY ================= */}
      <div>
        <label>Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => {
            if (e.target.value === "add-new") {
              setShowCatInput(true);
            } else {
              setForm({ ...form, categoryId: e.target.value });
            }
          }}
          className="border p-3 w-full"
        >
          <option value="">Select Category</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="add-new">+ Add Category</option>
        </select>

        {showCatInput && (
          <div className="flex gap-2 mt-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="border p-2 w-full"
            />
            <button onClick={handleAddCategory} className="bg-black text-white px-4">
              Add
            </button>
          </div>
        )}
      </div>

      {/* ================= SUBCATEGORY ================= */}
      {form.categoryId && (
        <div>
          <label>Subcategory</label>
          <select
            value={form.subCategoryId}
            onChange={(e) => {
              if (e.target.value === "add-new") {
                setShowSubInput(true);
              } else {
                setForm({ ...form, subCategoryId: e.target.value });
              }
            }}
            className="border p-3 w-full"
          >
            <option value="">Select Subcategory</option>
            {subCategories.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
            <option value="add-new">+ Add Subcategory</option>
          </select>

          {showSubInput && (
            <div className="space-y-2 mt-3 border p-3">
              <input
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                className="border p-2 w-full"
              />
                <SvgIconField
  value={form.icon}
  onChange={(val) =>
    setForm(prev => ({ ...prev, icon: val }))
  }
/>
              {/* <SvgIconField value={subIcon} onChange={setSubIcon} /> */}

              <button onClick={handleAddSubCategory} className="bg-black text-white px-4 py-2">
                Add Subcategory
              </button>

            </div>
          )}
        </div>
      )}

      {/* ================= FAQ ================= */}
      {form.subCategoryId && (
        <div className="border p-4 rounded space-y-3">

          <h3 className="font-bold">FAQs</h3>

          <input
            placeholder="Question"
            value={faqForm.question}
            onChange={(e) =>
              setFaqForm(prev => ({ ...prev, question: e.target.value }))
            }
            className="border p-2 w-full"
          />

          <textarea
            placeholder="Answer"
            value={faqForm.answer}
            onChange={(e) =>
              setFaqForm(prev => ({ ...prev, answer: e.target.value }))
            }
            className="border p-2 w-full"
          />

          <button
            onClick={editingFaqId ? handleUpdateFaq : handleAddFaq}
            className="bg-blue-600 text-white px-4 py-2"
          >
            {editingFaqId ? "Update FAQ" : "Add FAQ"}
          </button>

          {/* LIST */}
          <div className="space-y-2">
            {faqs.map(faq => (
              <div key={faq.id} className="border p-3 rounded">
                <p className="font-semibold">{faq.question}</p>
                <p className="text-sm text-gray-600">{faq.answer}</p>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleEditFaq(faq)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteFaq(faq.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

export default AddCategory;