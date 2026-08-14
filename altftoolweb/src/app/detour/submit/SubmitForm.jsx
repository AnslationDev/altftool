"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";

/*
 * Suggestion form.
 *
 * Composes a mailto rather than posting to an endpoint — the same approach as
 * /request-a-tool. There is no submissions backend on this platform, and a form
 * that silently discards what people type would be worse than an honest one
 * that hands the message to their mail client.
 *
 * The address is shown in full underneath so the form is never the only route.
 *
 * Taxonomy arrives as props for the same reason as BrowseFilters: importing it
 * would drag every category's SEO copy into the bundle to populate a <select>.
 */

const CONTACT_EMAIL = "altftool@gmail.com";

export default function SubmitForm({ families, timeBands }) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState("");
  const [why, setWhy] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = `AltF Detour suggestion: ${name || url}`;
    const body = [
      `Site: ${name || "(not given)"}`,
      `URL: ${url}`,
      category ? `Suggested category: ${category}` : null,
      time ? `Suggested time band: ${time}` : null,
      "",
      "Why it belongs:",
      why || "(not given)",
    ]
      .filter((line) => line !== null)
      .join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  const field =
    "mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-[var(--dtr-accent)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="dtr-url" className="text-sm font-medium">
          Website address <span aria-hidden="true">*</span>
        </label>
        <input
          id="dtr-url"
          type="url"
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://"
          className={field}
        />
      </div>

      <div>
        <label htmlFor="dtr-name" className="text-sm font-medium">
          What is it called?
        </label>
        <input
          id="dtr-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="dtr-cat" className="text-sm font-medium">
            Where does it fit?
          </label>
          <select
            id="dtr-cat"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className={field}
          >
            <option value="">Not sure</option>
            {families.map((family) => (
              <optgroup key={family.id} label={family.name}>
                {family.categories.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dtr-time" className="text-sm font-medium">
            How long does it take to be worth it?
          </label>
          <select
            id="dtr-time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className={field}
          >
            <option value="">Not sure</option>
            {timeBands.map((band) => (
              <option key={band.id} value={band.label}>
                {band.label} — {band.hint}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dtr-why" className="text-sm font-medium">
          Why does it belong here?
        </label>
        <textarea
          id="dtr-why"
          rows={4}
          value={why}
          onChange={(event) => setWhy(event.target.value)}
          placeholder="One or two sentences is plenty. What does it do that nothing else does?"
          className={field}
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
        style={{ background: "var(--dtr-accent)", color: "var(--dtr-accent-foreground)" }}
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        Send suggestion
      </button>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
        This opens your email app with the details filled in. You can also write
        to{" "}
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="font-medium text-foreground underline-offset-2 hover:underline"
        >
          {CONTACT_EMAIL}
        </a>{" "}
        directly.
      </p>
    </form>
  );
}
