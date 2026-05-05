"use client";

import { useEffect, useState } from "react";
import { subscribeAlert } from "@/lib/alertBus";

const VARIANTS = {
  success: "bg-green-600 text-white",
  error: "bg-red-600 text-white",
  warning: "bg-yellow-500 text-black",
};

export default function GlobalAlertHost() {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const unsub = subscribeAlert((data) => {
      setAlert(data);
      setTimeout(() => setAlert(null), 4000);
    });

    return unsub;
  }, []);

  if (!alert) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999]">
      <div
        className={`px-4 py-3 rounded-lg shadow-lg flex justify-between gap-4 min-w-[280px] ${VARIANTS[alert.type]}`}
      >
        <span className="text-sm font-medium">{alert.message}</span>
        <button onClick={() => setAlert(null)}>×</button>
      </div>
    </div>
  );
}