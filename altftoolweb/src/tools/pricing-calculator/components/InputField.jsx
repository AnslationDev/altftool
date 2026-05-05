import React from "react";

export default function InputField({ label, value, setValue }) {
  return (
    <div className="mb-4">

      {/* Label */}
      <label className="block text-(--foreground) font-medium mb-2">
        {label}
      </label>

      {/* Input */}
      <input
        type="number"
        value={value === 0 ? "" : value}
        placeholder="Enter value"
        onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
        className="
          w-full px-4 py-2 rounded-lg
          bg-(--background)
          text-(--foreground)
          border border-(--border)
          placeholder:text-(--muted-foreground)
          focus:outline-none
          focus:ring-2 focus:ring-(--primary)
          focus:border-(--primary)
          transition-all
        "
      />
    </div>
  );
}
