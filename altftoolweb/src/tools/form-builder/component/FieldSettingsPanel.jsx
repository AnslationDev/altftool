import React from "react";
import ValidationBuilder from "./ValidationBuilder";
import SmartSuggestions from "./SmartSuggestions";

const FieldSettingsPanel = ({ field, updateField, formFields, setFormFields, }) => {
  if (!field) return null;

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
