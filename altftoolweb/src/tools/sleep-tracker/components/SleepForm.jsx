"use client";

import React, { useState } from "react";
import { Field, Input, Select, Button, Alert } from "@altftool/ui";

export default function SleepForm({ onSave }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    bedtime: "22:00",
    wakeTime: "06:30",
    timeToFallAsleep: 15,
    nightAwakenings: 0,
    minutesAwake: 0,
    napDuration: 0,
    age: "",
    gender: "",
    activityLevel: "",
    stressLevel: "",
    caffeineIntake: 0,
    alcoholIntake: 0,
    screenTime: 60,
    roomEnvironment: "",
    temperature: "",
    sleepGoal: 8,
    sleepQuality: 5
  });

  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (["timeToFallAsleep", "nightAwakenings", "minutesAwake", "napDuration", "age", "caffeineIntake", "alcoholIntake", "screenTime", "sleepGoal", "sleepQuality"].includes(field)) {
      value = value === "" ? "" : Number(value);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.bedtime || !formData.wakeTime) {
      setError("Bedtime and wake time are required.");
      return;
    }
    if (formData.sleepGoal === "" || Number.isNaN(Number(formData.sleepGoal)) || Number(formData.sleepGoal) <= 0) {
      setError("Sleep goal is required and must be a positive number of hours.");
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
          <Input type="date" value={formData.date} onChange={handleChange("date")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
        <Field label="Sleep Quality (1-10)">
          <Input type="number" min="1" max="10" value={formData.sleepQuality} onChange={handleChange("sleepQuality")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Bedtime">
          <Input type="time" value={formData.bedtime} onChange={handleChange("bedtime")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
        <Field label="Wake-up Time">
          <Input type="time" value={formData.wakeTime} onChange={handleChange("wakeTime")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Time Taken to Fall Asleep (mins)">
          <Input type="number" min="0" value={formData.timeToFallAsleep} onChange={handleChange("timeToFallAsleep")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
        <Field label="Night Awakenings (times)">
          <Input type="number" min="0" value={formData.nightAwakenings} onChange={handleChange("nightAwakenings")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Total Minutes Awake in Night">
          <Input type="number" min="0" value={formData.minutesAwake} onChange={handleChange("minutesAwake")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
        <Field label="Daytime Nap Duration (mins)">
          <Input type="number" min="0" value={formData.napDuration} onChange={handleChange("napDuration")} className="min-h-[48px] px-4 py-2 text-base" />
        </Field>
      </div>

      <div className="pt-4 border-t border-(--border)">
        <h3 className="mb-4 text-lg font-semibold text-(--foreground)">Lifestyle & Environment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field label="Activity Level">
            <Select value={formData.activityLevel} onChange={handleChange("activityLevel")} className="min-h-[48px] px-4 py-2 text-base">
              <option value="">Select...</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Lightly Active</option>
              <option value="moderate">Moderately Active</option>
              <option value="active">Very Active</option>
            </Select>
          </Field>
          <Field label="Stress Level">
            <Select value={formData.stressLevel} onChange={handleChange("stressLevel")} className="min-h-[48px] px-4 py-2 text-base">
              <option value="">Select...</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
              <option value="severe">Severe</option>
            </Select>
          </Field>
          <Field label="Caffeine Intake (cups)">
            <Input type="number" min="0" value={formData.caffeineIntake} onChange={handleChange("caffeineIntake")} className="min-h-[48px] px-4 py-2 text-base" />
          </Field>
          <Field label="Alcohol Drinks">
            <Input type="number" min="0" value={formData.alcoholIntake} onChange={handleChange("alcoholIntake")} className="min-h-[48px] px-4 py-2 text-base" />
          </Field>
          <Field label="Screen Time Before Bed (mins)">
            <Input type="number" min="0" value={formData.screenTime} onChange={handleChange("screenTime")} className="min-h-[48px] px-4 py-2 text-base" />
          </Field>
          <Field label="Room Environment">
            <Select value={formData.roomEnvironment} onChange={handleChange("roomEnvironment")} className="min-h-[48px] px-4 py-2 text-base">
              <option value="">Select...</option>
              <option value="dark_quiet">Dark & Quiet</option>
              <option value="some_light">Some Light/Noise</option>
              <option value="noisy_bright">Noisy/Bright</option>
            </Select>
          </Field>
        </div>
      </div>

      <div className="pt-4 border-t border-(--border)">
        <h3 className="mb-4 text-lg font-semibold text-(--foreground)">Profile & Goals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field label="Age">
            <Input type="number" min="0" value={formData.age} onChange={handleChange("age")} className="min-h-[48px] px-4 py-2 text-base" />
          </Field>
          <Field label="Gender">
            <Select value={formData.gender} onChange={handleChange("gender")} className="min-h-[48px] px-4 py-2 text-base">
              <option value="">Select...</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </Select>
          </Field>
          <Field label="Sleep Goal (hours)">
            <Input type="number" min="4" max="14" step="0.5" value={formData.sleepGoal} onChange={handleChange("sleepGoal")} className="min-h-[48px] px-4 py-2 text-base" />
          </Field>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full text-lg min-h-[56px]">Save Sleep Log</Button>
    </form>
  );
}
