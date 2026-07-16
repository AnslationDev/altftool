"use client";

import React, { useState, useEffect } from "react";
import { FileCode, CheckCircle2, Copy, Braces, Code2 } from "lucide-react";

function convertJsonToTs(obj, rootName = "RootObject", options = { useType: false, useSemicolons: true }) {
  const interfaces = [];
  const generatedNames = new Set();

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function getUniqueName(name) {
    let clean = name.replace(/[^a-zA-Z0-9]/g, "");
    clean = capitalize(clean);
    if (!clean) clean = "Nested";
    let candidate = clean;
    let counter = 2;
    while (generatedNames.has(candidate)) {
      candidate = `${clean}${counter}`;
      counter++;
    }
    generatedNames.add(candidate);
    return candidate;
  }

  function parseObject(o, interfaceName) {
    let fields = [];
    const entries = Object.entries(o);
    
    entries.forEach(([key, val]) => {
      let typeStr = "any";
      if (val === null) {
        typeStr = "any";
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          typeStr = "any[]";
        } else {
          const first = val[0];
          if (typeof first === "object" && first !== null) {
            const nestedName = getUniqueName(key + "Item");
            parseObject(first, nestedName);
            typeStr = `${nestedName}[]`;
          } else {
            typeStr = `${typeof first}[]`;
          }
        }
      } else if (typeof val === "object") {
        const nestedName = getUniqueName(key);
        parseObject(val, nestedName);
        typeStr = nestedName;
      } else {
        typeStr = typeof val;
      }
      
      const term = options.useSemicolons ? ";" : "";
      fields.push(`  ${key}: ${typeStr}${term}`);
    });

    const keyword = options.useType ? "type" : "interface";
    const divider = options.useType ? " = {" : " {";
    const lines = [
      `export ${keyword} ${interfaceName}${divider}`,
      ...fields,
      `}`
    ];
    interfaces.push(lines.join("\n"));
  }

  if (typeof obj !== "object" || obj === null) {
    const keyword = options.useType ? "type" : "interface";
    return `export ${keyword} ${rootName} = ${typeof obj};`;
  }

  const mainName = getUniqueName(rootName);
  parseObject(obj, mainName);
  
  return interfaces.reverse().join("\n\n");
}

export default function ToolHome() {
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(
      {
        id: 101,
        username: "developer_pro",
        active: true,
        address: {
          city: "San Francisco",
          zip: 94103,
          geo: { lat: 37.77, lng: -122.41 }
        },
        tags: ["react", "typescript", "tailwind"],
        history: [{ action: "login", ip: "127.0.0.1" }]
      },
      null,
      2
    )
  );
  const [tsOutput, setTsOutput] = useState("");
  const [rootName, setRootName] = useState("RootObject");
  const [useType, setUseType] = useState(false); // interface vs type
  const [useSemicolons, setUseSemicolons] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError("");
    if (!jsonInput.trim()) {
      setTsOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const output = convertJsonToTs(parsed, rootName || "RootObject", {
        useType,
        useSemicolons
      });
      setTsOutput(output);
    } catch (e) {
      setError(e.message);
      setTsOutput("");
    }
  }, [jsonInput, rootName, useType, useSemicolons]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tsOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setError("Format Failed: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <FileCode className="h-5 w-5 text-primary group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    JSON to TypeScript Converter
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Developer, Type Safety
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Convert unstructured JSON schemas into type-safe TypeScript models recursively. Generate standalone clean child interfaces instantly.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "TypeScript"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Braces size={14} className="text-primary" />
                  Input JSON Object
                </label>
                <button
                  onClick={handleFormat}
                  className="text-[10px] font-bold text-primary hover:underline px-2 py-0.5 bg-primary/5 rounded"
                >
                  Format JSON
                </button>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste raw JSON here..."
                rows={14}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
              {error && (
                <div className="text-red-500 font-mono text-[11px] bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                  ⚠️ JSON Parse Error: {error}
                </div>
              )}
            </div>

            {/* Output TS */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={14} className="text-primary" />
                  Generated TypeScript Definitions
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!!error || !tsOutput}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                >
                  {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                value={tsOutput}
                readOnly
                placeholder="TypeScript definitions will appear here..."
                rows={14}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
              />
            </div>

          </div>

          {/* Configurations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-border mt-4">
            
            {/* Root interface name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Root Type Name
              </label>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                placeholder="e.g. UserProfile"
                className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-semibold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Type Definition Formats */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                TypeScript Format
              </label>
              <select
                value={useType ? "type" : "interface"}
                onChange={(e) => setUseType(e.target.value === "type")}
                className="w-full bg-surface-soft border border-border rounded-xl p-2.5 text-xs font-bold text-foreground outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="interface">interface Name {'{ ... }'}</option>
                <option value="type">type Name = {'{ ... }'}</option>
              </select>
            </div>

            {/* Formatting Options */}
            <div className="flex flex-col justify-center gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useSemicolons}
                  onChange={(e) => setUseSemicolons(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Use Semicolons (;)
              </label>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
