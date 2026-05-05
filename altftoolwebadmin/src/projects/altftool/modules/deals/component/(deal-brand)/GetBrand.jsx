"use client";

import React, { useEffect, useMemo, useState } from "react";
import { brandService } from "../../firebaseService/brand.service";
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";

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
        <img src={row.original.logo} className="h-10 w-10" />
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
    if (!confirm("Delete brand?")) return;
    await brandService.remove(id);
  };
 
  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
    />
  );
}

export default GetBrand;