import React from "react";

const DragDropBuilder = ({ fieldTypes, onDropField, addField, conditions, addCondition, fields }) => {
  const handleDragStart = (e, type) => {
    e.dataTransfer.setData("fieldType", type);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const fieldType = e.dataTransfer.getData("fieldType");

    if (fieldType) {
      onDropField(fieldType);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="min-h-[120px]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {fieldTypes.map(({ type, label }) => {

          
          // Conditional Logic: Check visibility
          
          const isVisible = conditions
            ? conditions
                .filter((c) => c.showFieldId === type)
                .every((c) => {
                  const targetField = fields.find((f) => f.id === c.ifFieldId);
                  return targetField ? targetField.value === c.ifValue : true;
                })
            : true;

          if (!isVisible) return null; // Skip rendering if condition not met

          return (
            <div
              key={type}
              draggable
              onDragStart={(e) => handleDragStart(e, type)}
              onClick={() => addField(type)}
              className="relative text-sm p-2 border border-(--border) rounded-md cursor-grab active:cursor-grabbing text-(--foreground) bg-(--card) hover:border-(--primary) transition-all duration-200 flex flex-col"
            >
              {/* Field Label */}
              <span className="mb-2">{label}</span>

              {/* Add Condition Button */}
              {addCondition && conditions && (
                <div className="flex justify-between items-center mt-auto">
                  <button
                    type="button"
                    className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering addField click
                      addCondition(type);
                    }}
                  >
                    Add Condition
                  </button>
                </div>
              )}

              {/* Display Existing Conditions for this field */}
              {conditions
                .filter((c) => c.showFieldId === type)
                .length > 0 && (
                <div className="mt-2 p-2 bg-(--muted) rounded-md text-sm text-(--muted-foreground)">
                  {conditions
                    .filter((c) => c.showFieldId === type)
                    .map((c) => (
                      <div key={c.id}>
                        IF [{c.ifFieldLabel || "Select Field"}] = {c.ifValue || "Select Value"} → SHOW [{label}]
                      </div>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DragDropBuilder;