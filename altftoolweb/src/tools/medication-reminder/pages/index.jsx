"use client";

import React from "react";
import Dashboard from "../components/Dashboard";

export default function MedicationReminderHome() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Medication Reminder</h1>
        <p className="text-sm text-(--muted-foreground)">
          Keep track of your daily medications and view your upcoming schedule.
        </p>
      </header>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}
