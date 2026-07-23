"use client";

import { useState } from "react";
import {
  Award,
  BadgeCheck,
  BarChart3,
  Home,
  Layers3,
  Megaphone,
  MessageSquareQuote,
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
  DEFAULT_HERO,
  DEFAULT_SERVICES_INTRO,
  DEFAULT_TEAM_PREVIEW,
  DEFAULT_TESTIMONIALS_INTRO,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  createAboutPoint,
  createHeroStat,
  createStat,
  createTrustedLogo,
  createWhyReason,
  deleteAboutPoint,
  deleteHeroStat,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyReason,
  saveAbout,
  saveContactCta,
  saveHero,
  saveServicesIntro,
  saveTeamPreview,
  saveTestimonialsIntro,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAbout,
  subscribeAboutPointItems,
  subscribeContactCta,
  subscribeHero,
  subscribeHeroStatItems,
  subscribeServicesIntro,
  subscribeStatItems,
  subscribeTeamPreview,
  subscribeTestimonialsIntro,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeWhyChooseUs,
  subscribeWhyReasonItems,
  toggleAboutPointStatus,
  toggleHeroStatStatus,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyReasonStatus,
  updateAboutPoint,
  updateHeroStat,
  updateStat,
  updateTrustedLogo,
  updateWhyReason,
  uploadTrustedLogoImage,
  uploadWhyReasonImage,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function SnapageeHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Snapagee Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Snapagee home page — edit on the left, see a live preview on the right. Each block saves on its own.
              Services, team, and testimonials copy shown here comes from their own modules; only the intro headings live on this page.
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
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page badge, headline, subcopy, CTAs, and the hero stat strip." preview={<HeroPreview data={form} stats={stats} />}>
      <SettingsCard
        eyebrow="Hero Section"
        title="Hero content"
        defaults={DEFAULT_HERO}
        subscribe={subscribeHero}
        save={saveHero}
        errorLabel="hero"
        onChange={setForm}
        fields={[
          { key: "badge", label: "Badge", type: "text", hint: "Small pill above the headline, e.g. availability status." },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 4 },
          { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text", half: true, hint: "Links to /contact on the frontend." },
          { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text", half: true, hint: "Links to /services on the frontend." },
        ]}
      />
      <CollectionManager
        eyebrow="Hero Stats"
        title="Hero Stats"
        itemNoun="stat"
        subscribe={subscribeHeroStatItems}
        create={createHeroStat}
        update={updateHeroStat}
        remove={deleteHeroStat}
        toggle={toggleHeroStatStatus}
        onItems={setStats}
        fields={[
          { key: "label", label: "Label", type: "text", required: true, placeholder: "Avg. Time to Launch" },
          { key: "value", label: "Value", type: "number", required: true, half: true },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: " wks" },
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

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Marquee heading and the scrolling client/partner logo images." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
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
        title="Logos"
        itemNoun="logo"
        subscribe={subscribeTrustedLogoItems}
        create={createTrustedLogo}
        update={updateTrustedLogo}
        remove={deleteTrustedLogo}
        toggle={toggleTrustedLogoStatus}
        onItems={setLogos}
        imageColumnLabel="Logo"
        fields={[
          { key: "alt", label: "Alt Text", type: "text", required: true, placeholder: "Acme Inc. logo" },
          { key: "src", label: "Logo Image", type: "image", upload: uploadTrustedLogoImage },
        ]}
        columns={[
          { key: "src", label: "Logo", image: true },
          { key: "alt", label: "Alt Text" },
        ]}
        itemLabel={(item) => item.alt}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={3} icon={BarChart3} title="Stats" subtitle="The standalone Stats section counters — independent from the hero stats above." preview={<StatsPreview stats={stats} />}>
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
          { key: "label", label: "Label", type: "text", required: true, placeholder: "Client Retention" },
          { key: "value", label: "Value", type: "number", required: true, half: true },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "%" },
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
    <SectionFrame index={4} icon={Users} title="About" subtitle="Who-we-are copy and the supporting bullet points." preview={<AboutPreview data={form} points={points} />}>
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
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 5 },
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
    <SectionFrame index={5} icon={Award} title="Why Choose Us" subtitle="Heading and the bento-grid reason cards (keep exactly 4 active)." preview={<WhyPreview data={form} reasons={reasons} />}>
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
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
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
        imageColumnLabel="Image"
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3 },
          { key: "imageUrl", label: "Image", type: "image", upload: uploadWhyReasonImage },
        ]}
        columns={[
          { key: "imageUrl", label: "Image", image: true },
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
          { key: "description", label: "Description", type: "textarea", rows: 3 },
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

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={9} icon={Megaphone} title="Contact CTA" subtitle="Closing banner used across the site's pages (no eyebrow on this section)." preview={<ContactCtaPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact CTA Section"
        title="Banner content"
        defaults={DEFAULT_CONTACT_CTA}
        subscribe={subscribeContactCta}
        save={saveContactCta}
        errorLabel="contact cta"
        onChange={setForm}
        fields={[
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "subheading", label: "Subheading", type: "textarea", rows: 3 },
          { key: "buttonLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Previews (Snapagee ink/paper + indigo/lime look)                          */
/* -------------------------------------------------------------------------- */

function HeroPreview({ data, stats }) {
  const active = (stats || []).filter((stat) => stat.active !== false);
  return (
    <PreviewShell>
      <div className="flex flex-col gap-4 p-6 text-left">
        {data.badge ? (
          <span
            className="inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ borderColor: HEX.border, color: HEX.dim }}
          >
            {data.badge}
          </span>
        ) : null}
        <PreviewHeading lead={data.headline || "Headline goes here"} className="text-2xl" />
        <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="flex flex-wrap items-center gap-3">
          <PrimaryBtn>{data.primaryCtaLabel || "Primary CTA"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCtaLabel || "Secondary CTA"}</SecondaryBtn>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-4 border-t pt-4 sm:grid-cols-4" style={{ borderColor: HEX.border }}>
          {active.length ? (
            active.map((stat) => (
              <div key={stat.id} className="flex flex-col gap-1">
                <p className="text-lg font-bold" style={{ color: HEX.fg }}>
                  {stat.value ?? 0}
                  <span style={{ color: HEX.accent }}>{stat.suffix}</span>
                </p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: HEX.dim }}>{stat.label || "Label"}</p>
              </div>
            ))
          ) : (
            <p className="col-span-full text-[11px]" style={{ color: HEX.dim }}>No hero stats yet</p>
          )}
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
          {data.heading || "Trusted by teams that ship fast"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <div
                key={logo.id}
                className="flex h-12 w-24 items-center justify-center rounded-lg border p-2"
                style={{ borderColor: HEX.border, background: HEX.raised }}
              >
                {logo.src ? (
                  <img src={logo.src} alt={logo.alt || ""} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-[10px]" style={{ color: HEX.dim }}>{logo.alt || "Logo"}</span>
                )}
              </div>
            ))
          ) : (
            <span className="text-[11px]" style={{ color: HEX.dim }}>No logos yet</span>
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
      <div className="flex flex-col gap-3 p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="text-lg" />
        <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        <ul className="flex flex-col gap-1.5">
          {active.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-xs" style={{ color: HEX.dim }}>
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEX.accent }} />
              {item.text}
            </li>
          ))}
        </ul>
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
        <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
        {data.description ? (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.description}</p>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {active.length ? (
            active.map((item) => (
              <div key={item.id} className="rounded-xl border p-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
                <div className="mb-2 flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border" style={{ borderColor: HEX.border }}>
                  {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-full w-full object-cover" /> : null}
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

function ContactCtaPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <PreviewHeading lead={data.heading} className="text-lg" />
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subheading}</p>
        <PrimaryBtn>{data.buttonLabel || "Start a Project"}</PrimaryBtn>
      </div>
    </PreviewShell>
  );
}
