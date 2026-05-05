import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";
import FileUploadPreview from "./FileUploadPreview";

const MultiStepForm = ({
  formFields,
  previewData,
  handlePreviewChange,
  handlePreviewSubmit,
  errors,
  theme,
}) => {
  const [step, setStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const total = formFields.length;
  const stepSize = Math.ceil(total / 2);

  const step1Fields = formFields.slice(0, stepSize);
  const step2Fields = formFields.slice(stepSize);

  const renderFields = (fields) =>
    fields.map((field) => (
      <div key={field.id}>
        <label className="block mb-2">
          {field.label}
          {field.required && (
            <span className="text-red-600 ml-1">*</span>
          )}
        </label>
        
{field.type === "file" ? (
  <>
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setUploadedFiles((prev) => ({
            ...prev,
            [field.id]: file,
          }));
          handlePreviewChange(field.id, file.name);
        }
      }}
      className="w-full px-3 py-2 border border-(--border) rounded-md"
      style={{
        borderRadius: `${theme.borderRadius}px`,
        fontFamily: theme.fontFamily,
      }}
    />

    {uploadedFiles[field.id] && (
  <FileUploadPreview file={uploadedFiles[field.id]} />
)}
  </>
) : field.type === "textarea" ? (
  <textarea
    value={previewData[field.id] || ""}
    onChange={(e) =>
      handlePreviewChange(field.id, e.target.value)
    }
    placeholder={field.placeholder}
    className="w-full px-3 py-2 border border-(--border) rounded-md"
    rows={3}
  />
) : (
  <input
    type={field.type}
    value={previewData[field.id] || ""}
    onChange={(e) =>
      handlePreviewChange(field.id, e.target.value)
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
    ));

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="text-center font-semibold">
        Step {step} of 3
      </div>

      {/* Step Content */}
      {step === 1 && renderFields(step1Fields)}

      {step === 2 && renderFields(step2Fields)}

      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Review</h2>
          {formFields.map((field) => (
            <p key={field.id}>
              <strong>{field.label}:</strong>{" "}
              {previewData[field.id] || "-"}
            </p>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between">
        {step > 1 && (
          <Button type="button" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}

        {step < 3 ? (
          <Button type ="button" onClick={() => setStep(step + 1)}>
            Next
          </Button>
        ) : (
          <Button  type ="submit" onClick={handlePreviewSubmit}>
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;