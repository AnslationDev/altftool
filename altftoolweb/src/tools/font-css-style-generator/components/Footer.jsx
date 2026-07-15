import { Code2, Download, Layers, ShieldCheck, Type, Wand2 } from "lucide-react";

const footerSections = [
  {
    icon: Wand2,
    title: "Working Flow",
    items: ["Enter text", "Adjust typography", "Preview instantly", "Copy or download CSS"],
  },
  {
    icon: Layers,
    title: "Best Uses",
    items: ["Hero headings", "Landing pages", "Buttons", "Paragraph styles"],
  },
  {
    icon: Code2,
    title: "Generated CSS",
    items: ["Font family", "Responsive clamp()", "Gradient text", "Text shadow"],
  },
  {
    icon: Download,
    title: "Export",
    items: ["Clipboard copy", "style.css download", "Local history", "Auto restore"],
  },
];

export default function Footer() {
  return (
    <footer className="font-css-footer mt-6">
      <div className="font-css-footer-top">
        <div className="flex items-center gap-3 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-500/15 text-cyan-500">
            <Type className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-[var(--foreground)] truncate">
              Font CSS Style Generator
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Frontend-only typography CSS, saved locally in your browser.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-xs font-bold text-teal-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          Live preview
        </span>
      </div>

      <div className="font-css-footer-grid">
        {footerSections.map((section) => {
          const Icon = section.icon;
          return (
            <section key={section.title} className="font-css-footer-panel">
              <div className="flex items-center gap-2 mb-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--foreground)]">
                  {section.title}
                </h3>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </footer>
  );
}
