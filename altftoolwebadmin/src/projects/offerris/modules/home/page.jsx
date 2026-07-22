"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  HelpCircle,
  Home,
  Layers3,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  Sparkles,
  Users,
} from "lucide-react";
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
  DEFAULT_ABOUT,
  DEFAULT_CONTACT_CTA,
  DEFAULT_FAQ_INTRO,
  DEFAULT_HERO,
  DEFAULT_LATEST_BLOGS,
  DEFAULT_NEWSLETTER,
  DEFAULT_SERVICES_INTRO,
  DEFAULT_TEAM_PREVIEW,
  DEFAULT_TESTIMONIALS_INTRO,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  createAboutHighlight,
  createStat,
  createTrustedLogo,
  createWhyItem,
  deleteAboutHighlight,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyItem,
  saveAbout,
  saveContactCta,
  saveFaqIntro,
  saveHero,
  saveLatestBlogs,
  saveNewsletter,
  saveServicesIntro,
  saveTeamPreview,
  saveTestimonialsIntro,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAbout,
  subscribeAboutHighlightItems,
  subscribeContactCta,
  subscribeFaqIntro,
  subscribeHero,
  subscribeLatestBlogs,
  subscribeNewsletter,
  subscribeServicesIntro,
  subscribeStatItems,
  subscribeTeamPreview,
  subscribeTestimonialsIntro,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeWhyChooseUs,
  subscribeWhyItemItems,
  toggleAboutHighlightStatus,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyItemStatus,
  updateAboutHighlight,
  updateStat,
  updateTrustedLogo,
  updateWhyItem,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function OfferrisHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Offerris Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Offerris home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutSection />
        <WhyChooseUsSection />
        <ServicesIntroSection />
        <TeamPreviewSection />
        <TestimonialsIntroSection />
        <FaqIntroSection />
        <LatestBlogsSection />
        <NewsletterSection />
        <ContactCtaSection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const [form, setForm] = useState(DEFAULT_HERO);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, CTAs, portal stack words, and the project card." preview={<HeroPreview data={form} />}>
      <SettingsCard
        eyebrow="Hero Section"
        title="Hero content"
        defaults={DEFAULT_HERO}
        subscribe={subscribeHero}
        save={saveHero}
        errorLabel="hero"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 4 },
          { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text", half: true },
          { key: "primaryCtaHref", label: "Primary CTA Href", type: "text", half: true },
          { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text", half: true },
          { key: "secondaryCtaHref", label: "Secondary CTA Href", type: "text", half: true },
          { key: "scrollLabel", label: "Scroll Label", type: "text" },
          { key: "stackItems", label: "Portal Stack Words", type: "list", placeholder: "STRATEGY", hint: "The vertical word stack inside the hero portal panel." },
          { key: "cardValue", label: "Project Card Value", type: "text", half: true, placeholder: "240+" },
          { key: "cardLabel", label: "Project Card Label", type: "text", half: true, placeholder: "Projects Completed" },
          { key: "cardSub", label: "Project Card Subtext", type: "text", placeholder: "Across 12+ Countries" },
        ]}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Marquee label and the scrolling brand names." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
      <SettingsCard
        eyebrow="Trusted Logos Section"
        title="Label"
        defaults={DEFAULT_TRUSTED_LOGOS}
        subscribe={subscribeTrustedLogos}
        save={saveTrustedLogos}
        errorLabel="trusted logos"
        onChange={setSettings}
        fields={[{ key: "label", label: "Label", type: "text" }]}
      />
      <CollectionManager
        eyebrow="Trusted Logos"
        title="Brand names"
        itemNoun="brand"
        subscribe={subscribeTrustedLogoItems}
        create={createTrustedLogo}
        update={updateTrustedLogo}
        remove={deleteTrustedLogo}
        toggle={toggleTrustedLogoStatus}
        onItems={setLogos}
        fields={[{ key: "name", label: "Brand Name", type: "text", required: true, placeholder: "NORTHWIND" }]}
        columns={[{ key: "name", label: "Brand" }]}
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={3} icon={BarChart3} title="Stats" subtitle="The four animated counters." preview={<StatsPreview stats={stats} />}>
      <CollectionManager
        eyebrow="Stats Section"
        title="Stats"
        itemNoun="stat"
        subscribe={subscribeStatItems}
        create={createStat}
        update={updateStat}
        remove={deleteStat}
        toggle={toggleStatStatus}
        onItems={setStats}
        fields={[
          { key: "value", label: "Value", type: "number", required: true, half: true },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+ / % / x / M+" },
          { key: "label", label: "Label", type: "text", required: true },
        ]}
        columns={[{ key: "label", label: "Stat" }, { key: "value", label: "Value", render: (item) => `${item.value}${item.suffix || ""}` }]}
        itemLabel={(item) => item.label}
      />
    </SectionFrame>
  );
}

function AboutSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState([]);
  return (
    <SectionFrame index={4} icon={Users} title="About" subtitle="Who-we-are copy and highlight bullets." preview={<AboutPreview data={form} highlights={highlights} />}>
      <SettingsCard
        eyebrow="About Section"
        title="About content"
        defaults={DEFAULT_ABOUT}
        subscribe={subscribeAbout}
        save={saveAbout}
        errorLabel="about"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "copy", label: "Copy", type: "textarea", rows: 5 },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
        ]}
      />
      <CollectionManager
        eyebrow="About"
        title="Highlights"
        itemNoun="highlight"
        subscribe={subscribeAboutHighlightItems}
        create={createAboutHighlight}
        update={updateAboutHighlight}
        remove={deleteAboutHighlight}
        toggle={toggleAboutHighlightStatus}
        onItems={setHighlights}
        fields={[{ key: "text", label: "Text", type: "text", required: true }]}
        columns={[{ key: "text", label: "Highlight" }]}
        itemLabel={(item) => item.text}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [form, setForm] = useState(DEFAULT_WHY_CHOOSE_US);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame index={5} icon={Megaphone} title="Why Choose Us" subtitle="Heading and the four value cards." preview={<WhyPreview data={form} items={items} />}>
      <SettingsCard
        eyebrow="Why Choose Us Section"
        title="Heading"
        defaults={DEFAULT_WHY_CHOOSE_US}
        subscribe={subscribeWhyChooseUs}
        save={saveWhyChooseUs}
        errorLabel="why choose us"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
        ]}
      />
      <CollectionManager
        eyebrow="Why Choose Us"
        title="Cards"
        itemNoun="card"
        subscribe={subscribeWhyItemItems}
        create={createWhyItem}
        update={updateWhyItem}
        remove={deleteWhyItem}
        toggle={toggleWhyItemStatus}
        onItems={setItems}
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
        ]}
        columns={[{ key: "title", label: "Card" }, { key: "description", label: "Description" }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function ServicesIntroSection() {
  const [form, setForm] = useState(DEFAULT_SERVICES_INTRO);
  return (
    <SectionFrame index={6} icon={Layers3} title="Services Intro" subtitle="Heading above the services grid (cards come from the Services module)." preview={<IntroPreview data={form} />}>
      <SettingsCard
        eyebrow="Services Grid Section"
        title="Heading"
        defaults={DEFAULT_SERVICES_INTRO}
        subscribe={subscribeServicesIntro}
        save={saveServicesIntro}
        errorLabel="services intro"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

function TeamPreviewSection() {
  const [form, setForm] = useState(DEFAULT_TEAM_PREVIEW);
  return (
    <SectionFrame index={7} icon={Users} title="Team Preview" subtitle="Heading above the four featured members (members come from the Team module)." preview={<IntroPreview data={form} cta />}>
      <SettingsCard
        eyebrow="Team Preview Section"
        title="Heading"
        defaults={DEFAULT_TEAM_PREVIEW}
        subscribe={subscribeTeamPreview}
        save={saveTeamPreview}
        errorLabel="team preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TestimonialsIntroSection() {
  const [form, setForm] = useState(DEFAULT_TESTIMONIALS_INTRO);
  return (
    <SectionFrame index={8} icon={MessageSquareQuote} title="Testimonials Intro" subtitle="Heading above the testimonial slider (quotes come from the Testimonials module)." preview={<IntroPreview data={form} />}>
      <SettingsCard
        eyebrow="Testimonials Section"
        title="Heading"
        defaults={DEFAULT_TESTIMONIALS_INTRO}
        subscribe={subscribeTestimonialsIntro}
        save={saveTestimonialsIntro}
        errorLabel="testimonials intro"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
    </SectionFrame>
  );
}

function FaqIntroSection() {
  const [form, setForm] = useState(DEFAULT_FAQ_INTRO);
  return (
    <SectionFrame index={9} icon={HelpCircle} title="FAQ Intro" subtitle="Heading above the FAQ accordion (questions come from the FAQ module)." preview={<IntroPreview data={form} />}>
      <SettingsCard
        eyebrow="FAQ Section"
        title="Heading"
        defaults={DEFAULT_FAQ_INTRO}
        subscribe={subscribeFaqIntro}
        save={saveFaqIntro}
        errorLabel="faq intro"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
    </SectionFrame>
  );
}

function LatestBlogsSection() {
  const [form, setForm] = useState(DEFAULT_LATEST_BLOGS);
  return (
    <SectionFrame index={10} icon={Newspaper} title="Latest Blogs" subtitle="Heading above the three newest posts (posts come from the Blog module)." preview={<IntroPreview data={form} cta />}>
      <SettingsCard
        eyebrow="Latest Blogs Section"
        title="Heading"
        defaults={DEFAULT_LATEST_BLOGS}
        subscribe={subscribeLatestBlogs}
        save={saveLatestBlogs}
        errorLabel="latest blogs"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={11} icon={Mail} title="Newsletter" subtitle="Newsletter card copy (section is currently commented out on the home page but stays managed)." preview={<NewsletterPreview data={form} />}>
      <SettingsCard
        eyebrow="Newsletter Section"
        title="Newsletter content"
        defaults={DEFAULT_NEWSLETTER}
        subscribe={subscribeNewsletter}
        save={saveNewsletter}
        errorLabel="newsletter"
        onChange={setForm}
        fields={[
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "placeholder", label: "Input Placeholder", type: "text", half: true },
          { key: "cta", label: "Button Label", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={12} icon={Megaphone} title="Contact CTA" subtitle="Bottom-of-page call to action (also reused across inner pages)." preview={<ContactCtaPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact CTA Section"
        title="Contact CTA content"
        defaults={DEFAULT_CONTACT_CTA}
        subscribe={subscribeContactCta}
        save={saveContactCta}
        errorLabel="contact CTA"
        onChange={setForm}
        fields={[
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text", half: true },
          { key: "ctaHref", label: "Button Href", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Previews (dark neon shells, mirror the live sections loosely)               */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3 p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="text-2xl" />
        <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy || "Subcopy goes here"}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <PrimaryBtn>{data.primaryCtaLabel || "Primary CTA"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCtaLabel || "Secondary CTA"}</SecondaryBtn>
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
          <div>
            <p className="text-lg font-bold" style={{ color: HEX.accentAlt }}>{data.cardValue || "240+"}</p>
            <p className="text-xs" style={{ color: HEX.fg }}>{data.cardLabel || "Projects Completed"}</p>
            <p className="text-[10px]" style={{ color: HEX.dim }}>{data.cardSub || "Across 12+ Countries"}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {(data.stackItems || []).slice(0, 4).map((item) => (
              <span key={item} className="text-[9px] font-semibold tracking-[0.3em]" style={{ color: HEX.dim }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ data, logos }) {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3 p-6">
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>
          {data.label || "Marquee label"}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {(logos.length ? logos : [{ id: "a", name: "BRAND ONE" }, { id: "b", name: "BRAND TWO" }]).map((logo) => (
            <span key={logo.id} className="text-xs font-bold tracking-widest" style={{ color: HEX.fg }}>{logo.name}</span>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function StatsPreview({ stats }) {
  const rows = stats.length ? stats : [{ id: "1", value: 240, suffix: "+", label: "Projects shipped" }];
  return (
    <PreviewShell>
      <div className="grid grid-cols-2 gap-3 p-6">
        {rows.map((stat) => (
          <div key={stat.id} className="rounded-xl border p-3 text-center" style={{ borderColor: HEX.border, background: HEX.raised }}>
            <p className="text-xl font-bold" style={{ color: HEX.accent }}>{stat.value}{stat.suffix}</p>
            <p className="text-[10px]" style={{ color: HEX.dim }}>{stat.label}</p>
          </div>
        ))}
      </div>
    </PreviewShell>
  );
}

function AboutPreview({ data, highlights }) {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3 p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.copy || "About copy goes here"}</p>
        <ul className="flex flex-col gap-1.5">
          {(highlights.length ? highlights.map((h) => h.text) : ["Highlight bullet"]).map((text) => (
            <li key={text} className="flex items-center gap-2 text-xs" style={{ color: HEX.fg }}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: HEX.accent }} />
              {text}
            </li>
          ))}
        </ul>
        <div><SecondaryBtn>{data.ctaLabel || "More About Us"}</SecondaryBtn></div>
      </div>
    </PreviewShell>
  );
}

function WhyPreview({ data, items }) {
  const rows = items.length ? items : [{ id: "1", title: "Card title", description: "Card description" }];
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3 p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="text-xs" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="grid grid-cols-2 gap-2">
          {rows.slice(0, 4).map((item, index) => (
            <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
              <p className="text-[10px] font-bold" style={{ color: HEX.accentAlt }}>{String(index + 1).padStart(2, "0")}</p>
              <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{item.title}</p>
              <p className="text-[10px] leading-relaxed" style={{ color: HEX.dim }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </PreviewShell>
  );
}

function IntroPreview({ data, cta }) {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-2 p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="text-lg" />
        {data.subcopy ? <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p> : null}
        {cta && data.ctaLabel ? <div className="mt-1"><SecondaryBtn>{data.ctaLabel}</SecondaryBtn></div> : null}
      </div>
    </PreviewShell>
  );
}

function NewsletterPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="text-xs" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="mt-2 flex w-full max-w-xs items-center gap-2">
          <span className="flex-1 rounded-full border px-3 py-1.5 text-left text-[10px]" style={{ borderColor: HEX.border, color: HEX.dim }}>
            {data.placeholder || "you@company.com"}
          </span>
          <PrimaryBtn>{data.cta || "Subscribe"}</PrimaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}

function ContactCtaPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="text-xs" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="mt-2"><PrimaryBtn>{data.ctaLabel || "Book a Strategy Call"}</PrimaryBtn></div>
      </div>
    </PreviewShell>
  );
}
