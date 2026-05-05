

// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,

// } from "material-react-table";
// import { firebaseBuySmartStoreSource } from "@/services/firebaseBuySmartStore";
// import { Trash2, ExternalLink, Pencil } from "lucide-react";

// function GetStore({ setActive, setEditStore, filter }) {
//   const [store, setStore] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(false);
//   const [updatingStatusId, setUpdatingStatusId] = useState(null);
//   const [rowSelection, setRowSelection] = useState({});

//   useEffect(() => {
//     const unsub = firebaseBuySmartStoreSource.subscribe(
//       (data) => {
//         setStore(data || []);
//         setLoading(false);
//       },
//       filter
//     );

//     return () => unsub && unsub();
//   }, [filter]);


//   const handleEdit = (item) => {
//     setActive(true);
//     setEditStore(item);
//   };

//   const handleDeleteSingle = async (id) => {
//     if (!confirm("Delete this store banner?")) return;
//     setDeleting(true);
//     await firebaseBuySmartStoreSource.remove(id, store);
//     setDeleting(false);
//   };

//   const handleBulkDelete = async () => {
//     const ids = Object.keys(rowSelection);
//     if (!ids.length) return;
//     if (!confirm(`Delete ${ids.length} store banners?`)) return;

//     setDeleting(true);
//     await firebaseBuySmartStoreSource.bulkDelete(ids, store);
//     setRowSelection({});
//     setDeleting(false);
//   };

//   const handleStatusChanged = async (item) => {
//     try {
//       setUpdatingStatusId(item.id);
//       const newStatus = item.status === "active" ? "paused" : "active";
//       await firebaseBuySmartStoreSource.update(item.id, {
//         status: newStatus,
//       });
//     } finally {
//       setUpdatingStatusId(null);
//     }
//   };


//   const columns = useMemo(
//     () => [
//       {
//         header: "No",
//         size: 100,
//         Cell: ({ row }) => row.index + 1,
//       },
//       {
//         accessorKey: "image",
//         header: "Image",
//         size: 100,
//         Cell: ({ cell }) => (
//           <img
//             src={cell.getValue()}
//             className="h-12 w-20 rounded border object-cover"
//           />
//         ),
//       },
//       {
//         accessorKey: "title",
//         header: "Title",
//         size: 100,
//       },
//       {
//         accessorKey: "link",
//         header: "Link",
//         size: 100,
//         Cell: ({ cell }) => (
//           <a
//             href={cell.getValue()}
//             target="_blank"
//             className="text-blue-600 flex items-center gap-1"
//           >
//             Visit <ExternalLink size={14} />
//           </a>
//         ),
//       },
//       {
//         accessorKey: "status",
//         header: "Status",
//         size: 100,
//         Cell: ({ row }) => {
//           const item = row.original;
//           return (
//             <button
//               disabled={updatingStatusId === item.id}
//               onClick={() => handleStatusChanged(item)}
//               className={`px-3 py-1.5 rounded-full text-xs font-semibold
//                 ${
//                   item.status === "active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-gray-200 text-gray-600"
//                 }`}
//             >
//               {updatingStatusId === item.id
//                 ? "Updating..."
//                 : item.status === "active"
//                 ? "Active"
//                 : "Paused"}
//             </button>
//           );
//         },
//       },
//       {
//         accessorKey: "country",
//         header: "Country",
//       },
//       {
//         header: "Action",
//         size: 100,
//         Cell: ({ row }) => {
//           const item = row.original;
//           return (
//             <div className="flex gap-2">
//               <button
//                 onClick={() => handleEdit(item)}
//                 className="p-2 bg-yellow-600 text-white rounded"
//               >
//                 <Pencil size={14} />
//               </button>
//               <button
//                 onClick={() => handleDeleteSingle(item.id)}
//                 className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white"
//               >
//                 <Trash2 size={14} />
//               </button>
//             </div>
//           );
//         },
//       },
//     ],
//     [updatingStatusId]
//   );


//   const table = useMaterialReactTable({
//     columns,
//     data: store,
//     state: {
//       isLoading: loading,
//       rowSelection,
//     },
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     getRowId: (row) => row.id,
//     enableColumnActions: true,
//     enableColumnOrdering: true,
//     enableGrouping: true,
//     enableColumnActions: true,
//     enableDensityToggle:false,
//     enableFullScreenToggle: true,
//     renderTopToolbarCustomActions: () =>
//       Object.keys(rowSelection).length > 0 && (
//         <button
//           onClick={handleBulkDelete}
//           disabled={deleting}
//           className="px-4 py-2 bg-red-600 text-white rounded"
//         >
//           Delete Selected
//         </button>
//       ),
//   });

//   return <MaterialReactTable table={table} />;
// }

// export default GetStore;


"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../(resuableComponent)/ReusableTable";
import { firebaseBuySmartStoreSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartStore";
import { ExternalLink } from "lucide-react";

function GetStore({ setActive, setEditStore, filter }) {
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);


  useEffect(() => {
    const unsub = firebaseBuySmartStoreSource.subscribe(
      (data) => {
        setStore(data || []);
        setLoading(false);
      },
      filter
    );

    return () => unsub && unsub();
  }, [filter]);


  const handleEdit = (item) => {
    setActive(true);
    setEditStore(item);
  };

 
  const handleDeleteSingle = async (id) => {
  
    if (!confirm("Delete this store banner?")) return;

    setDeleting(true);
    await firebaseBuySmartStoreSource.remove(id);
    setDeleting(false);
  };
  


  const handleBulkDelete = async (ids) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} store banners?`)) return;

    setDeleting(true);
    await firebaseBuySmartStoreSource.bulkDelete(ids, store);
    setDeleting(false);
  };

 
  const handleStatusChanged = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await firebaseBuySmartStoreSource.update(item.id, {
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
        accessorKey: "image",
        header: "Image",
        Cell: ({ cell }) => (
          <img
            src={cell.getValue()}
            className="h-12 w-20 object-cover rounded border"
          />
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
      },
      {
        accessorKey: "link",
        header: "Link",
        Cell: ({ cell }) => (
          <a
            href={cell.getValue()}
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


  if (!loading && !store.length) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-lg font-semibold">No Store Banners</p>
        <p className="text-gray-500 text-sm mt-1">
          Add store banners to display on BuySmart
        </p>
      </div>
    );
  }

  return (
    <ReusableTable
      data={store}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDeleteSingle}
      onBulkDelete={handleBulkDelete}
      onStatusChange={handleStatusChanged}
    />
  );
}

export default GetStore;




