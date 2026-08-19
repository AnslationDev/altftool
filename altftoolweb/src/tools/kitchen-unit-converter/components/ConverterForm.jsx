"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Scale,
  Droplets,
  Thermometer,
  ArrowRightLeft,
  Copy,
  Check,
  Save
} from "lucide-react";

const UNITS = {
  weight: {
    base: 'grams',
    icon: Scale,
    color: 'text-blue-500',
    units: [
      { label: 'Grams (g)', value: 'grams', rate: 1 },
      { label: 'Kilograms (kg)', value: 'kg', rate: 1000 },
      { label: 'Ounces (oz)', value: 'ounces', rate: 28.3495 },
      { label: 'Pounds (lb)', value: 'pounds', rate: 453.592 }
    ]
  },
  volume: {
    base: 'ml',
    icon: Droplets,
    color: 'text-cyan-500',
    units: [
      { label: 'Milliliters (ml)', value: 'ml', rate: 1 },
      { label: 'Liters (l)', value: 'liters', rate: 1000 },
      { label: 'Cups (US)', value: 'cups', rate: 236.588 },
      { label: 'Tablespoons (tbsp)', value: 'tbsp', rate: 14.7868 },
      { label: 'Teaspoons (tsp)', value: 'tsp', rate: 4.92892 },
      { label: 'Fluid Ounces (fl oz)', value: 'fl_oz', rate: 29.5735 }
    ]
  },
  temperature: {
    base: 'celsius',
    icon: Thermometer,
    color: 'text-orange-500',
    units: [
      { label: 'Celsius (°C)', value: 'celsius' },
      { label: 'Fahrenheit (°F)', value: 'fahrenheit' }
    ]
  }
};

const ConverterForm = ({ onConvert }) => {
  const [activeTab, setActiveTab] = useState('weight');
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(UNITS.weight.units[0].value);
  const [toUnit, setToUnit] = useState(UNITS.weight.units[1]?.value || UNITS.weight.units[0].value);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const handleTabChange = (key) => {
    const categoryUnits = UNITS[key].units;
    setActiveTab(key);
    setFromUnit(categoryUnits[0].value);
    setToUnit(categoryUnits[1]?.value || categoryUnits[0].value);
  };

  const convert = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val)) {
      setResult(null);
      return;
    }

    let converted;
    if (activeTab === 'temperature') {
      if (fromUnit === toUnit) converted = val;
      else if (fromUnit === 'celsius' && toUnit === 'fahrenheit') converted = (val * 9/5) + 32;
      else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') converted = (val - 32) * 5/9;
    } else {
      const fromObj = UNITS[activeTab].units.find(u => u.value === fromUnit);
      const toObj = UNITS[activeTab].units.find(u => u.value === toUnit);
      if (!fromObj || !toObj) return;
      converted = (val * fromObj.rate) / toObj.rate;
    }
    if (converted === undefined) return;
    setResult(Number(converted.toFixed(4)));
  };

  useEffect(() => {
    convert();
  }, [inputValue, fromUnit, toUnit, activeTab]);

  const handleSave = () => {
    if (result === null || isNaN(result)) return;
    const fromLabel = UNITS[activeTab].units.find(u => u.value === fromUnit)?.label.replace(/\s*\(.*\)\s*$/, '') || "";
    const toLabel = UNITS[activeTab].units.find(u => u.value === toUnit)?.label.replace(/\s*\(.*\)\s*$/, '') || "";
    const val = parseFloat(inputValue);
    if (isNaN(val)) return;
    onConvert({
      fromValue: val,
      fromUnit: fromLabel,
      toValue: result,
      toUnit: toLabel,
      category: activeTab
    });
  };

  const handleCopy = () => {
    if (result === null) return;
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(result.toString()).then(() => {
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {Object.entries(UNITS).map(([key, config]) => {
          const Icon = config.icon;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              aria-pressed={activeTab === key}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold ${activeTab === key ? "bg-primary text-white shadow-sm" : "bg-card text-foreground hover:bg-surface-soft border border-border"}`}
            >
              <Icon className={`h-4 w-4 ${activeTab === key ? "text-white" : "text-muted"}`} />
              <span className="capitalize">{key}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="kuc-amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount to Convert</label>
            <input
              id="kuc-amount"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-4 font-mono text-2xl font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              placeholder="0.00"
            />
          </div>

          <div className="relative space-y-4">
            <div className="space-y-2">
              <label htmlFor="kuc-from" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From</label>
              <select
                id="kuc-from"
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer"
              >
                {UNITS[activeTab].units.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>

            <div className="absolute left-1/2 top-[55%] z-10 -translate-x-1/2 -translate-y-1/2">
              <button
                onClick={swapUnits}
                aria-label="Swap from and to units"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm"
              >
                <ArrowRightLeft className="h-5 w-5 rotate-90 md:rotate-0" />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="kuc-to" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">To</label>
              <select
                id="kuc-to"
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 font-mono text-sm font-bold text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 cursor-pointer"
              >
                {UNITS[activeTab].units.map(u => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 p-6 border border-primary/10">
          <span className="text-sm font-bold text-muted mb-2 uppercase tracking-wider">Result</span>
          <div className="text-center">
            <div aria-live="polite" role="status" className="text-5xl font-black text-primary tracking-tight mb-2">
              {result !== null ? result : '0'}
            </div>
            <div className="text-lg font-bold text-foreground mb-4">
              {UNITS[activeTab].units.find(u => u.value === toUnit)?.label.replace(/\s*\(.*\)\s*$/, '')}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 w-full">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold ${copied ? "bg-success text-white" : "bg-card text-foreground hover:bg-surface-soft border border-border"}`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground shadow-sm"
            >
              <Save className="h-4 w-4" />
              Save to History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterForm;
