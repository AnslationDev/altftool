"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@altftool/ui";
import MedicationForm from "./MedicationForm";
import ScheduleList from "./ScheduleList";

export default function Dashboard() {
  const [medications, setMedications] = useState([]);
  const [isAdding, setIsAdding] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("altftool_medications");
      if (saved) {
        setMedications(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load medications from localStorage", e);
    }
  }, []);

  // Save to localStorage when medications change
  useEffect(() => {
    try {
      localStorage.setItem("altftool_medications", JSON.stringify(medications));
    } catch (e) {
      console.error("Failed to save medications to localStorage", e);
    }
  }, [medications]);

  const handleAddMedication = (newMedication) => {
    setMedications((prev) => [...prev, { ...newMedication, id: Date.now().toString() }]);
    setIsAdding(false);
  };

  const handleDeleteMedication = (id) => {
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  return (
    <div className="space-y-6">
      {isAdding ? (
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-bold text-(--foreground)">Add New Medication</h2>
          <MedicationForm onSubmit={handleAddMedication} onCancel={() => setIsAdding(false)} />
        </Card>
      ) : (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-(--foreground)">Your Schedule</h2>
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            + Add Medication
          </Button>
        </div>
      )}

      {!isAdding && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-(--foreground)">Active Medications</h3>
            {medications.length === 0 ? (
              <p className="text-sm text-(--muted-foreground)">No medications added yet.</p>
            ) : (
              <ul className="space-y-3">
                {medications.map((med) => (
                  <li key={med.id} className="flex items-center justify-between rounded-md border border-(--border) bg-(--card) p-3">
                    <div>
                      <p className="font-medium text-(--foreground)">{med.name}</p>
                      <p className="text-xs text-(--muted-foreground)">
                        {med.dosage} • {med.frequency}
                      </p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteMedication(med.id)}>
                      Remove
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 font-semibold text-(--foreground)">Upcoming Doses</h3>
            <ScheduleList medications={medications} />
          </Card>
        </div>
      )}
    </div>
  );
}
