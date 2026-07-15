"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react";

const checkLabels = {
  faceCentered: "Face Centered",
  headSizeOk: "Head Size",
  eyePositionOk: "Eye Position",
  backgroundOk: "Background",
  resolutionOk: "Resolution",
  sharpnessOk: "Sharpness",
  lightingOk: "Lighting",
};

function CheckItem({ id, check }) {
  const Icon = check.passed ? CheckCircle : check.borderline ? AlertTriangle : XCircle;
  const color = check.passed
    ? "text-green-500"
    : check.borderline
      ? "text-amber-500"
      : "text-(--danger)";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-3 p-3 rounded-lg bg-(--card) border border-(--border)"
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${color}`} />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-semibold text-(--foreground)">{checkLabels[id] || id}</span>
        <span className="text-xs text-(--muted-foreground) leading-relaxed">{check.message}</span>
        {check.current != null && (
          <span className="text-[10px] text-(--muted-foreground) tabular-nums">
            {check.current} {check.required ? `/ ${check.required}` : ""}
          </span>
        )}
      </div>
    </motion.div>
  );
}

function ScoreCircle({ score }) {
  const color = score >= 80 ? "text-green-500" : score >= 60 ? "text-amber-500" : "text-(--danger)";
  const strokeColor = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="var(--border)" strokeWidth="4" />
          <circle
            cx="40" cy="40" r={radius} fill="none" stroke={strokeColor} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${color}`}>{score}%</span>
        </div>
      </div>
      <span className="text-xs font-medium text-(--muted-foreground)">Compliance Score</span>
    </div>
  );
}

export default function ComplianceChecker({ compliance, template }) {
  const [expanded, setExpanded] = useState(true);

  if (!compliance) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-(--muted-foreground)">
        <Info size={36} />
        <p className="text-sm font-medium">No compliance data</p>
        <p className="text-xs text-center max-w-[200px]">Upload a photo to check compliance with {template?.name || "selected template"} requirements</p>
      </div>
    );
  }

  const checks = [
    "faceCentered", "headSizeOk", "eyePositionOk", "backgroundOk",
    "resolutionOk", "sharpnessOk", "lightingOk",
  ];

  const score = compliance.overallScore || 0;
  const passedCount = checks.filter((k) => compliance[k]?.passed).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-center">
        <ScoreCircle score={score} />
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-(--muted-foreground)">
        <span className="flex items-center gap-1">
          <CheckCircle size={12} className="text-green-500" />
          {passedCount} passed
        </span>
        <span className="flex items-center gap-1">
          <XCircle size={12} className="text-(--danger)" />
          {checks.length - passedCount} failed
        </span>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-(--muted)/30 border border-(--border)
          text-sm font-semibold text-(--foreground) hover:bg-(--muted)/50 transition-colors"
        aria-expanded={expanded}
      >
        <span>Detailed Checks</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {checks.map((key) => (
                compliance[key] && <CheckItem key={key} id={key} check={compliance[key]} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
        <AlertTriangle size={14} className="shrink-0 mt-0.5 text-amber-500" />
        <p className="text-[11px] text-(--muted-foreground) leading-relaxed">
          These are helpful guidelines only. Always verify with official requirements before submitting your photo.
        </p>
      </div>
    </div>
  );
}
