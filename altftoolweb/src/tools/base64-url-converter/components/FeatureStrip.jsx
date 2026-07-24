import { ClipboardCheck, Code2, Layers, Link, ShieldCheck, Zap } from "lucide-react";

const FEATURES = [
  {
    icon: Link,
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    iconTextClass: "text-emerald-600 dark:text-emerald-400",
    title: "URL Safe",
    description: "Converts + to - and / to _ for safe URL usage.",
  },
  {
    icon: Zap,
    iconBgClass: "bg-blue-50 dark:bg-blue-950/50",
    iconTextClass: "text-blue-600 dark:text-blue-400",
    title: "Instant Conversion",
    description: "Lightning fast conversion on your device.",
  },
  {
    icon: ShieldCheck,
    iconBgClass: "bg-purple-50 dark:bg-purple-950/50",
    iconTextClass: "text-purple-600 dark:text-purple-400",
    title: "Privacy First",
    description: "Your data never leaves your browser.",
  },
  {
    icon: Code2,
    iconBgClass: "bg-amber-50 dark:bg-amber-950/50",
    iconTextClass: "text-amber-600 dark:text-amber-400",
    title: "Dev Friendly",
    description: "Perfect for JWT, APIs, and web applications.",
  },
  {
    icon: Layers,
    iconBgClass: "bg-blue-50 dark:bg-blue-950/50",
    iconTextClass: "text-blue-600 dark:text-blue-400",
    title: "Batch Processing",
    description: "Convert large Base64 strings with ease.",
  },
  {
    icon: ClipboardCheck,
    iconBgClass: "bg-emerald-50 dark:bg-emerald-950/50",
    iconTextClass: "text-emerald-600 dark:text-emerald-400",
    title: "Clipboard Ready",
    description: "One click copy & paste support.",
  },
];

export default function FeatureStrip() {
  return (
    <section aria-label="Tool highlights" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {FEATURES.map(({ icon: Icon, iconBgClass, iconTextClass, title, description }) => (
        <div key={title} className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
          <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass} ${iconTextClass}`}>
            <Icon aria-hidden="true" size={18} className="stroke-[2.2]" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      ))}
    </section>
  );
}
