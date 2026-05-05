"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Award,
  Cpu,
  MemoryStick,
  AlertTriangle,
  ShieldAlert,
  Gauge,
  Wrench,
} from "lucide-react";

function KpiCard({ label, value, sublabel, icon: Icon, accent = "blue", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="soft-card p-5">
        {/* Decorative gradient line */}
        <div className="card-glow-line" />
        <div className="relative">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="icon-badge">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="mt-3 text-4xl font-extrabold tracking-tight text-foreground count-pop"
          >
            {value}
          </motion.p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-primary">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{sublabel}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniCard({ label, value, icon: Icon, tone = "default", delay = 0 }) {
  const toneClass =
    tone === "danger"
      ? "text-red-600 dark:text-red-400"
      : tone === "warn"
        ? "text-blue-600 dark:text-blue-400"
        : tone === "good"
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-800";
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="soft-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <div className="icon-badge-soft">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p
          className={`mt-2 text-2xl font-extrabold tracking-tight ${toneClass} count-pop`}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );
}

export default function ResultCards({ metrics }) {
  const {
    responseTime,
    cpuUsage,
    ramUsage,
    errorRate,
    timeoutRisk,
    crashProbability,
    safeTrafficLimit,
    bottleneck,
  } = metrics;

  const errorTone =
    errorRate > 8 ? "danger" : errorRate > 3 ? "warn" : "good";
  const cpuTone =
    cpuUsage > 90 ? "danger" : cpuUsage > 70 ? "warn" : "good";
  const ramTone =
    ramUsage > 90 ? "danger" : ramUsage > 70 ? "warn" : "good";

  return (
    <div className="space-y-6">
      {/* Top 3 hero KPIs (like screenshot) */}
      <div className="grid gap-6 md:grid-cols-3">
        <KpiCard
          label="Estimated Response Time"
          value={`${Math.round(responseTime)} ms`}
          sublabel="Predicted under current load"
          icon={Calendar}
          delay={0}
        />
        <KpiCard
          label="Safe Traffic Limit"
          value={`${safeTrafficLimit.toLocaleString()}/s`}
          sublabel="Max sustainable req/sec"
          icon={TrendingUp}
          delay={0.1}
        />
        <KpiCard
          label="Bottleneck Cause"
          value={bottleneck}
          sublabel="Primary limiting resource"
          icon={Award}
          delay={0.2}
        />
      </div>

      {/* Secondary metrics - balanced 2x3 grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
        <MiniCard
          label="CPU Usage"
          value={`${cpuUsage.toFixed(1)}%`}
          icon={Cpu}
          tone={cpuTone}
          delay={0.1}
        />
        <MiniCard
          label="RAM Usage"
          value={`${ramUsage.toFixed(1)}%`}
          icon={MemoryStick}
          tone={ramTone}
          delay={0.15}
        />
        <MiniCard
          label="Error Rate"
          value={`${errorRate.toFixed(1)}%`}
          icon={AlertTriangle}
          tone={errorTone}
          delay={0.2}
        />
        <MiniCard
          label="Timeout Risk"
          value={timeoutRisk}
          icon={ShieldAlert}
          tone={
            timeoutRisk === "High"
              ? "danger"
              : timeoutRisk === "Medium"
                ? "warn"
                : "good"
          }
          delay={0.25}
        />
        <MiniCard
          label="Crash Probability"
          value={`${crashProbability.toFixed(0)}%`}
          icon={Gauge}
          tone={
            crashProbability > 60
              ? "danger"
              : crashProbability > 25
                ? "warn"
                : "good"
          }
          delay={0.3}
        />
        <MiniCard
          label="Mitigation"
          value="Auto-tuned"
          icon={Wrench}
          tone="default"
          delay={0.35}
        />
      </div>
    </div>
  );
}
