import React from "react";

const SmartSuggestions = ({ field, addField, updateField, formFields, setFormFields }) => {
  // Only for Email field
  if (field.type !== "email" || field.isConfirmEmail ) return null;


  return (
    <div className="mt-3 p-3  rounded-md bg-(--card)">
      

      <div className="flex flex-wrap gap-2">
       {/* Add Confirm Email */}
       <button
          type="button"
          onClick={() => {
            const confirmField = {
              id: `${Date.now()}-${Math.random()}`,
              type: "email",
              label: "Confirm Email",
              placeholder: "Confirm your email...",
              required: true,
              options: [],
              minLength: "",
              maxLength: "",
              pattern: "",
              isConfirmEmail: true,
              linkedFieldId: field.id,
            };

  setFormFields((prev) => {
  const alreadyExists = prev.some(
    (f) => f.isConfirmEmail && f.linkedFieldId === field.id
  );

  if (alreadyExists) return prev; 

  return [...prev, confirmField]; 
});
}}
          className="text-xs px-3 py-1 border border-(--border) rounded-md hover:bg-(--muted)"
            
        >
          + Add Confirm Email
        </button>
      </div>
    </div>
  );
};

export default SmartSuggestions;