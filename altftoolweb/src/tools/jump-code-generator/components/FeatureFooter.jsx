import { ClipboardCheck, Code2, Download, History, Radar, ShieldCheck } from "lucide-react";

export default function FeatureFooter({ stats, readiness, activeType, history }) {
  const features = [
    {
      title: "Real-time Generation",
      text: `${activeType.label} updates instantly with ${stats.lines} live code lines and ${readiness.score}% readiness.`,
      icon: Radar,
    },
    {
      title: "Privacy First",
      text: "All generation, preview, copy, download, and history storage runs client-side in your browser.",
      icon: ShieldCheck,
    },
    {
      title: "Export & Copy",
      text: "Copy generated snippets or download production-ready HTML, JSX, and JavaScript files instantly.",
      icon: Download,
    },
    {
      title: "Template Logic",
      text: "Generate anchors, smooth scroll handlers, React Router navigation, buttons, and reusable snippets.",
      icon: Code2,
    },
    {
      title: "Saved History",
      text: `${history.length} saved snippet${history.length === 1 ? "" : "s"} available locally for quick reuse.`,
      icon: History,
    },
    {
      title: "Synced Preview",
      text: "Validation, template output, preview state, and code statistics stay synced as inputs change.",
      icon: ClipboardCheck,
    },
  ];

  return (
    <section className="pb-2 pt-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-black leading-tight text-blue-500 sm:text-3xl">Jump Code Generator Features</h2>
        <p className="mt-3 text-sm text-(--muted-foreground) sm:text-base">
          A secure, fast, and fully browser-based navigation code studio
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, text, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-(--border) bg-(--card)/55 p-5">
            <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-500">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-(--foreground)">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-(--muted-foreground)">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
