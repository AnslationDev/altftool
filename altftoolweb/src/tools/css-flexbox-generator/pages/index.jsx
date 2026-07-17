"use client";

import React, { useState, useEffect } from "react";
import { Layout, CheckCircle2, Copy, FileDown, Sliders, RefreshCw, Layers, Plus, Trash2 } from "lucide-react";

export default function ToolHome() {
  // Container Properties
  const [direction, setDirection] = useState("row");
  const [wrap, setWrap] = useState("nowrap");
  const [justifyContent, setJustifyContent] = useState("flex-start");
  const [alignItems, setAlignItems] = useState("stretch");
  const [alignContent, setAlignContent] = useState("stretch");
  const [gap, setGap] = useState(12);

  // Flex Items State
  const [items, setItems] = useState([
    { id: 1, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0 },
    { id: 2, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0 },
    { id: 3, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0 },
  ]);
  const [selectedItemId, setSelectedItemId] = useState(1);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const containerStyle = {
    display: "flex",
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent: justifyContent,
    alignItems: alignItems,
    alignContent: alignContent,
    gap: `${gap}px`,
  };

  const handleAddItem = () => {
    if (items.length >= 10) return;
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem = { id: nextId, grow: 0, shrink: 1, basis: "auto", alignSelf: "auto", order: 0 };
    setItems([...items, newItem]);
    setSelectedItemId(nextId);
  };

  const handleRemoveItem = (idToRemove) => {
    if (items.length <= 1) return;
    const updated = items.filter((item) => item.id !== idToRemove);
    setItems(updated);
    if (selectedItemId === idToRemove) {
      setSelectedItemId(updated[0].id);
    }
  };

  const updateSelectedField = (field, value) => {
    setItems(
      items.map((item) => {
        if (item.id === selectedItemId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const getSelectedItem = () => {
    return items.find((item) => item.id === selectedItemId) || items[0];
  };

  const selectedItem = getSelectedItem();

  const getCssString = () => {
    let containerCss = `.flex-container {\n  display: flex;\n  flex-direction: ${direction};\n  flex-wrap: ${wrap};\n  justify-content: ${justifyContent};\n  align-items: ${alignItems};\n  align-content: ${alignContent};\n  gap: ${gap}px;\n}`;
    
    let itemCss = "";
    items.forEach((item) => {
      const isModified = item.grow !== 0 || item.shrink !== 1 || item.basis !== "auto" || item.alignSelf !== "auto" || item.order !== 0;
      if (isModified) {
        itemCss += `\n\n.flex-item-${item.id} {\n  flex-grow: ${item.grow};\n  flex-shrink: ${item.shrink};\n  flex-basis: ${item.basis};\n  align-self: ${item.alignSelf};\n  order: ${item.order};\n}`;
      }
    });

    return containerCss + itemCss;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCssString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const textBlob = new Blob([getCssString()], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(textBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flexbox-layout.css";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Layout className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    CSS Flexbox Generator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Design, Layout
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Design CSS Flexbox layout flows dynamically. Add items, toggle parent container alignment rules, tweak item overrides, and copy production styles.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Flexbox", "Playground", "Clean CSS"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls - 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Flex Container Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                <Sliders size={14} className="text-primary" />
                Flex Container Properties
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Flex Direction */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">flex-direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                {/* Flex Wrap */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">flex-wrap</label>
                  <select
                    value={wrap}
                    onChange={(e) => setWrap(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="nowrap">nowrap</option>
                    <option value="wrap">wrap</option>
                    <option value="wrap-reverse">wrap-reverse</option>
                  </select>
                </div>

                {/* Justify Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">justify-content</label>
                  <select
                    value={justifyContent}
                    onChange={(e) => setJustifyContent(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                {/* Align Items */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">align-items</label>
                  <select
                    value={alignItems}
                    onChange={(e) => setAlignItems(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>

                {/* Align Content */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground uppercase">align-content</label>
                  <select
                    value={alignContent}
                    onChange={(e) => setAlignContent(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                  </select>
                </div>

                {/* Gap */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-foreground font-bold uppercase">
                    <span>Gap spacing</span>
                    <span className="text-primary font-mono">{gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={gap}
                    onChange={(e) => setGap(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

            </div>

            {/* Individual Flex Items Override */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" />
                  Item Details
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={items.length >= 10}
                    className="bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-primary/10 transition disabled:opacity-50"
                  >
                    <Plus size={12} /> Add Block
                  </button>
                </div>
              </div>

              {/* Selector items list */}
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => setSelectedItemId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedItemId === item.id
                          ? "bg-primary border-primary text-white"
                          : "bg-surface-soft border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      Block {item.id}
                    </button>
                    {items.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="absolute -top-1.5 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                      >
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Single item property values */}
              {selectedItem && (
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 bg-surface-soft p-4 rounded-xl border border-border/60">
                  
                  {/* grow */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">flex-grow</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedItem.grow}
                      onChange={(e) => updateSelectedField("grow", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                  {/* shrink */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">flex-shrink</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedItem.shrink}
                      onChange={(e) => updateSelectedField("shrink", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                  {/* basis */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">flex-basis</label>
                    <input
                      type="text"
                      value={selectedItem.basis}
                      onChange={(e) => updateSelectedField("basis", e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                  {/* alignSelf */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">align-self</label>
                    <select
                      value={selectedItem.alignSelf}
                      onChange={(e) => updateSelectedField("alignSelf", e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-1.5 text-xs font-bold outline-none"
                    >
                      <option value="auto">auto</option>
                      <option value="flex-start">flex-start</option>
                      <option value="flex-end">flex-end</option>
                      <option value="center">center</option>
                      <option value="baseline">baseline</option>
                      <option value="stretch">stretch</option>
                    </select>
                  </div>

                  {/* order */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">order</label>
                    <input
                      type="number"
                      value={selectedItem.order}
                      onChange={(e) => updateSelectedField("order", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                </div>
              )}

            </div>
          </div>

        {/* Visual Preview Box (Full Width) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
            Flex Container Visualizer
          </span>

          {/* Flex Box Playground */}
          <div
            className="w-full min-h-[220px] rounded-xl border border-border bg-slate-950 p-4 transition-all overflow-auto"
            style={containerStyle}
          >
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItemId(item.id)}
                className={`h-16 min-w-[60px] p-2 flex flex-col justify-center items-center rounded-lg border text-xs font-black transition cursor-pointer select-none ${
                  selectedItemId === item.id
                    ? "bg-primary border-primary text-white scale-102"
                    : "bg-surface-soft border-border text-foreground hover:border-primary/50"
                }`}
                style={{
                  flexGrow: item.grow,
                  flexShrink: item.shrink,
                  flexBasis: item.basis,
                  alignSelf: item.alignSelf,
                  order: item.order,
                }}
              >
                <span>#{item.id}</span>
                {(item.grow > 0 || item.order !== 0) && (
                  <span className="text-[7px] leading-none opacity-80 mt-1 uppercase font-semibold">
                    {item.grow > 0 ? `G:${item.grow} ` : ""}{item.order !== 0 ? `O:${item.order}` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Layout - Controls and Generated CSS Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Controls Column */}
          <div className="space-y-6">
            
            {/* Flex Container Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                <Sliders size={14} className="text-primary" />
                Flex Container Properties
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Flex Direction */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground uppercase">flex-direction</label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="row">row</option>
                    <option value="row-reverse">row-reverse</option>
                    <option value="column">column</option>
                    <option value="column-reverse">column-reverse</option>
                  </select>
                </div>

                {/* Flex Wrap */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground uppercase">flex-wrap</label>
                  <select
                    value={wrap}
                    onChange={(e) => setWrap(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="nowrap">nowrap</option>
                    <option value="wrap">wrap</option>
                    <option value="wrap-reverse">wrap-reverse</option>
                  </select>
                </div>

                {/* Justify Content */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground uppercase">justify-content</label>
                  <select
                    value={justifyContent}
                    onChange={(e) => setJustifyContent(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                    <option value="space-evenly">space-evenly</option>
                  </select>
                </div>

                {/* Align Items */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground uppercase">align-items</label>
                  <select
                    value={alignItems}
                    onChange={(e) => setAlignItems(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="baseline">baseline</option>
                  </select>
                </div>

                {/* Align Content */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-foreground uppercase">align-content</label>
                  <select
                    value={alignContent}
                    onChange={(e) => setAlignContent(e.target.value)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none"
                  >
                    <option value="stretch">stretch</option>
                    <option value="flex-start">flex-start</option>
                    <option value="flex-end">flex-end</option>
                    <option value="center">center</option>
                    <option value="space-between">space-between</option>
                    <option value="space-around">space-around</option>
                  </select>
                </div>

                {/* Gap */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-foreground font-bold uppercase">
                    <span>Gap spacing</span>
                    <span className="text-primary font-mono">{gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={gap}
                    onChange={(e) => setGap(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

            </div>

            {/* Individual Flex Items Override */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers size={14} className="text-primary" />
                  Item Overrides
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={items.length >= 10}
                    className="bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 hover:bg-primary/10 transition disabled:opacity-50"
                  >
                    <Plus size={12} /> Add Block
                  </button>
                </div>
              </div>

              {/* Selector items list */}
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => setSelectedItemId(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        selectedItemId === item.id
                          ? "bg-primary border-primary text-white"
                          : "bg-surface-soft border-border text-foreground hover:border-primary/50"
                      }`}
                    >
                      Block {item.id}
                    </button>
                    {items.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="absolute -top-1.5 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                      >
                        <Trash2 size={8} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Single item property values */}
              {selectedItem && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-surface-soft p-4 rounded-xl border border-border/60">
                  
                  {/* grow */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">grow</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedItem.grow}
                      onChange={(e) => updateSelectedField("grow", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                  {/* shrink */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">shrink</label>
                    <input
                      type="number"
                      min="0"
                      value={selectedItem.shrink}
                      onChange={(e) => updateSelectedField("shrink", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                  {/* basis */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">basis</label>
                    <input
                      type="text"
                      value={selectedItem.basis}
                      onChange={(e) => updateSelectedField("basis", e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none animate-none"
                    />
                  </div>

                  {/* alignSelf */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">align</label>
                    <select
                      value={selectedItem.alignSelf}
                      onChange={(e) => updateSelectedField("alignSelf", e.target.value)}
                      className="w-full bg-background border border-border rounded-lg p-1.5 text-xs font-bold outline-none"
                    >
                      <option value="auto">auto</option>
                      <option value="flex-start">start</option>
                      <option value="flex-end">end</option>
                      <option value="center">center</option>
                      <option value="baseline">base</option>
                      <option value="stretch">stretch</option>
                    </select>
                  </div>

                  {/* order */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase">order</label>
                    <input
                      type="number"
                      value={selectedItem.order}
                      onChange={(e) => updateSelectedField("order", parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg p-2 text-xs font-bold outline-none"
                    />
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Generated CSS Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 h-fit">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <RefreshCw size={14} className="text-primary" />
                Generated Stylesheet
              </span>
              
              <div className="flex gap-1.5">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {copied ? <CheckCircle2 size={10} className="text-primary" /> : <Copy size={10} />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition shrink-0"
                >
                  {downloaded ? <CheckCircle2 size={10} className="text-primary" /> : <FileDown size={10} />}
                  {downloaded ? "Downloaded" : "Download"}
                </button>
              </div>
            </div>

            <div className="bg-surface-soft p-4 rounded-xl border border-border font-mono text-[10px] text-foreground space-y-2 select-all max-h-[280px] overflow-y-auto leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre-wrap">{getCssString()}</pre>
            </div>
          </div>

          </div>

        </div>

      </div>
    </div>
  );
}
