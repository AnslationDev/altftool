"use client";

import { createContext, useContext, useState, useCallback } from "react";
import  AlertItem  from "./AlertItem";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const showAlert = useCallback((text, variant = "success", duration = 3000) => {
    const id = Date.now();

    const newAlert = { id, text, variant };
    setAlerts((prev) => [...prev, newAlert]);

    if (duration) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      {/* Alert Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} {...alert} onClose={removeAlert} />
        ))}
      </div>
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);