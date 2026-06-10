"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import BrandEditForm from "./BrandEditForm";
import { categoryService } from "../../firebaseService/category.service";
import { subscribeAllBrands, allBrandService } from "../../firebaseService/allBrand.service";
import { AlertTriangle, Loader2, Trash2, Pencil } from "lucide-react";
import ReusableTable, { SafeTableImage } from "@/projects/altftool/modules/buysmart/(components)/(resuableComponent)/ReusableTable";

function GetBrand() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [active, setActive] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleting, setDeleting] = useState(false);
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

  const handleDelete = useCallback((item) => {
    setDeleteError("");
    setDeleteTarget(item);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setDeleteError("");
      await allBrandService.remove(deleteTarget.categoryId, deleteTarget.id);
      setDeleteTarget(null);
    } catch (error) {
      console.error("Brand delete failed", error);
      setDeleteError(error?.message || "Brand delete failed. Please retry after checking Firebase access.");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

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
            <SafeTableImage
              src={row.original.logo}
              alt={row.original.brandName}
              className="h-10 w-10 rounded border object-contain"
              fallbackClassName="h-10 w-10 rounded border border-dashed border-gray-300 bg-gray-50"
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
          <ReusableTable
            data={tableData}
            columns={columns}
            loading={categoriesLoading || brandsLoading}
            enableRowSelection={false}
          />
          {deleteTarget ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-2xl">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Delete this brand?</h2>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      This will permanently delete {deleteTarget.name || "this brand"}. This action cannot be undone.
                    </p>
                    {deleteError ? (
                      <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                        {deleteError}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default GetBrand;
