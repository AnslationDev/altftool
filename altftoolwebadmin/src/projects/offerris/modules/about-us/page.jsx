"use client";

import { useState } from "react";
import { Clock, Gem, Image as ImageIcon, Info, Sparkles, Users } from "lucide-react";
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
  DEFAULT_ABOUT_HERO,
  DEFAULT_ABOUT_LEADERSHIP,
  DEFAULT_ABOUT_TIMELINE_INTRO,
  DEFAULT_ABOUT_VALUES_INTRO,
  createAboutStoryImage,
  createAboutTimelineEntry,
  createAboutValue,
  deleteAboutStoryImage,
  deleteAboutTimelineEntry,
  deleteAboutValue,
  saveAboutHero,
  saveAboutLeadership,
  saveAboutTimelineIntro,
  saveAboutValuesIntro,
  subscribeAboutHero,
  subscribeAboutLeadership,
  subscribeAboutStoryImages,
  subscribeAboutTimeline,
  subscribeAboutTimelineIntro,
  subscribeAboutValues,
  subscribeAboutValuesIntro,
  toggleAboutStoryImageStatus,
  toggleAboutTimelineStatus,
  toggleAboutValueStatus,
  updateAboutStoryImage,
  updateAboutTimelineEntry,
  updateAboutValue,
  uploadAboutHeroImage,
  uploadAboutStoryImage,
} from "./service/aboutUs.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function OfferrisAboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offerris About Us</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Offerris About page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <StoryImagesSection />
        <ValuesSection />
        <TimelineSection />
        <LeadershipSection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1) Hero — doc about/hero                                                   */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_HERO);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Badge, headline, and hero illustration at the top of the About page." preview={<HeroPreview data={form} />}>
      <SettingsCard
        eyebrow="Hero Section"
        title="About hero"
        defaults={DEFAULT_ABOUT_HERO}
        subscribe={subscribeAboutHero}
        save={saveAboutHero}
        errorLabel="about hero"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text", half: true },
          { key: "imageAlt", label: "Image Alt Text", type: "text", half: true },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "image", label: "Hero Image", type: "image", upload: uploadAboutHeroImage },
        ]}
      />
    </SectionFrame>
  );
}

function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div className="flex flex-col justify-center">
          <Eyebrow>{data.badge}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-3 text-2xl" />
        </div>
        <div className="flex items-center justify-center overflow-hidden rounded-xl border" style={{ borderColor: HEX.border, background: HEX.raised }}>
          {data.image ? (
            <img src={data.image} alt={data.imageAlt || ""} className="max-h-40 w-full object-contain p-3" />
          ) : (
            <ImageIcon className="m-10 h-8 w-8" style={{ color: HEX.dim }} />
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 2) Story Images — collection aboutStoryImages                              */
/* -------------------------------------------------------------------------- */
function StoryImagesSection() {
  const [images, setImages] = useState([]);
  return (
    <SectionFrame index={2} icon={ImageIcon} title="Story Images" subtitle="The three-image collage shown next to the story copy." preview={<StoryImagesPreview items={images} />}>
      <CollectionManager
        eyebrow="Story Images"
        title="Story images"
        itemNoun="image"
        subscribe={subscribeAboutStoryImages}
        create={createAboutStoryImage}
        update={updateAboutStoryImage}
        remove={deleteAboutStoryImage}
        toggle={toggleAboutStoryImageStatus}
        onItems={setImages}
        fields={[
          { key: "image", label: "Image", type: "image", upload: uploadAboutStoryImage },
          { key: "alt", label: "Alt Text", type: "text", required: true },
        ]}
        columns={[
          { key: "alt", label: "Alt Text", primary: true },
          { key: "image", label: "Image", image: true },
        ]}
        itemLabel={(item) => item.alt}
      />
    </SectionFrame>
  );
}

function StoryImagesPreview({ items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        {active.length ? (
          <div className="grid grid-cols-3 gap-3">
            {active.map((item) => (
              <div key={item.id} className="aspect-[4/3] overflow-hidden rounded-xl border" style={{ borderColor: HEX.border }}>
                <img src={item.image} alt={item.alt || ""} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: HEX.dim }}>No active story images yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 3) Values — doc about/values + collection aboutValues                      */
/* -------------------------------------------------------------------------- */
function ValuesSection() {
  const [intro, setIntro] = useState(DEFAULT_ABOUT_VALUES_INTRO);
  const [values, setValues] = useState([]);
  return (
    <SectionFrame index={3} icon={Gem} title="Values" subtitle="Section heading plus the principle cards." preview={<ValuesPreview data={intro} items={values} />}>
      <SettingsCard
        eyebrow="Values Section"
        title="Heading"
        defaults={DEFAULT_ABOUT_VALUES_INTRO}
        subscribe={subscribeAboutValuesIntro}
        save={saveAboutValuesIntro}
        errorLabel="values heading"
        onChange={setIntro}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
      <CollectionManager
        eyebrow="Values"
        title="Values"
        itemNoun="value"
        subscribe={subscribeAboutValues}
        create={createAboutValue}
        update={updateAboutValue}
        remove={deleteAboutValue}
        toggle={toggleAboutValueStatus}
        onItems={setValues}
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
        ]}
        columns={[{ key: "title", label: "Title", primary: true }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function ValuesPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        {active.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {active.map((item) => (
              <div key={item.id} className="rounded-xl border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
                <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{item.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: HEX.dim }}>{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active values yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 4) Timeline — doc about/timeline + collection aboutTimeline                */
/* -------------------------------------------------------------------------- */
function TimelineSection() {
  const [intro, setIntro] = useState(DEFAULT_ABOUT_TIMELINE_INTRO);
  const [entries, setEntries] = useState([]);
  return (
    <SectionFrame index={4} icon={Clock} title="Timeline" subtitle="Section heading plus the year-by-year milestones." preview={<TimelinePreview data={intro} items={entries} />}>
      <SettingsCard
        eyebrow="Timeline Section"
        title="Heading"
        defaults={DEFAULT_ABOUT_TIMELINE_INTRO}
        subscribe={subscribeAboutTimelineIntro}
        save={saveAboutTimelineIntro}
        errorLabel="timeline heading"
        onChange={setIntro}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
      <CollectionManager
        eyebrow="Timeline"
        title="Entries"
        itemNoun="entry"
        subscribe={subscribeAboutTimeline}
        create={createAboutTimelineEntry}
        update={updateAboutTimelineEntry}
        remove={deleteAboutTimelineEntry}
        toggle={toggleAboutTimelineStatus}
        onItems={setEntries}
        fields={[
          { key: "year", label: "Year", type: "text", required: true, half: true, placeholder: "2026" },
          { key: "title", label: "Title", type: "text", required: true, half: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
        ]}
        columns={[
          { key: "title", label: "Title", primary: true },
          { key: "year", label: "Year", render: (item) => item.year },
        ]}
        itemLabel={(item) => item.title || item.year}
      />
    </SectionFrame>
  );
}

function TimelinePreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        {active.length ? (
          <div className="mt-5 flex flex-col gap-4">
            {active.map((item) => (
              <div key={item.id} className="flex gap-4">
                <span className="shrink-0 text-sm font-semibold" style={{ color: HEX.accent }}>{item.year}</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: HEX.dim }}>{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active timeline entries yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* 5) Leadership — doc about/leadership                                       */
/* -------------------------------------------------------------------------- */
function LeadershipSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_LEADERSHIP);
  return (
    <SectionFrame index={5} icon={Users} title="Leadership" subtitle="Section heading and CTA — members derive from the Team module (first 3)." preview={<LeadershipPreview data={form} />}>
      <SettingsCard
        eyebrow="Leadership Section"
        title="Heading & CTA"
        defaults={DEFAULT_ABOUT_LEADERSHIP}
        subscribe={subscribeAboutLeadership}
        save={saveAboutLeadership}
        errorLabel="leadership heading"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text", half: true },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
    </SectionFrame>
  );
}

function LeadershipPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        <p className="mt-3 text-xs" style={{ color: HEX.dim }}>Members shown here come from the Team module (first three).</p>
        <div className="mt-4">
          <PrimaryBtn>{data.ctaLabel || "Meet the full team"}</PrimaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}
