

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
import ReusableTable, { SafeTableImage } from "../(resuableComponent)/ReusableTable";
import { firebaseBuySmartStoreSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartStore";
import { AlertTriangle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { isExternalMerchantUrl, slugifyBuySmartBrand } from "@altftool/core/buysmart";

function getStoreSlug(store = {}) {
  return slugifyBuySmartBrand(store.slug || store.title || store.name || store.link || store.url);
}

function getStoreQuality(store = {}, stores = []) {
  const issues = [];
  const duplicateCount = stores.filter((item) => getStoreSlug(item) === getStoreSlug(store)).length;

  if (!store.title && !store.name) issues.push("Missing title");
  if (!isExternalMerchantUrl(store.link || store.url)) issues.push("Missing merchant URL");
  if (!store.image && !store.logo) issues.push("Missing image");
  if (store.status !== "active") issues.push("Paused");
  if (duplicateCount > 1) issues.push("Duplicate store");

  const score = Math.max(0, 100 - issues.length * 22);
  return {
    issues,
    score,
    status: issues.some((issue) => issue.includes("Missing")) ? "fix" : issues.length ? "review" : "ready",
  };
}

function StoreQualityBadge({ item, stores }) {
  const quality = getStoreQuality(item, stores);
  const style =
    quality.status === "ready"
      ? "border-green-200 bg-green-50 text-green-700"
      : quality.status === "fix"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div className="min-w-36">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${style}`}>
        {quality.status === "ready" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {quality.score}/100
      </span>
      <p className="mt-1 line-clamp-2 text-xs text-gray-500">
        {quality.issues.length ? quality.issues.slice(0, 2).join(", ") : "Ready to publish"}
      </p>
    </div>
  );
}

function StoreQualitySummary({ stores }) {
  const stats = stores.reduce(
    (acc, item) => {
      const quality = getStoreQuality(item, stores);
      acc[quality.status] += 1;
      return acc;
    },
    { fix: 0, ready: 0, review: 0 },
  );

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Store quality</p>
        <p className="mt-1 text-lg font-semibold text-gray-950">{stores.length} store rows audited</p>
        <p className="mt-1 text-sm text-gray-600">Links, images, duplicate slugs, and status are checked here.</p>
      </div>
      {[
        { label: "Ready", value: stats.ready, className: "border-green-200 bg-green-50 text-green-700" },
        { label: "Review", value: stats.review, className: "border-amber-200 bg-amber-50 text-amber-700" },
        { label: "Fix first", value: stats.fix, className: "border-red-200 bg-red-50 text-red-700" },
      ].map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 shadow-sm ${card.className}`}>
          <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function GetStore({ setActive, setEditStore, filter }) {
  const [store, setStore] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickActionId, setQuickActionId] = useState("");


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
    await firebaseBuySmartStoreSource.remove(id);
    return true;
  };
  


  const handleBulkDelete = async (ids) => {
    if (!ids.length) return false;
    await firebaseBuySmartStoreSource.bulkDelete(ids, store);
    return true;
  };

 
  const handleStatusChanged = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";

    await firebaseBuySmartStoreSource.update(item.id, {
      status: newStatus,
    });
  };

  const handleQuickActivate = async (item) => {
    setQuickActionId(item.id);

    try {
      await firebaseBuySmartStoreSource.update(item.id, {
        status: "active",
      });
    } finally {
      setQuickActionId("");
    }
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
          <SafeTableImage
            src={cell.getValue()}
            alt="Store banner"
            className="h-12 w-20 rounded border object-cover"
            fallbackClassName="h-12 w-20 rounded border border-dashed border-gray-300 bg-gray-50"
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
        Cell: ({ cell }) => {
          const href = cell.getValue();
          if (!isExternalMerchantUrl(href)) {
            return (
              <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                Missing link
              </span>
            );
          }

          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600"
            >
              Visit <ExternalLink size={14} />
            </a>
          );
        },
      },
      {
        header: "Quality",
        Cell: ({ row }) => <StoreQualityBadge item={row.original} stores={store} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        type: "status", // ✅ reusable handles it
      },
      {
        header: "Quick action",
        Cell: ({ row }) => {
          const item = row.original;
          const isActive = item.status === "active";

          return (
            <button
              type="button"
              disabled={isActive || quickActionId === item.id}
              onClick={() => handleQuickActivate(item)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {quickActionId === item.id ? "Saving..." : isActive ? "Active" : "Activate"}
            </button>
          );
        },
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
    [quickActionId, store]
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
    <div className="space-y-4">
      <StoreQualitySummary stores={store} />
      <ReusableTable
        data={store}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDeleteSingle={handleDeleteSingle}
        onBulkDelete={handleBulkDelete}
        onStatusChange={handleStatusChanged}
        confirmDeletes
      />
    </div>
  );
}

export default GetStore;
