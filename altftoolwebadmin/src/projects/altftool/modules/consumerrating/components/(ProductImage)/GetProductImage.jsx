"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
import { productImageService } from "../../firebaseService/productImage.service";

function GetProductImage({ setActive, setEditData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = productImageService.subscribeAll((res) => {
      setData(res);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const tableData = useMemo(() => {
    return data.map((item, index) => ({
      id: item.id,
      number: index + 1,
      title: item.title,
      image: item.image,
      status: item.status || "active"
    }));
  }, [data]);

  const columns = [
    { accessorKey: "number", header: "#" },
    { accessorKey: "title", header: "Title" },

    {
      accessorKey: "image",
      header: "Image",
      Cell: ({ row }) => (
        <img
          src={row.original.image}
          className="h-12 w-20 object-cover rounded"
        />
      )
    },

    { accessorKey: "status", header: "Status", type: "status" },
    { accessorKey: "action", header: "Action", type: "action" }
  ];

  const handleEdit = (item) => {
    setEditData(item);
    setActive(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await productImageService.remove(id);
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await productImageService.update(item.id, {
      status: newStatus
    });

    // instant UI
    setData(prev =>
      prev.map(d =>
        d.id === item.id ? { ...d, status: newStatus } : d
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

export default GetProductImage;