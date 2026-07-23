"use client";

import { useState } from "react";
import { Dribbble, Globe, Instagram, Linkedin, Settings, Twitter } from "lucide-react";
import {
  Eyebrow,
  HEX,
  PreviewHeading,
  PreviewShell,
  PrimaryBtn,
  SecondaryBtn,
  SectionFrame,
  SettingsCard,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_SITE_SETTINGS,
  saveSiteSettings,
  subscribeSiteSettings,
} from "./service/siteSettings.service";

export default function SnapageeSiteSettingsPage() {
  const [form, setForm] = useState(DEFAULT_SITE_SETTINGS);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Snapagee Site Settings</h1>
            <p className="text-sm text-gray-500">Global brand, contact, social, and CTA defaults.</p>
          </div>
        </div>

        <SectionFrame
          index={1}
          icon={Globe}
          title="Brand & Contact"
          subtitle="Identity, contact details, social profiles, and CTA button copy."
          preview={<SettingsPreview form={form} />}
        >
          <SettingsCard
            eyebrow="Site"
            title="Site settings"
            defaults={DEFAULT_SITE_SETTINGS}
            subscribe={subscribeSiteSettings}
            save={saveSiteSettings}
            errorLabel="site settings"
            onChange={setForm}
            fields={[
              { key: "name", label: "Name", type: "text", required: true, half: true, placeholder: "Snapagee" },
              { key: "tagline", label: "Tagline", type: "text", half: true, placeholder: "Results snap into focus." },
              {
                key: "description",
                label: "Description",
                type: "textarea",
                rows: 3,
                placeholder:
                  "Snapagee is a digital marketing and product studio that ships fast, precise, revenue-driving work for ambitious brands.",
              },
              { key: "url", label: "Site URL", type: "text", half: true, placeholder: "https://www.snapagee.com" },
              { key: "founded", label: "Founded", type: "text", half: true, placeholder: "2019" },
              { key: "email", label: "Email", type: "text", half: true, placeholder: "hello@snapagee.com" },
              { key: "phone", label: "Phone", type: "text", half: true, placeholder: "+1 (415) 555-0142" },
              {
                key: "address",
                label: "Address",
                type: "text",
                placeholder: "548 Market Street, Suite 61000, San Francisco, CA 94104",
              },
              { key: "twitter", label: "Twitter", type: "text", half: true, placeholder: "https://twitter.com/snapagee" },
              { key: "linkedin", label: "LinkedIn", type: "text", half: true, placeholder: "https://linkedin.com/company/snapagee" },
              { key: "instagram", label: "Instagram", type: "text", half: true, placeholder: "https://instagram.com/snapagee" },
              { key: "dribbble", label: "Dribbble", type: "text", half: true, placeholder: "https://dribbble.com/snapagee" },
              { key: "ctaPrimaryLabel", label: "Primary CTA Label", type: "text", half: true, placeholder: "Book a Call" },
              { key: "ctaSecondaryLabel", label: "Secondary CTA Label", type: "text", half: true, placeholder: "See Our Work" },
            ]}
          />
        </SectionFrame>
      </div>
    </div>
  );
}

/* ---------------------- Snapagee front-end live preview ------------------ */

function SettingsPreview({ form }) {
  const displayUrl = (form.url || "https://www.snapagee.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const socials = [
    { key: "twitter", label: "Twitter", href: form.twitter, Icon: Twitter },
    { key: "linkedin", label: "LinkedIn", href: form.linkedin, Icon: Linkedin },
    { key: "instagram", label: "Instagram", href: form.instagram, Icon: Instagram },
    { key: "dribbble", label: "Dribbble", href: form.dribbble, Icon: Dribbble },
  ].filter((item) => item.href);

  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{form.founded ? `Est. ${form.founded}` : "SNAPAGEE"}</Eyebrow>
        <PreviewHeading className="mt-2 text-2xl" lead={form.name || "Snapagee"} />
        {form.tagline ? (
          <p className="mt-1 text-sm font-medium" style={{ color: HEX.accent }}>
            {form.tagline}
          </p>
        ) : null}
        <p className="mt-3 max-w-md text-xs leading-relaxed" style={{ color: HEX.dim }}>
          {form.description || "Add a description to preview it here."}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryBtn>{form.ctaPrimaryLabel || "Book a Call"}</PrimaryBtn>
          <SecondaryBtn>{form.ctaSecondaryLabel || "See Our Work"}</SecondaryBtn>
        </div>

        {socials.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {socials.map(({ key, label, Icon }) => (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em]"
                style={{ borderColor: HEX.border, color: HEX.fg }}
              >
                <Icon className="h-3 w-3" /> {label}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-5 rounded-xl border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>
            Contact
          </p>
          <div className="space-y-1">
            <p className="text-xs" style={{ color: HEX.dim }}>{displayUrl}</p>
            <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{form.email || "No email set."}</p>
            <p className="text-xs" style={{ color: HEX.dim }}>{form.phone || ""}</p>
            <p className="text-xs" style={{ color: HEX.dim }}>{form.address || ""}</p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}
