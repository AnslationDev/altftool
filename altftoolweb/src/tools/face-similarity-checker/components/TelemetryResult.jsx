"use client";
import React from "react";
import { CheckCircle2, ShieldAlert, Sparkles, ShieldCheck } from "lucide-react";

export default function TelemetryResult({ similarity, qualityMetrics, settings }) {
  // Define progress circle details
  const radius = 55;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (similarity / 100) * circumference;

  return (
    <div className="bg-(--surface) border border-(--border) p-8 rounded-2xl shadow-xl space-y-8 backdrop-blur-md bg-opacity-95">
      
      {/* Visual Similarity Meter header */}
      <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-(--border)">
        {/* Circular Progress Gauge */}
        <div className="relative flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-full shadow-inner">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            {/* Base circle background */}
            <circle
              stroke="var(--border)"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Progress line */}
            <circle
              stroke={similarity > 75 ? "#14B8A6" : similarity > 50 ? "#EAB308" : "#EF4444"}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset, transition: "stroke-dashoffset 1s ease-in-out" }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-(--foreground)">{similarity}<span className="text-xl">%</span></span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Match</span>
          </div>
        </div>

        {/* Dynamic recommendation message */}
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-500 flex items-center justify-center sm:justify-start gap-1.5 mb-2">
            <Sparkles className="w-4 h-4" /> Similarity Summary
          </span>
          <h4 className="font-black text-xl text-(--foreground) tracking-tight">
            {similarity > 85 ? "High Biometric Correspondence" : similarity > 60 ? "Moderate Visual Congruence" : "Low Visual Similarity"}
          </h4>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
            {similarity > 85 
              ? "Facial geometry structures, eye-tilt ratios, and landmark vectors show significant overlap and strong biometric alignment." 
              : similarity > 60 
              ? "Key contours align well, but micro-features, tilt angles, or lighting profiles introduce noticeable variances." 
              : "Landmark spacing vectors and facial geometries show distinct structure profiles with low correlation."}
          </p>
        </div>
      </div>

      {/* Quality Telemetry Grid */}
      <div className="space-y-5">
        <h4 className="text-sm font-extrabold text-(--foreground) uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-500" /> Visual Quality & Facial Analysis
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Face Detection", val: "Match Found", desc: "Two faces loaded", status: "ok" },
            { label: "Sharpness", val: qualityMetrics.sharpness, desc: "Blur / focus checking", status: qualityMetrics.sharpness === "Sharp" ? "ok" : "warn" },
            { label: "Facial Angle", val: qualityMetrics.angle, desc: "Head pitch alignment", status: qualityMetrics.angle === "Centered" ? "ok" : "warn" },
            { label: "Exposure", val: qualityMetrics.exposure, desc: "Light saturation", status: qualityMetrics.exposure === "Balanced" ? "ok" : "warn" },
            { label: "Expression", val: qualityMetrics.smile, desc: "Emotion evaluation", status: "ok" },
            { label: "Occlusion", val: qualityMetrics.glasses, desc: "Facial blocks", status: qualityMetrics.glasses === "No Occlusion" ? "ok" : "warn" },
            { label: "Eye Visibility", val: qualityMetrics.eyes, desc: "Pupils clear", status: "ok" },
            { label: "Latency", val: "45ms", desc: "Extraction speed", status: "ok" },
          ].map((metric, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-slate-300 dark:bg-slate-600 group-hover:bg-teal-500 transition-colors"></div>
              
              <div className="flex items-center justify-between ml-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{metric.label}</span>
                {metric.status === "ok" ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-500" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                )}
              </div>
              
              <div className="ml-2 mt-1">
                <span className="text-sm font-black text-(--foreground) block">{metric.val}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{metric.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
