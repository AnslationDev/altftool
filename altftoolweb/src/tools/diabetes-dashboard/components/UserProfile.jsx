"use client";

import React, { useState } from "react";
import { Field, Input, Select, Button, Alert } from "@altftool/ui";

export default function UserProfile({ initialProfile, onSave }) {
  const [formData, setFormData] = useState(initialProfile || {
    age: "",
    gender: "",
    height: "",
    weight: "",
    diabetesType: "",
    targetMin: 70,
    targetMax: 130,
    insulinUsage: false
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    if (["age", "height", "weight", "targetMin", "targetMax"].includes(field)) {
      value = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Guard against an inverted target range (min > max). Left unchecked,
    // Dashboard's `r >= targetMin && r <= targetMax` range filter becomes
    // impossible to satisfy for any reading, so "Time in Target" would
    // silently and permanently read 0% no matter how well-controlled the
    // user's readings are.
    const min = Number(formData.targetMin);
    const max = Number(formData.targetMax);
    if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
      setError("Minimum target must be less than or equal to maximum target.");
      setSuccess(false);
      return;
    }

    setError(null);
    onSave(formData);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && <Alert tone="success" title="Success">Profile saved successfully.</Alert>}
      {error && <Alert tone="danger" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Height (cm)">
          <Input type="number" min="0" value={formData.height} onChange={handleChange("height")} className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" min="0" value={formData.weight} onChange={handleChange("weight")} className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
      </div>

      <div className="pt-4 border-t border-(--border)">
        <h3 className="mb-4 text-xl font-bold text-(--foreground)">Diabetes Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Diabetes Type">
            <Select value={formData.diabetesType} onChange={handleChange("diabetesType")} className="min-h-[56px] px-4 py-3 text-lg">
              <option value="">Select…</option>
              <option value="type1">Type 1</option>
              <option value="type2">Type 2</option>
              <option value="prediabetes">Prediabetes</option>
              <option value="gestational">Gestational</option>
              <option value="other">Other</option>
            </Select>
          </Field>

          <div className="flex items-center gap-2 mt-8">
            <Input
              type="checkbox"
              id="insulinUsage"
              checked={formData.insulinUsage}
              onChange={handleChange("insulinUsage")}
              className="w-auto h-5 w-5"
            />
            <label htmlFor="insulinUsage" className="text-lg font-medium text-(--foreground) cursor-pointer">
              Currently taking Insulin?
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-(--border)">
        <h3 className="mb-4 text-xl font-bold text-(--foreground)">Target Blood Sugar Range (mg/dL)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Minimum (Target)">
            <Input type="number" min="0" value={formData.targetMin} onChange={handleChange("targetMin")} className="min-h-[56px] px-4 py-3 text-lg" />
          </Field>
          <Field label="Maximum (Target)">
            <Input type="number" min="0" value={formData.targetMax} onChange={handleChange("targetMax")} className="min-h-[56px] px-4 py-3 text-lg" />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full text-lg min-h-[56px]">Save Profile</Button>
    </form>
  );
}
