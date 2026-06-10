"use client";

import React, { useEffect, useState } from "react";
import { firebaseBuySmartRuleSetSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartRuleSet";
import { AlertTriangle, Loader2, Trash2, Pencil } from "lucide-react";

function GetRuleSet({ setActive, setEditRule }) {
  const [ruleData, setRuleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const unsub = firebaseBuySmartRuleSetSource.subscribe((data) => {
      setRuleData(data || []);
      setLoading(false);
    });

    return () => unsub && unsub();
  }, []);

  const handleEdit = (rule) => {
    setEditRule(rule);
    setActive(true);
  };

  const requestDelete = (rule) => {
    setDeleteError("");
    setDeleteTarget(rule);
  };

  const cancelDelete = () => {
    if (deletingId) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleteError("");
    setDeletingId(deleteTarget.id);
    try {
      await firebaseBuySmartRuleSetSource.remove(deleteTarget.id, ruleData);
      setDeleteTarget(null);
    } catch (error) {
      console.error("RuleSet delete failed", error);
      setDeleteError(error?.message || "RuleSet delete failed. Please retry after checking Firebase access.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Loading RuleSets...
      </div>
    );
  }

  if (!ruleData.length) {
    return (
      <div className="py-12 text-center border border-dashed rounded-lg">
        <p className="font-semibold text-lg">No RuleSets Found</p>
        <p className="text-sm text-gray-500 mt-1">
          Click “Add RuleSet +” to create one
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b bg-gray-100">
            <tr className="text-left">
              <th className="px-4 py-3">Id</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 text-center">Idle Time</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {ruleData.map((rule, index) => (
              <tr
                key={rule.id}
                className="border-b transition hover:bg-gray-50"
              >
                <td className="px-4 py-3 font-medium">
                  {index + 1}
                </td>

                <td className="max-w-[240px] truncate px-4 py-3 text-blue-600">
                  {rule.title}
                </td>

                <td className="px-4 py-3 text-center">
                  {rule.idleTime}s
                </td>

                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      rule.active
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {rule.active ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      title="Edit RuleSet"
                      onClick={() => handleEdit(rule)}
                      disabled={Boolean(deletingId)}
                      className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      title="Delete RuleSet"
                      onClick={() => requestDelete(rule)}
                      disabled={deletingId === rule.id}
                      className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === rule.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Delete RuleSet?</h2>
                <p className="mt-1 text-sm leading-6 text-gray-600">
                  This will permanently delete {deleteTarget.title || "this RuleSet"}. This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError ? (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                {deleteError}
              </div>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={Boolean(deletingId)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                {deletingId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default GetRuleSet;
