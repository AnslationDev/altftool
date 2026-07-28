"use client";

import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../(resuableComponent)/ReusableTable";
import { firebaseBuySmartRuleSetSource } from "@/projects/altftool/modules/buysmart/services/firebaseBuySmartRuleSet";

function GetRuleSet({ setActive, setEditRule }) {
  const [ruleData, setRuleData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteSingle = async (id) => {
    await firebaseBuySmartRuleSetSource.remove(id, ruleData);
    return true;
  };

  const columns = useMemo(
    () => [
      {
        header: "Id",
        Cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "title",
        header: "Title",
        Cell: ({ cell }) => (
          <div className="max-w-[240px] truncate font-medium text-[var(--primary)]">
            {cell.getValue()}
          </div>
        ),
      },
      {
        accessorKey: "idleTime",
        header: "Idle Time",
        Cell: ({ cell }) => `${cell.getValue()}s`,
      },
      {
        accessorKey: "active",
        header: "Status",
        Cell: ({ cell }) => (
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              cell.getValue()
                ? "bg-[var(--success-soft)] text-[var(--success-text)]"
                : "bg-[var(--danger-soft)] text-[var(--danger-text)]"
            }`}
          >
            {cell.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        header: "Action",
        type: "action",
      },
    ],
    []
  );

  return (
    <ReusableTable
      data={ruleData}
      columns={columns}
      loading={loading}
      onEdit={handleEdit}
      onDeleteSingle={handleDeleteSingle}
      confirmDeletes
      emptyMessage="No RuleSets Found"
    />
  );
}

export default GetRuleSet;
