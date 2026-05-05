import React from "react";

export default function Button({ children, onClick, className }) {
  return (
    <button
      className={`bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-80 ${className || ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}