/**
 * DNS Verification Flow Visual (Pure Light Theme)
 * Location: src/app/altflinking/components/visuals/DnsVerificationFlowVisual.jsx
 */
"use client";

import React, { useState } from "react";
import { Terminal, CheckCircle2, ShieldCheck, Globe, Loader, Copy } from "lucide-react";

export default function DnsVerificationFlowVisual() {
  const [copied, setCopied] = useState(false);
  const dnsRecord = "altftool-verify=abc123xyz456";

  const handleCopy = () => {
    navigator.clipboard.writeText(dnsRecord).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { icon: Globe,       label: "Domain Submitted",       done: true  },
    { icon: Terminal,    label: "DNS TXT Added",           done: true  },
    { icon: Loader,      label: "Automated Scan Running",  done: false, active: true },
    { icon: ShieldCheck, label: "Ownership Confirmed",     done: false },
  ];

  return (
    <div className="altf-card p-5 space-y-4 bg-white border border-slate-200 rounded-2xl text-xs">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900">DNS Ownership Verification</p>
          <p className="text-[10px] text-slate-500">Automated TXT record check · Anti-Fraud Engine</p>
        </div>
      </div>

      {/* DNS Record Snippet */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono">
        <Terminal className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
        <span className="flex-1 text-[11px] text-slate-700 truncate">{dnsRecord}</span>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-indigo-600 transition"
          title="Copy record"
        >
          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Verification Steps */}
      <div className="space-y-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 p-2 rounded-xl border text-[11px] font-semibold transition ${
                s.done
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : s.active
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${s.active ? "animate-spin" : ""}`} />
              <span>{s.label}</span>
              {s.done && <CheckCircle2 className="h-3.5 w-3.5 ml-auto text-indigo-600" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
