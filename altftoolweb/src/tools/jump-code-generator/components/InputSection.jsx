"use client";

import { motion } from "framer-motion";
import { Check, Code2, FileCode2, MousePointerClick, Route, ScrollText } from "lucide-react";
import ProgressTracker from "./ProgressTracker";
import { codeTypes } from "../hooks/useJumpCodeGenerator";

const iconMap = {
  "html-anchor": MousePointerClick,
  "smooth-scroll": ScrollText,
  "button-jump": MousePointerClick,
  "react-router": Route,
  "scroll-section": ScrollText,
  snippet: FileCode2,
  custom: Code2,
};

function Field({ field, config, value, onChange }) {
  if (config.options) {
    return (
      <label className="block min-w-0">
        <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
          <Code2 className="h-4 w-4 text-blue-400" />
          {config.label}
        </span>
        <select value={value} onChange={(event) => onChange(field, event.target.value)} className="pp-input">
          {config.options.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
    );
  }

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-bold">
        <Code2 className="h-4 w-4 text-blue-400" />
        {config.label}
      </span>
      <input
        type={config.type || "text"}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={config.placeholder}
        className="pp-input"
      />
    </label>
  );
}

export default function InputSection({ form, updateField, activeFields, fieldConfig, readiness, validation }) {
  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4">
      <div className="mb-4 min-w-0">
        <h2 className="text-xl font-black">Jump Code Details</h2>
        <p className="text-sm text-(--muted-foreground)">Choose a jump pattern. Fields and output update instantly.</p>
      </div>

      <ProgressTracker readiness={readiness} />

      <div className="mb-4 grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {codeTypes.map((type) => {
          const active = form.codeType === type.id;
          const Icon = iconMap[type.id] || Code2;
          return (
            <motion.button
              layout
              key={type.id}
              type="button"
              onClick={() => updateField("codeType", type.id)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${active ? "border-teal-400/45 bg-teal-400/10" : "border-(--border) bg-(--muted)/25"}`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-teal-400" : "text-blue-400"}`} />
                <span className="min-w-0 break-words text-sm font-black">{type.label}</span>
                {active && <Check className="ml-auto h-4 w-4 shrink-0 text-teal-400" />}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="grid min-w-0 gap-4">
        {activeFields.map((field) => (
          <Field key={field} field={field} config={fieldConfig[field]} value={form[field]} onChange={updateField} />
        ))}
      </div>

      {validation.warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-400/35 bg-amber-400/10 p-4 text-sm text-amber-500">
          {validation.warnings.map((warning) => <p key={warning}>{warning}</p>)}
        </div>
      )}
    </div>
  );
}
