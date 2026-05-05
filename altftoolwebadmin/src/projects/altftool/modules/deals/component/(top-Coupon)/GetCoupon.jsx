"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
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
        <img src={row.original.image} className="h-10 w-16 rounded" />
      )
    },

    {
      accessorKey: "logo",
      header: "Logo",
      Cell: ({ row }) => (
        <img src={row.original.logo} className="h-8 w-8 rounded" />
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
    if (!confirm("Delete coupon?")) return;
    await topCouponService.remove(id);
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
    if (!ids.length) return;
  
    if (!confirm(`Delete ${ids.length} coupons?`)) return;
  
    await topCouponService.bulkDelete(ids);
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
    />
  );
}

export default GetCoupon;