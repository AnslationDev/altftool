"use client";

import { useState } from "react";
import { Clock, Mail, MessageSquare } from "lucide-react";
import {
  CollectionManager,
  Eyebrow,
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
  createContactHoursEntry,
  deleteContactHoursEntry,
  saveContactForm,
  saveContactSettings,
  subscribeContactForm,
  subscribeContactHours,
  subscribeContactSettings,
  toggleContactHoursStatus,
  updateContactHoursEntry,
} from "./service/contact.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function OfferrisContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offerris Contact Us</h1>
            <p className="text-sm text-gray-500">
              Manage the contact page hero, office details, business hours, and the intake form copy. Each block saves on its own.
            </p>
          </div>
        </div>

        <SettingsSection />
        <BusinessHoursSection />
        <FormCopySection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) Hero + office/contact details — doc contact/settings                    */
/* -------------------------------------------------------------------------- */
function SettingsSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_SETTINGS);
  return (
    <SectionFrame index={1} icon={Mail} title="Page Hero & Office" subtitle="Hero copy plus the office address, email, phone, and map placeholder." preview={<SettingsPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact Settings"
        title="Hero & office details"
        defaults={DEFAULT_CONTACT_SETTINGS}
        subscribe={subscribeContactSettings}
        save={saveContactSettings}
        errorLabel="contact settings"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "officeName", label: "Office Name", type: "text", half: true },
          { key: "country", label: "Country", type: "text", half: true },
          { key: "addressLine1", label: "Address Line 1", type: "text", half: true },
          { key: "addressLine2", label: "Address Line 2", type: "text", half: true },
          { key: "email", label: "Email", type: "text", half: true },
          { key: "phone", label: "Phone", type: "text", half: true },
          { key: "mapEmbedPlaceholder", label: "Map Embed Placeholder", type: "textarea", rows: 2 },
        ]}
      />
    </SectionFrame>
  );
}

function SettingsPreview({ data }) {
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.badge}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-2xl" />
        {data.subcopy ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        ) : null}
        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: HEX.border, background: HEX.raised }}>
          <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{data.officeName || "Office"}</p>
          <p className="mt-1 text-xs" style={{ color: HEX.dim }}>{data.addressLine1}</p>
          <p className="text-xs" style={{ color: HEX.dim }}>{data.addressLine2}</p>
          <p className="text-xs" style={{ color: HEX.dim }}>{data.country}</p>
          <p className="mt-2 text-xs" style={{ color: HEX.accent }}>{data.email}</p>
          <p className="text-xs" style={{ color: HEX.accent }}>{data.phone}</p>
        </div>
        {data.mapEmbedPlaceholder ? (
          <p className="mt-3 text-[11px] italic" style={{ color: HEX.dim }}>{data.mapEmbedPlaceholder}</p>
        ) : null}
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Business Hours — collection contactHours                                */
/* -------------------------------------------------------------------------- */
function BusinessHoursSection() {
  const [entries, setEntries] = useState([]);
  return (
    <SectionFrame index={2} icon={Clock} title="Business Hours" subtitle="The days/hours rows shown next to the office details." preview={<HoursPreview items={entries} />}>
      <CollectionManager
        eyebrow="Business Hours"
        title="Hours"
        itemNoun="entry"
        subscribe={subscribeContactHours}
        create={createContactHoursEntry}
        update={updateContactHoursEntry}
        remove={deleteContactHoursEntry}
        toggle={toggleContactHoursStatus}
        onItems={setEntries}
        fields={[
          { key: "days", label: "Days", type: "text", required: true, half: true, placeholder: "Monday – Thursday" },
          { key: "hours", label: "Hours", type: "text", required: true, half: true, placeholder: "9:00 AM – 7:00 PM PT" },
        ]}
        columns={[
          { key: "days", label: "Days", primary: true },
          { key: "hours", label: "Hours" },
        ]}
        itemLabel={(item) => item.days}
      />
    </SectionFrame>
  );
}

function HoursPreview({ items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>Business Hours</Eyebrow>
        {active.length ? (
          <div className="mt-4 flex flex-col gap-2">
            {active.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 border-b pb-2 last:border-b-0" style={{ borderColor: HEX.border }}>
                <span className="text-xs font-medium" style={{ color: HEX.fg }}>{item.days}</span>
                <span className="text-xs" style={{ color: HEX.dim }}>{item.hours}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-xs" style={{ color: HEX.dim }}>No active hours yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) Form Copy — doc contact/form                                            */
/* -------------------------------------------------------------------------- */
function FormCopySection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_FORM);
  return (
    <SectionFrame index={3} icon={MessageSquare} title="Form Copy" subtitle="Labels, placeholders, dropdown options, and success copy for the intake form." preview={<FormPreview data={form} />}>
      <SettingsCard
        eyebrow="Intake Form"
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
          { key: "submitLabel", label: "Submit Label", type: "text", half: true },
          { key: "successTitle", label: "Success Title", type: "text", half: true },
          { key: "successBody", label: "Success Body", type: "textarea", rows: 2 },
          { key: "budgetOptions", label: "Budget Options", type: "list", placeholder: "Under $10k", hint: "Rendered as the dropdown choices for the budget field." },
          { key: "serviceOptions", label: "Service Options", type: "list", placeholder: "SEO", hint: "Rendered as the dropdown choices for the service field." },
        ]}
      />
    </SectionFrame>
  );
}

function FormPreview({ data }) {
  const budgetOptions = Array.isArray(data.budgetOptions) ? data.budgetOptions.filter(Boolean) : [];
  const serviceOptions = Array.isArray(data.serviceOptions) ? data.serviceOptions.filter(Boolean) : [];
  return (
    <PreviewShell>
      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormPreviewField label={data.nameLabel} placeholder={data.namePlaceholder} />
          <FormPreviewField label={data.emailLabel} placeholder={data.emailPlaceholder} />
          <FormPreviewField label={data.companyLabel} placeholder={data.companyPlaceholder} />
          <FormPreviewField label={data.serviceLabel} placeholder={serviceOptions[0] || "Select a service"} />
          <FormPreviewField label={data.budgetLabel} placeholder={budgetOptions[0] || "Select a budget"} />
        </div>
        <div className="mt-3">
          <FormPreviewField label={data.messageLabel} placeholder={data.messagePlaceholder} tall />
        </div>
        <div className="mt-4">
          <PrimaryBtn>{data.submitLabel || "Submit"}</PrimaryBtn>
        </div>
        <div className="mt-4 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
          <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{data.successTitle}</p>
          <p className="mt-1 text-[11px]" style={{ color: HEX.dim }}>{data.successBody}</p>
        </div>
      </div>
    </PreviewShell>
  );
}

function FormPreviewField({ label, placeholder, tall }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: HEX.dim }}>{label || "Label"}</p>
      <div
        className={`mt-1 rounded-lg border px-3 py-2 text-xs ${tall ? "min-h-[52px]" : ""}`}
        style={{ borderColor: HEX.border, background: HEX.raised, color: HEX.dim }}
      >
        {placeholder || ""}
      </div>
    </div>
  );
}
