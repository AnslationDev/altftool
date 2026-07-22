"use client";

import { useState } from "react";
import { FileText, Landmark, Sparkles, Users } from "lucide-react";
import {
  CollectionManager,
  Eyebrow,
  HEX,
  PreviewHeading,
  PreviewShell,
  SectionFrame,
  SettingsCard,
} from "../_shared/AdminSectionShared";
import {
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_TEAM_SECTION,
  DEFAULT_ABOUT_VALUES,
  createAboutValueItem,
  deleteAboutValueItem,
  saveAboutHero,
  saveAboutTeamSection,
  saveAboutValues,
  subscribeAboutHero,
  subscribeAboutTeamSection,
  subscribeAboutValueItems,
  subscribeAboutValues,
  toggleAboutValueItemStatus,
  updateAboutValueItem,
  uploadAboutValueImage,
} from "./service/aboutUs.service";

export default function ShophobiaAboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shophobia About Us</h1>
            <p className="text-sm text-gray-500">
              Manage the /about page. The story copy &amp; highlights come from the Home module&apos;s About section; team members come from the Team module.
            </p>
          </div>
        </div>

        <HeroSection />
        <ValuesSection />
        <TeamSectionHeading />
      </div>
    </div>
  );
}

function HeroSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_HERO);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Badge, heading, and intro line — the intro renders after the site description." preview={<HeroPreview data={form} />}>
      <SettingsCard
        eyebrow="About Hero"
        title="Hero content"
        defaults={DEFAULT_ABOUT_HERO}
        subscribe={subscribeAboutHero}
        save={saveAboutHero}
        errorLabel="about hero"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text", placeholder: "Our Story" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "intro", label: "Intro Line", type: "textarea", rows: 3, hint: "Use {founded} to insert the founded year from Site Settings. Renders after the site description." },
        ]}
      />
    </SectionFrame>
  );
}

function ValuesSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_VALUES);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame index={2} icon={Landmark} title="Values" subtitle="Heading and the alternating value timeline (title, description, illustration)." preview={<ValuesPreview data={form} items={items} />}>
      <SettingsCard
        eyebrow="Values Section"
        title="Heading"
        defaults={DEFAULT_ABOUT_VALUES}
        subscribe={subscribeAboutValues}
        save={saveAboutValues}
        errorLabel="values"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 2 },
        ]}
      />
      <CollectionManager
        eyebrow="Values"
        title="Value cards"
        itemNoun="value"
        subscribe={subscribeAboutValueItems}
        create={createAboutValueItem}
        update={updateAboutValueItem}
        remove={deleteAboutValueItem}
        toggle={toggleAboutValueItemStatus}
        onItems={setItems}
        imageColumnLabel="Illustration"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
          { key: "image", label: "Illustration", type: "image", upload: uploadAboutValueImage },
        ]}
        columns={[{ key: "image", label: "Illustration", image: true }, { key: "title", label: "Value" }, { key: "description", label: "Description", render: (item) => item.description }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function TeamSectionHeading() {
  const [form, setForm] = useState(DEFAULT_ABOUT_TEAM_SECTION);
  return (
    <SectionFrame index={3} icon={Users} title="Team Section" subtitle="Heading above the team strip (members come from the Team module)." preview={<TeamHeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="Team Section"
        title="Heading"
        defaults={DEFAULT_ABOUT_TEAM_SECTION}
        subscribe={subscribeAboutTeamSection}
        save={saveAboutTeamSection}
        errorLabel="team section"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
    </SectionFrame>
  );
}

/* ------------------------------- previews -------------------------------- */

function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
        <span className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: HEX.border, color: HEX.accent }}>
          {data.badge || "Our Story"}
        </span>
        <PreviewHeading lead={data.heading} className="text-xl" />
        <p className="max-w-md text-xs leading-relaxed" style={{ color: HEX.dim }}>
          [Site description] {data.intro}
        </p>
      </div>
    </PreviewShell>
  );
}

function ValuesPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
          {data.description ? <p className="mt-1 text-xs" style={{ color: HEX.dim }}>{data.description}</p> : null}
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {active.length ? (
            active.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: `linear-gradient(135deg, ${HEX.accentAlt}, ${HEX.violet})`, color: HEX.fg }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.image ? (
                  <img src={item.image} alt="" className="h-10 w-10 shrink-0 object-contain" />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold" style={{ color: HEX.fg }}>{item.title || "Untitled"}</p>
                  <p className="truncate text-[11px]" style={{ color: HEX.dim }}>{item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-[11px]" style={{ color: HEX.dim }}>No values yet</p>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function TeamHeadingPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="text-lg" />
        <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>Members render from the Team module</p>
      </div>
    </PreviewShell>
  );
}
