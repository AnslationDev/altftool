"use client";

import React, { useState } from "react";
import { Field, Input, Select, Button, Card, Alert } from "@altftool/ui";

// Sample symptom options – in a real app this would be fetched or defined elsewhere
const SYMPTOM_OPTIONS = [
  { value: "cough", label: "Cough" },
  { value: "fever", label: "Fever" },
  { value: "headache", label: "Headache" },
  { value: "fatigue", label: "Fatigue" },
  { value: "chest_pain", label: "Chest Pain" },
  { value: "shortness_of_breath", label: "Shortness of Breath" },
];

export default function SymptomForm() {
  const [formData, setFormData] = useState({
    symptoms: [],
    age: "",
    gender: "",
    pregnancy: false,
    duration: "",
    severity: "",
  });
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((opt) => opt.value);
    setFormData((prev) => ({ ...prev, symptoms: selected }));
  };

  const validate = () => {
    if (!formData.symptoms.length) return "Please select at least one symptom.";
    if (!formData.age) return "Age is required.";
    if (!formData.gender) return "Gender is required.";
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    // Placeholder result – in a real implementation this would call an API.
    setResult({
      assessment: "Possible mild infection. Monitor symptoms and consult a doctor if they worsen.",
      urgent: formData.symptoms.includes("chest_pain") || formData.symptoms.includes("shortness_of_breath"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="alt-ui-form space-y-6">
      {error && <Alert tone="danger" title="Error">{error}</Alert>}
      {result && (
        <Card className="alt-ui-card--result alt-ui-card--bordered" style={{ marginBottom: "1rem" }}>
          <h3 className="alt-ui-card__title">Assessment</h3>
          <p>{result.assessment}</p>
          {result.urgent && (
            <Alert tone="danger" title="Urgent Recommendation">
              Your symptoms may require immediate medical attention. Please seek care promptly.
            </Alert>
          )}
        </Card>
      )}
      <Field label="Select Symptoms" helpText="Hold Ctrl (Cmd on Mac) to select multiple.">
        <Select multiple value={formData.symptoms} onChange={handleMultiSelect} style={{ minHeight: '180px' }} className="p-3 text-lg">
          {SYMPTOM_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="py-2 px-1">{opt.label}</option>
          ))}
        </Select>
      </Field>
      <Field label="Age">
        <Input type="number" min="0" value={formData.age} onChange={handleChange("age")} className="min-h-[56px] px-4 py-3 text-lg" />
      </Field>
      <Field label="Gender">
        <Select value={formData.gender} onChange={handleChange("gender")} className="min-h-[56px] px-4 py-3 text-lg">
          <option value="">Select…</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      {/* Pregnancy field appears only for female gender */}
      {formData.gender === "female" && (
        <div className="flex items-center gap-2">
          <Input
            type="checkbox"
            id="pregnancy"
            checked={formData.pregnancy}
            onChange={handleChange("pregnancy")}
            className="w-auto h-5 w-5"
          />
          <label htmlFor="pregnancy" className="text-sm font-medium text-(--foreground) cursor-pointer">
            Pregnant?
          </label>
        </div>
      )}
      <Field label="Duration (days)">
        <Input type="number" min="0" value={formData.duration} onChange={handleChange("duration")} className="min-h-[56px] px-4 py-3 text-lg" />
      </Field>
      <Field label="Severity">
        <Select value={formData.severity} onChange={handleChange("severity")} className="min-h-[56px] px-4 py-3 text-lg">
          <option value="">Select…</option>
          <option value="mild">Mild</option>
          <option value="moderate">Moderate</option>
          <option value="severe">Severe</option>
        </Select>
      </Field>
      <Button type="submit" variant="primary" size="lg" className="w-full text-lg min-h-[56px]">Analyze Symptoms</Button>
    </form>
  );
}
