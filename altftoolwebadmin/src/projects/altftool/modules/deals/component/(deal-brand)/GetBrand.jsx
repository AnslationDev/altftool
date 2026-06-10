"use client";

import React, { useEffect, useMemo, useState } from "react";
import { brandService } from "../../firebaseService/brand.service";
import ReusableTable, { SafeTableImage } from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";

function GetBrand({ setActive, setEditData }) {

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = brandService.subscribeAll((res) => {
      setData(res);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const tableData = useMemo(() => {
    return data.map((item, i) => ({
      id: item.id,
      ...item,
      number: i + 1,
      offerCount: item.offers?.length || 0,
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

    { accessorKey: "highestDiscount", header: "Top Discount" },
    { accessorKey: "offerCount", header: "Offers" },

    { accessorKey: "status", header: "Status", type: "status" },
    { accessorKey: "action", header: "Action", type: "action" }
  ];

  const handleEdit = (item) => {
    setEditData(item);
    setActive(true);
  };

  const handleDelete = async (id) => {
    await brandService.remove(id);
    return true;
  };
 
  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
      confirmDeletes
    />
  );
}

export default GetBrand;
