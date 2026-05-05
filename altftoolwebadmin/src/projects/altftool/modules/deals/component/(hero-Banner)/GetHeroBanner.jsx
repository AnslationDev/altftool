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
import ReusableTable from "../../../buysmart/(components)/(resuableComponent)/ReusableTable";
import { heroBannerService } from "../../firebaseService/heroBanner.service";

function GetHeroBanner({ setActive, setEditData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

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
        <img
          src={row.original.image}
          className="h-12 w-20 object-cover rounded"
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
    if (!confirm("Delete banner?")) return;
    await heroBannerService.remove(id);
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
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    if (!confirm(`Delete ${selectedIds.length} banners?`)) return;

    try {
      setBulkDeleting(true);

      await heroBannerService.bulkDelete(selectedIds);

      setSelectedIds([]); // reset selection
    } catch (err) {
      console.error(err);
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div>
      {/* ✅ BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="flex justify-between items-center mb-3 p-3 bg-red-50 border rounded">
          <span className="text-sm font-medium">
            {selectedIds.length} selected
          </span>

          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            {bulkDeleting
              ? "Deleting..."
              : `Delete Selected (${selectedIds.length})`}
          </button>
        </div>
      )}

      {/* ✅ TABLE */}
      <ReusableTable
        data={tableData}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDeleteSingle={handleDelete}
        onStatusChange={handleStatusChange}

        // 🔥 IMPORTANT
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}

        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}

export default GetHeroBanner;