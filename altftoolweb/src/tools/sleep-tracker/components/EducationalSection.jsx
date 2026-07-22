import React from "react";
import { Alert } from "@altftool/ui";

export default function EducationalSection() {
  return (
    <div className="space-y-8">
      <Alert tone="warning" title="Medical Disclaimer">
        This tool is for educational purposes only and does not diagnose sleep disorders (e.g., sleep apnea, insomnia).
        Always consult a healthcare professional for medical advice and treatment.
      </Alert>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">What is Healthy Sleep?</h2>
        <p className="text-(--muted-foreground) mb-4 leading-relaxed">
          Healthy sleep is vital for physical and mental well-being. It is generally characterized by sufficient duration,
          good quality (uninterrupted), appropriate timing, and regularity. For most adults, 7 to 9 hours a night is recommended.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Understanding Sleep Cycles</h2>
        <ul className="list-disc pl-5 space-y-2 text-(--muted-foreground)">
          <li><strong>N1 (Light Sleep):</strong> The transition between wakefulness and sleep.</li>
          <li><strong>N2 (Light Sleep):</strong> Heart rate and body temperature drop. Accounts for about 50% of sleep.</li>
          <li><strong>N3 (Deep Sleep):</strong> Crucial for physical restoration, tissue repair, and immune function.</li>
          <li><strong>REM (Rapid Eye Movement):</strong> Essential for cognitive functions like memory consolidation and creativity.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">How Sleep Score Works</h2>
        <p className="text-(--muted-foreground) mb-4 leading-relaxed">
          Your sleep score is estimated based on three primary factors:
          <br/>1. <strong>Duration:</strong> Total time spent asleep relative to your sleep goal.
          <br/>2. <strong>Efficiency:</strong> The percentage of time in bed actually spent asleep.
          <br/>3. <strong>Interruptions:</strong> Night awakenings and total minutes awake.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-(--foreground) mb-4">Common Sleep Mistakes</h2>
        <ul className="list-disc pl-5 space-y-2 text-(--muted-foreground)">
          <li>Inconsistent sleep schedules (especially on weekends).</li>
          <li>High screen time (blue light exposure) right before bed.</li>
          <li>Consuming caffeine or heavy meals late in the evening.</li>
          <li>Sleeping in an environment that is too warm, noisy, or bright.</li>
        </ul>
      </section>
    </div>
  );
}
