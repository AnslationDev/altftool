import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";

const TestMode = ({
  formFields,
  handlePreviewChange,
  errors,
  theme,
}) => {
  const [testData, setTestData] = useState({});
  const [tips, setTips] = useState([]);

  const handleChange = (field, value) => {
    setTestData((prev) => ({ ...prev, [field.id]: value }));
    handlePreviewChange(field.id, value);
  };

  const generateTips = () => {
    let suggestions = [];

    formFields.forEach((field) => {
      if (!field.required) {
        suggestions.push(`💡 "${field.label}" ko required banao`);
      }

      if (
        field.type === "text" &&
        !field.minLength &&
        !field.maxLength
      ) {
        suggestions.push(
          `💡 "${field.label}" me length validation add karo`
        );
      }

      if (field.type === "email" && !field.required) {
        suggestions.push(
          `💡 "${field.label}" ko required + validate karo`
        );
      }

      if (!field.placeholder) {
        suggestions.push(
          `💡 "${field.label}" me placeholder add karo`
        );
      }
    });

    setTips(suggestions);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h2 className="subheading mb-4"> Test Mode</h2>

      <form className="space-y-6">
        {formFields.map((field) => (
          <div key={field.id}>
            <label className="block mb-2">
              {field.label}
              {field.required && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </label>

            {field.type === "textarea" ? (
              <textarea
                value={testData[field.id] || ""}
                onChange={(e) =>
                  handleChange(field, e.target.value)
                }
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-(--border) rounded-md"
                rows={3}
              />
            ) : (
              <input
                type={field.type}
                value={testData[field.id] || ""}
                onChange={(e) =>
                  handleChange(field, e.target.value)
                }
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-(--border) rounded-md"
                style={{
                  borderRadius: `${theme.borderRadius}px`,
                  fontFamily: theme.fontFamily,
                }}
              />
            )}

            {errors[field.id] && (
              <p className="text-red-600 text-sm mt-1">
                {errors[field.id]}
              </p>
            )}
          </div>
        ))}
      </form>

      {/* Generate Tips Button */}
      <div className="mt-6 flex gap-3">
        <Button onClick={generateTips}>
          Generate UX Tips
        </Button>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="mt-6 p-4 border border-(--border) rounded-md bg-(--muted)">
          <h3 className="font-semibold mb-2">💡 Suggestions</h3>
          {tips.map((tip, index) => (
            <p key={index} className="text-sm mb-1">
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestMode;