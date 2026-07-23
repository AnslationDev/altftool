"use client";

import { useState } from "react";
import { Contact, Mail, MapPin, Phone } from "lucide-react";
import {
  HEX,
  PreviewHeading,
  PreviewShell,
  PrimaryBtn,
  SectionFrame,
  SettingsCard,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_CONTACT_SETTINGS,
  saveContactSettings,
  subscribeContactSettings,
} from "./service/contact.service";

export default function ThestylelifeContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Contact className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TheStyleLife Contact Us</h1>
            <p className="text-sm text-gray-500">
              Manage the /contact page hero, info cards, and form copy. The form itself stays a client-side no-op — this manages labels only.
            </p>
          </div>
        </div>

        <PageSection />
      </div>
    </div>
  );
}

/**
 * TheStyleLife's `contact/settings` doc holds the page hero, info cards, AND
 * the form's field labels + success state in one place (unlike Shophobia's
 * split `contact/settings` + `contact/form` docs) — so this is a single
 * SectionFrame/SettingsCard pair covering the full field set.
 */
function PageSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_SETTINGS);
  return (
    <SectionFrame
      index={1}
      icon={MapPin}
      title="Contact Page"
      subtitle="Hero copy, info cards, the reasons dropdown, and the form's field labels & success state."
      preview={<ContactPreview data={form} />}
    >
      <SettingsCard
        eyebrow="Contact Page"
        title="Page & form copy"
        defaults={DEFAULT_CONTACT_SETTINGS}
        subscribe={subscribeContactSettings}
        save={saveContactSettings}
        errorLabel="contact page"
        onChange={setForm}
        fields={[
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Subheading", type: "textarea", rows: 2 },
          { key: "email", label: "Email", type: "text", half: true },
          { key: "phone", label: "Phone", type: "text", half: true },
          { key: "address", label: "Address", type: "text", half: true },
          { key: "hours", label: "Hours", type: "text", half: true },
          {
            key: "reasons",
            label: "Reasons",
            type: "list",
            placeholder: "Start a new brand or website project",
            hint: "One option per row — populates the form's \"What can we help with?\" dropdown.",
          },
          { key: "nameLabel", label: "Name Field Label", type: "text", half: true },
          { key: "emailLabel", label: "Email Field Label", type: "text", half: true },
          { key: "reasonLabel", label: "Reason Field Label", type: "text", half: true },
          { key: "messageLabel", label: "Message Field Label", type: "text", half: true },
          { key: "submitLabel", label: "Submit Button", type: "text", half: true },
          { key: "successTitle", label: "Success Title", type: "text", half: true },
          { key: "successBody", label: "Success Body", type: "textarea", rows: 2 },
        ]}
      />
    </SectionFrame>
  );
}

/* ------------------------------- preview -------------------------------- */

function ContactPreview({ data }) {
  const cards = [
    { icon: Mail, label: "Email", value: data.email },
    { icon: Phone, label: "Phone", value: data.phone },
    { icon: MapPin, label: "Studio", value: data.address },
  ];
  const reasons = Array.isArray(data.reasons) ? data.reasons.filter(Boolean) : [];

  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <PreviewHeading lead={data.heading} className="text-lg" />
          <p className="mt-2 text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subheading}</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          {cards.map((card) => (
            <div key={card.label} className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
              <card.icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.accent }} />
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{card.label}</p>
                <p className="truncate text-xs" style={{ color: HEX.fg }}>{card.value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
            <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>Hours</p>
            <p className="text-xs" style={{ color: HEX.fg }}>{data.hours}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 border-t pt-5" style={{ borderColor: HEX.border }}>
          <PreviewField label={data.nameLabel || "Name"} />
          <PreviewField label={data.emailLabel || "Email"} />
          <PreviewField label={data.reasonLabel || "What can we help with?"} placeholder={reasons[0] || "Select"} />
          <PreviewField label={data.messageLabel || "Message"} tall />
          <div><PrimaryBtn>{data.submitLabel || "Send Message"}</PrimaryBtn></div>
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: HEX.accent, background: HEX.raised }}>
            <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{data.successTitle || "Message sent."}</p>
            <p className="mt-1 text-[11px]" style={{ color: HEX.dim }}>{data.successBody}</p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function PreviewField({ label, placeholder, tall }) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: HEX.dim }}>{label}</p>
      <div
        className="truncate rounded-lg border px-2.5 text-[11px]"
        style={{ borderColor: HEX.border, color: HEX.dim, paddingTop: tall ? 8 : 6, paddingBottom: tall ? 20 : 6 }}
      >
        {placeholder || " "}
      </div>
    </div>
  );
}
