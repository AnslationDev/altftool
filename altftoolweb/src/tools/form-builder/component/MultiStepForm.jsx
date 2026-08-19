"use client";

import React, { useState } from "react";
import { Button } from "@/shared/ui/Button";
import FieldControl from "./FieldControl";

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
    fields.map((field) => {
      const fieldId = `msf-${field.id}`;
      const errorId = `${fieldId}-error`;
      const hasError = !!errors[field.id];
      return (
        <div key={field.id}>
          <label htmlFor={fieldId} className="block mb-2">
            {field.label}
            {field.required && (
              <span className="text-red-600 ml-1" aria-hidden="true">
                *
              </span>
            )}
          </label>

          <FieldControl
            field={field}
            id={fieldId}
            value={previewData[field.id]}
            onChange={(val) => handlePreviewChange(field.id, val)}
            theme={theme}
            uploadedFile={uploadedFiles[field.id]}
            onFileChange={(file) => {
              setUploadedFiles((prev) => ({
                ...prev,
                [field.id]: file,
              }));
              handlePreviewChange(field.id, file.name);
            }}
            ariaDescribedBy={hasError ? errorId : undefined}
            ariaInvalid={hasError}
          />

          {hasError && (
            <p id={errorId} role="alert" className="text-red-600 text-sm mt-1">
              {errors[field.id]}
            </p>
          )}
        </div>
      );
    });

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
              {Array.isArray(previewData[field.id])
                ? previewData[field.id].join(", ") || "-"
                : previewData[field.id] || "-"}
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
