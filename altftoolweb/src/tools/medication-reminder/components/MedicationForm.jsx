"use client";

import React, { useState } from "react";
import { Field, Input, Select, Button, Alert } from "@altftool/ui";

export default function MedicationForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    time: "08:00",
  });
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    if (!formData.name.trim()) return "Medication name is required.";
    if (!formData.dosage.trim()) return "Dosage is required.";
    if (!formData.time) return "Time is required.";
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert tone="danger" title="Error">{error}</Alert>}

      <Field label="Medication Name" helpText="e.g., Vitamin C, Amoxicillin">
        <Input
          type="text"
          value={formData.name}
          onChange={handleChange("name")}
          placeholder="Enter medication name"
          className="min-h-[48px] py-2"
        />
      </Field>

      <Field label="Dosage" helpText="e.g., 500mg, 1 tablet">
        <Input
          type="text"
          value={formData.dosage}
          onChange={handleChange("dosage")}
          placeholder="Enter dosage amount"
          className="min-h-[48px] py-2"
        />
      </Field>

      <Field label="Frequency">
        <Select value={formData.frequency} onChange={handleChange("frequency")} className="min-h-[48px] py-2">
          <option value="daily">Daily</option>
          <option value="twice_daily">Twice Daily</option>
          <option value="weekly">Weekly</option>
          <option value="as_needed">As Needed</option>
        </Select>
      </Field>

      <Field label="Time of Day" helpText="When should you take this?">
        <Input
          type="time"
          value={formData.time}
          onChange={handleChange("time")}
          className="min-h-[48px] py-2"
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">Save Medication</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
