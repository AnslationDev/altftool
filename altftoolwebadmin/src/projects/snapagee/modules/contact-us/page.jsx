"use client";

import { useState } from "react";
import { Contact, Mail, MapPin, Phone } from "lucide-react";
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
  DEFAULT_CONTACT_SETTINGS,
  createContactOffice,
  deleteContactOffice,
  saveContactSettings,
  subscribeContactOffices,
  subscribeContactSettings,
  toggleContactOfficeStatus,
  updateContactOffice,
} from "./service/contact.service";

export default function SnapageeContactUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Contact className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Snapagee Contact Us</h1>
            <p className="text-sm text-gray-500">
              Manage the /contact page hero, info cards, offices, the FAQ intro, and the form's field labels. The form itself stays a client-side no-op — this manages labels only.
            </p>
          </div>
        </div>

        <PageSection />
      </div>
    </div>
  );
}

/**
 * Snapagee's `contact/settings` doc holds the page hero, info-card labels,
 * the FAQ intro, AND the form's field labels + success state in one place
 * (mirrors TheStyleLife's single `contact/settings` doc). Offices back the
 * "Offices" info card as their own ordered collection — the site falls back
 * to `data/contact.json.offices` until an admin adds rows here.
 */
function PageSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_SETTINGS);
  const [offices, setOffices] = useState([]);
  return (
    <SectionFrame
      index={1}
      icon={MapPin}
      title="Contact Page"
      subtitle="Hero copy, info cards, offices, the FAQ intro, and the form's field labels & success state."
      preview={<ContactPreview data={form} offices={offices} />}
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
          { key: "pageEyebrow", label: "Page Eyebrow", type: "text", half: true },
          { key: "officesCardLabel", label: "Offices Card Label", type: "text", half: true },
          { key: "emailCardLabel", label: "Email Card Label", type: "text", half: true },
          { key: "phoneCardLabel", label: "Phone Card Label", type: "text", half: true },
          { key: "faqEyebrow", label: "FAQ Eyebrow", type: "text", half: true },
          { key: "faqHeading", label: "FAQ Heading", type: "text", half: true },
          {
            key: "projectTypes",
            label: "Project Types",
            type: "list",
            placeholder: "Website Design & Development",
            hint: "One option per row — populates the form's \"Project Type\" dropdown.",
          },
          {
            key: "budgetRanges",
            label: "Budget Ranges",
            type: "list",
            placeholder: "Under $10k",
            hint: "One option per row — populates the form's \"Budget\" dropdown.",
          },
          { key: "nameLabel", label: "Name Field Label", type: "text", half: true },
          { key: "emailLabel", label: "Email Field Label", type: "text", half: true },
          { key: "companyLabel", label: "Company Field Label", type: "text", half: true },
          { key: "budgetLabel", label: "Budget Field Label", type: "text", half: true },
          { key: "projectTypeLabel", label: "Project Type Field Label", type: "text", half: true },
          { key: "detailsLabel", label: "Details Field Label", type: "text", half: true },
          { key: "submitLabel", label: "Submit Button", type: "text", half: true },
          { key: "successTitle", label: "Success Title", type: "text", half: true },
          { key: "successBody", label: "Success Body", type: "textarea", rows: 2 },
        ]}
      />
      <CollectionManager
        eyebrow="Offices"
        title="Offices"
        itemNoun="office"
        subscribe={subscribeContactOffices}
        create={createContactOffice}
        update={updateContactOffice}
        remove={deleteContactOffice}
        toggle={toggleContactOfficeStatus}
        onItems={setOffices}
        fields={[
          { key: "city", label: "City", type: "text", required: true, half: true, placeholder: "San Francisco" },
          {
            key: "address",
            label: "Address",
            type: "text",
            required: true,
            half: true,
            placeholder: "548 Market Street, Suite 61000, San Francisco, CA 94104",
          },
        ]}
        columns={[
          { key: "city", label: "City" },
          { key: "address", label: "Address" },
        ]}
        itemLabel={(item) => item.city}
      />
    </SectionFrame>
  );
}

/* ------------------------------- preview -------------------------------- */

function ContactPreview({ data, offices }) {
  const activeOffices = (offices || []).filter((office) => office.active !== false);

  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <Eyebrow>{data.pageEyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
          <p className="mt-2 text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subheading}</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
            <Mail className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.accent }} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{data.emailCardLabel || "Email"}</p>
              <p className="truncate text-xs" style={{ color: HEX.fg }}>hello@snapagee.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
            <Phone className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.accent }} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{data.phoneCardLabel || "Phone"}</p>
              <p className="truncate text-xs" style={{ color: HEX.fg }}>+1 (415) 555-0142</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.accent }} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{data.officesCardLabel || "Offices"}</p>
              {activeOffices.length ? (
                <div className="mt-1 flex flex-col gap-1.5">
                  {activeOffices.map((office) => (
                    <div key={office.id}>
                      <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{office.city}</p>
                      <p className="truncate text-[11px]" style={{ color: HEX.dim }}>{office.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[11px]" style={{ color: HEX.dim }}>Falls back to San Francisco / New York.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 border-t pt-5" style={{ borderColor: HEX.border }}>
          <div className="grid grid-cols-2 gap-2.5">
            <PreviewField label={data.nameLabel || "Name"} />
            <PreviewField label={data.emailLabel || "Email"} />
            <PreviewField label={data.companyLabel || "Company"} />
            <PreviewField label={data.budgetLabel || "Budget"} placeholder={data.budgetRanges?.[0] || "Select a range"} />
          </div>
          <PreviewField label={data.projectTypeLabel || "Project Type"} placeholder={data.projectTypes?.[0] || "Select"} />
          <PreviewField label={data.detailsLabel || "Project Details"} tall />
          <div><PrimaryBtn>{data.submitLabel || "Send Message"}</PrimaryBtn></div>
          <div className="rounded-xl border p-3 text-center" style={{ borderColor: HEX.accent, background: HEX.raised }}>
            <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{data.successTitle || "Message received"}</p>
            <p className="mt-1 text-[11px]" style={{ color: HEX.dim }}>{data.successBody}</p>
          </div>
        </div>

        <div className="mt-5 border-t pt-5 text-center" style={{ borderColor: HEX.border }}>
          <Eyebrow>{data.faqEyebrow}</Eyebrow>
          <PreviewHeading lead={data.faqHeading} className="mt-1 text-sm" />
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
