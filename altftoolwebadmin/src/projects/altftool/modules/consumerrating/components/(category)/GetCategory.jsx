"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";

import { categoryService } from "../../firebaseService/category.service";
import { subCategoryService } from "../../firebaseService/subcategory.service";
import { faqService } from "../../firebaseService/faq.service";

function GetCategory({ setActive, setEditData }) {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const unsubCat = categoryService.subscribe(setCategories);
    const unsubSub = subCategoryService.subscribeAll(setSubCategories);

    const unsubFaq = faqService.subscribeAll
      ? faqService.subscribeAll(setFaqs)
      : () => {};

    setLoading(false);

    return () => {
      unsubCat();
      unsubSub();
      unsubFaq();
    };
  }, []);

  // ================= MAP TABLE =================
  const tableData = useMemo(() => {
    return subCategories.map((sub, index) => {
      const category = categories.find(c => c.id === sub.categoryId);

      const faqCount = faqs.filter(
        f =>
          f.categoryId === sub.categoryId &&
          f.subCategoryId === sub.id
      ).length;

      return {
        id: sub.id,
        number: index + 1,
        category: category?.name || "-",
        subCategory: sub.name,
        icon: sub.icon,
        status: sub.status || "active",
        faqCount,
        categoryId: sub.categoryId,
        subCategoryId: sub.id,
      };
    });
  }, [categories, subCategories, faqs]);

  // ================= COLUMNS =================
  const columns = [
    { accessorKey: "number", header: "#" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "subCategory", header: "Sub Category" },

    {
      accessorKey: "icon",
      header: "Icon",
      Cell: ({ row }) => {
        const icon = row.original.icon;
    
        if (!icon) return "-";
    
        // SVG string
        if (icon.startsWith("<svg")) {
          return (
            <div
              className="h-8 w-8 text-blue-500"
              dangerouslySetInnerHTML={{ __html: icon }}
            />
          );
        }
    
        // Image URL
        return (
          <img
            src={icon}
            alt="icon"
            className="h-10 w-10 object-cover rounded"
          />
        );
      },
    },

    {
      accessorKey: "faqCount",
      header: "FAQ",
    },

    {
      accessorKey: "status",
      header: "Status",
      type: "status",
    },

    {
      accessorKey: "action",
      header: "Action",
      type: "action",
    },
  ];

  // ================= ACTIONS =================

  const handleEdit = (item) => {
    const sub = subCategories.find(s => s.id === item.id);
  
    const relatedFaqs = faqs.filter(
      f =>
        f.categoryId === sub.categoryId &&
        f.subCategoryId === sub.id
    );
  
    setEditData({
      ...sub,
      faqs: relatedFaqs, // ✅ send FAQs also
    });
  
    setActive(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    await subCategoryService.remove(id);
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";
  
    await subCategoryService.update(item.id, {
      status: newStatus,
    });
  
    // optional instant UI update
    setSubCategories(prev =>
      prev.map(s =>
        s.id === item.id ? { ...s, status: newStatus } : s
      )
    );
  };

  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
      onStatusChange={handleStatusChange}
    />
  );
}

export default GetCategory;