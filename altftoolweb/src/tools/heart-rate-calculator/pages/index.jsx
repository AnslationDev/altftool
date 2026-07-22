"use client";

import React, { useState } from "react";
import { Card, Button, Input, Field } from "@altftool/ui";

const ZONES = [
  { name: "Zone 5: Maximum", color: "bg-red-500", min: 0.9, max: 1.0, desc: "Develops maximum performance and speed" },
  { name: "Zone 4: Hard", color: "bg-orange-500", min: 0.8, max: 0.9, desc: "Increases maximum performance capacity" },
  { name: "Zone 3: Moderate", color: "bg-yellow-500", min: 0.7, max: 0.8, desc: "Improves aerobic fitness" },
  { name: "Zone 2: Light", color: "bg-green-500", min: 0.6, max: 0.7, desc: "Improves basic endurance and fat burning" },
  { name: "Zone 1: Very Light", color: "bg-blue-400", min: 0.5, max: 0.6, desc: "Helps with recovery" },
];

export default function HeartRateCalculatorHome() {
  const [formData, setFormData] = useState({
    age: "",
    restingHr: "",
  });

  const [result, setResult] = useState(null);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const calculate = (e) => {
    e.preventDefault();
    const { age, restingHr } = formData;
    if (!age) return;

    // Tanaka formula for Max HR is generally more accurate
    const mhr = Math.round(208 - (0.7 * Number(age)));

    const rhr = restingHr ? Number(restingHr) : null;
    let zones = [];

    if (rhr) {
      // Karvonen Formula: Target HR = ((MHR - RHR) * %Intensity) + RHR
      const hrr = mhr - rhr;
      zones = ZONES.map(z => ({
        ...z,
        targetMin: Math.round((hrr * z.min) + rhr),
        targetMax: Math.round((hrr * z.max) + rhr),
      }));
    } else {
      // Simple % of MHR
      zones = ZONES.map(z => ({
        ...z,
        targetMin: Math.round(mhr * z.min),
        targetMax: Math.round(mhr * z.max),
      }));
    }

    setResult({ mhr, rhr, hrr: rhr ? mhr - rhr : null, zones });
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-(--foreground)">Heart Rate Zones Calculator</h1>
        <p className="text-(--muted-foreground)">Calculate your target training zones to optimize your cardio workouts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8">
        <Card className="p-6 h-fit">
          <form onSubmit={calculate} className="space-y-6">
            <Field label="Age">
              <Input type="number" min="1" max="120" value={formData.age} onChange={handleChange("age")} required className="min-h-[48px]" />
            </Field>

            <Field label="Resting Heart Rate (bpm)">
              <Input type="number" min="30" max="120" value={formData.restingHr} onChange={handleChange("restingHr")} placeholder="Optional (e.g. 60)" className="min-h-[48px]" />
              <p className="text-xs text-(--muted-foreground) mt-2">Providing your resting HR allows us to use the more accurate Karvonen formula.</p>
            </Field>

            <Button type="submit" variant="primary" className="w-full min-h-[56px] text-lg">Calculate Zones</Button>
          </form>
        </Card>

        <div className="space-y-6">
          {!result ? (
            <Card className="p-8 text-center flex flex-col items-center justify-center h-full bg-(--muted) border-dashed">
              <p className="text-(--muted-foreground)">Enter your age to calculate your Maximum Heart Rate and Training Zones.</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="p-6 text-center border-red-500 border-2 shadow-sm">
                  <h3 className="text-sm font-bold text-(--muted-foreground) mb-1 uppercase tracking-wide">Max Heart Rate</h3>
                  <span className="text-4xl font-black text-(--foreground)">{result.mhr} <span className="text-lg font-normal text-(--muted-foreground)">bpm</span></span>
                </Card>
                {result.rhr && (
                  <Card className="p-6 text-center border-blue-500 border-2 shadow-sm">
                    <h3 className="text-sm font-bold text-(--muted-foreground) mb-1 uppercase tracking-wide">Heart Rate Reserve</h3>
                    <span className="text-4xl font-black text-(--foreground)">{result.hrr} <span className="text-lg font-normal text-(--muted-foreground)">bpm</span></span>
                  </Card>
                )}
              </div>

              <Card className="overflow-hidden shadow-sm">
                <div className="p-6 border-b border-(--border)">
                  <h3 className="text-xl font-bold">Target Training Zones</h3>
                  <p className="text-sm text-(--muted-foreground)">Calculated using {result.rhr ? "the Karvonen Method" : "percentage of Max HR"}.</p>
                </div>
                <div className="p-0">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {result.zones.map((zone, idx) => (
                        <tr key={idx} className="border-b border-(--border) last:border-0 hover:bg-(--muted) transition-colors">
                          <td className="p-4 w-4">
                            <div className={`w-4 h-4 rounded-full ${zone.color}`}></div>
                          </td>
                          <td className="py-4 px-2">
                            <div className="font-bold">{zone.name}</div>
                            <div className="text-xs text-(--muted-foreground)">{zone.desc}</div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="text-lg font-black text-(--foreground)">{zone.targetMin} - {zone.targetMax} <span className="text-sm font-normal text-(--muted-foreground)">bpm</span></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
