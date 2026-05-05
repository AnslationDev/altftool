import React, { useMemo } from "react";

const FormScore = ({ formFields }) => {
  const score = useMemo(() => {
    if (!formFields || formFields.length === 0) return 0;

    let total = 100;
    let current = 0;

    //  Required Fields (30 points)
    const requiredFields = formFields.filter((f) => f.required).length;
    current += (requiredFields / formFields.length) * 30;

    //  Validation (40 points)
    const validatedFields = formFields.filter(
      (f) =>
        f.required ||
        f.minLength ||
        f.maxLength ||
        f.pattern ||
        f.type === "email" ||
        f.type === "url"
    ).length;
    current += (validatedFields / formFields.length) * 40;

    //  UX (30 points)
    const uxFields = formFields.filter(
      (f) => f.label && f.placeholder
    ).length;
    current += (uxFields / formFields.length) * 30;

    return Math.round(current);
  }, [formFields]);

  return (
    <div className="text-center mt-2">
      <p className="text-sm font-medium">
       Form Quality:{" "}
        <span className="font-bold">{score}%</span>
      </p>
    </div>
  );
};

export default FormScore;