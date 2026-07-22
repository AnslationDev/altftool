"use client";

import React from "react";
import { Card } from "@altftool/ui";
import SymptomForm from "../components/SymptomForm";

export default function SymptomCheckerHome() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Symptom Checker</h1>
        <p className="text-base text-(--muted-foreground)">
          Assess your symptoms to find possible causes and receive guidance.
        </p>
      </header>
      <main>
        <Card className="p-6 shadow-sm md:p-8">
          <SymptomForm />
        </Card>
      </main>
    </div>
  );
}
