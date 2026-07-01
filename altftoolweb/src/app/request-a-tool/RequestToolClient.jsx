"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  Lightbulb,
  Mail,
  MessageSquareText,
  Send,
} from "lucide-react";

const CONTACT_EMAIL = "altftool@gmail.com";

const requestTypes = [
  "Converter",
  "Calculator",
  "Image/PDF tool",
  "Developer helper",
  "AI workflow",
  "Productivity utility",
  "Other",
];

const requestGuides = [
  {
    title: "Clear problem",
    description: "Tell us what the tool should solve and who it helps.",
    icon: Lightbulb,
  },
  {
    title: "Useful inputs",
    description: "Add sample inputs, outputs, formats, or links if you have them.",
    icon: ClipboardList,
  },
  {
    title: "Tool review",
    description: "Strong requests help us prioritize future AltFTool builds.",
    icon: CheckCircle2,
  },
];

const initialForm = {
  name: "",
  email: "",
  toolName: "",
  category: requestTypes[0],
  audience: "",
  details: "",
};

export default function RequestToolClient() {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);

  const isReady = useMemo(
    () => form.toolName.trim() && form.details.trim() && form.email.trim(),
    [form.details, form.email, form.toolName],
  );

  const updateField = (field) => (event) => {
    setSent(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = `AltFTool tool request: ${form.toolName || "New tool idea"}`;
    const body = [
      `Name: ${form.name || "Not provided"}`,
      `Email: ${form.email || "Not provided"}`,
      `Tool name: ${form.toolName || "Not provided"}`,
      `Category: ${form.category || "Not provided"}`,
      `Who it helps: ${form.audience || "Not provided"}`,
      "",
      "Tool idea:",
      form.details || "Not provided",
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <main className="relative overflow-hidden bg-(--background) text-(--foreground)">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_12%,transparent),color-mix(in_srgb,var(--secondary)_8%,transparent)_58%,transparent)]" />
      <section className="section relative pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-normal text-(--foreground) sm:text-5xl">
            Request a tool
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-(--muted-foreground) sm:text-base">
            Tell us what utility, converter, calculator, generator, or workflow you want added to AltFTool. Clear requests help us plan the tools people need most.
          </p>
        </div>

        <div className="mx-auto mt-7 max-w-6xl rounded-[var(--anslation-ds-radius-xl)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-lg)] sm:mt-8 sm:p-4">
          <div className="grid gap-5 lg:grid-cols-[0.88fr_1.62fr]">
            <aside className="relative overflow-hidden rounded-[var(--anslation-ds-radius-lg)] bg-[linear-gradient(145deg,var(--primary),var(--primary-active))] p-6 text-(--primary-foreground) sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--secondary)_22%,transparent),transparent)]" />
              <div className="relative">
              <h2 className="text-2xl font-bold tracking-normal">Tool request information</h2>
              <p className="mt-3 text-sm leading-6 opacity-85">
                The more specific your request is, the easier it is to evaluate and plan.
              </p>

              <div className="mt-8 space-y-5">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary-foreground)/15">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">Request inbox</span>
                    <span className="mt-1 block break-all text-sm opacity-85">{CONTACT_EMAIL}</span>
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary-foreground)/15">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">Planning review</span>
                    <span className="mt-1 block text-sm opacity-85">Tool ideas are reviewed during product planning.</span>
                  </span>
                </div>

                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] bg-(--primary-foreground)/15">
                    <MessageSquareText className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">Helpful details</span>
                    <span className="mt-1 block text-sm opacity-85">Include inputs, outputs, examples, and the problem it solves.</span>
                  </span>
                </div>
              </div>

              <div className="mt-8 space-y-4 border-t border-(--primary-foreground)/20 pt-6">
                {requestGuides.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius-sm)] bg-(--primary-foreground)/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">{title}</span>
                      <span className="mt-1 block text-xs leading-5 opacity-80">{description}</span>
                    </span>
                  </div>
                ))}
              </div>
              </div>
            </aside>

            <form
              id="request-tool-form"
              onSubmit={handleSubmit}
              className="p-2 sm:p-5 lg:p-7"
            >
              <div className="mb-7">
                <h2 className="text-2xl font-bold tracking-normal text-(--foreground)">Tell us what to build</h2>
                <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                  We use these details to understand the workflow, audience, and priority.
                </p>
              </div>

              <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold text-(--muted-foreground)">Your name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Your name"
                    className="mt-2 h-11 w-full border-0 border-b border-(--border) bg-transparent px-0 text-sm font-semibold text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-0"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-(--muted-foreground)">Your email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="you@example.com"
                    required
                    className="mt-2 h-11 w-full border-0 border-b border-(--border) bg-transparent px-0 text-sm font-semibold text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-0"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-(--muted-foreground)">Tool name</span>
                  <input
                    type="text"
                    value={form.toolName}
                    onChange={updateField("toolName")}
                    placeholder="Example: Invoice splitter"
                    required
                    className="mt-2 h-11 w-full border-0 border-b border-(--border) bg-transparent px-0 text-sm font-semibold text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-0"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-(--muted-foreground)">Request type</span>
                  <select
                    value={form.category}
                    onChange={updateField("category")}
                    className="mt-2 h-11 w-full border-0 border-b border-(--border) bg-transparent px-0 text-sm font-semibold text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-0"
                  >
                    {requestTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-(--muted-foreground)">Who should this help?</span>
                  <input
                    type="text"
                    value={form.audience}
                    onChange={updateField("audience")}
                    placeholder="Creators, students, developers, marketers..."
                    className="mt-2 h-11 w-full border-0 border-b border-(--border) bg-transparent px-0 text-sm font-semibold text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-0"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-(--primary)">Tool request</span>
                  <textarea
                    value={form.details}
                    onChange={updateField("details")}
                    placeholder="Describe the tool you want us to add"
                    required
                    rows={5}
                    className="mt-2 w-full resize-y border-0 border-b border-(--primary) bg-transparent px-0 py-3 text-sm font-semibold leading-6 text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary-active) focus:ring-0"
                  />
                </label>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={!isReady}
                  className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-5 text-sm font-bold text-(--primary-foreground) shadow-[var(--anslation-ds-shadow-sm)] transition hover:bg-(--primary-active) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  Send request
                </button>

                <p className="text-xs leading-5 text-(--muted-foreground)">
                  Opens a prefilled email to <span className="font-semibold text-(--foreground)">{CONTACT_EMAIL}</span>.
                </p>
              </div>

              {sent ? (
                <div className="mt-4 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--muted) p-3 text-sm font-semibold text-(--foreground)">
                  Your email app should open with the request details filled in.
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
