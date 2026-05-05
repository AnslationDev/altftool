import React from "react";

const ValidationBuilder = ({ field, updateField }) => {
  return (
    <div className="w-full mt-3 p-3 border border-(--border) rounded-md bg-(--card) flex flex-col gap-3">
      {/* Required */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={field.required || false}
          onChange={(e) => updateField(field.id, "required", e.target.checked)}
        />
        <label className="text-sm">Required</label>
      </div>

      {/* Min / Max Length */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="number"
          placeholder="Min Length"
          value={field.minLength ?? ""}
          onChange={(e) =>
            updateField(
              field.id,
              "minLength",
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          className="w-full px-3 py-2 border border-(--border) rounded-md"
        />
        <input
          type="number"
          placeholder="Max Length"
          value={field.maxLength ?? ""}
          onChange={(e) =>
            updateField(
              field.id,
              "maxLength",
              e.target.value === "" ? "" : Number(e.target.value),
            )
          }
          className="w-full px-3 py-2 border border-(--border) rounded-md"
        />
      </div>

      {/* Pattern Label */}
      <label className="text-sm font-medium">Custom Format (Advanced)</label>

      {/* Helper Text */}
      <p className="text-xs text-(--muted-foreground) mb-1">
        Example: Only letters → ^[A-Za-z]+$
      </p>

      {/* Pattern */}
      <input
        type="text"
        placeholder="Regex Pattern (e.g. ^[A-Za-z]+$)"
        value={field.pattern ?? ""}
        onChange={(e) => updateField(field.id, "pattern", e.target.value || "")}
        className="w-full px-3 py-2 border border-(--border) rounded-md"
      />
    </div>
  );
};

export default ValidationBuilder;
