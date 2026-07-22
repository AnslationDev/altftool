import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, Snowflake, Refrigerator, Fan, Lightbulb, Tv, WashingMachine, Microwave, Laptop, Wind } from "lucide-react";
import { appliancePresets } from "../utils/presets";

const iconMap = {
  Snowflake,
  Refrigerator,
  Fan,
  Lightbulb,
  Tv,
  WashingMachine,
  Microwave,
  Zap,
  Laptop,
  Wind
};

export default function ApplianceForm({ onAdd, electricityRate, setElectricityRate }) {
  const [formData, setFormData] = useState({
    name: "",
    wattage: "",
    hoursPerDay: "",
    quantity: "1"
  });

  const handlePresetSelect = (preset) => {
    setFormData({
      ...formData,
      name: preset.name,
      wattage: preset.wattage,
      hoursPerDay: formData.hoursPerDay || "1"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.wattage || !formData.hoursPerDay || !formData.quantity) return;

    onAdd({
      ...formData,
      id: Date.now().toString(),
      wattage: Number(formData.wattage),
      hoursPerDay: Number(formData.hoursPerDay),
      quantity: Number(formData.quantity)
    });

    setFormData({ name: "", wattage: "", hoursPerDay: "", quantity: "1" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-sm space-y-6"
    >
      <div>
        <h2 className="text-xl font-black text-(--foreground) mb-2">Quick Presets</h2>
        <p className="text-sm text-(--muted-foreground) mb-6">Select a common appliance to auto-fill its wattage.</p>

        <div className="flex flex-wrap gap-2">
          {appliancePresets.map((preset) => {
            const Icon = iconMap[preset.icon] || Zap;
            const isActive = formData.name === preset.name;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                  ? "bg-(--primary) text-white border-(--primary) shadow-lg shadow-blue-500/20 scale-105"
                  : "bg-(--background) text-(--muted-foreground) border-(--border) hover:border-(--primary)/50 hover:text-(--primary)"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-(--border) w-full opacity-50" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-black text-(--foreground)">Appliance Details</h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) ml-1">
              Appliance Name
            </label>
            <input
              type="text"
              placeholder="e.g. Living Room AC"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) focus:border-(--primary) outline-none transition-all font-bold text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) ml-1">
                Power (Watts)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.wattage}
                onChange={(e) => setFormData({ ...formData, wattage: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) focus:border-(--primary) outline-none transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) ml-1">
                Usage (Hrs/Day)
              </label>
              <input
                type="number"
                max="24"
                placeholder="0"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) focus:border-(--primary) outline-none transition-all font-bold text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) ml-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--border) focus:border-(--primary) outline-none transition-all font-bold text-sm"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-(--primary) ml-1">
                Rate (₹/kWh)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="₹"
                value={electricityRate}
                onChange={(e) => setElectricityRate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-(--background) border border-(--primary)/30 focus:border-(--primary) outline-none transition-all font-black text-sm text-(--primary)"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/10 active:scale-[0.98] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Appliance</span>
        </button>
      </form>
    </motion.div>
  );
}
