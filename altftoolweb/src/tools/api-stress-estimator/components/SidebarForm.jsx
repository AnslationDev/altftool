"use client";

import { Plus, Settings2 } from "lucide-react";

const methodOptions = ["GET", "POST", "PUT", "DELETE"];
const runtimeOptions = ["Node.js", "Python", "Go", "Java"];
const dbOptions = ["Postgres", "MySQL", "MongoDB", "Redis"];
const hostingOptions = ["VPS", "Serverless", "Kubernetes", "Dedicated"];

function Field({ label, children }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

export default function SidebarForm({ config, onChange }) {
  const update = (key, value) => onChange({ ...config, [key]: value });

  return (
    <div className="soft-card p-5">
      {/* Decorative gradient line */}
      <div className="card-glow-line" />

      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="icon-badge">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Configure API Endpoint
            </h3>
            <p className="text-xs text-muted-foreground">
              Define your server + endpoint to estimate stress
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Endpoint URL">
            <input
              type="text"
              className="field"
              value={config.endpoint}
              onChange={(e) => update("endpoint", e.target.value)}
              placeholder="https://api.example.com/v1/users"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="HTTP Method">
              <select
                className="field"
                value={config.method}
                onChange={(e) => update("method", e.target.value)}
              >
                {methodOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Runtime">
              <select
                className="field"
                value={config.runtime}
                onChange={(e) => update("runtime", e.target.value)}
              >
                {runtimeOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Avg Response Time (ms)">
              <input
                type="number"
                min={10}
                className="field"
                value={config.baseResponseTime}
                onChange={(e) =>
                  update("baseResponseTime", Number(e.target.value) || '')
                }
              />
            </Field>
            <Field label="Concurrent Users">
              <input
                type="number"
                min={1}
                className="field"
                value={config.concurrentUsers}
                onChange={(e) =>
                  update("concurrentUsers", Number(e.target.value) || '')
                }
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="CPU Cores">
              <input
                type="number"
                min={1}
                className="field"
                value={config.cpuCores}
                onChange={(e) => update("cpuCores", Number(e.target.value) || '')}
              />
            </Field>
            <Field label="RAM (GB)">
              <input
                type="number"
                min={1}
                className="field"
                value={config.ramGb}
                onChange={(e) => update("ramGb", Number(e.target.value) || '')}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Database Type">
              <select
                className="field"
                value={config.dbType}
                onChange={(e) => update("dbType", e.target.value)}
              >
                {dbOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Hosting">
              <select
                className="field"
                value={config.hostingType}
                onChange={(e) => update("hostingType", e.target.value)}
              >
                {hostingOptions.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted p-3">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                Cache Enabled
              </span>
            </div>
            <button
              type="button"
              onClick={() => update("cacheEnabled", !config.cacheEnabled)}
              className={`relative h-6 w-11 rounded-full transition ${
                config.cacheEnabled ? "bg-gray-400" : "bg-gray-300"
              }`}
              aria-pressed={config.cacheEnabled}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition ${
                  config.cacheEnabled ? "left-[22px] bg-blue-600" : "left-0.5 bg-blue-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
