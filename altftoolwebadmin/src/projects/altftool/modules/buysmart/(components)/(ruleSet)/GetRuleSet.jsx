"use client";

import React, { useEffect, useState } from "react";
import { firebaseBuySmartRuleSetSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartRuleSet";
import { Trash2, Pencil } from "lucide-react";

function GetRuleSet({ setActive, setEditRule }) {
  const [ruleData, setRuleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (id) => {
    const ok = confirm("Are you sure you want to delete this RuleSet?");
    if (!ok) return;

    setDeletingId(id);
    await firebaseBuySmartRuleSetSource.remove(id, ruleData);
    setDeletingId(null);
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
    <div className="overflow-x-auto border rounded-lg bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr className="text-left">
            <th className="px-4 py-3">Id</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 text-center">Idle Time</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {ruleData.map((rule , index) => (
            <tr
              key={rule.id}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="px-4 py-3 font-medium">
                {index + 1}
              </td>

              <td className="px-4 py-3 text-blue-600 truncate max-w-[240px]">
                {rule.title}
              </td>

              <td className="px-4 py-3 text-center">
                {rule.idleTime}s
              </td>

              <td className="px-4 py-3 text-center">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
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
                    onClick={() => handleEdit(rule)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(rule.id)}
                    disabled={deletingId === rule.id}
                    className="text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    {deletingId === rule.id ? "..." : <Trash2 size={16} />}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GetRuleSet;