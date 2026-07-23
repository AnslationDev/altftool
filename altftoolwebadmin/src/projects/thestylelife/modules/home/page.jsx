"use client";

import { useState } from "react";
import {
  Award,
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
  createAboutPoint,
  createStat,
  createTrustedLogo,
  createWhyReason,
  deleteAboutPoint,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyReason,
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
  subscribeAboutPointItems,
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
  subscribeWhyReasonItems,
  toggleAboutPointStatus,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyReasonStatus,
  updateAboutPoint,
  updateStat,
  updateTrustedLogo,
  updateWhyReason,
  uploadAboutImage,
  uploadHeroImage,
  uploadWhyReasonImage,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function ThestylelifeHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">TheStyleLife Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the TheStyleLife home page — edit on the left, see a live preview on the right. Each block saves on its own.
              Services, team, testimonials, and FAQs come from their own modules.
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
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, subcopy, CTAs, and the hero photo." preview={<HeroPreview data={form} />}>
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
          { key: "image", label: "Hero Image", type: "image", upload: uploadHeroImage },
        ]}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Marquee heading and the scrolling brand names." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
      <SettingsCard
        eyebrow="Trusted Logos Section"
        title="Heading"
        defaults={DEFAULT_TRUSTED_LOGOS}
        subscribe={subscribeTrustedLogos}
        save={saveTrustedLogos}
        errorLabel="trusted logos"
        onChange={setSettings}
        fields={[{ key: "heading", label: "Heading", type: "text" }]}
      />
      <CollectionManager
        eyebrow="Trusted Logos"
        title="Brands"
        itemNoun="brand"
        subscribe={subscribeTrustedLogoItems}
        create={createTrustedLogo}
        update={updateTrustedLogo}
        remove={deleteTrustedLogo}
        toggle={toggleTrustedLogoStatus}
        onItems={setLogos}
        fields={[{ key: "name", label: "Brand Name", type: "text", required: true, placeholder: "FIELDING & CO." }]}
        columns={[{ key: "name", label: "Brand" }]}
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={3} icon={BarChart3} title="Stats" subtitle="The animated counters under the hero (no heading — just the numbers)." preview={<StatsPreview stats={stats} />}>
      <CollectionManager
        eyebrow="Home Stats"
        title="Stats"
        itemNoun="stat"
        subscribe={subscribeStatItems}
        create={createStat}
        update={updateStat}
        remove={deleteStat}
        toggle={toggleStatStatus}
        onItems={setStats}
        fields={[
          { key: "label", label: "Label", type: "text", required: true, placeholder: "Brands Styled" },
          { key: "value", label: "Value", type: "number", required: true, half: true },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+" },
        ]}
        columns={[
          { key: "label", label: "Stat" },
          { key: "value", label: "Value", render: (item) => `${item.value ?? 0}${item.suffix || ""}` },
        ]}
        itemLabel={(item) => item.label}
      />
    </SectionFrame>
  );
}

function AboutSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [points, setPoints] = useState([]);
  return (
    <SectionFrame index={4} icon={Users} title="About" subtitle="Who-we-are copy, image, and the supporting points." preview={<AboutPreview data={form} points={points} />}>
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
          { key: "body", label: "Body", type: "textarea", rows: 5, hint: "Also opens the About page's story section." },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
          { key: "image", label: "Image", type: "image", upload: uploadAboutImage },
        ]}
      />
      <CollectionManager
        eyebrow="About"
        title="Points"
        itemNoun="point"
        subscribe={subscribeAboutPointItems}
        create={createAboutPoint}
        update={updateAboutPoint}
        remove={deleteAboutPoint}
        toggle={toggleAboutPointStatus}
        onItems={setPoints}
        fields={[{ key: "text", label: "Text", type: "text", required: true }]}
        columns={[{ key: "text", label: "Point" }]}
        itemLabel={(item) => item.text}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [form, setForm] = useState(DEFAULT_WHY_CHOOSE_US);
  const [reasons, setReasons] = useState([]);
  return (
    <SectionFrame index={5} icon={Award} title="Why Choose Us" subtitle="Heading and the four illustrated reason cards." preview={<WhyPreview data={form} reasons={reasons} />}>
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
        ]}
      />
      <CollectionManager
        eyebrow="Why Choose Us"
        title="Reasons"
        itemNoun="reason"
        subscribe={subscribeWhyReasonItems}
        create={createWhyReason}
        update={updateWhyReason}
        remove={deleteWhyReason}
        toggle={toggleWhyReasonStatus}
        onItems={setReasons}
        imageColumnLabel="Illustration"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
          { key: "image", label: "Illustration", type: "image", upload: uploadWhyReasonImage },
        ]}
        columns={[
          { key: "image", label: "Illustration", image: true },
          { key: "title", label: "Reason" },
          { key: "description", label: "Description" },
        ]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function ServicesIntroSection() {
  const [form, setForm] = useState(DEFAULT_SERVICES_INTRO);
  return (
    <SectionFrame index={6} icon={Layers3} title="Services Intro" subtitle="Heading above the services grid (cards come from the Services module)." preview={<IntroPreview data={form} cta />}>
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TeamPreviewSection() {
  const [form, setForm] = useState(DEFAULT_TEAM_PREVIEW);
  return (
    <SectionFrame index={7} icon={Users} title="Team Preview" subtitle="Heading above the featured members (members come from the Team module)." preview={<IntroPreview data={form} cta />}>
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

function FaqIntroSection() {
  const [form, setForm] = useState(DEFAULT_FAQ_INTRO);
  return (
    <SectionFrame index={9} icon={HelpCircle} title="FAQ Intro" subtitle="Heading above the accordion (questions come from the FAQ module)." preview={<IntroPreview data={form} />}>
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

function LatestBlogsSection() {
  const [form, setForm] = useState(DEFAULT_LATEST_BLOGS);
  return (
    <SectionFrame index={10} icon={Newspaper} title="Latest Blogs" subtitle="Heading above the newest posts (posts come from the Blog module)." preview={<IntroPreview data={form} cta />}>
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={11} icon={Mail} title="Newsletter" subtitle="Signup panel copy — a plain button label, no link or success message." preview={<NewsletterPreview data={form} />}>
      <SettingsCard
        eyebrow="Newsletter Section"
        title="Newsletter content"
        defaults={DEFAULT_NEWSLETTER}
        subscribe={subscribeNewsletter}
        save={saveNewsletter}
        errorLabel="newsletter"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={12} icon={Megaphone} title="Contact CTA" subtitle="Closing banner used across the site's pages." preview={<ContactCtaPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact CTA Section"
        title="Banner content"
        defaults={DEFAULT_CONTACT_CTA}
        subscribe={subscribeContactCta}
        save={saveContactCta}
        errorLabel="contact cta"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Previews (TheStyleLife paper/ink/coral editorial look)                     */
/* -------------------------------------------------------------------------- */

function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="grid gap-4 p-6 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
        <div className="flex flex-col items-start gap-3 text-left">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.headline || "Headline goes here"} className="text-2xl" />
          <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryBtn>{data.primaryCtaLabel || "Primary CTA"}</PrimaryBtn>
            <SecondaryBtn>{data.secondaryCtaLabel || "Secondary CTA"}</SecondaryBtn>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: HEX.border, background: HEX.raised, minHeight: 160 }}>
          {data.image ? <img src={data.image} alt="" className="h-full w-full object-cover" /> : null}
        </div>
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ data, logos }) {
  const active = (logos || []).filter((logo) => logo.active !== false);
  return (
    <PreviewShell>
      <div className="px-6 py-8 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.3em]" style={{ color: HEX.dim }}>
          {data.heading || "Styled brands trust us with their story"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <span
                key={logo.id}
                className="flex h-10 items-center justify-center rounded-lg border px-3 text-[10px] font-semibold uppercase tracking-wider"
                style={{ borderColor: HEX.border, background: HEX.raised, color: HEX.dim }}
              >
                {logo.name}
              </span>
            ))
          ) : (
            <span className="text-[11px]" style={{ color: HEX.dim }}>No brand names yet</span>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function StatsPreview({ stats }) {
  const active = (stats || []).filter((stat) => stat.active !== false);
  return (
    <PreviewShell>
      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {active.length ? (
          active.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center gap-1 text-center">
              <p className="text-2xl font-bold" style={{ color: HEX.fg }}>
                {stat.value ?? 0}
                <span style={{ color: HEX.accent }}>{stat.suffix}</span>
              </p>
              <p className="text-[10px] uppercase tracking-wider" style={{ color: HEX.dim }}>{stat.label || "Label"}</p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-[11px]" style={{ color: HEX.dim }}>No stats yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

function AboutPreview({ data, points }) {
  const active = (points || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="grid gap-5 p-6 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.headline} className="text-lg" />
          <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
          <ul className="flex flex-col gap-1.5">
            {active.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-xs" style={{ color: HEX.dim }}>
                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEX.accent }} />
                {item.text}
              </li>
            ))}
          </ul>
          <div><SecondaryBtn>{data.ctaLabel || "More About Us"}</SecondaryBtn></div>
        </div>
        <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: HEX.border, background: HEX.raised, minHeight: 160 }}>
          {data.image ? <img src={data.image} alt="" className="h-full w-full object-cover" /> : null}
        </div>
      </div>
    </PreviewShell>
  );
}

function WhyPreview({ data, reasons }) {
  const active = (reasons || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="mt-2 text-lg" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {active.length ? (
            active.map((item) => (
              <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: HEX.border }}>
                  {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain" /> : null}
                </div>
                <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{item.title || "Untitled"}</p>
                <p className="mt-1 text-[11px] leading-snug" style={{ color: HEX.dim }}>{item.description}</p>
              </div>
            ))
          ) : (
            <p className="text-[11px]" style={{ color: HEX.dim }}>No reasons yet</p>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function IntroPreview({ data, cta }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="text-lg" />
        {data.description ? (
          <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.description}</p>
        ) : null}
        {cta && data.ctaLabel ? <SecondaryBtn>{data.ctaLabel}</SecondaryBtn> : null}
      </div>
    </PreviewShell>
  );
}

function NewsletterPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        <PrimaryBtn>{data.ctaLabel || "Subscribe"}</PrimaryBtn>
      </div>
    </PreviewShell>
  );
}

function ContactCtaPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="text-lg" />
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        <PrimaryBtn>{data.ctaLabel || "Start a Conversation"}</PrimaryBtn>
      </div>
    </PreviewShell>
  );
}
