import React from "react";
import { Trash2 } from "lucide-react";
import ValidationBuilder from "./ValidationBuilder";
import SmartSuggestions from "./SmartSuggestions";

const OPTION_FIELD_TYPES = ["select", "radio", "checkbox"];

const FieldSettingsPanel = ({
  field,
  updateField,
  formFields,
  setFormFields,
  updateOptions,
  addOption,
  removeOption,
}) => {
  if (!field) return null;

  const hasOptions = OPTION_FIELD_TYPES.includes(field.type);

  return (
    <div className="bg-(--card) p-4 sm:p-6 border border-(--border) rounded-xl">
      {/* Header */}
      <h2 className="text-xl font-semibold mb-4">⚙️ Field Settings</h2>

      {/* Field Name */}
      <p className="text-sm text-(--muted-foreground) mb-4">
        Editing: {field.label}
      </p>

      {/* Validation Section */}
      <ValidationBuilder field={field} updateField={updateField} />

      {/* Options Editor (Dropdown / Radio / Checkbox) */}
      {hasOptions && updateOptions && addOption && removeOption && (
        <div className="mt-6 border-t border-(--border) pt-4">
          <h3 className="text-sm font-semibold mb-3">Options</h3>
          <div className="flex flex-col gap-2">
            {(field.options || []).map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOptions(field.id, idx, e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  aria-label={`Option ${idx + 1}`}
                  className="flex-1 px-3 py-2 border border-(--border) rounded-md bg-(--card) text-(--foreground)"
                />
                <button
                  type="button"
                  onClick={() => removeOption(field.id, idx)}
                  disabled={(field.options || []).length <= 1}
                  aria-label={`Remove option ${idx + 1}`}
                  className="p-2 border border-(--border) rounded-md text-(--danger-text) hover:bg-(--danger-soft) disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addOption(field.id)}
            className="mt-3 text-xs px-3 py-1 border border-(--border) rounded-md hover:bg-(--muted)"
          >
            + Add Option
          </button>
        </div>
      )}

      {field.type === "email" && !field.isConfirmEmail && (
      <div className="mt-6 border-t border-(--border) pt-4">
        <h3 className="text-sm font-semibold mb-3">💡 Smart Suggestions</h3>

        <SmartSuggestions
          field={field}
          updateField={updateField}
          formFields={formFields}
          setFormFields={setFormFields}
        />
      </div>
      )}
    
    </div>
  );
};

export default FieldSettingsPanel;
