"use client";

import { useState } from "react";
import { Link2, PanelBottom } from "lucide-react";
import {
  CollectionManager,
  HEX,
  PreviewShell,
  SectionFrame,
  SettingsCard,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_FOOTER_SETTINGS,
  createQuickLink,
  createResource,
  deleteQuickLink,
  deleteResource,
  saveFooterSettings,
  subscribeFooterSettings,
  subscribeQuickLinks,
  subscribeResources,
  toggleQuickLinkStatus,
  toggleResourceStatus,
  updateQuickLink,
  updateResource,
} from "./service/footer.service";

export default function ShophobiaFooterPage() {
  const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [quickLinks, setQuickLinks] = useState([]);
  const [resources, setResources] = useState([]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <PanelBottom className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shophobia Footer</h1>
            <p className="text-sm text-gray-500">
              Manage column headings, links, and the copyright line. The services column comes from the Services module; newsletter copy from the Home module.
            </p>
          </div>
        </div>

        <SectionFrame
          index={1}
          icon={PanelBottom}
          title="Headings & Copy"
          subtitle="Column headings, the newsletter blurb, and the copyright suffix."
          preview={<FooterPreview settings={settings} quickLinks={quickLinks} resources={resources} />}
        >
          <SettingsCard
            eyebrow="Footer"
            title="Headings & copy"
            defaults={DEFAULT_FOOTER_SETTINGS}
            subscribe={subscribeFooterSettings}
            save={saveFooterSettings}
            errorLabel="footer settings"
            onChange={setSettings}
            fields={[
              { key: "quickLinksHeading", label: "Quick Links Heading", type: "text", half: true },
              { key: "servicesHeading", label: "Services Heading", type: "text", half: true },
              { key: "newsletterHeading", label: "Newsletter Heading", type: "text", half: true },
              { key: "newsletterBlurb", label: "Newsletter Blurb", type: "text", half: true },
              { key: "copyrightSuffix", label: "Copyright Suffix", type: "text", hint: 'Renders as "© {year} {legal name}. {suffix}".' },
            ]}
          />
        </SectionFrame>

        <SectionFrame index={2} icon={Link2} title="Link Columns" subtitle="The quick-links column plus the legal/resource links.">
          <CollectionManager
            eyebrow="Footer"
            title="Quick links"
            itemNoun="link"
            subscribe={subscribeQuickLinks}
            create={createQuickLink}
            update={updateQuickLink}
            remove={deleteQuickLink}
            toggle={toggleQuickLinkStatus}
            onItems={setQuickLinks}
            fields={[
              { key: "label", label: "Label", type: "text", required: true, half: true },
              { key: "href", label: "Href", type: "text", required: true, half: true, placeholder: "/about" },
            ]}
            columns={[{ key: "label", label: "Link" }, { key: "href", label: "Href", render: (item) => item.href }]}
            itemLabel={(item) => item.label}
          />
          <CollectionManager
            eyebrow="Footer"
            title="Resource links"
            itemNoun="resource"
            subscribe={subscribeResources}
            create={createResource}
            update={updateResource}
            remove={deleteResource}
            toggle={toggleResourceStatus}
            onItems={setResources}
            fields={[
              { key: "label", label: "Label", type: "text", required: true, half: true },
              { key: "href", label: "Href", type: "text", required: true, half: true, placeholder: "/privacy-policy" },
            ]}
            columns={[{ key: "label", label: "Resource" }, { key: "href", label: "Href", render: (item) => item.href }]}
            itemLabel={(item) => item.label}
          />
        </SectionFrame>
      </div>
    </div>
  );
}

function FooterPreview({ settings, quickLinks, resources }) {
  const activeQuick = (quickLinks || []).filter((item) => item.active !== false);
  const activeResources = (resources || []).filter((item) => item.active !== false);
  const year = new Date().getFullYear();

  return (
    <PreviewShell>
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span
              className="text-sm font-bold tracking-tight"
              style={{
                background: `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.violet}, ${HEX.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              SHOPHOBIA
            </span>
            <p className="mt-2 text-[10px] leading-relaxed" style={{ color: HEX.dim }}>
              {settings.newsletterBlurb || "Monthly signal, zero spam."}
            </p>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>
              {settings.quickLinksHeading || "Quick Links"}
            </p>
            <ul className="mt-2 space-y-1">
              {activeQuick.length ? activeQuick.map((link) => (
                <li key={link.id} className="truncate text-[11px]" style={{ color: HEX.fg }}>{link.label}</li>
              )) : (
                <li className="text-[11px]" style={{ color: HEX.dim }}>No links yet</li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>
              {settings.newsletterHeading || "Newsletter"}
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="flex-1 truncate rounded-full border px-2 py-1 text-[10px]" style={{ borderColor: HEX.border, color: HEX.dim }}>
                your@email.com
              </span>
              <span className="rounded-full px-2 py-1 text-[10px] font-semibold" style={{ background: `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.violet})`, color: HEX.fg }}>
                →
              </span>
            </div>
            {activeResources.length ? (
              <ul className="mt-3 space-y-1">
                {activeResources.slice(0, 3).map((link) => (
                  <li key={link.id} className="truncate text-[10px]" style={{ color: HEX.dim }}>{link.label}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
        <div className="mt-5 border-t pt-3 text-center text-[10px]" style={{ borderColor: HEX.border, color: HEX.dim }}>
          © {year} Shophobia Digital Collective. {settings.copyrightSuffix || "All rights reserved."}
        </div>
      </div>
    </PreviewShell>
  );
}
