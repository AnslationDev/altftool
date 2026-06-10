// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
// import { heroBannerService } from "../../firebaseService/heroBanner.service";

// function GetHeroBanner({ setActive, setEditData }) {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   //  FETCH
//   useEffect(() => {
//     const unsub = heroBannerService.subscribeAll((res) => {
//       setData(res);
//       setLoading(false);
//     });

//     return () => unsub();
//   }, []);

//   //  MAP
//   const tableData = useMemo(() => {
//     return data.map((item, index) => ({
//       id: item.id,
//       number: index + 1,
//       title: item.title,
//       image: item.image,
//       link : item.link,
//       status: item.status || "active"
//     }));
//   }, [data]);

//   // 
//   const columns = [
//     { accessorKey: "number", header: "No" },

//     { accessorKey: "title", header: "Title" },

//     {
//       accessorKey: "image",
//       header: "Image",
//       Cell: ({ row }) => (
//         <img
//           src={row.original.image}
//           className="h-12 w-20 object-cover rounded"
//         />
//       )
//     },
//     { accessorKey: "link", header: "Link" },

//     {
//       accessorKey: "status",
//       header: "Status",
//       type: "status"
//     },

//     {
//       accessorKey: "action",
//       header: "Action",
//       type: "action"
//     }
//   ];

//   //  ACTIONS
//   const handleEdit = (item) => {
//     setEditData(item);
//     setActive(true);
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete banner?")) return;
//     await heroBannerService.remove(id);
//   };

//   const handleStatusChange = async (item) => {
//     const newStatus = item.status === "active" ? "paused" : "active";

//     await heroBannerService.update(item.id, {
//       status: newStatus
//     });

//     // instant UI
//     setData(prev =>
//       prev.map(i =>
//         i.id === item.id ? { ...i, status: newStatus } : i
//       )
//     );
//   };

//   return (
//     <ReusableTable
//       data={tableData}
//       columns={columns}
//       loading={loading}
//       onEdit={handleEdit}
//       onDeleteSingle={handleDelete}
//       onStatusChange={handleStatusChange}
//     />
//   );
// }

// export default GetHeroBanner;


"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable, { SafeTableImage } from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
import { heroBannerService } from "../../firebaseService/heroBanner.service";

function GetHeroBanner({ setActive, setEditData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const unsub = heroBannerService.subscribeAll((res) => {
      setData(res || []);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // ================= MAP =================
  const tableData = useMemo(() => {
    return data.map((item, index) => ({
      id: item.id,
      number: index + 1,
      title: item.title,
      image: item.image,
      link: item.link,
      status: item.status || "active",
    }));
  }, [data]);

  // ================= COLUMNS =================
  const columns = [
    { accessorKey: "number", header: "No" },

    { accessorKey: "title", header: "Title" },

    {
      accessorKey: "image",
      header: "Image",
      Cell: ({ row }) => (
        <SafeTableImage
          src={row.original.image}
          alt={row.original.title || "Hero banner"}
          className="h-12 w-20 rounded border object-cover"
          fallbackClassName="h-12 w-20 rounded border border-dashed border-gray-300 bg-gray-50"
        />
      ),
    },

    { accessorKey: "link", header: "Link" },

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
    await heroBannerService.remove(id);
    return true;
  };

  const handleStatusChange = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await heroBannerService.update(item.id, {
      status: newStatus,
    });

    // instant UI update
    setData((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: newStatus } : i
      )
    );
  };

  // ================= BULK DELETE =================
  const handleBulkDelete = async (ids) => {
    if (!ids.length) return false;
    await heroBannerService.bulkDelete(ids);
    return true;
  };

  return (
    <ReusableTable
      data={tableData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDelete}
      onStatusChange={handleStatusChange}
      onBulkDelete={handleBulkDelete}
      confirmDeletes
    />
  );
}

export default GetHeroBanner;
