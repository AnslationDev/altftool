// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,

// } from "material-react-table";
// import { firebaseBuySmartHeroSource } from "@/services/firebaseBuySmartHero";
// import { Trash2, ExternalLink, Pencil } from "lucide-react";
// import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

// function GetHeroSectionData({ setActive, filter, setEditHero }) {
//   const [heroes, setHeroes] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [rowSelection, setRowSelection] = useState({});
//   const [updatingStatusId, setUpdatingStatusId] = useState(null);

//   const [openDeleteModal, setOpenDeleteModal] = useState(false);
//   const [selectedHero, setSelectedHero] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [bulkDeleting, setBulkDeleting] = useState(false);


//   useEffect(() => {
//     const unsub = firebaseBuySmartHeroSource.subscribe(
//       (data) => {
//         setHeroes(data || []);
//         setLoading(false);
//       },
//       filter
//     );

//     return () => unsub && unsub();
//   }, [filter]);



//   const handleEdit = (hero) => {
//     setActive(true);
//     setEditHero(hero);
//   };

//   const openDeleteConfirm = (hero) => {
//     setSelectedHero(hero);
//     setOpenDeleteModal(true);
//   };

//   const cancelDelete = () => {
//     setOpenDeleteModal(false);
//     setSelectedHero(null);
//   };

//   const confirmDelete = async () => {
//     if (!selectedHero) return;
//     try {
//       setDeletingId(selectedHero.id);
//       await firebaseBuySmartHeroSource.remove(selectedHero.id);
//     } finally {
//       setDeletingId(null);
//       setOpenDeleteModal(false);
//       setSelectedHero(null);
//     }
//   };

//   const handleBulkDelete = async () => {
//     const ids = Object.keys(rowSelection);
//     if (!ids.length) return;
//     if (!confirm(`Delete ${ids.length} hero banners?`)) return;

//     try {
//       setBulkDeleting(true);
//       await firebaseBuySmartHeroSource.bulkDelete(ids);
//       setRowSelection({});
//     } finally {
//       setBulkDeleting(false);
//     }
//   };

//   const handleStatusChanged = async (hero) => {
//     try {
//       setUpdatingStatusId(hero.id);
//       const newStatus = hero.status === "active" ? "paused" : "active";
//       await firebaseBuySmartHeroSource.update(hero.id, {
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
//             className="h-14 w-24 object-cover rounded-md border"
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
//           const hero = row.original;
//           return (
//             <button
//               disabled={updatingStatusId === hero.id}
//               onClick={() => handleStatusChanged(hero)}
//               className={`px-4 py-1.5 rounded-full text-xs font-semibold
//                 ${
//                   hero.status === "active"
//                     ? "bg-green-100 text-green-700"
//                     : "bg-gray-200 text-gray-600"
//                 }`}
//             >
//               {updatingStatusId === hero.id
//                 ? "Updating..."
//                 : hero.status === "active"
//                 ? "Active"
//                 : "Paused"}
//             </button>
//           );
//         },
//       },
//       {
//         accessorKey: "country",
//         header: "Country",
//         size: 100,
//       },
//       {
//         header: "Action",
//         size: 100,
//         Cell: ({ row }) => {
//           const hero = row.original;
//           return (
//             <div className="flex gap-2 justify-center">
//               <button
//                 onClick={() => handleEdit(hero)}
//                 className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-md"
//               >
//                 <Pencil size={14} />
//               </button>

//               <button
//                 onClick={() => openDeleteConfirm(hero)}
//                 disabled={deletingId === hero.id}
//                 className="bg-black hover:bg-gray-800 text-white p-2 rounded-md"
//               >
//                 <Trash2 size={14} />
//               </button>
//             </div>
//           );
//         },
//       },
//     ],
//     [updatingStatusId, deletingId]
//   );


//   const table = useMaterialReactTable({
//     columns,
//     data: heroes,
//     state: {
//       isLoading: loading,
//       rowSelection,
//     },
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     getRowId: (row) => row.id,
//     enableColumnActions: false,
//     enableColumnOrdering: true,
//     enableGrouping: true,
//     enableColumnActions: true,
//     enableDensityToggle:false,
//     enableFullScreenToggle: true,
//     renderTopToolbarCustomActions: () =>
//       Object.keys(rowSelection).length > 0 && (
//         <button
//           onClick={handleBulkDelete}
//           disabled={bulkDeleting}
//           className="px-4 py-2 bg-red-600 text-white rounded"
//         >
//           Delete Selected ({Object.keys(rowSelection).length})
//         </button>
//       ),
//   });

//   if (!loading && !heroes.length) {
//     return (
//       <div className="text-center py-12 border border-dashed rounded-lg">
//         <p className="text-lg font-semibold">No Hero Banners</p>
//         <p className="text-gray-500 text-sm mt-1">
//           Add a hero banner to display on BuySmart
//         </p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <MaterialReactTable table={table} />

//       {openDeleteModal && (
//         <DeleteConfirmModal
//           onCancel={cancelDelete}
//           onConfirm={confirmDelete}
//           loading={deletingId !== null}
//         />
//       )}
//     </>
//   );
// }

// export default GetHeroSectionData;

"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "./(resuableComponent)/ReusableTable";
import { firebaseBuySmartHeroSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartHero";
import { ExternalLink } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

function GetHeroSectionData({ setActive, setEditHero, filter }) {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHero, setSelectedHero] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

 
  useEffect(() => {
    const unsub = firebaseBuySmartHeroSource.subscribe(
      (data) => {
        setHeroes(data || []);
        setLoading(false);
      },
      filter
    );

    return () => unsub && unsub();
  }, [filter]);


  const handleEdit = (hero) => {
    setActive(true);
    setEditHero(hero);
  };


  const openDeleteConfirm = (hero) => {
    setSelectedHero(hero);
    setOpenDeleteModal(true);
  };


  const cancelDelete = () => {
    setOpenDeleteModal(false);
    setSelectedHero(null);
  };


  const confirmDelete = async () => {
    if (!selectedHero) return;

    try {
      setDeletingId(selectedHero.id);
      await firebaseBuySmartHeroSource.remove(selectedHero.id);
    } finally {
      setDeletingId(null);
      setOpenDeleteModal(false);
      setSelectedHero(null);
    }
  };


  const handleBulkDelete = async (ids) => {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} hero banners?`)) return;

    await firebaseBuySmartHeroSource.bulkDelete(ids);
  };


  const handleStatusChanged = async (hero) => {
    const newStatus = hero.status === "active" ? "paused" : "active";

    await firebaseBuySmartHeroSource.update(hero.id, {
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
            className="h-14 w-24 object-cover rounded border"
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
        type: "status", 
      },
      {
        accessorKey: "country",
        header: "Country",
      },
      {
        header: "Action",
        type: "action",
      },
    ],
    []
  );


  if (!loading && !heroes.length) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-lg font-semibold">No Hero Banners</p>
        <p className="text-gray-500 text-sm mt-1">
          Add a hero banner to display on BuySmart
        </p>
      </div>
    );
  }

  return (
    <>
      <ReusableTable
        data={heroes}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDeleteSingle={(id) => openDeleteConfirm({ id })}
        onBulkDelete={handleBulkDelete}
        onStatusChange={handleStatusChanged}
      />

      {openDeleteModal && (
        <DeleteConfirmModal
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
          loading={deletingId !== null}
        />
      )}
    </>
  );
}

export default GetHeroSectionData;