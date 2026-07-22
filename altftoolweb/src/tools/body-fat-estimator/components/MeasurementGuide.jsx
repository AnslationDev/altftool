import React from "react";
import { HelpCircle, ArrowRight } from "lucide-react";

export default function MeasurementGuide({ setActiveTab }) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/80 p-6 sm:p-8 shadow-xl backdrop-blur-2xl">
        <h2 className="text-xl font-bold text-[var(--primary)] flex items-center gap-2 mb-6">
          <HelpCircle className="h-5 w-5" />
          How to Measure Correctly
        </h2>

        <div className="space-y-6 text-sm text-[var(--secondary-foreground)] leading-relaxed">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="rounded-xl bg-[var(--background)]/50 p-4 border border-[var(--card-border)]">
              <h3 className="font-semibold text-[var(--primary)] mb-2">📏 Neck Measurement</h3>
              <p className="text-xs text-[var(--secondary-foreground)]">
                Measure below the larynx (Adam's apple) sloping down toward the front. Keep the tape flat, don't compress the skin. Stand relaxed.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--background)]/50 p-4 border border-[var(--card-border)]">
              <h3 className="font-semibold text-[var(--primary)] mb-2">📐 Waist Measurement</h3>
              <p className="text-xs text-[var(--secondary-foreground)]">
                <strong>Men:</strong> At belly button level. <strong>Women:</strong> At narrowest point of torso. Measure at the end of a normal exhale.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--background)]/50 p-4 border border-[var(--card-border)]">
              <h3 className="font-semibold text-[var(--primary)] mb-2">👖 Hip Measurement (Women)</h3>
              <p className="text-xs text-[var(--secondary-foreground)]">
                Around the widest part of hips and glutes, tape parallel to floor.
              </p>
            </div>
            <div className="rounded-xl bg-[var(--background)]/50 p-4 border border-[var(--card-border)]">
              <h3 className="font-semibold text-[var(--primary)] mb-2">🗜️ Skinfold Sites</h3>
              <p className="text-xs text-[var(--secondary-foreground)]">
                Pinch fold away from muscle, place caliper 1cm below fingers, read mm within 2 seconds.
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--card-border)] pt-6">
            <h3 className="font-semibold text-[var(--foreground)] mb-3">ACE Body Fat Standards</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)] text-[var(--secondary-foreground)]">
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Men</th>
                    <th className="py-2.5 px-3">Women</th>
                    <th className="py-2.5 px-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  <tr><td className="py-2.5 px-3 text-blue-400 font-semibold">Essential Fat</td><td>2–5%</td><td>10–13%</td><td className="text-[var(--secondary-foreground)]">Minimum for health</td></tr>
                  <tr><td className="py-2.5 px-3 text-emerald-400 font-semibold">Athletic</td><td>6–13%</td><td>14–20%</td><td className="text-[var(--secondary-foreground)]">High performance</td></tr>
                  <tr><td className="py-2.5 px-3 text-[var(--primary)] font-semibold">Fitness</td><td>14–17%</td><td>21–24%</td><td className="text-[var(--secondary-foreground)]">Healthy fit range</td></tr>
                  <tr><td className="py-2.5 px-3 text-amber-400 font-semibold">Acceptable</td><td>18–24%</td><td>25–31%</td><td className="text-[var(--secondary-foreground)]">Average, lower risk</td></tr>
                  <tr><td className="py-2.5 px-3 text-rose-400 font-semibold">Obese</td><td>25%+</td><td>32%+</td><td className="text-[var(--secondary-foreground)]">Higher health risk</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveTab("calculator")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-indigo-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
            >
              Start Estimating Now
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
