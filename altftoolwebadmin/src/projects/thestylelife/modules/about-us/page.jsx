"use client";

import { useState } from "react";
import { FileText, History, Landmark, Sparkles } from "lucide-react";
import {
  CollectionManager,
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
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_TIMELINE,
  DEFAULT_ABOUT_VALUES,
  createAboutHeroStat,
  createAboutTimelineItem,
  createAboutValueItem,
  deleteAboutHeroStat,
  deleteAboutTimelineItem,
  deleteAboutValueItem,
  saveAboutHero,
  saveAboutTimelineSection,
  saveAboutValuesSection,
  subscribeAboutHero,
  subscribeAboutHeroStats,
  subscribeAboutTimelineItems,
  subscribeAboutTimelineSection,
  subscribeAboutValueItems,
  subscribeAboutValuesSection,
  toggleAboutHeroStatStatus,
  toggleAboutTimelineItemStatus,
  toggleAboutValueItemStatus,
  updateAboutHeroStat,
  updateAboutTimelineItem,
  updateAboutValueItem,
  uploadAboutHeroImage1,
  uploadAboutHeroImage2,
  uploadAboutHeroImage3,
  uploadAboutValuesImage1,
  uploadAboutValuesImage2,
} from "./service/aboutUs.service";

export default function ThestylelifeAboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TheStyleLife About Us</h1>
            <p className="text-sm text-gray-500">
              Manage the /about page: the hero + stats, the timeline, and the values section.
            </p>
          </div>
        </div>

        <HeroSection />
        <TimelineSection />
        <ValuesSection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) Hero — doc about/hero + collection aboutHeroStats                       */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_HERO);
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame
      index={1}
      icon={Sparkles}
      title="Hero"
      subtitle="Badge, heading, intro copy, CTAs, the three hero images, and the stats row."
      preview={<HeroPreview data={form} stats={stats} />}
    >
      <SettingsCard
        eyebrow="About Hero"
        title="Hero content"
        defaults={DEFAULT_ABOUT_HERO}
        subscribe={subscribeAboutHero}
        save={saveAboutHero}
        errorLabel="about hero"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text", half: true, placeholder: "The Studio" },
          { key: "sinceBadgeText", label: "Since Badge Text", type: "text", half: true, placeholder: "SINCE 2016" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text", half: true },
          { key: "primaryCtaHref", label: "Primary CTA Link", type: "text", half: true },
          { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text", half: true },
          { key: "secondaryCtaHref", label: "Secondary CTA Link", type: "text", half: true },
          { key: "image1", label: "Image 1 (large)", type: "image", upload: uploadAboutHeroImage1 },
          { key: "image2", label: "Image 2 (medium)", type: "image", upload: uploadAboutHeroImage2 },
          { key: "image3", label: "Image 3 (bottom)", type: "image", upload: uploadAboutHeroImage3 },
        ]}
      />
      <CollectionManager
        eyebrow="Hero Stats"
        title="Stats"
        itemNoun="stat"
        subscribe={subscribeAboutHeroStats}
        create={createAboutHeroStat}
        update={updateAboutHeroStat}
        remove={deleteAboutHeroStat}
        toggle={toggleAboutHeroStatStatus}
        onItems={setStats}
        fields={[
          { key: "value", label: "Value", type: "text", required: true, half: true, placeholder: "180+" },
          { key: "label", label: "Label", type: "text", required: true, half: true, placeholder: "Brands" },
        ]}
        columns={[
          { key: "value", label: "Stat" },
          { key: "label", label: "Label", render: (item) => item.label },
        ]}
        itemLabel={(item) => `${item.value} ${item.label}`}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Timeline — doc about/timeline + collection aboutTimeline                */
/* -------------------------------------------------------------------------- */
function TimelineSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_TIMELINE);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame
      index={2}
      icon={History}
      title="Timeline"
      subtitle="Heading and the studio's year-by-year record."
      preview={<TimelinePreview data={form} items={items} />}
    >
      <SettingsCard
        eyebrow="Timeline Section"
        title="Heading"
        defaults={DEFAULT_ABOUT_TIMELINE}
        subscribe={subscribeAboutTimelineSection}
        save={saveAboutTimelineSection}
        errorLabel="timeline"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 2 },
        ]}
      />
      <CollectionManager
        eyebrow="Timeline"
        title="Entries"
        itemNoun="entry"
        subscribe={subscribeAboutTimelineItems}
        create={createAboutTimelineItem}
        update={updateAboutTimelineItem}
        remove={deleteAboutTimelineItem}
        toggle={toggleAboutTimelineItemStatus}
        onItems={setItems}
        fields={[
          { key: "year", label: "Year", type: "text", required: true, half: true, placeholder: "2016" },
          { key: "title", label: "Title", type: "text", required: true, half: true, placeholder: "The Studio Opens" },
          { key: "detail", label: "Detail", type: "textarea", rows: 3 },
        ]}
        columns={[
          { key: "year", label: "Entry" },
          { key: "title", label: "Title", render: (item) => item.title },
        ]}
        itemLabel={(item) => `${item.year} — ${item.title}`}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) Values — doc about/values + collection aboutValues                     */
/* -------------------------------------------------------------------------- */
function ValuesSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_VALUES);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame
      index={3}
      icon={Landmark}
      title="Values"
      subtitle="Heading, the two illustration photos, and the value cards."
      preview={<ValuesPreview data={form} items={items} />}
    >
      <SettingsCard
        eyebrow="Values Section"
        title="Heading & images"
        defaults={DEFAULT_ABOUT_VALUES}
        subscribe={subscribeAboutValuesSection}
        save={saveAboutValuesSection}
        errorLabel="values"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 2 },
          { key: "image1", label: "Image 1", type: "image", upload: uploadAboutValuesImage1 },
          { key: "image2", label: "Image 2", type: "image", upload: uploadAboutValuesImage2 },
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
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
        ]}
        columns={[
          { key: "title", label: "Value" },
          { key: "description", label: "Description", render: (item) => item.description },
        ]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

/* ------------------------------- previews -------------------------------- */

function HeroPreview({ data, stats }) {
  const active = (stats || []).filter((item) => item.active !== false);
  const images = [data.image1, data.image2, data.image3].filter(Boolean);

  return (
    <PreviewShell>
      <div className="flex flex-col gap-4 p-6">
        <div>
          <span className="rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ borderColor: HEX.border, color: HEX.accent }}>
            {data.badge || "The Studio"}
          </span>
          <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
          <p className="mt-2 max-w-md text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryBtn>{data.primaryCtaLabel || "Start Your Project"}</PrimaryBtn>
            <SecondaryBtn>{data.secondaryCtaLabel || "View Our Work"}</SecondaryBtn>
          </div>
        </div>

        {images.length ? (
          <div className="flex gap-2">
            {images.map((src, index) => (
              <div key={index} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: HEX.border }}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            <span className="ml-1 flex h-16 items-center rounded-full px-3 text-[10px] font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
              {data.sinceBadgeText || "SINCE 2016"}
            </span>
          </div>
        ) : null}

        <div className="grid grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: HEX.border }}>
          {active.length ? (
            active.map((item) => (
              <div key={item.id}>
                <p className="text-lg font-bold" style={{ color: HEX.fg }}>{item.value}</p>
                <p className="text-[10px] uppercase tracking-wide" style={{ color: HEX.dim }}>{item.label}</p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-[11px]" style={{ color: HEX.dim }}>No stats yet — falls back to the bundled JSON.</p>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function TimelinePreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
          {data.body ? <p className="mt-1 text-xs" style={{ color: HEX.dim }}>{data.body}</p> : null}
        </div>
        <div className="mt-5 flex flex-col gap-4 border-l pl-4" style={{ borderColor: HEX.border }}>
          {active.length ? (
            active.map((item) => (
              <div key={item.id}>
                <p className="text-xs font-bold" style={{ color: HEX.accent }}>{item.year}</p>
                <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed" style={{ color: HEX.dim }}>{item.detail}</p>
              </div>
            ))
          ) : (
            <p className="text-[11px]" style={{ color: HEX.dim }}>No timeline entries yet</p>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function ValuesPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  const images = [data.image1, data.image2].filter(Boolean);

  return (
    <PreviewShell>
      <div className="p-6">
        <div className="text-center">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
          {data.body ? <p className="mt-1 text-xs" style={{ color: HEX.dim }}>{data.body}</p> : null}
        </div>

        {images.length ? (
          <div className="mt-3 flex gap-2">
            {images.map((src, index) => (
              <div key={index} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border" style={{ borderColor: HEX.border }}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-3">
          {active.length ? (
            active.map((item, index) => (
              <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: HEX.accent, color: "#ffffff" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
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
