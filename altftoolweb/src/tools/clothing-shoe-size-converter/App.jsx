"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shirt,
  Footprints,
  User,
  Users,
  Baby,
  RefreshCw,
  Search,
  Check,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  History,
  Trash2,
  Scale,
  Zap,
  TrendingUp,
  LayoutDashboard,
  Dna
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SIZE_DATA, CATEGORIES, GENDERS, FIT_TYPES } from "./utils/sizeData";
import { convertShoeSize, convertClothingSize, getRecommendation } from "./lib";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Fashion Size Engine";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        International Fit Analytics Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Seamlessly convert global sizing standards and find your perfect fit with our intelligent measurement-based recommendation engine.
      </p>
    </motion.div>
  );
};

// --- Main App ---

export default function SizeConverter() {
  const [category, setCategory] = useState(CATEGORIES.CLOTHING);
  const [gender, setGender] = useState(GENDERS.MEN);
  const [subCategory, setSubCategory] = useState("shirts");

  const [fromSystem, setFromSystem] = useState("us");
  const [inputValue, setInputValue] = useState("");

  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hip: "",
    footLength: ""
  });
  const [fitType, setFitType] = useState("REGULAR");

  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState([]);
  const [toast, setToast] = useState(null);

  // Load data
  useEffect(() => {
    const savedHistory = localStorage.getItem("size_converter_history");
    const savedProfile = localStorage.getItem("size_converter_profile");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedProfile) setProfile(JSON.parse(savedProfile));
  }, []);

  useEffect(() => {
    localStorage.setItem("size_converter_history", JSON.stringify(history));
    localStorage.setItem("size_converter_profile", JSON.stringify(profile));
  }, [history, profile]);

  // Real-time conversion logic
  const conversionResult = useMemo(() => {
    if (!inputValue) return null;
    const categoryData = category === CATEGORIES.SHOES ? SIZE_DATA.shoes[gender] : SIZE_DATA.clothing[gender]?.[subCategory];
    if (!categoryData) return null;

    if (category === CATEGORIES.SHOES) {
      return convertShoeSize(inputValue, fromSystem, gender);
    }
    return convertClothingSize(inputValue, subCategory, gender, fromSystem);
  }, [inputValue, fromSystem, category, subCategory, gender]);

  // Real-time recommendation logic
  const recommendation = useMemo(() => {
    const categoryData = category === CATEGORIES.SHOES ? SIZE_DATA.shoes[gender] : SIZE_DATA.clothing[gender]?.[subCategory];
    if (!categoryData) return null;
    return getRecommendation(measurements, category, subCategory, gender, fitType);
  }, [measurements, category, subCategory, gender, fitType]);

  const subCategories = useMemo(() => {
    if (category === CATEGORIES.SHOES) return [];
    return Object.keys(SIZE_DATA.clothing[gender] || {});
  }, [category, gender]);

  // Reset subcategory if it's not valid for the current gender/category
  useEffect(() => {
    if (category === CATEGORIES.CLOTHING) {
      const validSubCategories = Object.keys(SIZE_DATA.clothing[gender] || {});
      if (validSubCategories.length > 0 && !validSubCategories.includes(subCategory)) {
        setSubCategory(validSubCategories[0]);
      }
    }
  }, [gender, category, subCategory]);

  const availableSystems = useMemo(() => {
    if (category === CATEGORIES.SHOES) return ["us", "uk", "eu", "in", "cm"];
    const data = SIZE_DATA.clothing[gender]?.[subCategory]?.[0];
    if (!data) return ["us", "eu", "uk"];
    return Object.keys(data).filter(k => ["us", "uk", "eu", "in", "cm", "size"].includes(k));
  }, [category, gender, subCategory]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const saveToHistory = () => {
    if (!conversionResult && !recommendation) return;
    const newEntry = {
      id: Date.now(),
      category,
      gender,
      subCategory,
      result: conversionResult || recommendation,
      timestamp: new Date().toLocaleTimeString()
    };
    setHistory(prev => [newEntry, ...prev].slice(0, 5));
    showToast("Result Saved to History");
  };

  const saveToProfile = () => {
    const res = conversionResult || recommendation;
    if (!res) return;

    const label = category === CATEGORIES.SHOES ? 'Shoes' : (subCategory.charAt(0).toUpperCase() + subCategory.slice(1));
    const newProfileEntry = {
      id: Date.now(),
      label: `${gender.charAt(0).toUpperCase() + gender.slice(1)}'s ${label}`,
      size: res.size || res.us || res.eu,
      category,
      subCategory
    };

    setProfile(prev => {
      // Prevent duplicates for the same category/gender
      const filtered = prev.filter(p => p.label !== newProfileEntry.label);
      return [newProfileEntry, ...filtered];
    });
    showToast("Added to My Size Vault");
  };

  const removeFromProfile = (id) => {
    setProfile(prev => prev.filter(p => p.id !== id));
    showToast("Removed from Vault");
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-primary/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Configuration & Inputs */}
          <div className="lg:col-span-4 space-y-6">

            {/* Mode Selector */}
            <GlassCard title="Global Configuration" icon={LayoutDashboard}>
              <div className="space-y-6">
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Main Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: CATEGORIES.CLOTHING, label: "Clothing", icon: Shirt },
                      { id: CATEGORIES.SHOES, label: "Footwear", icon: Footprints }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          if (cat.id === CATEGORIES.CLOTHING) setSubCategory("shirts");
                        }}
                        className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold transition-all border ${category === cat.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/30'
                          : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                          }`}
                      >
                        <cat.icon size={16} />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Demographic</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: GENDERS.MEN, label: "Men", icon: User },
                      { id: GENDERS.WOMEN, label: "Women", icon: Users },
                      { id: GENDERS.KIDS, label: "Kids", icon: Baby }
                    ].map(g => (
                      <button
                        key={g.id}
                        onClick={() => setGender(g.id)}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl text-[10px] font-bold transition-all border ${gender === g.id
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/30'
                          : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                          }`}
                      >
                        <g.icon size={16} />
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SubCategory */}
                {category === CATEGORIES.CLOTHING && subCategories.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Garment Type</label>
                    <select
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                      className="w-full bg-(--background) border border-(--border) rounded-2xl px-4 py-3 text-sm focus:border-blue-500/50 outline-none transition-colors appearance-none"
                    >
                      {subCategories.map(sub => (
                        <option key={sub} value={sub}>
                          {sub.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Instant Converter */}
            <GlassCard title="Instant Converter" icon={Zap} delay={0.1}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block whitespace-nowrap">From System</label>
                    <select
                      value={fromSystem}
                      onChange={(e) => setFromSystem(e.target.value)}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-xs focus:border-blue-500/50 outline-none h-[42px]"
                    >
                      {availableSystems.map(sys => (
                        <option key={sys} value={sys}>{sys.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block whitespace-nowrap">Your Size</label>
                    <input
                      type="text"
                      placeholder="e.g. 10, M, 42"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-3 py-2.5 text-xs focus:border-blue-500/50 outline-none h-[42px]"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {conversionResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 overflow-hidden"
                    >
                      <div className="text-[10px] font-black text-blue-500 uppercase mb-3">Equivalent Sizes</div>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(conversionResult)
                          .filter(([k]) => k !== fromSystem && k !== 'size')
                          .map(([sys, val]) => (
                            <div key={sys} className="flex flex-col">
                              <span className="text-[8px] font-black text-muted-foreground uppercase">{sys}</span>
                              <span className="text-sm font-bold text-(--foreground)">{val}</span>
                            </div>
                          ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={saveToHistory}
                  disabled={!conversionResult}
                  className="w-full py-3 rounded-xl bg-blue-600/10 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-2"
                >
                  <History size={14} />
                  Pin to History
                </button>

                <button
                  onClick={saveToProfile}
                  disabled={!conversionResult}
                  className="w-full py-3 rounded-xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Dna size={14} />
                  Save to My Vault
                </button>
              </div>
            </GlassCard>

            {/* My Size Vault */}
            <GlassCard title="My Size Vault" icon={Dna}>
              <div className="space-y-4">
                {profile.length > 0 ? profile.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        {item.category === CATEGORIES.SHOES ? <Footprints size={14} /> : <Shirt size={14} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-(--foreground)">{item.label}</div>
                        <div className="text-[12px] font-black text-blue-500">{item.size}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromProfile(item.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )) : (
                  <div className="text-center py-6 border-2 border-dashed border-(--border) rounded-2xl">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Your Vault is Empty</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Measurement History */}
            <GlassCard title="Recent Insights" icon={History}>
              <div className="space-y-4">
                {history.length > 0 ? history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-(--background) border border-(--border) hover:border-blue-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        {item.category === CATEGORIES.SHOES ? <Footprints size={14} /> : <Shirt size={14} />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-(--foreground)">
                          {item.subCategory || item.category}
                        </div>
                        <div className="text-[8px] text-muted-foreground uppercase">{item.timestamp}</div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-blue-500">
                      {item.result.size || item.result.us || item.result.eu}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Info size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">No History Active</p>
                  </div>
                )}
                {history.length > 0 && (
                  <button
                    onClick={() => { setHistory([]); showToast("History Cleared"); }}
                    className="w-full py-2 text-[8px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                  >
                    Clear Analytics
                  </button>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Lab & Results */}
          <div className="lg:col-span-8 space-y-6">

            {/* Measurement Lab */}
            <GlassCard title="Measurement Lab" icon={Dna}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-(--foreground)">Anatomic Inputs</label>
                      <span className="text-[10px] text-muted-foreground bg-(--background) px-2 py-0.5 rounded-full border border-(--border)">Inches / CM</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {category === CATEGORIES.CLOTHING ? (
                        <>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase">Chest</span>
                            <input
                              type="number"
                              placeholder="38"
                              value={measurements.chest}
                              onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-muted-foreground uppercase">Waist</span>
                            <input
                              type="number"
                              placeholder="32"
                              value={measurements.waist}
                              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                              className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50"
                            />
                          </div>
                          {subCategory === 'dresses' && (
                            <div className="space-y-1.5 col-span-2">
                              <span className="text-[9px] font-black text-muted-foreground uppercase">Hip</span>
                              <input
                                type="number"
                                placeholder="40"
                                value={measurements.hip}
                                onChange={(e) => setMeasurements({ ...measurements, hip: e.target.value })}
                                className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50"
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="space-y-1.5 col-span-2">
                          <span className="text-[9px] font-black text-muted-foreground uppercase">Foot Length (CM)</span>
                          <input
                            type="number"
                            placeholder="27.5"
                            value={measurements.footLength}
                            onChange={(e) => setMeasurements({ ...measurements, footLength: e.target.value })}
                            className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500/50"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-(--foreground)">Preferred Fit Silhouette</label>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(FIT_TYPES).map(fit => (
                        <button
                          key={fit}
                          onClick={() => setFitType(fit)}
                          className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all border whitespace-nowrap ${fitType === fit
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-900/20'
                            : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                            }`}
                        >
                          {fit}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={80} className="text-blue-500" />
                  </div>
                  <div className="text-[10px] font-black text-blue-500 uppercase mb-2">Recommended Matrix</div>
                  {recommendation ? (
                    <motion.div
                      key={recommendation.size || recommendation.us}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-6xl font-black text-(--foreground) mb-1">{recommendation.size || recommendation.us}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{category === 'shoes' ? 'US Size' : 'Standard Fit'}</div>
                      <div className="mt-6 flex flex-wrap justify-center gap-2">
                        <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20 flex items-center gap-1">
                          <Check size={12} /> {fitType} Optimal
                        </div>
                      </div>
                      <button
                        onClick={saveToProfile}
                        className="mt-6 px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
                      >
                        Add to My Vault
                      </button>
                    </motion.div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4 text-blue-500/30">
                        <Scale size={32} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Fit Lab Ready</p>
                        <p className="text-[9px] text-blue-500 font-bold uppercase">
                          {category === 'shoes' ? 'Enter Foot Length (CM) to Start' : 'Provide Body Measurements to Start'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>

            {/* Comparison Matrix */}
            <GlassCard title="International Comparison Matrix" icon={Scale}>
              <div className="overflow-x-auto no-scrollbar -mx-5 px-5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-(--border)">
                      {category === CATEGORIES.CLOTHING && <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">Size</th>}
                      <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">US</th>
                      <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">UK</th>
                      <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">EU</th>
                      <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">{category === 'shoes' ? 'IN' : 'IN/Asia'}</th>
                      <th className="pb-4 text-[10px] font-black text-muted-foreground uppercase pr-4">{category === 'shoes' ? 'CM' : 'Details'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    {(category === CATEGORIES.SHOES ? (SIZE_DATA.shoes[gender] || []) : (SIZE_DATA.clothing[gender]?.[subCategory] || [])).map((row, idx) => (
                      <tr key={idx} className={`hover:bg-blue-500/5 transition-colors group ${recommendation && (row.us === recommendation.us || row.size === recommendation.size) ? 'bg-blue-600/10' : ''}`}>
                        {category === CATEGORIES.CLOTHING && <td className="py-4 pr-4 font-black text-sm text-blue-500">{row.size}</td>}
                        <td className="py-4 pr-4 text-sm font-medium text-(--foreground)">{row.us}</td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">{row.uk}</td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">{row.eu}</td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground">{row.in || row.chest}</td>
                        <td className="py-4 pr-4 text-sm text-muted-foreground font-mono">{row.cm || row.waist || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Fashion Insights Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12">
              {[
                { title: "Fit Nuance", desc: "Slim fit cuts typically require sizing up if your measurements are on the threshold.", icon: Maximize2 },
                { title: "Foot Length", desc: "Always measure your foot length in CM for the most accurate international shoe conversion.", icon: Footprints },
                { title: "Global Variance", desc: "European sizes tend to be more precise with half-size increments in footwear.", icon: Scale }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-3xl bg-(--card) border border-(--border) hover:border-blue-500/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <item.icon size={18} />
                  </div>
                  <h4 className="text-sm font-bold text-(--foreground) mb-2">{item.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
