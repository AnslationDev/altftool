"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import BrandEditForm from "./BrandEditForm";
import { categoryService } from "../../firebaseService/category.service";
import { subscribeAllBrands, allBrandService } from "../../firebaseService/allBrand.service";
import { Trash2, Pencil } from "lucide-react";

function GetBrand() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [active, setActive] = useState(false);
  const [editData, setEditData] = useState(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);

  useEffect(() => {
    return categoryService.subscribe((data) => {
      setCategories(data);
      setCategoriesLoading(false);
    });
  }, []);

  useEffect(() => {
    return subscribeAllBrands((data) => {
      setBrands(data);
      setBrandsLoading(false);
    });
  }, []);

  const tableData = useMemo(() => {
    return categories.flatMap((category) => {
      const categoryBrands = brands.filter(
        (brand) => brand.categoryId === category.id
      );

      if (categoryBrands.length === 0) {
        return [
          {
            id: `empty-${category.id}`,
            categoryId: category.id,
            categoryName: category.name,
            brandName: "No brand added",
            logo: "",
            link: "",
            brand: null,
          },
        ];
      }

      return categoryBrands.map((brand) => ({
        id: brand.id,
        categoryId: category.id,
        categoryName: category.name,
        brandName: brand.name,
        logo: brand.logo,
        link: brand.link,
        brand,
      }));
    });
  }, [categories, brands]);

  const handleDelete = useCallback(async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    await allBrandService.remove(item.categoryId, item.id);
  }, []);

  const columns = useMemo(
    () => [
      {
        header: "No",
        Cell: ({ row }) => row.index + 1,
        size: 70,
      },
      {
        accessorKey: "categoryName",
        header: "Category Name",
      },
      {
        accessorKey: "brandName",
        header: "Brand Name",
      },
      {
        accessorKey: "logo",
        header: "Logo",
        Cell: ({ row }) =>
          row.original.logo ? (
            <img
              src={row.original.logo}
              alt={row.original.brandName}
              className="h-10 w-10 rounded object-contain border"
            />
          ) : (
            <span className="text-gray-400">-</span>
          ),
        size: 90,
      },
      {
        accessorKey: "link",
        header: "Brand Link",
        Cell: ({ row }) =>
          row.original.link ? (
            <a
              href={row.original.link}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline"
            >
              {row.original.link}
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          ),
      },
      {
        header: "Action",
        Cell: ({ row }) => {
          const brand = row.original.brand;

          if (!brand) {
            return <span className="text-gray-400">-</span>;
          }

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                title="Edit brand"
                onClick={() => {
                  setEditData(brand);
                  setActive(true);
                }}
                className="rounded p-2 text-amber-600 hover:bg-amber-50"
              >
                <Pencil size={16} />
              </button>

              <button
                type="button"
                title="Delete brand"
                onClick={() => handleDelete(brand)}
                className="rounded p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
        size: 110,
      },
    ],
    [handleDelete]
  );

  const table = useMaterialReactTable({
    columns,
    data: tableData,
    state: {
      isLoading: categoriesLoading || brandsLoading,
    },
    getRowId: (row) => row.id,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    enableColumnOrdering: true,
    enableColumnActions: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  return (
    <div className="p-6">

      {active ? (
        <BrandEditForm
          editData={editData}
          setActive={(value) => {
            setActive(value);
            if (!value) setEditData(null);
          }}
          categories={categories}
        />
      ) : (
        <>
          <h2 className="text-xl font-bold mb-6">Category & Brands</h2>
          <MaterialReactTable table={table} />
        </>
      )}
    </div>
  );
}

export default GetBrand;
