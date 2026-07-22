"use client";

import { useState } from "react";
import { Contact, FormInput, Mail, MapPin, Phone } from "lucide-react";
import {
  HEX,
  PreviewHeading,
  PreviewShell,
  PrimaryBtn,
  SectionFrame,
  SettingsCard,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_CONTACT_FORM,
  DEFAULT_CONTACT_SETTINGS,
  saveContactForm,
  saveContactSettings,
  subscribeContactForm,
  subscribeContactSettings,
} from "./service/contact.service";

export default function ShophobiaContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Contact className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shophobia Contact Us</h1>
            <p className="text-sm text-gray-500">
              Manage the /contact page hero, info cards, and form copy. The form itself stays a client-side no-op — this manages labels only.
            </p>
          </div>
        </div>

        <PageSection />
        <FormSection />
      </div>
    </div>
  );
}

function PageSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_SETTINGS);
  return (
    <SectionFrame index={1} icon={MapPin} title="Page & Info Cards" subtitle="Hero copy plus the email/phone/address/hours cards." preview={<PagePreview data={form} />}>
      <SettingsCard
        eyebrow="Contact Page"
        title="Hero & info cards"
        defaults={DEFAULT_CONTACT_SETTINGS}
        subscribe={subscribeContactSettings}
        save={saveContactSettings}
        errorLabel="contact page"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text", half: true, placeholder: "Let's Talk" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "emailLabel", label: "Email Card Label", type: "text", half: true },
          { key: "email", label: "Email", type: "text", half: true },
          { key: "phoneLabel", label: "Phone Card Label", type: "text", half: true },
          { key: "phone", label: "Phone", type: "text", half: true },
          { key: "addressLabel", label: "Address Card Label", type: "text", half: true },
          { key: "address", label: "Address", type: "text", half: true },
          { key: "hoursLabel", label: "Hours Card Label", type: "text", half: true },
          { key: "hours", label: "Hours", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function FormSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_FORM);
  return (
    <SectionFrame index={2} icon={FormInput} title="Form Copy" subtitle="Labels, placeholders, options, and the success state." preview={<FormPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact Form"
        title="Form copy"
        defaults={DEFAULT_CONTACT_FORM}
        subscribe={subscribeContactForm}
        save={saveContactForm}
        errorLabel="contact form"
        onChange={setForm}
        fields={[
          { key: "nameLabel", label: "Name Label", type: "text", half: true },
          { key: "namePlaceholder", label: "Name Placeholder", type: "text", half: true },
          { key: "emailLabel", label: "Email Label", type: "text", half: true },
          { key: "emailPlaceholder", label: "Email Placeholder", type: "text", half: true },
          { key: "companyLabel", label: "Company Label", type: "text", half: true },
          { key: "companyPlaceholder", label: "Company Placeholder", type: "text", half: true },
          { key: "serviceLabel", label: "Service Label", type: "text", half: true },
          { key: "budgetLabel", label: "Budget Label", type: "text", half: true },
          { key: "messageLabel", label: "Message Label", type: "text", half: true },
          { key: "messagePlaceholder", label: "Message Placeholder", type: "text", half: true },
          { key: "submitLabel", label: "Submit Button", type: "text", half: true },
          { key: "successTitle", label: "Success Title", type: "text", half: true },
          { key: "successBody", label: "Success Body", type: "textarea", rows: 2 },
          { key: "budgetRanges", label: "Budget Ranges", type: "list", placeholder: "$10k – $25k", hint: "One option per row." },
          { key: "serviceOptions", label: "Service Options", type: "list", placeholder: "Website Design & Development", hint: "One option per row." },
        ]}
      />
    </SectionFrame>
  );
}

/* ------------------------------- previews -------------------------------- */

function PagePreview({ data }) {
  const cards = [
    { icon: Mail, label: data.emailLabel || "Email Us", value: data.email },
    { icon: Phone, label: data.phoneLabel || "Call Us", value: data.phone },
    { icon: MapPin, label: data.addressLabel || "Studio", value: data.address },
  ];
  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <span className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: HEX.border, color: HEX.accent }}>
            {data.badge || "Let's Talk"}
          </span>
          <PreviewHeading lead={data.heading} className="mt-3 text-lg" />
          <p className="mt-2 text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
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
            <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{data.hoursLabel || "Studio Hours"}</p>
            <p className="text-xs" style={{ color: HEX.fg }}>{data.hours}</p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function FormPreview({ data }) {
  const services = Array.isArray(data.serviceOptions) ? data.serviceOptions.filter(Boolean) : [];
  const budgets = Array.isArray(data.budgetRanges) ? data.budgetRanges.filter(Boolean) : [];
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3 p-6">
        <div className="grid grid-cols-2 gap-2.5">
          <PreviewField label={data.nameLabel || "Full Name"} placeholder={data.namePlaceholder} />
          <PreviewField label={data.emailLabel || "Email Address"} placeholder={data.emailPlaceholder} />
          <PreviewField label={data.companyLabel || "Company / Brand"} placeholder={data.companyPlaceholder} />
          <PreviewField label={data.serviceLabel || "Service Interested In"} placeholder={services[0] || "Select"} />
        </div>
        <PreviewField label={data.budgetLabel || "Estimated Budget"} placeholder={budgets[0] || "Select"} />
        <PreviewField label={data.messageLabel || "Project Details"} placeholder={data.messagePlaceholder} tall />
        <div><PrimaryBtn>{data.submitLabel || "Send Message"}</PrimaryBtn></div>
        <div className="rounded-xl border p-3 text-center" style={{ borderColor: HEX.accent, background: HEX.raised }}>
          <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{data.successTitle || "Message Received"}</p>
          <p className="mt-1 text-[11px]" style={{ color: HEX.dim }}>{data.successBody}</p>
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
