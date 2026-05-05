import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  Fan,
  Laptop,
  Lightbulb,
  Microwave,
  Plus,
  PlugZap,
  Power,
  Refrigerator,
  RotateCcw,
  Search,
  Snowflake,
  Sparkles,
  Tv,
  WashingMachine,
  Wind,
  X,
  Zap
} from "lucide-react";
import { ApplianceCard } from "../components/ApplianceCard";
import { ApplianceGroupCard } from "../components/ApplianceGroupCard";
import { ChartsSection } from "../components/ChartsSection";
import { Insights } from "../components/Insights";
import { PDFButton } from "../components/PDFButton";
import { SummaryPanel } from "../components/SummaryPanel";
import { quickApplianceTemplates, roomCategories } from "../data/applianceDefaults";
import { statesData } from "../data/statesData";
import { calculateDashboard, formatINR } from "../lib/calculateBill";
import { clearSettings, loadSettings, saveSettings } from "../lib/storage";
import Features from "../components/Features";

const iconMap = {
  ac: Snowflake,
  fridge: Refrigerator,
  fan: Fan,
  tv: Tv,
  cooler: Wind,
  washing: WashingMachine,
  laptop: Laptop,
  microwave: Microwave,
  geyser: PlugZap,
  lights: Lightbulb,
  custom: Zap,
};

const fallbackSettings = {
  appliances: [],
  includeTaxes: true,
  starSavings: false,
  taxPercent: "0",
  customRate: "",
};

const makeId = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

const createAppliance = (template) => ({
  ...template,
  id: makeId(),
});

const defaultForm = {
  name: "",
  wattage: "",
  quantity: "",
  hoursPerDay: "",
  iconKey: "custom",
  subType: "",
};

export default function App() {
  const storedSettings = useMemo(() => loadSettings(), []);
  const [appliances, setAppliances] = useState(storedSettings?.appliances ?? fallbackSettings.appliances);
  const [selectedState, setSelectedState] = useState(storedSettings?.selectedState ?? fallbackSettings.selectedState);
  const [includeTaxes, setIncludeTaxes] = useState(storedSettings?.includeTaxes ?? fallbackSettings.includeTaxes);
  const [starSavings, setStarSavings] = useState(storedSettings?.starSavings ?? fallbackSettings.starSavings);
  const [taxPercent, setTaxPercent] = useState(storedSettings?.taxPercent ?? fallbackSettings.taxPercent);
  const [customRate, setCustomRate] = useState(storedSettings?.customRate ?? fallbackSettings.customRate);
  const [searchTerm, setSearchTerm] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [isAdded, setIsAdded] = useState(false);

  const currentState = useMemo(
    () => statesData.find((state) => state.state === selectedState) ?? statesData[0],
    [selectedState],
  );
  const summary = useMemo(() => calculateDashboard(appliances, currentState, includeTaxes, false, Number(taxPercent) || 0, Number(customRate) || 0), [appliances, currentState, includeTaxes, taxPercent, customRate]);
  const efficientSummary = useMemo(() => calculateDashboard(appliances, currentState, includeTaxes, true, Number(taxPercent) || 0, Number(customRate) || 0), [appliances, currentState, includeTaxes, taxPercent, customRate]);
  const displaySummary = starSavings ? efficientSummary : summary;
  const monthlySavings = Math.max(0, summary.monthlyCost - efficientSummary.monthlyCost);
  const billPressure = Math.min(100, Math.round((summary.monthlyCost / 8000) * 100));
  const controlScore = Math.max(0, 100 - billPressure);
  const searchQuery = searchTerm.trim().toLowerCase();

  const groupedAppliances = useMemo(() => {
    const groups = {};
    appliances.forEach((appliance) => {
      if (!groups[appliance.name]) {
        groups[appliance.name] = {
          name: appliance.name,
          iconKey: appliance.iconKey,
          items: [],
          totalWattage: 0,
          totalDailyUnits: 0,
          totalUnits: 0,
          totalCost: 0
        };
      }
      const itemBreakdown = summary.applianceBreakdown.find(b => b.id === appliance.id);
      if (itemBreakdown) {
        groups[appliance.name].items.push({
          ...appliance,
          monthlyUnits: itemBreakdown.monthlyUnits,
          monthlyCost: itemBreakdown.monthlyCost
        });
        groups[appliance.name].totalWattage += appliance.wattage * appliance.quantity;
        groups[appliance.name].totalDailyUnits += itemBreakdown.dailyUnits;
        groups[appliance.name].totalUnits += itemBreakdown.monthlyUnits;
        groups[appliance.name].totalCost += itemBreakdown.monthlyCost;
      }
    });

    return Object.values(groups).filter(group => {
      if (!searchQuery) return true;
      return group.name.toLowerCase().includes(searchQuery);
    });
  }, [appliances, summary, searchQuery]);

  useEffect(() => {
    saveSettings({ appliances, selectedState, includeTaxes, starSavings, taxPercent, customRate });
  }, [appliances, selectedState, includeTaxes, starSavings, taxPercent, customRate]);

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setTaxPercent(""); // Clear tax percent as requested
  };

  const updateAppliance = useCallback((id, patch) => {
    setAppliances((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeAppliance = useCallback((id) => {
    setAppliances((items) => items.filter((item) => item.id !== id));
  }, []);

  const removeGroup = useCallback((name) => {
    setAppliances((items) => items.filter((item) => item.name !== name));
  }, []);

  const addTemplate = useCallback((template) => {
    const defaultSubType = template.subTypes ? template.subTypes[0] : null;
    setForm({
      name: template.name,
      wattage: defaultSubType ? defaultSubType.wattage : template.wattage,
      quantity: 1,
      hoursPerDay: 1,
      roomCategory: template.roomCategory || "Other",
      iconKey: template.iconKey,
      subType: defaultSubType ? defaultSubType.name : "",
    });
  }, []);

  const handleSubTypeChange = (typeName) => {
    const template = quickApplianceTemplates.find((t) => t.name === form.name);
    const selectedType = template?.subTypes?.find((st) => st.name === typeName);
    if (selectedType) {
      setForm((current) => ({
        ...current,
        subType: typeName,
        wattage: selectedType.wattage,
      }));
    }
  };

  const handleCustomSubmit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    const wattage = Number(form.wattage);
    const quantity = Number(form.quantity);
    const hours = Math.min(24, Number(form.hoursPerDay) || 0);

    if (!name || isNaN(wattage) || wattage <= 0 || isNaN(quantity) || quantity <= 0 || !customRate) {
      if (!customRate) {
        alert("Please enter the Electricity Rate (₹/Unit) before adding an appliance.");
      }
      return;
    }

    // Requirement: Keep each appliance entry separately with unique id
    setAppliances((items) => [
      createAppliance({
        ...form,
        name,
        wattage,
        quantity,
        hoursPerDay: hours || 1,
      }),
      ...items,
    ]);

    setForm(defaultForm);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const resetAllData = () => {
    clearSettings();
    setAppliances([]);
    setIncludeTaxes(true);
    setStarSavings(false);
    setTaxPercent("0");
    setCustomRate("");
    setSearchTerm("");
    setForm(defaultForm);
    setShowResetModal(false);
  };

  return (
    <div className="px-4 py-6 text-(--foreground) min-h-screen">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-(--background) text-(--primary) text-center mb-8 mx-auto"
        >
          {/* <div className="flex justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25">
              <PlugZap size={28} className="text-white" />
            </div>
          </div> */}
          <h1 className="heading flex justify-center gap-2 animate-fade-up">
            Household Energy Cost Estimator
          </h1>
          <p className="description opacity-90 mt-2 text-(--secondary) animate-fade-up">
            Analyze usage & optimize your Indian utility costs
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <PDFButton
              appliances={appliances}
              summary={summary}
              efficientSummary={efficientSummary}
              chartElementId="abhilfe-charts"
            />
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-(--border) bg-(--card) px-4 py-3 text-sm font-semibold text-(--secondary) transition hover:-translate-y-0.5 hover:text-red-400 hover:border-red-400/30"
            >
              <RotateCcw size={17} /> Reset Data
            </button>
          </div>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <div className="max-w-5xl mx-auto bg-(--card) rounded-2xl shadow-2xl border border-(--border) overflow-hidden">
        <div className="p-6 space-y-10">

          {/* Summary Section - Transformed SummaryPanel */}
          <section>
            <SummaryPanel
              summary={displaySummary}
              includeTaxes={includeTaxes}
              taxPercent={taxPercent}
              onTaxToggle={setIncludeTaxes}
              onTaxPercentChange={setTaxPercent}
            />
          </section>

          {/* Form and Appliances Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Add Appliance Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 space-y-6"
            >
              <div className="rounded-2xl border border-(--border) bg-(--background)/50 p-6">
                <div className="mb-6">
                  <p className="text-sm font-semibold text-(--primary) uppercase tracking-wider">Configuration</p>
                  <h2 className="text-xl font-bold mt-1">Add Appliance</h2>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {quickApplianceTemplates.map((template) => {
                    const Icon = iconMap[template.iconKey] || Zap;
                    const isActive = form.name === template.name;
                    return (
                      <button
                        type="button"
                        key={template.name}
                        onClick={() => addTemplate(template)}
                        className={`p-3 rounded-xl border transition-all group ${isActive
                          ? "border-(--primary) bg-(--primary)/10 text-(--primary)"
                          : "border-(--border) bg-(--card) hover:border-(--primary)/50 text-(--secondary) hover:text-(--primary)"
                          }`}
                        title={`Select ${template.name}`}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleCustomSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block">Appliance Name</span>
                        <input
                          value={form.name}
                          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                          placeholder="e.g. Water Pump"
                          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block">Appliance Type</span>
                        <input
                          value={form.subType}
                          onChange={(event) => setForm((current) => ({ ...current, subType: event.target.value }))}
                          placeholder="e.g. LED, Split AC"
                          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block">Wattage</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.wattage}
                          placeholder="e.g. 100"
                          onChange={(event) => {
                            const val = event.target.value;
                            if (val === "" || /^\d*$/.test(val)) {
                              setForm((current) => ({ ...current, wattage: val }));
                            }
                          }}
                          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block">Quantity</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={form.quantity}
                          placeholder="e.g. 1"
                          onChange={(event) => {
                            const val = event.target.value;
                            if (val === "" || /^\d*$/.test(val)) {
                              setForm((current) => ({ ...current, quantity: val }));
                            }
                          }}
                          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block">Usage (Hrs/Day)</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={form.hoursPerDay}
                          placeholder="e.g. 8"
                          onChange={(event) => {
                            const val = event.target.value;
                            if (val === "" || /^\d*\.?\d*$/.test(val)) {
                              const numVal = Number(val);
                              if (numVal <= 24) {
                                setForm((current) => ({ ...current, hoursPerDay: val }));
                              }
                            }
                          }}
                          className="w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition"
                        />
                      </label>
                      <label className="block">
                        <span className="text-sm font-medium text-(--secondary) mb-1.5 block font-bold text-(--primary)">Electricity Rate (₹/Unit)</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--secondary) text-xs font-bold">₹</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={customRate}
                            placeholder="e.g. 10"
                            onChange={(event) => {
                              const val = event.target.value;
                              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                setCustomRate(val);
                              }
                            }}
                            className="w-full rounded-xl border border-(--primary)/30 bg-(--background) pl-7 pr-4 py-3 text-(--foreground) outline-none focus:border-(--primary) transition font-bold"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white shadow-lg transition-all duration-300 ${isAdded
                      ? "bg-emerald-500 shadow-emerald-500/20"
                      : "bg-(--primary) shadow-indigo-500/20 hover:opacity-90"
                      }`}
                  >
                    {isAdded ? (
                      <>
                        <Check size={18} /> Added Successfully
                      </>
                    ) : (
                      <>
                        <Plus size={18} /> Add to List
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Right: Appliances List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">Your Appliances</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-bold">
                    {appliances.length} Items
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {groupedAppliances.length > 0 ? (
                  groupedAppliances.map((group) => (
                    <motion.div
                      key={group.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <ApplianceGroupCard
                        group={group}
                        onRemoveItem={removeAppliance}
                        onRemoveGroup={removeGroup}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-(--card) rounded-3xl border border-dashed border-(--border)">
                    <div className="flex justify-center mb-4 text-(--secondary)/20">
                      <Power size={64} />
                    </div>
                    <h3 className="text-xl font-bold text-(--foreground) mb-2">No Appliances Added</h3>
                    <p className="text-(--secondary) max-w-xs mx-auto">
                      Start by selecting an icon or adding a custom appliance above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Detailed Charts Section */}
          <section className="pt-4 border-t border-(--border)">
            <ChartsSection summary={displaySummary} />
          </section>

          {/* Insights Section */}
          <section>
            <Insights
              appliances={appliances}
              summary={summary}
              efficientSummary={efficientSummary}
              starSavings={starSavings}
              onStarSavingsToggle={setStarSavings}
            />
          </section>
        </div>
      </div>

      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl bg-(--card) border border-(--border) p-8 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reset Dashboard?</h2>
                  <p className="mt-2 text-(--secondary) text-sm leading-relaxed">
                    This will permanently clear all your saved appliances and preferences. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-6 py-3 rounded-xl font-semibold text-(--secondary) hover:bg-(--background) transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={resetAllData}
                  className="px-6 py-3 rounded-xl bg-red-500 font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-600 transition"
                >
                  Clear All
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Features />
    </div>
  );
}