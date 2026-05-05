"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../(resuableComponent)/ReusableTable";
import { firebaseBuySmartFeatureBrandSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartFeatureBrand";
import { ExternalLink } from "lucide-react";

function GetFeatureBrand({ setActive, setEditFeature }) {
  const [brand, setBrand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    const unsub = firebaseBuySmartFeatureBrandSource.subscribe((data) => {
      setBrand(data || []);
      setLoading(false);
    });

    return () => unsub && unsub();
  }, []);


  const handleEdit = (item) => {
    setActive(true);
    setEditFeature(item);
  };


  const handleDeleteSingle = async (id) => {
    if (!confirm("Delete this brand?")) return;

    setDeleting(true);
    await firebaseBuySmartFeatureBrandSource.remove(id, brand);
    setDeleting(false);
  };


  const handleBulkDelete = async (ids) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} brands?`)) return;

    setDeleting(true);
    await firebaseBuySmartFeatureBrandSource.bulkDelete(ids, brand);
    setDeleting(false);
  };

  
  const handleStatusChanged = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await firebaseBuySmartFeatureBrandSource.update(item.id, {
      status: newStatus,
    });
  };

  

  const columns = useMemo(
    () => [
      {
        header: "No",
        Cell: ({ row }) => row.index + 1,
      },

      {
        header: "Image",
        Cell: ({ row }) => (
          <img
            src={row.original.BrandDetail?.[0]?.image}
            className="h-12 w-20 rounded border object-cover"
          />
        ),
      },

      {
        header: "Title",
        Cell: ({ row }) =>
          row.original.BrandDetail?.[0]?.title || "-",
      },

      {
        accessorKey: "category",
        header: "Category",
      },

      {
        header: "Link",
        Cell: ({ row }) => (
          <a
            href={row.original.BrandDetail?.[0]?.link}
            target="_blank"
            className="text-blue-600 flex items-center gap-1"
          >
            Visit <ExternalLink size={14} />
          </a>
        ),
      },

      {
        accessorKey: "status",
        header: "Status",
        type: "status", // ✅ reusable handles it
      },

      {
        accessorKey: "country",
        header: "Country",
      },

      {
        header: "Action",
        type: "action", // ✅ reusable handles it
      },
    ],
    []
  );

  
  if (!loading && !brand.length) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-lg font-semibold">No Feature Brands</p>
        <p className="text-gray-500 text-sm mt-1">
          Add feature brands to display on BuySmart
        </p>
      </div>
    );
  }

  return (
    <ReusableTable
      data={brand}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDeleteSingle}
      onBulkDelete={handleBulkDelete}
      onStatusChange={handleStatusChanged}
    />
  );
}

export default GetFeatureBrand;