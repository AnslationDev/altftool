"use client";

import React, { useEffect, useMemo, useState } from "react";
import { categoryService } from "../../firebaseService/category.service";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";

function GetCategory({ setActive, setEditData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const unsub = categoryService.subscribe((res) => {
      setData(res);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ================= MAP =================
  const tableData = useMemo(() => {
    return data.map((item, index) => ({
      id: item.id,
      number: index + 1,
      name: item.name,
      image: item.image,
      status: item.status || "active",
    }));
  }, [data]);

  // ================= COLUMNS =================
  const columns = [
    { accessorKey: "number", header: "No" },

    { accessorKey: "name", header: "Category Name" },

    {
      accessorKey: "image",
      header: "Image",
      Cell: ({ row }) => (
        row.original.image ? (
          <img
            src={row.original.image}
            className="h-12 w-12 object-cover rounded"
            alt="category"
          />
        ) : "-"
      ),
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
    setEditData(item);
    setActive(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete category?")) return;
    await categoryService.remove(id);
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await categoryService.update(item.id, {
      status: newStatus,
    });

    // instant UI update
    setData((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: newStatus } : i
      )
    );
  };

  // ================= RETURN =================
  return (

    <div>
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
      onStatusChange={handleStatusChange}
    />

    </div>
  );
}

export default GetCategory;