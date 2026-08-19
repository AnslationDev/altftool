"use client";

import { Shield, EyeOff, Cpu, Lock } from "lucide-react";

export default function PrivacySecuritySection() {
  const privacyPillars = [
    {
      icon: EyeOff,
      title: "Zero Data Tracking",
      description: "We do not track your browsing history, clicks, or search activity.",
    },
    {
      icon: Cpu,
      title: "100% Local Execution",
      description: "All core operations run isolated directly within your browser runtime.",
    },
    {
      icon: Lock,
      title: "Minimal Permissions",
      description: "Only requests essential browser access strictly needed for its functionality.",
    },
    {
      icon: Shield,
      title: "Manifest V3 Compliant",
      description: "Built according to Chrome's strict security standards and store policies.",
    },
  ];

  return (
    <section className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)] border border-[var(--border)] shadow-sm space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[var(--border)]">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="w-3.5 h-3.5" />
            <span>Privacy & Security Guarantee</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--foreground)] tracking-tight">
            Your Data Stays Yours
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            We believe productivity tools should respect user privacy. This extension is engineered from the ground up to protect your digital footprint.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {privacyPillars.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div key={idx} className="space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-[var(--primary)] border border-emerald-500/20 flex items-center justify-center">
                <IconComp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
