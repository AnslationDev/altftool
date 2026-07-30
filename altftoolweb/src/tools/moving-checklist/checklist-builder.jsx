// checklist-builder.jsx - 40-Task Moving Checklist (Complete)
"use client";

import React, { useState, useEffect } from 'react';

// ==================== CUSTOM SVG ICONS ====================

const HomeIcon = () => (
  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
    <path d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 15V15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H21M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const CheckedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor"/>
    <path d="M7 12L10.5 15.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15M7 10L12 15L17 10M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 3L15 6L12 9M21 3V9H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const FolderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 6H20C20.5304 6 21.0391 6.21071 21.4142 6.58579C21.7893 6.96086 22 7.46957 22 8V19Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4H4C2.89543 4 2 4.89543 2 6V20C2 21.1046 2.89543 22 4 22H18C19.1046 22 20 21.1046 20 20V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18.5 2.5C19.3284 1.67157 20.6716 1.67157 21.5 2.5C22.3284 3.32843 22.3284 4.67157 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <path d="M16 3V8H21M7 13H17M7 17H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// ==================== PRESET CATEGORIES ====================

const PRESET_CATEGORIES = {
  "8 Weeks Before": [
    "Research moving companies and get quotes",
    "Create a moving budget",
    "Sort and declutter belongings",
    "Start collecting packing supplies (boxes, tape, bubble wrap)",
    "Notify landlord or real estate agent",
    "Arrange transfer of medical records",
    "Research new area (schools, doctors, utilities)",
  ],
  "4 Weeks Before": [
    "Confirm moving date with movers",
    "Start packing non-essential items",
    "Label boxes by room and contents",
    "Change address with post office",
    "Notify banks, credit cards, insurance companies",
    "Arrange utility disconnection at old home",
    "Arrange utility connection at new home",
    "Plan meals to use up perishable food",
  ],
  "2 Weeks Before": [
    "Pack most belongings except daily essentials",
    "Confirm moving company details and timing",
    "Arrange time off work for moving day",
    "Clean rooms as they empty",
    "Take photos of electronics setups for reconnection",
    "Dispose of hazardous materials properly",
    "Return borrowed items to neighbors/friends",
  ],
  "1 Week Before": [
    "Pack an essentials box for first night",
    "Confirm parking arrangements for moving truck",
    "Defrost and clean refrigerator",
    "Take final meter readings",
    "Clean the entire house thoroughly",
    "Check all rooms, closets, and storage areas",
    "Prepare payment for moving company",
  ],
  "Moving Day": [
    "Do final walkthrough of empty home",
    "Check all windows and doors are locked",
    "Hand over keys to landlord or new owner",
    "Supervise movers loading truck",
    "Keep important documents with you",
    "Take photos of empty rooms for records",
  ],
  "After Moving": [
    "Unpack essentials first (kitchen, bedroom, bathroom)",
    "Check all items for damage",
    "Register with new doctor and dentist",
    "Update driving license and vehicle registration",
    "Explore new neighborhood",
    "Meet new neighbors",
    "File moving expense receipts for tax purposes",
  ],
};

// ==================== MAIN COMPONENT ====================

export default function ChecklistBuilder({ toolConfig }) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [customItems, setCustomItems] = useState([]);
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [usePresets, setUsePresets] = useState(true);
  const [checkedItems, setCheckedItems] = useState({});
  const [activeFilter, setActiveFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState('');
  const [removedPresetItems, setRemovedPresetItems] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moving-checklist-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCustomItems(data.items || []);
        setCheckedItems(data.checked || {});
        setUsePresets(data.usePresets !== false);
        setRemovedPresetItems(data.removedPresets || []);
      } catch (e) {}
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      items: customItems,
      checked: checkedItems,
      usePresets,
      removedPresets: removedPresetItems
    };
    localStorage.setItem('moving-checklist-data', JSON.stringify(data));
  }, [customItems, checkedItems, usePresets, removedPresetItems]);

  // Build full checklist
  const buildChecklist = () => {
    let allItems = [...customItems];

    if (usePresets) {
      Object.entries(PRESET_CATEGORIES).forEach(([category, items]) => {
        items.forEach(item => {
          const presetId = `preset-${category}-${item}`;
          if (!removedPresetItems.includes(presetId)) {
            const exists = allItems.find(i => i.id === presetId);
            if (!exists) {
              allItems.push({ id: presetId, text: item, category, isPreset: true });
            }
          }
        });
      });
    }

    return allItems;
  };

  const checklist = buildChecklist();

  // Group by category
  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Filter
  const filteredGrouped = Object.entries(groupedChecklist).reduce((acc, [category, items]) => {
    const filtered = items.filter(item => {
      if (activeFilter === 'done') return checkedItems[item.id];
      if (activeFilter === 'pending') return !checkedItems[item.id];
      return true;
    });
    if (filtered.length > 0) acc[category] = filtered;
    return acc;
  }, {});

  // Stats
  const totalItems = checklist.length;
  const completedItems = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  // Toggle check
  const toggleCheck = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Add custom item
  const addCustomItem = () => {
    if (!newItemText.trim()) return;
    const category = newItemCategory || 'General';
    setCustomItems(prev => [...prev, {
      id: Date.now().toString(),
      text: newItemText.trim(),
      category,
      isPreset: false,
    }]);
    setNewItemText('');
    setNewItemCategory('');
    setShowAddForm(false);
  };

  // Start editing item
  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditText(item.text);
  };

  // Save edit
  const saveEdit = () => {
    if (!editText.trim() || !editingItem) return;

    const item = checklist.find(i => i.id === editingItem);
    if (!item) return;

    if (item.isPreset) {
      // Move preset to custom with edited text
      setRemovedPresetItems(prev => [...prev, item.id]);
      setCustomItems(prev => [...prev, {
        id: Date.now().toString(),
        text: editText.trim(),
        category: item.category,
        isPreset: false,
      }]);
    } else {
      setCustomItems(prev => prev.map(i =>
        i.id === editingItem ? { ...i, text: editText.trim() } : i
      ));
    }

    setEditingItem(null);
    setEditText('');
  };

  // Remove item (works for both preset and custom)
  const removeItem = (itemId) => {
    const item = checklist.find(i => i.id === itemId);
    if (!item) return;

    if (item.isPreset) {
      setRemovedPresetItems(prev => [...prev, itemId]);
    } else {
      setCustomItems(prev => prev.filter(i => i.id !== itemId));
    }

    setCheckedItems(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });

    if (editingItem === itemId) {
      setEditingItem(null);
      setEditText('');
    }
  };

  // Export
  const exportChecklist = () => {
    const lines = ['MOVING CHECKLIST', '================', ''];
    Object.entries(filteredGrouped).forEach(([category, items]) => {
      lines.push(`--- ${category} ---`);
      items.forEach(item => {
        const status = checkedItems[item.id] ? '[x]' : '[ ]';
        lines.push(`${status} ${item.text}`);
      });
      lines.push('');
    });
    lines.push(`Progress: ${completedItems}/${totalItems} (${progress}%)`);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'moving-checklist.txt';
    a.click();
  };

  const resetAll = () => {
    if (window.confirm('Clear all checklist data? This cannot be undone.')) {
      setCustomItems([]);
      setCheckedItems({});
      setUsePresets(true);
      setRemovedPresetItems([]);
      setEditingItem(null);
    }
  };

  if (!showBuilder) {
    return (
      <div className="min-h-screen bg-(--background) p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="text-(--primary)">
                <HomeIcon />
              </div>
              <h1 className="heading text-center">{toolConfig?.name || "40-Task Moving Checklist"}</h1>
            </div>
            <p className="description">Build your moving checklist step by step with reusable fields and clean output</p>
          </div>

          <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-(--primary)/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-(--primary)">
                      <FolderIcon />
                    </div>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-4">
                    Stress-Free Moving Starts Here
                  </h2>
                  <p className="text-lg text-(--muted-foreground) mb-6">
                    Get a complete moving checklist organized by timeline. Track progress,
                    add custom items, edit or remove any task, and export your list.
                  </p>

                  <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-(--foreground) mb-3">How it works:</h3>
                    <div className="space-y-2 text-left text-(--muted-foreground)">
                      <p>• <strong>Preset Checklist</strong> — 6 timeline categories with 40+ tasks</p>
                      <p>• <strong>Custom Items</strong> — Add your own tasks to any category</p>
                      <p>• <strong>Edit & Delete</strong> — Modify or remove any item including presets</p>
                      <p>• <strong>Track Progress</strong> — Check off items and see completion percentage</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBuilder(true)}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg"
                  >
                    <ArrowRightIcon /> Build My Checklist
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-(--foreground)">How to Use</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Review Presets", desc: "Start with 40+ pre-built tasks across 6 timeline categories." },
                { step: "2", title: "Customize All", desc: "Add, edit, or remove any item — both presets and custom tasks." },
                { step: "3", title: "Track & Export", desc: "Check off tasks, monitor progress, and download your checklist." },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-(--primary) rounded-2xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4 shadow-lg">{item.step}</div>
                  <h3 className="font-bold text-(--foreground) mb-2">{item.title}</h3>
                  <p className="text-sm text-(--muted-foreground)">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="max-w-5xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-(--foreground)">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: <CalendarIcon />, title: "6 Timeline Categories", desc: "8 weeks, 4 weeks, 2 weeks, 1 week, moving day, after moving." },
                { icon: <PlusIcon />, title: "Add Custom Items", desc: "Create your own tasks in any category with one click." },
                { icon: <EditIcon />, title: "Edit Any Item", desc: "Modify preset or custom task text anytime." },
                { icon: <TrashIcon />, title: "Remove Any Item", desc: "Delete preset or custom items you don't need." },
                { icon: <CheckIcon />, title: "Progress Tracking", desc: "Check off completed items with visual progress bar." },
                { icon: <DownloadIcon />, title: "Export Checklist", desc: "Download your complete checklist as a text file." },
              ].map((feature, idx) => (
                <div key={idx} className="flex gap-3 items-start bg-(--card) border border-(--border) rounded-xl p-4">
                  <span className="text-(--primary) flex-shrink-0 mt-0.5">{feature.icon}</span>
                  <div>
                    <h4 className="font-semibold text-(--foreground) text-sm">{feature.title}</h4>
                    <p className="text-xs text-(--muted-foreground) mt-0.5">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8 mb-4">
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-primary px-10 py-5 rounded-xl text-xl font-bold inline-flex items-center gap-3 shadow-xl"
            >
              <ArrowRightIcon /> Build My Checklist Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== BUILDER ====================
  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-(--primary)">
              <HomeIcon />
            </div>
            <h1 className="heading text-center">{toolConfig?.name || "Moving Checklist"}</h1>
          </div>
          <p className="description">Track your moving progress</p>
          <button onClick={() => setShowBuilder(false)}
            className="mt-4 text-sm text-(--primary) hover:underline">
            &larr; Back to Home
          </button>
        </div>

        {/* Progress Bar */}
        <div className="bg-(--card) border border-(--border) rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-(--foreground)">Overall Progress</span>
            <span className="text-sm font-bold text-(--primary)">{progress}%</span>
          </div>
          <div className="h-4 bg-(--muted) rounded-full overflow-hidden">
            <div className="h-full bg-(--primary) rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-(--muted-foreground) mt-2">{completedItems} of {totalItems} tasks completed</p>
        </div>

        {/* Main Card */}
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">

          {/* Toolbar */}
          <div className="p-4 md:p-6 border-b border-(--border) flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              <button onClick={() => setShowAddForm(true)}
                className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <PlusIcon /> Add Item
              </button>
              <button onClick={exportChecklist}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                <DownloadIcon /> Export
              </button>
              <button onClick={resetAll}
                className="btn-secondary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 text-red-500">
                <ResetIcon /> Reset All
              </button>
            </div>

            <div className="flex items-center gap-1 bg-(--muted) rounded-lg p-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'done', label: 'Done' },
              ].map(f => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                    activeFilter === f.id ? 'bg-(--primary) text-white shadow' : 'text-(--muted-foreground) hover:text-(--foreground)'
                  }`}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* Preset Toggle */}
          <div className="px-4 md:px-6 py-3 bg-(--muted) border-b border-(--border) flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-(--foreground) cursor-pointer">
              <input type="checkbox" checked={usePresets} onChange={(e) => setUsePresets(e.target.checked)}
                className="rounded border-(--border) text-(--primary) focus:ring-(--primary)" />
              Include preset checklist items (40+ tasks)
            </label>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <div className="p-4 md:p-6 bg-(--muted) border-b border-(--border)">
              <h4 className="font-semibold text-(--foreground) mb-3">Add Custom Item</h4>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Enter task description..."
                  className="flex-1 px-4 py-2 bg-(--background) border border-(--border) rounded-lg text-(--foreground) focus:border-(--primary) focus:outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
                />
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="px-4 py-2 bg-(--background) border border-(--border) rounded-lg text-(--foreground) focus:border-(--primary) focus:outline-none"
                >
                  <option value="">Select category</option>
                  {Object.keys(PRESET_CATEGORIES).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="General">General</option>
                </select>
                <button onClick={addCustomItem}
                  className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                  <PlusIcon /> Add
                </button>
                <button onClick={() => setShowAddForm(false)}
                  className="btn-secondary px-4 py-2 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}

          {/* Checklist */}
          <div className="p-4 md:p-6">
            {Object.keys(filteredGrouped).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(filteredGrouped).map(([category, items]) => {
                  const categoryTotal = items.length;
                  const categoryDone = items.filter(i => checkedItems[i.id]).length;

                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-(--foreground) text-lg">{category}</h3>
                        <span className="text-xs text-(--muted-foreground)">
                          {categoryDone}/{categoryTotal}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {items.map(item => (
                          <div key={item.id}
                            className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                              checkedItems[item.id] ? 'bg-(--muted)' : 'bg-(--card) border border-(--border) hover:shadow-sm'
                            }`}>
                            {editingItem === item.id ? (
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="flex-1 px-3 py-1 bg-(--background) border border-(--border) rounded-lg text-sm text-(--foreground) focus:border-(--primary) focus:outline-none"
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                  autoFocus
                                />
                                <button onClick={saveEdit} className="p-1 text-green-500 hover:text-green-600">
                                  <SaveIcon />
                                </button>
                                <button onClick={() => setEditingItem(null)} className="p-1 text-(--muted-foreground) hover:text-red-500">
                                  <TrashIcon />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => toggleCheck(item.id)}
                                  className="flex items-center gap-3 flex-1 text-left"
                                >
                                  <span className={`flex-shrink-0 ${checkedItems[item.id] ? 'text-green-500' : 'text-(--muted-foreground)'}`}>
                                    {checkedItems[item.id] ? <CheckedIcon /> : <CheckIcon />}
                                  </span>
                                  <span className={`text-sm ${checkedItems[item.id] ? 'text-(--muted-foreground) line-through' : 'text-(--foreground)'}`}>
                                    {item.text}
                                  </span>
                                  {item.isPreset && (
                                    <span className="text-xs text-(--muted-foreground) opacity-50">(preset)</span>
                                  )}
                                </button>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                  <button
                                    onClick={() => startEdit(item)}
                                    className="p-1 text-(--muted-foreground) hover:text-(--primary)"
                                    title="Edit item"
                                  >
                                    <EditIcon />
                                  </button>
                                  <button
                                    onClick={() => removeItem(item.id)}
                                    className="p-1 text-(--muted-foreground) hover:text-red-500"
                                    title="Remove item"
                                  >
                                    <TrashIcon />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-(--muted-foreground) opacity-20 mb-4 flex justify-center">
                  <FolderIcon />
                </div>
                <p className="text-(--muted-foreground) text-lg">No items found</p>
                <p className="text-xs text-(--muted-foreground) mt-1">Add items or enable presets to get started</p>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-(--muted-foreground)">
          Data saved locally &bull; Good luck with your move!
        </div>
      </div>
    </div>
  );
}
