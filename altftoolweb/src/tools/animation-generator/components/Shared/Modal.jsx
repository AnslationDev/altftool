import React from "react";

export default function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-4 rounded shadow-md relative">
        <button className="absolute top-2 right-2 text-muted-foreground" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}