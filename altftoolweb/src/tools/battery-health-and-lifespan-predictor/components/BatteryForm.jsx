import { useState, useEffect } from "react";
import {
  Clock, Thermometer, Zap, Battery, Plug, Smartphone, Gauge,
  HelpCircle, Cpu, AlertTriangle,
} from "lucide-react";
import { inputSchema } from "../utils/InputSchema";
import { deviceProfiles } from "../utils/deviceProfiles";

const fieldIcons = {
  age: Clock, usage: Gauge, heat: Thermometer, usageStyle: Smartphone,
  chargingFrequencyType: Plug, dailyFrequency: Clock, weeklyFrequency: Clock,
  chargingStyle: Battery, fastChargingPercent: Zap, drainBelow20: AlertTriangle,
  overnightCharging: Battery, workload: Cpu, pluggedRatio: Plug,
  chargeCyclesPerWeek: Clock, thermalThrottling: Thermometer,
  gamingRender: Zap, drivingStyle: Gauge, fastChargingUsage: Zap,
  chargingDepth: Battery, temperatureRange: Thermometer,
  regenBraking: Zap, idleStorageDaysPerMonth: Clock,
  loadStability: Gauge, cycleStability: Clock, storageIdleMonths: Clock,
  usageIntensitySpikes: Zap,
};

export default function BatteryForm({ device, loading, onCalculate }) {
  const [values, setValues] = useState({});
  const [fields, setFields] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const category = deviceProfiles[device]?.category || "misc";
    const schemaFields = inputSchema[category] || [];
    setFields(schemaFields);
    const init = {};
    schemaFields.forEach(f => { if (f.type === "select") init[f.key] = f.options[0]; });
    setValues(init);
    setErrors({});
  }, [device]);

  function updateValue(key, value) {
    setValues(prev => {
      const next = { ...prev, [key]: value };
      if (key === "chargingFrequencyType") {
        delete next.dailyFrequency;
        delete next.weeklyFrequency;
      }
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate() {
    const newErrors = {};
    fields.forEach(f => {
      const v = values[f.key];
      if (f.type === "number" && (v === undefined || v === "" || isNaN(Number(v)) || Number(v) < 0))
        newErrors[f.key] = "Required";
      if (f.conditional) {
        const cond = f.conditional[values[f.key]];
        if (cond) {
          const sv = values[cond.key];
          if (cond.type === "number" && (sv === undefined || sv === "" || isNaN(Number(sv)) || Number(sv) < 0))
            newErrors[cond.key] = "Required";
          else if (cond.type === "select" && !sv) newErrors[cond.key] = "Required";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submit() {
    if (validate()) {
      const payload = { device };
      fields.forEach(f => {
        payload[f.key] = values[f.key];
        if (f.conditional) {
          const c = f.conditional[values[f.key]];
          if (c) payload[c.key] = values[c.key];
        }
      });
      onCalculate(payload);
    }
  }

  function fillTypical() {
    const cat = deviceProfiles[device]?.category;
    const t = {};
    if (cat === "mobile") {
      t.age = 12; t.usage = 5; t.heat = "low"; t.usageStyle = "Moderate (social media, video)";
      t.chargingFrequencyType = "Daily"; t.dailyFrequency = "Once";
      t.chargingStyle = "Balanced (20-80%)"; t.fastChargingPercent = "Occasionally";
      t.drainBelow20 = "never"; t.overnightCharging = "no";
    } else if (cat === "laptop") {
      t.age = 18; t.usage = 8; t.heat = "warm"; t.workload = "Moderate";
      t.pluggedRatio = "Mostly plugged in"; t.chargeCyclesPerWeek = "3-4 times a week";
      t.thermalThrottling = "rare"; t.gamingRender = "no";
    } else if (cat === "ev") {
      t.age = 24; t.usage = 50; t.heat = "low"; t.drivingStyle = "Normal (balanced driving)";
      t.fastChargingUsage = "Sometimes (a few times a month)";
      t.chargingDepth = "Daily to 80-90%, 100% for long trips";
      t.temperatureRange = "Mild (10–25°C)"; t.regenBraking = "medium";
      t.idleStorageDaysPerMonth = "0 days (never idle)";
    } else {
      t.age = 20; t.usage = 4; t.heat = "normal"; t.chargeCyclesPerWeek = "1-2 times a week";
      t.loadStability = "stable"; t.cycleStability = "regular"; t.storageIdleMonths = 0;
      t.usageIntensitySpikes = "low";
    }
    setValues(t); setErrors({});
  }

  function renderField(field) {
    const val = values[field.key];
    const err = errors[field.key];
    // ★ Only transition shadow – no border or colour transitions
    const baseClass = `w-full p-3 rounded-xl border bg-[var(--card)] text-sm outline-none transition-shadow duration-300 ${
      err ? "border-red-400" : "border-[var(--border)] focus:border-[var(--primary)]/50"
    } hover:border-[var(--primary)]/30`;

    if (field.type === "select") {
      return (
        <select
          value={val || field.options[0]}
          onChange={(e) => updateValue(field.key, e.target.value)}
          className={baseClass}
        >
          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input
        type="number"
        value={val || ""}
        onChange={(e) => updateValue(field.key, e.target.value)}
        placeholder={field.label}
        className={baseClass}
      />
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes scanHorizontal {
          0% { left: -10%; }
          100% { left: 110%; }
        }
        .animate-scanHorizontal { animation: scanHorizontal 2s linear infinite; }
        .gradient-border-card {
          --angle: 0deg;
          border: 2px solid transparent;
          background-origin: border-box;
          background-clip: padding-box, border-box;
          background-image: linear-gradient(var(--card), var(--card)), conic-gradient(from var(--angle), var(--primary), #a855f7, var(--primary));
          animation: rotateBorder 4s linear infinite;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative p-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
            <Battery className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-[var(--primary)] to-blue-400 bg-clip-text text-transparent">
            Device Input Panel
          </h2>
        </div>
        <button onClick={fillTypical}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--card)] border border-[var(--border)] text-xs font-medium text-[var(--secondary-foreground)] hover:border-[var(--primary)]/50 hover:text-[var(--primary)] transition-[transform,box-shadow] duration-300 hover:shadow-lg hover:shadow-[var(--primary)]/10"
        >
          <Zap className="w-3.5 h-3.5" /> Fill typical values
        </button>
      </div>

      {/* Input card with gradient border */}
      <div className="gradient-border-card rounded-3xl p-6 shadow-lg backdrop-blur-xl bg-[var(--card)]/80">
        <div className="grid md:grid-cols-2 gap-5">
          {fields.map(field => {
            const IconComponent = fieldIcons[field.key] || HelpCircle;
            return (
              <div key={field.key}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-7 h-7 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center shadow-sm">
                    <IconComponent className="w-4 h-4 text-[var(--primary)]" />
                  </span>
                  <label className="text-xs font-medium opacity-80" title={field.tooltip || ""}>
                    {field.label}
                  </label>
                  <HelpCircle className="w-3 h-3 text-gray-400 hover:text-[var(--primary)] transition-colors cursor-help" title={field.tooltip} />
                </div>
                {renderField(field)}
                {errors[field.key] && <p className="text-red-400 text-xs mt-1">{errors[field.key]}</p>}
                {/* conditional sub‑field */}
                {field.conditional && values[field.key] && field.conditional[values[field.key]] && (
                  <div className="mt-2 ml-4 pl-3 border-l-2 border-[var(--primary)]/30">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-4 h-4 text-[var(--primary)]/70" />
                      <label className="text-xs font-medium opacity-80">
                        {field.conditional[values[field.key]].label}
                      </label>
                    </div>
                    {field.conditional[values[field.key]].type === "select" ? (
                      <select
                        value={values[field.conditional[values[field.key]].key] || field.conditional[values[field.key]].options[0]}
                        onChange={(e) => updateValue(field.conditional[values[field.key]].key, e.target.value)}
                        className={`w-full p-3 rounded-xl border bg-[var(--card)] text-sm outline-none transition-shadow duration-300 ${
                          errors[field.conditional[values[field.key]].key] ? "border-red-400" : "border-[var(--border)] focus:border-[var(--primary)]/50"
                        } hover:border-[var(--primary)]/30`}
                      >
                        {field.conditional[values[field.key]].options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type="number"
                        value={values[field.conditional[values[field.key]].key] || ""}
                        onChange={(e) => updateValue(field.conditional[values[field.key]].key, e.target.value)}
                        placeholder={field.conditional[values[field.key]].label}
                        className={`w-full p-3 rounded-xl border bg-[var(--card)] text-sm outline-none transition-shadow duration-300 ${
                          errors[field.conditional[values[field.key]].key] ? "border-red-400" : "border-[var(--border)] focus:border-[var(--primary)]/50"
                        } hover:border-[var(--primary)]/30`}
                      />
                    )}
                    {errors[field.conditional[values[field.key]].key] && (
                      <p className="text-red-400 text-xs mt-1">{errors[field.conditional[values[field.key]].key]}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={submit} disabled={loading}
        className="w-full py-4 rounded-2xl bg-[var(--primary)] text-white font-semibold flex items-center justify-center gap-2 transition-[transform,box-shadow] duration-300 hover:scale-[1.02] active:scale-95 shadow-lg shadow-[var(--primary)]/30 hover:shadow-[var(--primary)]/50"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg> Analyzing...
          </>
        ) : (
          <><Zap className="w-5 h-5" /> Analyze Battery</>
        )}
      </button>
    </div>
  );
}