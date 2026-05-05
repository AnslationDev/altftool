"use client";

import { useState, useEffect } from "react";
import TopBar from "./components/TopBar";
import DynamicConfigModal from "./components/DynamicConfigModal";
import DataTable from "./components/DataTable";
import DataModal from "./components/DataModal";
import { fetchDynamicRoute } from "./service/dynamic.service";
import { fetchData } from "./service/data.service";

export default function Page() {
  // ── Original: dynamic config modal ──
  const [openConfig, setOpenConfig] = useState(false);
  const [configData, setConfigData] = useState(null);

  const loadConfig = async () => {
    const res = await fetchDynamicRoute();
    setConfigData(res);
  };

  // ── New: data items table + modal ──
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // null = closed | true = create mode | object = edit mode
  const [dataModalTarget, setDataModalTarget] = useState(null);

  const loadItems = async () => {
    try {
      const res = await fetchData();
      setItems(res);
    } catch (err) {
      console.error("Failed to fetch data items:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadConfig();
    loadItems();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-7 space-y-5">

        <TopBar
          onCreate={() => setOpenConfig(true)}
          onAddData={() => setDataModalTarget(true)}
        />

        {/* Original: dynamic config modal */}
        {openConfig && (
          <DynamicConfigModal
            data={configData}
            onClose={() => setOpenConfig(false)}
            refresh={loadConfig}
          />
        )}

        {/* New: data items table */}
        {loadingItems ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm">
            Loading…
          </div>
        ) : (
          <DataTable
            items={items}
            onEdit={(item) => setDataModalTarget(item)}
            refresh={loadItems}
          />
        )}

        {/* New: data create/edit modal */}
        {dataModalTarget !== null && (
          <DataModal
            data={dataModalTarget === true ? undefined : dataModalTarget}
            existingItems={items}
            onClose={() => setDataModalTarget(null)}
            refresh={loadItems}
          />
        )}

      </div>
    </div>
  );
}