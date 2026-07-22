import React from "react";
import { Alert } from "@altftool/ui";

export default function EducationalSection() {
  return (
    <div className="space-y-8">
      <Alert tone="warning" title="Medical Disclaimer">
        This tool is for educational and self-monitoring purposes only. It is not a medical device, nor a substitute for professional medical care.
        Always consult your doctor or endocrinologist before making changes to your medication or lifestyle.
      </Alert>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Understanding Blood Sugar Targets</h2>
        <p className="text-(--muted-foreground) mb-4 leading-relaxed">
          Targets vary depending on age, diabetes type, and overall health. Generally, the American Diabetes Association recommends:
        </p>
        <ul className="list-disc pl-5 space-y-2 text-(--muted-foreground)">
          <li><strong>Fasting or Before Meals:</strong> 80 – 130 mg/dL (4.4 - 7.2 mmol/L)</li>
          <li><strong>1-2 Hours After Meals:</strong> Less than 180 mg/dL (10.0 mmol/L)</li>
          <li><strong>HbA1c Target:</strong> Usually below 7% for many non-pregnant adults.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Symptoms of High Blood Sugar (Hyperglycemia)</h2>
        <ul className="list-disc pl-5 space-y-2 text-(--muted-foreground)">
          <li>Frequent urination</li>
          <li>Increased thirst</li>
          <li>Fatigue and feeling tired</li>
          <li>Blurred vision</li>
          <li>Headaches</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Symptoms of Low Blood Sugar (Hypoglycemia)</h2>
        <ul className="list-disc pl-5 space-y-2 text-(--muted-foreground)">
          <li>Shakiness, sweating, or chills</li>
          <li>Irritability or confusion</li>
          <li>Fast heartbeat</li>
          <li>Dizziness or lightheadedness</li>
          <li>Hunger and nausea</li>
        </ul>
        <p className="mt-2 text-sm text-(--muted-foreground) italic">
          If you experience severe low blood sugar, consume 15g of fast-acting carbs (like juice or glucose tablets) and recheck in 15 minutes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Foot Care Tips</h2>
        <p className="text-(--muted-foreground) mb-4 leading-relaxed">
          Diabetes can cause nerve damage and poor blood flow, making foot care essential.
          Check your feet daily for cuts, blisters, or swelling. Wash them in warm water, dry gently (especially between toes), and moisturize (but not between the toes). Never walk barefoot.
        </p>
      </section>
    </div>
  );
}
