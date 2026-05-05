import React from "react";

export default function Button({ text, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full
        py-2.5
        font-semibold
        bg-(--primary)
        text-(--primary-foreground)
        hover:opacity-90
        active:scale-[0.98]
        transition-all
      "
    >
      {text}
    </button>
  );
}
