"use client";

import React, { useEffect, useMemo, useState } from "react";
import { UpcomingDealService } from "../../firebaseService/UpcomingDeal.service";
import ReusableTable, { SafeTableImage } from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
import { categoryService } from "../../firebaseService/category.service";


function GetUpcomingDeal({ setActive, setEditData }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
   const [categories, setCategories] = useState([]);

  useEffect(() => {
    const unsub = UpcomingDealService .subscribeAll((res) => {
      setData(res);
      setLoading(false);
    });

    return () => unsub();
  }, []);
  useEffect(() => {
    return categoryService.subscribe(setCategories);
  }, []);



  // const tableData = useMemo(() => {
  //   return data.map((item, i) => ({
  //     id: item.id,
  //     number: i + 1,
  //     name: item.name,
  //     logo: item.logo,
  //     bannerImg:item.bannerImg,
  //     link : item.link,
  //     highestDiscount:item.highestDiscount,
  //     categoryId:item.selectedCategory,
  //     status: item.status
  //   }));
  // }, [data]);

  const tableData = useMemo(() => {
    return data.map((item, i) => ({
      ...item, // ✅ VERY IMPORTANT (full data pass)
      id: item.id,
      number: i + 1,
    }));
  }, [data]);

  const columns = [
    { accessorKey: "number", header: "No" },
    { accessorKey: "name", header: "Brand" },

    {
      accessorKey: "logo",
      header: "Logo",
      Cell: ({ row }) => (
        <SafeTableImage src={row.original.logo} alt={`${row.original.name || "Brand"} logo`} className="h-10 w-10 rounded border object-contain" fallbackClassName="h-10 w-10 rounded border border-dashed border-gray-300 bg-gray-50" />
      )
    },
    { accessorKey: "bannerImg", 
      header: "Banner",
      Cell: ({ row }) => (
        <SafeTableImage src={row.original.bannerImg} alt={`${row.original.name || "Deal"} banner`} className="h-10 w-10 rounded border object-cover" fallbackClassName="h-10 w-10 rounded border border-dashed border-gray-300 bg-gray-50" />
      )
     },

     {
      accessorKey: "highestDiscount",
      header: "Highest Discount",
      Cell: ({ row }) => (
        <span className="font-semibold text-green-600">
          {row.original.highestDiscount || "—"}
        </span>
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
    await UpcomingDealService .remove(id);
    return true;
  };

   const handleStatusChange = async (item) => {
      const newStatus = item.status === "active" ? "paused" : "active";
  
      await UpcomingDealService.update(item.id, {
        status: newStatus,
      });
  
      // instant UI update
      setData((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: newStatus } : i
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
      confirmDeletes
    />
  );
}

export default GetUpcomingDeal;
