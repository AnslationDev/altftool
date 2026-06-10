"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable, { SafeTableImage } from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
import { topCouponService } from "../../firebaseService/topCoupon.service";

function GetCoupon({ setActive, setEditData }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH
  useEffect(() => {
    const unsub = topCouponService.subscribeAll((res) => {
      setData(res);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // MAP
  const tableData = useMemo(() => {
    return data.map((item, index) => ({
      id: item.id,
      number: index + 1,
      name: item.brandname,
      image: item.brandimage,
      description:item.description,
      logo: item.brandlogo,
      discount: item.discount,
      link:item.link,
      code: item.code,
      status: item.status
    }));
  }, [data]);

  // COLUMNS
  const columns = [
    { accessorKey: "number", header: "#" },

    { accessorKey: "name", header: "Brand" },

    {
      accessorKey: "image",
      header: "Image",
      Cell: ({ row }) => (
        <SafeTableImage src={row.original.image} alt={row.original.name || "Coupon"} className="h-10 w-16 rounded border object-cover" fallbackClassName="h-10 w-16 rounded border border-dashed border-gray-300 bg-gray-50" />
      )
    },

    {
      accessorKey: "logo",
      header: "Logo",
      Cell: ({ row }) => (
        <SafeTableImage src={row.original.logo} alt={`${row.original.name || "Brand"} logo`} className="h-8 w-8 rounded border object-cover" fallbackClassName="h-8 w-8 rounded border border-dashed border-gray-300 bg-gray-50" />
      )
    },

    { accessorKey: "discount", header: "Discount" },
    { accessorKey: "code", header: "Code" },

    {
      accessorKey: "status",
      header: "Status",
      type: "status"
    },

    {
      accessorKey: "action",
      header: "Action",
      type: "action"
    }
  ];

  // ACTIONS
  const handleEdit = (item) => {
    setEditData(item);
    setActive(true);
  };

  const handleDelete = async (id) => {
    await topCouponService.remove(id);
    return true;
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await topCouponService.update(item.id, {
      status: newStatus
    });

    setData(prev =>
      prev.map(i =>
        i.id === item.id ? { ...i, status: newStatus } : i
      )
    );
  };

  const handleBulkDelete = async (ids) => {
    if (!ids.length) return false;
    await topCouponService.bulkDelete(ids);
    return true;
  };

  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
      onBulkDelete={handleBulkDelete} 
      onStatusChange={handleStatusChange}
      confirmDeletes
    />
  );
}

export default GetCoupon;
