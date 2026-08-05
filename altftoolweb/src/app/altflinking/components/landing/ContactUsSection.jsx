"use client";

import React, { useState } from "react";
import { ExternalLink, Info, Mail } from "lucide-react";

const CONTACT_EMAIL = "altftool@gmail.com";

export default function ContactUsSection({ showToast = () => {} }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Buyer or agency",
    website: "",
    message: "",
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    const subject = `ALTFTool inquiry from ${formData.name.trim()}`;
    const body = [
      `Name: ${formData.name.trim()}`,
      `Email: ${formData.email.trim()}`,
      `Role: ${formData.role}`,
      `Website: ${formData.website.trim() || "Not provided"}`,
      "",
      "Message:",
      formData.message.trim(),
    ].join("\n");

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showToast("An email draft was requested. Your inquiry is sent only after you send it from your email app.");
  };

  return (
    <section className="altf-card border border-border p-6 sm:p-10" aria-labelledby="contact-heading">
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <Mail className="h-4 w-4" aria-hidden="true" />
            CONTACT BY EMAIL
          </span>
          <div className="space-y-2">
            <h2 id="contact-heading" className="text-3xl font-black tracking-tight text-foreground">
              Send the ALTFTool team an inquiry
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              Ask about listing review, placement-request details, or using the marketplace workflow. No response-time commitment is implied.
            </p>
          </div>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-surface-soft p-4 text-foreground transition hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-4 w-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[10px] font-semibold uppercase text-muted">Email</span>
              <span className="block text-sm font-bold">{CONTACT_EMAIL}</span>
            </span>
          </a>

          <div className="flex items-start gap-3 rounded-lg border border-border bg-surface-soft p-4 text-xs leading-relaxed text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <p>
              This form does not submit to a server or save your details in the browser. It prepares a draft in your email app; you must send that draft to contact us.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface-soft p-5 sm:p-6 lg:col-span-7">
          <h3 className="text-base font-bold text-foreground">Prepare an email draft</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-muted">
              Full name <span aria-hidden="true">*</span>
              <input
                type="text"
                required
                autoComplete="name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="altf-input mt-1 text-xs"
              />
            </label>
            <label className="text-xs font-semibold text-muted">
              Email <span aria-hidden="true">*</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="altf-input mt-1 text-xs"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-xs font-semibold text-muted">
              Role
              <select
                value={formData.role}
                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                className="altf-input mt-1 text-xs"
              >
                <option>Buyer or agency</option>
                <option>Publisher</option>
                <option>Other</option>
              </select>
            </label>
            <label className="text-xs font-semibold text-muted">
              Website
              <input
                type="text"
                inputMode="url"
                placeholder="example.com"
                value={formData.website}
                onChange={(event) => setFormData({ ...formData, website: event.target.value })}
                className="altf-input mt-1 text-xs"
              />
            </label>
          </div>

          <label className="block text-xs font-semibold text-muted">
            Inquiry <span aria-hidden="true">*</span>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(event) => setFormData({ ...formData, message: event.target.value })}
              className="altf-input mt-1 resize-y text-xs"
            />
          </label>

          <button type="submit" className="altf-btn-primary w-full py-3 text-xs font-bold">
            Open email draft
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </button>
        </form>
      </div>
    </section>
  );
}
