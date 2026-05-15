"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clipboard,
  Code2,
  Cpu,
  Database,
  Download,
  Eye,
  FileJson,
  FileText,
  Gauge,
  Globe2,
  HardDrive,
  Lock,
  MonitorSmartphone,
  Network,
  Radar,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";
import { useSystemData } from "@/tools/device-browser-dashboard/hooks/useSystemData";
import {
  copyToClipboard,
  createTextReport,
  downloadJSON,
  downloadTXT,
} from "@/tools/device-browser-dashboard/utils/export";

const TABS = [
  { id: "overview", label: "Overview", icon: Gauge },
  { id: "hardware", label: "Hardware", icon: Cpu },
  { id: "browser", label: "Browser APIs", icon: Code2 },
  { id: "privacy", label: "Security", icon: ShieldCheck },
  { id: "report", label: "Report", icon: FileText },
];

const scoreColors = {
  good: "#16a34a",
  warn: "#d97706",
  risk: "#dc2626",
  info: "var(--primary)",
};

const metricTone = {
  good: "text-green-600",
  warn: "text-amber-600",
  risk: "text-red-600",
  info: "text-(--primary)",
};

function formatDate(value) {
  if (!value) return "Not scanned yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date(value));
}

function scoreTone(score) {
  if (score >= 75) return "good";
  if (score >= 45) return "warn";
  return "risk";
}

function fingerprintTone(score) {
  if (score >= 65) return "risk";
  if (score >= 35) return "warn";
  return "good";
}

function groupBy(items, key) {
  return items.reduce((groups, item) => {
    const group = item[key] || "Other";
    return {
      ...groups,
      [group]: [...(groups[group] || []), item],
    };
  }, {});
}

function Panel({ title, icon: Icon, eyebrow, action, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-lg border border-(--border) bg-(--card) p-4 sm:p-5 ${className}`}>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          {Icon ? (
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-(--border) bg-(--background) text-(--primary)">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{eyebrow}</p> : null}
            <h2 className="break-words text-lg font-extrabold text-(--foreground)">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ tone = "info", children }) {
  const styles = {
    good: "border-green-500/30 bg-green-500/10 text-green-600",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    risk: "border-red-500/30 bg-red-500/10 text-red-600",
    info: "border-(--border) bg-(--card) text-(--foreground)",
  };

  return (
    <span className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-full border px-3 py-1 text-center text-xs font-bold ${styles[tone]}`}>
      {children}
    </span>
  );
}

function DataRow({ label, value, strong = false }) {
  return (
    <div className="flex flex-col gap-1 border-b border-(--border) py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-5">
      <span className="text-sm font-semibold text-(--muted-foreground)">{label}</span>
      <span className={`break-words text-sm text-(--foreground) sm:max-w-[68%] sm:text-right ${strong ? "font-extrabold" : "font-semibold"}`}>
        {value || "N/A"}
      </span>
    </div>
  );
}

function ScoreDial({ label, value, detail, icon: Icon, tone = "info" }) {
  const safeValue = Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : 0;
  const color = scoreColors[tone] || scoreColors.info;

  return (
    <article className="rounded-lg border border-(--border) bg-(--card) p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
          <p className={`mt-2 text-3xl font-black ${metricTone[tone]}`}>{safeValue}%</p>
        </div>
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(${color} ${safeValue * 3.6}deg, var(--background) 0deg)`,
          }}
        >
          <div className="grid h-10 w-10 place-items-center rounded-full border border-(--border) bg-(--card) text-(--primary)">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      <p className="mx-auto mt-4 max-w-[12rem] text-sm font-medium leading-relaxed text-(--muted-foreground)">{detail}</p>
    </article>
  );
}

function SignalRow({ label, value, icon: Icon, tone = "info" }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border) py-3 last:border-b-0">
      <div className="flex min-w-32 flex-1 items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-(--border) bg-(--background) text-(--primary)">
          <Icon className="h-4 w-4" />
        </div>
        <span className="min-w-0 whitespace-normal text-sm font-bold text-(--foreground)">{label}</span>
      </div>
      <span className="shrink-0">
        <StatusBadge tone={tone}>{value || "N/A"}</StatusBadge>
      </span>
    </div>
  );
}

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="mb-3 flex items-center gap-2 text-(--primary)">
        <Icon className="h-4 w-4 shrink-0" />
        <p className="min-w-0 break-words text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">{label}</p>
      </div>
      <p className="break-words text-sm font-extrabold text-(--foreground)">{value || "N/A"}</p>
    </div>
  );
}

function CapabilityCard({ capability }) {
  const Icon = capability.supported ? CheckCircle2 : XCircle;

  return (
    <div className="min-w-0 rounded-lg border border-(--border) bg-(--card) p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="min-w-0 break-words text-sm font-extrabold text-(--foreground)">{capability.label}</h3>
        <Icon className={`h-5 w-5 ${capability.supported ? "text-green-600" : "text-red-600"}`} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">{capability.group}</p>
      <p className="mt-2 text-sm leading-relaxed text-(--muted-foreground)">{capability.detail}</p>
    </div>
  );
}

function PermissionRow({ permission }) {
  const tone = permission.tone === "success" ? "good" : permission.tone === "warning" ? "warn" : "info";

  return (
    <div className="flex flex-col gap-3 border-b border-(--border) py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <span className="text-sm font-bold text-(--foreground)">{permission.label}</span>
      <StatusBadge tone={tone}>{permission.status}</StatusBadge>
    </div>
  );
}

function DetailGrid({ rows }) {
  return (
    <div className="tool-card-grid">
      {rows.map(([label, value, Icon = Sparkles]) => (
        <StatTile key={label} label={label} value={value} icon={Icon} />
      ))}
    </div>
  );
}

function OverviewTab({ data }) {
  const topCapabilities = data.capabilities.slice(0, 10);

  return (
    <div className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Live Environment Snapshot" eyebrow="Scan summary" icon={Radar}>
        <div className="tool-card-grid">
          <StatTile label="Browser" value={`${data.browser.name || "N/A"} ${data.browser.version || ""}`.trim()} icon={Globe2} />
          <StatTile label="Operating System" value={data.device.os} icon={MonitorSmartphone} />
          <StatTile label="Device Type" value={data.device.deviceType} icon={Cpu} />
          <StatTile label="Viewport" value={data.screen.viewport} icon={Gauge} />
          <StatTile label="GPU Renderer" value={data.gpu.renderer} icon={Zap} />
          <StatTile label="Timezone" value={data.region.timezone} icon={Network} />
        </div>
      </Panel>

      <Panel title="Capability Board" eyebrow="First-pass support check" icon={Sparkles}>
        <div className="tool-compact-grid">
          {topCapabilities.map((capability) => (
            <CapabilityCard key={capability.key} capability={capability} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function HardwareTab({ data }) {
  return (
    <div className="grid gap-6 2xl:grid-cols-2">
      <Panel title="Device Profile" eyebrow="Hardware identity" icon={Cpu}>
        {[
          ["Operating System", data.device.os],
          ["Platform", data.device.platform],
          ["Vendor", data.device.vendor],
          ["Device Type", data.device.deviceType],
          ["CPU", data.device.cpuCores],
          ["Memory", data.device.ram],
          ["Touch", data.device.touchSupport],
          ["Pointer", data.device.pointer],
        ].map(([label, value]) => (
          <DataRow key={label} label={label} value={value} strong={label === "Operating System"} />
        ))}
      </Panel>

      <Panel title="Display & GPU" eyebrow="Render stack" icon={MonitorSmartphone}>
        {[
          ["Screen Resolution", data.screen.resolution],
          ["Available Resolution", data.screen.availableResolution],
          ["Viewport", data.screen.viewport],
          ["Pixel Ratio", data.screen.pixelRatio],
          ["Orientation", data.screen.orientation],
          ["Color Depth", data.screen.colorDepth],
          ["Fullscreen", data.screen.fullscreen],
          ["GPU Vendor", data.gpu.vendor],
          ["GPU Renderer", data.gpu.renderer],
          ["WebGL 1", data.gpu.webgl1 ? "Supported" : "Not supported"],
          ["WebGL 2", data.gpu.webgl2 ? "Supported" : "Not supported"],
        ].map(([label, value]) => (
          <DataRow key={label} label={label} value={value} strong={label === "GPU Renderer"} />
        ))}
      </Panel>

      <Panel title="Power & Network" eyebrow="Runtime connection" icon={Wifi}>
        {[
          ["Battery Status", data.battery.status],
          ["Battery Level", data.battery.level],
          ["Charging", data.battery.charging],
          ["Online", data.network.online],
          ["Effective Type", data.network.effectiveType],
          ["Downlink", data.network.downlink],
          ["Latency", data.network.rtt],
          ["Save Data", data.network.saveData],
        ].map(([label, value]) => (
          <DataRow key={label} label={label} value={value} />
        ))}
      </Panel>

      <Panel title="Storage & Media" eyebrow="Local access" icon={HardDrive}>
        {[
          ["Local Storage", data.storage.localStorage],
          ["Session Storage", data.storage.sessionStorage],
          ["IndexedDB", data.storage.indexedDB],
          ["Cache Storage", data.storage.cacheStorage],
          ["Quota", data.storage.quota],
          ["Used", data.storage.used],
          ["Persistence", data.storage.persisted],
          ["Cameras", data.media.cameras],
          ["Microphones", data.media.microphones],
          ["Speakers", data.media.speakers],
          ["Device Labels", data.media.labelsVisible],
        ].map(([label, value]) => (
          <DataRow key={label} label={label} value={value} />
        ))}
      </Panel>
    </div>
  );
}

function BrowserTab({ data }) {
  const groupedCapabilities = groupBy(data.capabilities, "group");

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 2xl:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Browser Context" eyebrow="Runtime identity" icon={Globe2}>
          {[
            ["Browser", data.browser.name],
            ["Version", data.browser.version],
            ["Engine", data.browser.engine],
            ["Languages", data.browser.languages],
            ["Cookies", data.browser.cookies],
            ["Online", data.browser.online],
            ["Dark Mode", data.browser.darkMode],
          ].map(([label, value]) => (
            <DataRow key={label} label={label} value={value} strong={label === "Browser"} />
          ))}
        </Panel>

        <Panel title="User Agent" eyebrow="Raw browser signature" icon={Code2}>
          <pre className="min-h-40 whitespace-pre-wrap rounded-lg border border-(--border) bg-(--background) p-4 font-mono text-xs leading-relaxed text-(--foreground)">
            {data.browser.userAgent || "N/A"}
          </pre>
        </Panel>
      </div>

      <Panel title="Client Hints & Region" eyebrow="Locale and UA data" icon={Network}>
        <DetailGrid
          rows={[
            ["UA Platform", data.userAgentData.platform, MonitorSmartphone],
            ["UA Brands", data.userAgentData.brands, Globe2],
            ["Architecture", data.userAgentData.architecture, Cpu],
            ["Bitness", data.userAgentData.bitness, Database],
            ["Model", data.userAgentData.model, MonitorSmartphone],
            ["Full Version", data.userAgentData.fullVersion, Code2],
            ["Locale", data.region.locale, Globe2],
            ["Language", data.region.language, Globe2],
            ["Calendar", data.region.calendar, FileText],
            ["Numbering System", data.region.numberingSystem, Gauge],
          ]}
        />
      </Panel>

      {Object.entries(groupedCapabilities).map(([group, capabilities]) => (
        <Panel key={group} title={`${group} Support`} eyebrow={`${capabilities.length} browser checks`} icon={Zap}>
          <div className="tool-compact-grid">
            {capabilities.map((capability) => (
              <CapabilityCard key={capability.key} capability={capability} />
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}

function PrivacyTab({ data }) {
  return (
    <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Security Context" eyebrow="Browser isolation" icon={Lock}>
        {[
          ["Secure Context", data.security.secureContext],
          ["Protocol", data.security.protocol],
          ["Cross-Origin Isolated", data.security.crossOriginIsolated],
          ["Cookies", data.security.cookies],
          ["Do Not Track", data.security.doNotTrack],
          ["Global Privacy Control", data.security.globalPrivacyControl],
          ["Referrer Policy", data.security.referrerPolicy],
        ].map(([label, value]) => (
          <DataRow key={label} label={label} value={value} strong={label === "Secure Context"} />
        ))}
      </Panel>

      <Panel title="Permission State" eyebrow="Prompt availability" icon={ShieldCheck}>
        <div>
          {data.permissions.map((permission) => (
            <PermissionRow key={permission.name} permission={permission} />
          ))}
          {!data.permissions.length ? (
            <p className="text-sm font-semibold text-(--muted-foreground)">Permission API data is not available yet.</p>
          ) : null}
        </div>
      </Panel>

      <Panel title="Fingerprint Surface Signals" eyebrow="Readable browser signals" icon={Eye} className="lg:col-span-2">
        <div className="tool-card-grid">
          {data.fingerprint.signals.map((signal) => (
            <div key={signal.label} className="rounded-lg border border-(--border) bg-(--background) p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-(--foreground)">{signal.label}</h3>
                <StatusBadge tone={signal.weight >= 12 ? "warn" : "info"}>+{signal.weight}</StatusBadge>
              </div>
              <p className="text-sm leading-relaxed text-(--muted-foreground)">{signal.detail}</p>
            </div>
          ))}
          {!data.fingerprint.signals.length ? (
            <p className="text-sm font-semibold text-(--muted-foreground)">Scan complete hone ke baad signals yahan dikhenge.</p>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function ReportTab({ data, reportText, copied, onCopy }) {
  return (
    <Panel
      title="Exportable Report"
      eyebrow="Copy or download"
      icon={Database}
      action={
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={onCopy} type="button">
            <Clipboard />
            {copied ? "Copied" : "Copy Report"}
          </button>
          <button className="btn-secondary" onClick={() => downloadJSON(data)} type="button">
            <FileJson />
            JSON
          </button>
          <button className="btn-secondary" onClick={() => downloadTXT(data)} type="button">
            <Download />
            TXT
          </button>
        </div>
      }
    >
      <pre className="max-h-[560px] overflow-auto rounded-lg border border-(--border) bg-(--background) p-4 text-xs leading-relaxed text-(--foreground)">
        {reportText}
      </pre>
    </Panel>
  );
}

export default function DeviceDashboardEntry() {
  const { data, loading, error, refresh } = useSystemData();
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);
  const reportText = useMemo(() => createTextReport(data), [data]);
  const compatibilityTone = scoreTone(data.scores.compatibility);
  const securityTone = scoreTone(data.scores.security);
  const surfaceTone = fingerprintTone(data.scores.fingerprint);

  const handleCopyJson = async () => {
    const success = await copyToClipboard(JSON.stringify(data, null, 2));
    setCopied(success);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCopyReport = async () => {
    const success = await copyToClipboard(reportText);
    setCopied(success);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const renderTab = () => {
    if (activeTab === "hardware") return <HardwareTab data={data} />;
    if (activeTab === "browser") return <BrowserTab data={data} />;
    if (activeTab === "privacy") return <PrivacyTab data={data} />;
    if (activeTab === "report") {
      return <ReportTab data={data} reportText={reportText} copied={copied} onCopy={handleCopyReport} />;
    }
    return <OverviewTab data={data} />;
  };

  return (
    <main className="mx-auto max-w-[1240px] px-4 pb-12 pt-8 text-(--foreground)">
      <header className="text-center">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <StatusBadge tone={loading ? "warn" : "good"}>
              {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {loading ? "Scanning" : "Live Scan Ready"}
            </StatusBadge>
            <StatusBadge tone={data.browser.online === "Online" ? "good" : "risk"}>
              <Wifi className="h-3.5 w-3.5" />
              {data.browser.online || "Checking network"}
            </StatusBadge>
          </div>
          <h1 className="heading mx-auto max-w-5xl text-center">
            Device & Browser Dashboard
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center">
            Debug browser APIs, hardware signals, privacy surface, permissions, GPU, storage, network, and exportable reports in one polished client-side command center.
          </p>
        </div>

        <div className="tool-card-grid mx-auto mt-8 w-full max-w-4xl">
          <ScoreDial
            label="Compatibility"
            value={data.scores.compatibility}
            detail={`${data.scores.supportedCapabilities}/${data.scores.totalCapabilities} browser checks ready`}
            icon={Gauge}
            tone={compatibilityTone}
          />
          <ScoreDial
            label="Security"
            value={data.scores.security}
            detail={data.security.secureContext || "Context still scanning"}
            icon={ShieldCheck}
            tone={securityTone}
          />
          <ScoreDial
            label="Surface"
            value={data.scores.fingerprint}
            detail={data.scores.fingerprintLabel || data.fingerprint.label}
            icon={Eye}
            tone={surfaceTone}
          />
        </div>
      </header>

      <section className="mt-8 grid gap-4 2xl:grid-cols-[1.25fr_0.75fr]">
        <Panel title="Environment Intelligence Panel" eyebrow="Last scan" icon={MonitorSmartphone}>
          <p className="max-w-3xl text-sm leading-relaxed text-(--muted-foreground)">
            Saara detection browser ke andar hota hai. Data server par send nahi hota. Use this panel for quick debugging before releasing browser-heavy features.
          </p>
          <div className="tool-card-grid mt-5">
            <StatTile label="Scanned" value={formatDate(data.summary.scannedAt)} icon={Radar} />
            <StatTile label="OS" value={data.device.os} icon={MonitorSmartphone} />
            <StatTile label="Browser" value={data.browser.name} icon={Globe2} />
            <StatTile label="GPU" value={data.gpu.vendor} icon={Zap} />
          </div>
          <div className="tool-action-grid mt-5">
            <button className="btn-primary w-full px-3" onClick={refresh} disabled={loading} type="button">
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Rescan Device
            </button>
            <button className="btn-secondary w-full px-3" onClick={handleCopyJson} type="button">
              <Clipboard />
              {copied ? "Copied" : "Copy JSON"}
            </button>
            <button className="btn-secondary w-full px-3" onClick={() => downloadJSON(data)} type="button">
              <FileJson />
              Download JSON
            </button>
            <button className="btn-secondary w-full px-3" onClick={() => downloadTXT(data)} type="button">
              <Download />
              Download TXT
            </button>
          </div>
        </Panel>

        <Panel title="Instant Signals" eyebrow="Status board" icon={Sparkles}>
          <SignalRow
            label="Browser Status"
            value={data.browser.online || "Unknown"}
            icon={Wifi}
            tone={data.browser.online === "Online" ? "good" : "risk"}
          />
          <SignalRow
            label="Secure Context"
            value={data.security.secureContext || "Scanning"}
            icon={Lock}
            tone={data.security.secureContext === "Secure context" ? "good" : "warn"}
          />
          <SignalRow
            label="Fingerprint Surface"
            value={data.fingerprint.label || "Scanning"}
            icon={Eye}
            tone={surfaceTone}
          />
          <SignalRow
            label="API Coverage"
            value={`${data.scores.supportedCapabilities}/${data.scores.totalCapabilities}`}
            icon={Code2}
            tone={compatibilityTone}
          />
        </Panel>
      </section>

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-600">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <nav className="tool-tab-grid mt-6 rounded-lg border border-(--border) bg-(--card) p-2" aria-label="Dashboard sections">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "btn-primary w-full" : "btn-secondary w-full"}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              <Icon />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">{renderTab()}</div>
    </main>
  );
}
