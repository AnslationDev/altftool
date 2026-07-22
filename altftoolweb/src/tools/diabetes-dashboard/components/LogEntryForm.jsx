"use client";

import React, { useState } from "react";
import { Field, Input, Select, Button, Textarea, Alert } from "@altftool/ui";

export default function LogEntryForm({ onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: "12:00",
    reading: "",
    unit: "mg/dL",
    readingType: "fasting",
    notes: "",
    carbs: "",
    water: "",
    exercise: "",
  });

  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (["reading", "carbs", "water", "exercise"].includes(field)) {
      value = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.reading) {
      setError("Blood glucose reading is required.");
      return;
    }
    setError(null);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert tone="danger" title="Error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Log Date">
          <Input type="date" value={formData.date} onChange={handleChange("date")} className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
        <Field label="Log Time">
          <Input type="time" value={formData.time} onChange={handleChange("time")} className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Blood Sugar Reading">
          <Input type="number" step="0.1" min="0" value={formData.reading} onChange={handleChange("reading")} placeholder="e.g. 110" className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
        <Field label="Unit">
          <Select value={formData.unit} onChange={handleChange("unit")} className="min-h-[56px] px-4 py-3 text-lg">
            <option value="mg/dL">mg/dL</option>
            <option value="mmol/L">mmol/L</option>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Reading Type">
          <Select value={formData.readingType} onChange={handleChange("readingType")} className="min-h-[56px] px-4 py-3 text-lg">
            <option value="fasting">Fasting</option>
            <option value="before_breakfast">Before Breakfast</option>
            <option value="after_breakfast">After Breakfast</option>
            <option value="before_lunch">Before Lunch</option>
            <option value="after_lunch">After Lunch</option>
            <option value="before_dinner">Before Dinner</option>
            <option value="after_dinner">After Dinner</option>
            <option value="bedtime">Bedtime</option>
            <option value="random">Random</option>
          </Select>
        </Field>
        <Field label="Meal / General Notes">
          <Input type="text" value={formData.notes} onChange={handleChange("notes")} placeholder="e.g. Felt dizzy, ate a big meal" className="min-h-[56px] px-4 py-3 text-lg" />
        </Field>
      </div>

      <div className="pt-4 border-t border-(--border)">
        <h3 className="mb-4 text-xl font-bold text-(--foreground)">Optional Lifestyle Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Carbs (g)">
            <Input type="number" min="0" value={formData.carbs} onChange={handleChange("carbs")} className="min-h-[56px] px-4 py-3 text-lg" />
          </Field>
          <Field label="Water Intake (glasses)">
            <Input type="number" min="0" value={formData.water} onChange={handleChange("water")} className="min-h-[56px] px-4 py-3 text-lg" />
          </Field>
          <Field label="Exercise (mins)">
            <Input type="number" min="0" value={formData.exercise} onChange={handleChange("exercise")} className="min-h-[56px] px-4 py-3 text-lg" />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full text-lg min-h-[56px]">Save Log Entry</Button>
    </form>
  );
}
