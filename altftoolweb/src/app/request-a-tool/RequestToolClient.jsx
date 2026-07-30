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
import "./request-tool.css";

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
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isReady = useMemo(
    () => form.toolName.trim() && form.details.trim() && form.email.trim(),
    [form.details, form.email, form.toolName],
  );

  const updateField = (field) => (event) => {
    setSent(false);
    setCopied(false);
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);

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

    // mailto: navigation must happen synchronously within the click/submit
    // gesture — Safari silently drops it if anything is awaited first.
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);

    Promise.resolve()
      .then(() => navigator.clipboard.writeText(`To: ${CONTACT_EMAIL}\nSubject: ${subject}\n\n${body}`))
      .then(() => setCopied(true))
      .catch(() => setCopied(false))
      .finally(() => setSubmitting(false));
  };

  return (
    <main className="request-tool-page">
      <section className="section request-tool-section">
        <div className="request-tool-hero">
          <h1>
            Request a <span>tool</span>
          </h1>
          <p>
            Tell us what utility, converter, calculator, generator, or workflow you want added to AltFTool. Clear requests help us plan the tools people need most.
          </p>
        </div>

        <div className="request-tool-shell">
          <div className="request-tool-grid">
            <aside className="request-tool-info-card">
              <div className="request-tool-info-inner">
              <h2>Tool request information</h2>
              <p>
                The more specific your request is, the easier it is to evaluate and plan.
              </p>

              <div className="request-tool-info-list">
                <div className="request-tool-info-row">
                  <span className="request-tool-info-icon">
                    <Mail className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="request-tool-info-title">Request inbox</span>
                    <span className="request-tool-info-text break-all">{CONTACT_EMAIL}</span>
                  </span>
                </div>

                <div className="request-tool-info-row">
                  <span className="request-tool-info-icon">
                    <Clock3 className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="request-tool-info-title">Planning review</span>
                    <span className="request-tool-info-text">Tool ideas are reviewed during product planning.</span>
                  </span>
                </div>

                <div className="request-tool-info-row">
                  <span className="request-tool-info-icon">
                    <MessageSquareText className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="request-tool-info-title">Helpful details</span>
                    <span className="request-tool-info-text">Include inputs, outputs, examples, and the problem it solves.</span>
                  </span>
                </div>
              </div>

              <div className="request-tool-guide-list">
                {requestGuides.map(({ title, description, icon: Icon }) => (
                  <div key={title} className="request-tool-guide-row">
                    <span>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="request-tool-info-title">{title}</span>
                      <span className="request-tool-guide-text">{description}</span>
                    </span>
                  </div>
                ))}
              </div>
              </div>
            </aside>

            <form
              id="request-tool-form"
              onSubmit={handleSubmit}
              className="request-tool-form"
            >
              <div className="request-tool-form-heading">
                <h2>Tell us what to build</h2>
                <p>
                  We use these details to understand the workflow, audience, and priority.
                </p>
              </div>

              <div className="request-tool-fields">
                <label className="block">
                  <span>Your name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Your name"
                    className="request-tool-input"
                  />
                </label>

                <label className="block">
                  <span>Your email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="you@example.com"
                    required
                    className="request-tool-input"
                  />
                </label>

                <label className="block">
                  <span>Tool name</span>
                  <input
                    type="text"
                    value={form.toolName}
                    onChange={updateField("toolName")}
                    placeholder="Example: Invoice splitter"
                    required
                    className="request-tool-input"
                  />
                </label>

                <label className="block">
                  <span>Request type</span>
                  <select
                    value={form.category}
                    onChange={updateField("category")}
                    className="request-tool-input"
                  >
                    {requestTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block sm:col-span-2">
                  <span>Who should this help?</span>
                  <input
                    type="text"
                    value={form.audience}
                    onChange={updateField("audience")}
                    placeholder="Creators, students, developers, marketers..."
                    className="request-tool-input"
                  />
                </label>

                <label className="block sm:col-span-2">
                  <span>Tool request</span>
                  <textarea
                    value={form.details}
                    onChange={updateField("details")}
                    placeholder="Describe the tool you want us to add"
                    required
                    rows={5}
                    className="request-tool-textarea"
                  />
                </label>
              </div>

              <div className="request-tool-actions">
                <button
                  type="submit"
                  disabled={!isReady || submitting}
                  className="request-tool-submit"
                >
                  <Send className="h-4 w-4" />
                  Send request
                </button>

                <p>
                  Opens a prefilled email to <span>{CONTACT_EMAIL}</span>.
                </p>
              </div>

              {sent ? (
                <div className="request-tool-success">
                  Your email app should open with the request details filled in.{" "}
                  {copied
                    ? `If it doesn't, the request has been copied to your clipboard — paste it into an email to ${CONTACT_EMAIL}.`
                    : `If it doesn't, send the details above directly to ${CONTACT_EMAIL}.`}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
