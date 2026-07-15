import { useState, useCallback } from "react";
import { generateId } from "../utils/helpers";

const HISTORY_KEY = "altft-decision-history";

function load() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function save(data) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(data)); } catch {}
}

export function useHistory() {
  const [records, setRecords] = useState(load);

  const addRecord = useCallback((entry) => {
    const record = { id: generateId(), ...entry, timestamp: Date.now() };
    setRecords((prev) => {
      const next = [record, ...prev].slice(0, 200);
      save(next);
      return next;
    });
    return record;
  }, []);

  const clearHistory = useCallback(() => {
    setRecords([]);
    save([]);
  }, []);

  const removeRecord = useCallback((id) => {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      save(next);
      return next;
    });
  }, []);

  return { records, addRecord, clearHistory, removeRecord };
}
