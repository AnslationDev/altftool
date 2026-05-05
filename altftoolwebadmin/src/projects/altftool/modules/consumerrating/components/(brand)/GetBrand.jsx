"use client";

import React, { useEffect, useState, useMemo } from "react";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";

import { brandService } from "../../firebaseService/brand.service";
import { categoryService } from "../../firebaseService/category.service";
import { subCategoryService } from "../../firebaseService/subcategory.service";

function GetBrand({ setActive, setEditBrand }) {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    const unsubBrand = brandService.subscribeAll((data) => {
      setBrands(data);
      setLoading(false);
    });

    const unsubCat = categoryService.subscribe(setCategories);
    const unsubSub = subCategoryService.subscribeAll(setSubCategories);

    return () => {
      unsubBrand();
      unsubCat();
      unsubSub();
    };
  }, []);

  // ================= SORT BY RANKING =================
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => {
      const ra = Number(a.ranking || 0);
      const rb = Number(b.ranking || 0);
      return ra - rb;
    });
  }, [brands]);

  // ================= MAP DATA =================
  const tableData = useMemo(() => {
    return sortedBrands.map((b, index) => {
      const category = categories.find(c => c.id === b.categoryId);
      const subCategory = subCategories.find(s => s.id === b.subCategoryId);

      return {
        id: b.id,

        // 🔥 serial number after sorting
        number: index + 1,

        // 🔥 IMPORTANT (send full data for edit)
        raw: b,

        category: category?.name || "-",
        subCategory: subCategory?.name || "-",
        name: b.name,
        logo: b.logo,
        title: b.heading,
        link: b.brandLink,
        country: b.country,
        rating: b.rating,
        ranking: b.ranking || "-",
        status: b.status || "active",
      };
    });
  }, [sortedBrands, categories, subCategories]);

  // ================= COLUMNS =================
  const columns = [
    {
      accessorKey: "number",
      header: "#",
      size: 50,
    },
    {
      accessorKey: "ranking",
      header: "Rank 🔥",
      size: 80,
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      accessorKey: "subCategory",
      header: "Sub Category",
    },
    {
      accessorKey: "name",
      header: "Brand Name",
    },
    {
      accessorKey: "logo",
      header: "Logo",
      Cell: ({ row }) => (
        row.original.logo ? (
          <img
            src={row.original.logo}
            alt="logo"
            className="h-10 w-10 object-cover rounded"
          />
        ) : "-"
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
    },
    {
      accessorKey: "link",
      header: "Link",
      Cell: ({ row }) => (
        row.original.link ? (
          <a
            href={row.original.link}
            target="_blank"
            className="text-blue-600 underline"
          >
            Visit
          </a>
        ) : "-"
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
    },
    {
      accessorKey: "rating",
      header: "Rating",
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand?")) return;
    await brandService.remove(id);
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await brandService.update(item.id, {
      status: newStatus,
    });
  };

  // 🔥 FIXED EDIT (send RAW data)
  const handleEdit = (item) => {
    setEditBrand(item.raw); // 👈 important
    setActive(true);
  };

  // ================= UI =================
  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onDeleteSingle={handleDelete}
      onStatusChange={handleStatusChange}
      onEdit={handleEdit}
    />
  );
}

export default GetBrand;