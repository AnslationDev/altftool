"use client";

import React, { useMemo, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { ExternalLink, Pencil, Trash2, X } from "lucide-react";


function ReusableTable({
  data = [],
  columns = [],
  loading = false,
  onEdit,
  onDeleteSingle,
  onBulkDelete,
  onStatusChange,
  enableRowSelection = true,
  emptyMessage = "No data available",
  getRowId = (row) => row.id,
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  
 


  function openPreviewModal(rowData) {
    setSelectedRow(rowData);
    setPreviewModal(true);

  }


  function closePreviewModal() {
    setPreviewModal(false);
    setSelectedRow(null);
  }




  const enhancedColumns = useMemo(() => {
    return columns.map((col) => {
      if (col.type === "status") {
        return {
          ...col,
          Cell: ({ row }) => {
            const item = row.original;

            return (
              <button
                disabled={updatingStatusId === item.id}
                onClick={async () => {
                  setUpdatingStatusId(item.id);
                  await onStatusChange(item);
                  setUpdatingStatusId(null);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${item.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {updatingStatusId === item.id
                  ? "Updating..."
                  : item.status === "active"
                    ? "Active"
                    : "Paused"}
              </button>
            );
          },
        };
      }

      if (col.type === "action") {
        return {
          ...col,
          Cell: ({ row }) => {
            const item = row.original;
            const [toolTip, setToolTip] = useState("");
      
            return (
              <div className="flex gap-2 justify-center">
                {/* View */}
                <button
                  type="button"
                  onClick={() => openPreviewModal(item)}
                  onMouseEnter={() => setToolTip(`view-${item.id}`)}
                  onMouseLeave={() => setToolTip("")}
                  className="relative p-1.5 cursor-pointer rounded-md text-blue-600 hover:bg-blue-50 transition"
                  style={{ overflow: "visible" }}
                >
                  <ExternalLink size={16} />
                  {toolTip === `view-${item.id}` && (
                    <span
                      style={{ zIndex: 9999 }}
                      className="pointer-events-none text-white rounded-sm px-2 py-1 bg-black absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap "
                    >
                      View
                      <span  />
                    </span>
                  )}
                </button>
      
                {/* Edit */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(item)}
                    onMouseEnter={() => setToolTip(`edit-${item.id}`)}
                    onMouseLeave={() => setToolTip("")}
                    className="relative p-1.5 cursor-pointer rounded-md text-amber-500 hover:bg-amber-50 transition"
                    style={{ overflow: "visible" }}
                  >
                    <Pencil size={16} />
                    {toolTip === `edit-${item.id}` && (
                      <span
                        style={{ zIndex: 9999 }}
                        className="pointer-events-none text-white rounded-sm px-2 py-1 bg-black absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap "
                      >
                        Edit
                        <span  />
                      </span>
                    )}
                  </button>
                )}
      
                {/* Delete */}
                {onDeleteSingle && (
                  <button
                    type="button"
                    onClick={() => onDeleteSingle(item.id)}
                    onMouseEnter={() => setToolTip(`delete-${item.id}`)}
                    onMouseLeave={() => setToolTip("")}
                    className="relative p-1.5 cursor-pointer rounded-md text-red-500 hover:bg-red-50 transition"
                    style={{ overflow: "visible" }}
                  >
                    <Trash2 size={16} />
                    {toolTip === `delete-${item.id}` && (
                      <span
                        style={{ zIndex: 9999 }}
                        className="pointer-events-none text-white rounded-sm px-2 py-1 bg-black  absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap "
                      >
                        Delete 
                        <span/>
                      </span>
                    )}
                  </button>
                )}
              </div>
            );
          },
        };
      }

      return col;
    });
  }, [columns, updatingStatusId, onEdit, onDeleteSingle, onStatusChange]);

  const table = useMaterialReactTable({
    columns: enhancedColumns,
    data,
    state: {
      isLoading: loading,
      rowSelection,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    getRowId,
    enableColumnActions: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableDensityToggle: false,
    enableFullScreenToggle: true,
    renderTopToolbarCustomActions: () =>
      Object.keys(rowSelection).length > 0 &&
      onBulkDelete && (
        <button
          onClick={() => onBulkDelete(Object.keys(rowSelection))}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete Selected ({Object.keys(rowSelection).length})
        </button>
      ),
  });

  if (!loading && data.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <p className="text-lg font-semibold">{emptyMessage}</p>
      </div>
    );
  }
 

  return (
    <div>
      <MaterialReactTable table={table} />


      {previewModal && selectedRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={closePreviewModal}
              className="absolute cursor-pointer right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-md transition hover:bg-gray-100 hover:text-black"
            >
              <X size={18} />
            </button>

            <div className="border-b border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">
              <h2 className="text-2xl font-bold text-gray-800">Preview Details</h2>
              <p className="mt-1 text-sm text-gray-500">
                View complete information for this row
              </p>
            </div>

            <div className="max-h-[85vh] overflow-y-auto px-6 py-6">
              <div className="gap-6 ">
                <div className="space-y-5">
                  {(selectedRow.image || selectedRow.img) && (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                      <img
                        src={selectedRow.image || selectedRow.img}
                        alt={selectedRow.title || "Preview"}
                        className="h-72 w-full object-contain "
                      />

                    </div>
                  )}

                  <div className="flex flex-col gap-5">
                    {selectedRow.category && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">Category</p>
                        <p className="text-base font-semibold text-gray-800">
                          {selectedRow.category}
                        </p>
                      </div>
                    )}

                    {selectedRow.title && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base font-semibold text-gray-800">
                          {selectedRow.title}
                        </p>
                      </div>
                    )}

                    {selectedRow.link && (
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">Link</p>
                        <a
                          href={selectedRow.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
                        >
                          {selectedRow.link}
                        </a>
                      </div>
                    )}

                    {(selectedRow.offerType || selectedRow.discount || selectedRow.cashback || selectedRow.points || selectedRow.code) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Offer Type</p>
                          <p className="text-base font-semibold capitalize text-gray-800">
                            {selectedRow.offerType || "deal"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Saving</p>
                          <p className="text-base font-semibold text-gray-800">
                            {selectedRow.discount ||
                              selectedRow.cashback ||
                              selectedRow.points ||
                              selectedRow.code ||
                              "-"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(selectedRow.verificationStatus || selectedRow.successRate !== undefined) && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Verification</p>
                          <p className="text-base font-semibold capitalize text-gray-800">
                            {selectedRow.verificationStatus || "pending"}
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Success Rate</p>
                          <p className="text-base font-semibold text-gray-800">
                            {Math.round(Number(selectedRow.successRate) || 0)}%
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Votes</p>
                          <p className="text-base font-semibold text-gray-800">
                            {Number(selectedRow.workingVotes) || 0} working / {Number(selectedRow.failedVotes) || 0} failed
                          </p>
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <p className="mb-1 text-sm font-medium text-gray-500">Last Verified</p>
                          <p className="text-base font-semibold text-gray-800">
                            {selectedRow.lastVerifiedAt || "-"}
                          </p>
                        </div>
                        {selectedRow.reviewNote ? (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
                            <p className="mb-1 text-sm font-medium text-gray-500">Review Note</p>
                            <p className="text-base font-semibold text-gray-800">
                              {selectedRow.reviewNote}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <p className="mb-1 text-sm font-medium text-gray-500">Country</p>
                      <p className="text-base font-semibold text-gray-800">
                        {selectedRow.country || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="my-5" >
                  {selectedRow?.BrandDetail?.length > 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Brand Details</h3>
                       
                      </div>

                      <div className="space-y-4">
                        {selectedRow.BrandDetail.map((item, index) => (
                          <div   key={index}  >
                             <div
                          
                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                          >
                            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                              <img
                                src={item.image || selectedRow.img}
                                alt={item.title || "Preview"}
                                className="h-72 w-full object-contain "
                              />

                            </div>
                          </div>
                          <div className="rounded-xl my-5 border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">Title</p>
                        <p className="text-base font-semibold text-gray-800">
                          {item.title}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="mb-1 text-sm font-medium text-gray-500">Link</p>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-sm font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
                        >
                          {item.link}
                        </a>
                      </div>
                      
                          </div>
                         

                        ))}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ReusableTable;
