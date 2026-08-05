/**
 * Production-Ready Order Milestone Stepper Visual Asset
 * Location: src/app/altflinking/components/visuals/OrderStatusStepperVisual.jsx
 */

"use client";

import React from "react";
import { Send, FileText, Globe, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function OrderStatusStepperVisual({ currentStep = 1 }) {
  const steps = [
    { step: 1, label: "Request Submitted", icon: Send },
    { step: 2, label: "Publisher Accepted", icon: FileText },
    { step: 3, label: "URL Submitted", icon: Globe },
    { step: 4, label: "Admin Reviewed", icon: ShieldCheck },
  ];

  return (
    <div className="w-full py-3 px-4 bg-white rounded-xl border border-slate-200">
      <div className="flex items-center justify-between relative">

        {/* Background Connecting Line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100 z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-emerald-500 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((item) => {
          const Icon = item.icon;
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;

          return (
            <div key={item.step} className="flex flex-col items-center relative z-10 space-y-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                    : isCurrent
                    ? "bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/40 ring-4 ring-indigo-500/20 animate-pulse"
                    : "bg-white text-slate-500 border-slate-200"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  isCompleted
                    ? "text-indigo-600"
                    : isCurrent
                    ? "text-indigo-600 font-extrabold"
                    : "text-slate-500"
                }`}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
