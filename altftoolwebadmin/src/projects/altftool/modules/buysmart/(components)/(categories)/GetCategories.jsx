// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from "material-react-table";
// import { firebaseBuySmartCategoriesSource } from "@/services/firebaseBuySmartCategories";
// import { Trash2, Pencil, ExternalLink } from "lucide-react";

// function GetCategories({ setActive, setEditCategories }) {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleting, setDeleting] = useState(false);
//   const [selectedLetter, setSelectedLetter] = useState("All");
//   const [rowSelection, setRowSelection] = useState({});
//   const [updatingStatusId, setUpdatingStatusId] = useState(null);


//   const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");


//   useEffect(() => {
//     const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
//       setCategories(data || []);
//       setLoading(false);
//     });
//     return () => unsub && unsub();
//   }, []);


//   const filteredCategories = useMemo(() => {
//     if (selectedLetter === "All") return categories;
//     return categories.filter(
//       (c) => c.title?.charAt(0).toUpperCase() === selectedLetter
//     );
//   }, [categories, selectedLetter]);


//   const handleEdit = (item) => {
//     setActive(true);
//     setEditCategories(item);
//   };

//   const handleDeleteSingle = async (id) => {
//     if (!confirm("Are you sure you want to delete this category?")) return;
//     setDeleting(true);
//     await firebaseBuySmartCategoriesSource.remove(id);
//     setDeleting(false);
//   };

//   const handleBulkDelete = async () => {
//     const ids = Object.keys(rowSelection);
//     if (!ids.length) return;
//     if (!confirm(`Delete ${ids.length} selected categories?`)) return;

//     setDeleting(true);
//     await firebaseBuySmartCategoriesSource.bulkDelete(ids, categories);
//     setRowSelection({});
//     setDeleting(false);
//   };

//   const handleStatusChanged = async (item) => {
//     try {
//       setUpdatingStatusId(item.id);
//       const newStatus = item.status === "active" ? "paused" : "active";
//       await firebaseBuySmartCategoriesSource.update(item.id, {
//         status: newStatus,
//       });
//     } finally {
//       setUpdatingStatusId(null);
//     }
//   };


//   const columns = useMemo(
//     () => [
//       {
//         header: "Initial",
//         size: 100,
//         Cell: ({ row }) => (
//           <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-sm">
//             {row.original.title?.charAt(0).toUpperCase()}
//           </div>
//         ),
//       },
//       {
//         accessorKey: "title",
//         header: "Title",
//         size:100,
//         Cell: ({ cell }) => (
//           <div className=" truncate w-36 capitalize" >
//             {cell.getValue()}
//           </div>
//         ) 
//       },
//       {
//         accessorKey: "link",
//         header: "Link",
//         size:100,
//         Cell: ({ cell }) => (
//           <a
//             href={cell.getValue()}
//             target="_blank"
//             className="text-blue-600  w-20 flex items-center gap-1"
//           >
//             Visit <ExternalLink size={14} />
//           </a>
//         ),
//       },
//       {
//         accessorKey: "status",
//         header: "Status",
//         size:100,
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
//         size:100,
//         Cell: ({ cell }) => cell.getValue() || "-",
//       },
      
//       {
//               header: "Action",
//               Cell: ({ row }) => {
//                 const item = row.original;
      
//                 return (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleEdit(item)}
//                       className="p-2 bg-yellow-600 text-white rounded"
//                     >
//                       <Pencil size={14} />
//                     </button>
      
//                     <button
//                       onClick={() => handleDeleteSingle(item.id)}
//                       className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-600 hover:text-white"
//                     >
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 );
//               },
//             },
//     ],
//     [updatingStatusId]
//   );

//   const table = useMaterialReactTable({
//     columns,
//     data: filteredCategories,
//     state: {
//       isLoading: loading,
//       rowSelection,
      
//     },
  
   
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     getRowId: (row) => row.id,
//     enableColumnActions: true,
//     enableDensityToggle:false,
//     enableFullScreenToggle: true,
//     enableColumnOrdering: true,
//     enableGrouping: true,
  
//     renderTopToolbarCustomActions: () =>
//       Object.keys(rowSelection).length > 0 && (
//         <button
//           onClick={handleBulkDelete}
//           disabled={deleting}
//           className="px-4 py-2 bg-red-600 text-white rounded"
//         >
//           Delete Selected ({Object.keys(rowSelection).length})
//         </button>
//       ),
      
//   });

  




//   return (
//     <div className="space-y-6">
      
//       <div className="bg-white border rounded-xl p-4">
//         <div className="flex flex-wrap gap-2 justify-center">
//           <button
//             onClick={() => setSelectedLetter("All")}
//             className={`px-4 py-1.5 rounded ${
//               selectedLetter === "All"
//                 ? "bg-black text-white"
//                 : "bg-gray-100"
//             }`}
//           >
//             All
//           </button>

//           {alphabet.map((letter) => (
//             <button
//               key={letter}
//               onClick={() => setSelectedLetter(letter)}
//               className={`w-9 h-9 rounded ${
//                 selectedLetter === letter
//                   ? "bg-black text-white"
//                   : "bg-gray-100"
//               }`}
//             >
//               {letter}
//             </button>
//           ))}
//         </div>
//       </div>
//       <MaterialReactTable table={table} />
//     </div>
//   );
// }

// export default GetCategories;


"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable, { SafeTableImage } from "../(resuableComponent)/ReusableTable";
import { firebaseBuySmartCategoriesSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartCategories";
import { AlertTriangle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import {
  getBuySmartQualitySummary,
  isExternalMerchantUrl,
  summarizeBuySmartQuality,
} from "@altftool/core/buysmart";

const verificationStyles = {
  draft: "bg-slate-100 text-slate-700",
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-green-50 text-green-700",
  expired: "bg-red-50 text-red-700",
  rejected: "bg-gray-100 text-gray-600",
};

function formatVerificationStatus(status) {
  if (!status) return "Pending";
  return status.replace(/-/g, " ");
}

function QualityBadge({ item, items }) {
  const quality = getBuySmartQualitySummary(item, items);
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
      {quality.issues.length ? (
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
          {quality.issues.slice(0, 2).map((issue) => issue.label).join(", ")}
        </p>
      ) : (
        <p className="mt-1 text-xs text-gray-500">Ready to publish</p>
      )}
    </div>
  );
}

function QualitySummaryStrip({ summary }) {
  const cards = [
    { label: "Ready", value: summary.ready, className: "border-green-200 bg-green-50 text-green-700" },
    { label: "Review", value: summary.review, className: "border-amber-200 bg-amber-50 text-amber-700" },
    { label: "Fix first", value: summary.fix, className: "border-red-200 bg-red-50 text-red-700" },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-[1.2fr_repeat(3,0.6fr)]">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
          Data quality
        </p>
        <h2 className="mt-1 text-lg font-semibold text-gray-950">
          {summary.total} BuySmart offer rows audited
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Missing links, expiry, verification, duplicates, and success signals are checked before publishing.
        </p>
      </div>
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 shadow-sm ${card.className}`}>
          <p className="text-xs font-bold uppercase tracking-wide">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function GetCategories({ setActive, setEditCategories }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [quickActionId, setQuickActionId] = useState("");

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  useEffect(() => {
    const unsub = firebaseBuySmartCategoriesSource.subscribe((data) => {
      setCategories(data || []);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, []);

  const filteredCategories = useMemo(() => {
    if (selectedLetter === "All") return categories;
    return categories.filter(
      (c) => c.title?.charAt(0).toUpperCase() === selectedLetter
    );
  }, [categories, selectedLetter]);

  const qualitySummary = useMemo(
    () => summarizeBuySmartQuality(categories),
    [categories],
  );

  const handleEdit = (item) => {
    setActive(true);
    setEditCategories(item);
  };

  const handleDeleteSingle = async (id) => {
    await firebaseBuySmartCategoriesSource.remove(id);
    return true;
  };

  const handleBulkDelete = async (ids) => {
    if (!ids.length) return false;
    await firebaseBuySmartCategoriesSource.bulkDelete(ids, categories);
    return true;
  };

  const handleStatusChanged = async (item) => {
    const newStatus = item.status === "active" ? "paused" : "active";
    await firebaseBuySmartCategoriesSource.update(item.id, {
      status: newStatus,
    });
  };

  const handleQuickVerify = async (item) => {
    setQuickActionId(item.id);

    try {
      await firebaseBuySmartCategoriesSource.update(item.id, {
        lastVerifiedAt: new Date().toISOString(),
        reviewNote: item.reviewNote || "Marked verified from BuySmart quality review.",
        successRate: Number(item.successRate) || 100,
        verificationStatus: "verified",
        verified: true,
      });
    } finally {
      setQuickActionId("");
    }
  };

  const columns = useMemo(
    () => [
      {
        header: "Initial",
        Cell: ({ row }) => (
          row.original.img || row.original.image ? (
            <SafeTableImage
              src={row.original.img || row.original.image}
              alt={row.original.title || "Brand"}
              className="h-9 w-9 rounded-full border border-gray-200 object-cover"
              fallbackClassName="h-9 w-9 rounded-full border border-dashed border-gray-300 bg-gray-50"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center text-sm">
              {row.original.title?.charAt(0).toUpperCase()}
            </div>
          )
        ),
      },
      {
        accessorKey: "title",
        header: "Title",
        Cell: ({ cell }) => (
          <div className="truncate w-36 capitalize">
            {cell.getValue()}
          </div>
        ),
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
        Cell: ({ row }) => <QualityBadge item={row.original} items={categories} />,
      },
      {
        accessorKey: "category",
        header: "Category",
        Cell: ({ cell }) => (
          <div className="truncate w-36 capitalize">
            {cell.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "offerType",
        header: "Type",
        Cell: ({ cell }) => (
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold capitalize text-gray-700">
            {cell.getValue() || "deal"}
          </span>
        ),
      },
      {
        header: "Saving",
        Cell: ({ row }) => (
          <div className="w-44 truncate text-sm">
            {row.original.discount ||
              row.original.cashback ||
              row.original.points ||
              row.original.code ||
              "-"}
          </div>
        ),
      },
      {
        accessorKey: "verified",
        header: "Verified",
        Cell: ({ cell }) => (
          <span
            className={`rounded px-2 py-1 text-xs font-semibold ${
              cell.getValue()
                ? "bg-green-50 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {cell.getValue() ? "Yes" : "No"}
          </span>
        ),
      },
      {
        accessorKey: "verificationStatus",
        header: "QA Status",
        Cell: ({ cell }) => {
          const value = cell.getValue() || "pending";
          return (
            <span
              className={`rounded px-2 py-1 text-xs font-semibold capitalize ${
                verificationStyles[value] || verificationStyles.pending
              }`}
            >
              {formatVerificationStatus(value)}
            </span>
          );
        },
      },
      {
        accessorKey: "successRate",
        header: "Success",
        Cell: ({ cell }) => (
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(Number(cell.getValue()) || 0)}%
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        type: "status", 
      },
      {
        header: "QA action",
        Cell: ({ row }) => {
          const item = row.original;
          const verified = item.verificationStatus === "verified" || item.verified;

          return (
            <button
              type="button"
              disabled={verified || quickActionId === item.id}
              onClick={() => handleQuickVerify(item)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 transition hover:border-green-300 hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {quickActionId === item.id ? "Saving..." : verified ? "Verified" : "Verify"}
            </button>
          );
        },
      },
      {
        accessorKey: "country",
        header: "Country",
        Cell: ({ cell }) => cell.getValue() || "-",
      },
      {
        header: "Action",
        type: "action", 
      },
    ],
    [categories, quickActionId]
  );

  return (
    <div className="space-y-6">
      <QualitySummaryStrip summary={qualitySummary} />

      {/* Alphabet Filter */}
      <div className="bg-white border rounded-xl p-4">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedLetter("All")}
            className={`px-4 py-1.5 rounded ${
              selectedLetter === "All"
                ? "bg-black text-white"
                : "bg-gray-100"
            }`}
          >
            All
          </button>

          {alphabet.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
              className={`w-9 h-9 rounded ${
                selectedLetter === letter
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <ReusableTable
        data={filteredCategories}
        columns={columns}
        loading={loading}
        onEdit={handleEdit}
        onDeleteSingle={handleDeleteSingle}
        onBulkDelete={handleBulkDelete}
        onStatusChange={handleStatusChanged}
        confirmDeletes
        emptyMessage={
          selectedLetter === "All"
            ? "No categories available"
            : `No categories found for "${selectedLetter}"`
        } 
      />
    </div>
  );
}

export default GetCategories;
