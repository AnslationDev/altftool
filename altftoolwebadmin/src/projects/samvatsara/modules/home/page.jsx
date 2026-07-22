"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Briefcase,
  Check,
  HelpCircle,
  Home,
  Mail,
  Megaphone,
  MessageSquareQuote,
  Newspaper,
  Sparkles,
  Star,
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
  asLines,
} from "./components/HomeAdminShared";
import {
  DEFAULT_ABOUT_TEASER,
  DEFAULT_BLOG_PREVIEW,
  DEFAULT_CTA,
  DEFAULT_FAQ_PREVIEW,
  DEFAULT_HERO,
  DEFAULT_NEWSLETTER,
  DEFAULT_SERVICES_PREVIEW,
  DEFAULT_TEAM_PREVIEW,
  DEFAULT_TESTIMONIALS_PREVIEW,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  WHY_ICONS,
  createStat,
  createTrustedLogo,
  createWhyReason,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyReason,
  saveAboutTeaser,
  saveBlogPreview,
  saveCta,
  saveFaqPreview,
  saveHero,
  saveNewsletter,
  saveServicesPreview,
  saveTeamPreview,
  saveTestimonialsPreview,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAboutTeaser,
  subscribeBlogPreview,
  subscribeCta,
  subscribeFaqPreview,
  subscribeHero,
  subscribeNewsletter,
  subscribeServicesPreview,
  subscribeStatItems,
  subscribeTeamPreview,
  subscribeTestimonialsPreview,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeWhyChooseUs,
  subscribeWhyReasonItems,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyReasonStatus,
  updateStat,
  updateTrustedLogo,
  updateWhyReason,
  uploadHeroImage,
  deleteHeroImage,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function SamvatsaraHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Samvatsara Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Samvatsara home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutTeaserSection />
        <WhyChooseUsSection />
        <ServicesPreviewSection />
        <TeamPreviewSection />
        <TestimonialsPreviewSection />
        <FaqPreviewSection />
        <BlogPreviewSection />
        <CtaSection />
        <NewsletterSection />
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
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, CTAs, and image." preview={<HeroPreview data={form} />}>
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
          { key: "headlineLead", label: "Headline (lead)", type: "text", required: true },
          { key: "headlineItalic", label: "Headline (italic)", type: "text" },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 4, required: true },
          { key: "ctaPrimary", label: "Primary CTA", type: "cta" },
          { key: "ctaSecondary", label: "Secondary CTA", type: "cta" },
          { key: "scrollLabel", label: "Scroll Label", type: "text" },
          {
            key: "imageUrl",
            label: "Hero Image",
            type: "image",
            pathKey: "imagePath",
            uploader: { upload: uploadHeroImage, remove: deleteHeroImage },
            aspect: "aspect-video",
          },
        ]}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Social-proof label and the logo names." preview={<TrustedLogosPreview label={settings.label} logos={logos} />}>
      <SettingsCard
        eyebrow="Trusted Logos Section"
        title="Section label"
        defaults={DEFAULT_TRUSTED_LOGOS}
        subscribe={subscribeTrustedLogos}
        save={saveTrustedLogos}
        errorLabel="trusted logos"
        onChange={setSettings}
        fields={[{ key: "label", label: "Label", type: "text", required: true }]}
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
        fields={[{ key: "name", label: "Name", type: "text", required: true }]}
        columns={[{ key: "name", label: "Name", primary: true }]}
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={3} icon={BarChart3} title="Stats" subtitle="Animated stat counters." preview={<StatsPreview items={stats} />}>
      <CollectionManager
        eyebrow="Stats"
        title="Stat counters"
        itemNoun="stat"
        subscribe={subscribeStatItems}
        create={createStat}
        update={updateStat}
        remove={deleteStat}
        toggle={toggleStatStatus}
        onItems={setStats}
        fields={[
          { key: "value", label: "Value", type: "number", required: true, half: true },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+ / % / yrs" },
          { key: "label", label: "Label", type: "text", required: true },
        ]}
        columns={[
          { key: "value", label: "Value", primary: true, render: (item) => `${item.value ?? 0}${item.suffix || ""}` },
          { key: "label", label: "Label" },
        ]}
        itemLabel={(item) => item.label}
      />
    </SectionFrame>
  );
}

function AboutTeaserSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT_TEASER);
  return (
    <SectionFrame index={4} icon={Sparkles} title="About Teaser" subtitle="Short intro block with bullet points and a quote." preview={<AboutTeaserPreview data={form} />}>
      <SettingsCard
        eyebrow="About Teaser Section"
        title="About teaser content"
        defaults={DEFAULT_ABOUT_TEASER}
        subscribe={subscribeAboutTeaser}
        save={saveAboutTeaser}
        errorLabel="about teaser"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text", hint: "The words within the heading rendered in italic." },
          { key: "body", label: "Body", type: "textarea", rows: 4, required: true },
          { key: "points", label: "Points (one per line)", type: "lines", rows: 4 },
          { key: "cta", label: "CTA", type: "cta" },
          { key: "quote", label: "Quote", type: "textarea", rows: 3 },
          { key: "quoteAuthor", label: "Quote Author", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [settings, setSettings] = useState(DEFAULT_WHY_CHOOSE_US);
  const [reasons, setReasons] = useState([]);
  return (
    <SectionFrame index={5} icon={Star} title="Why Choose Us" subtitle="Heading and the list of reasons." preview={<WhyChooseUsPreview data={settings} reasons={reasons} />}>
      <SettingsCard
        eyebrow="Why Choose Us Section"
        title="Heading"
        defaults={DEFAULT_WHY_CHOOSE_US}
        subscribe={subscribeWhyChooseUs}
        save={saveWhyChooseUs}
        errorLabel="why choose us"
        onChange={setSettings}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
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
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
          { key: "icon", label: "Icon", type: "select", options: WHY_ICONS, half: true },
        ]}
        columns={[
          { key: "title", label: "Title", primary: true },
          { key: "icon", label: "Icon" },
        ]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function ServicesPreviewSection() {
  const [form, setForm] = useState(DEFAULT_SERVICES_PREVIEW);
  return (
    <SectionFrame index={6} icon={Briefcase} title="Services Preview" subtitle="Intro copy above the services grid." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="Services Preview Section"
        title="Services preview content"
        defaults={DEFAULT_SERVICES_PREVIEW}
        subscribe={subscribeServicesPreview}
        save={saveServicesPreview}
        errorLabel="services preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

function TeamPreviewSection() {
  const [form, setForm] = useState(DEFAULT_TEAM_PREVIEW);
  return (
    <SectionFrame index={7} icon={Users} title="Team Preview" subtitle="Intro copy above the team grid." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Team Preview Section"
        title="Team preview content"
        defaults={DEFAULT_TEAM_PREVIEW}
        subscribe={subscribeTeamPreview}
        save={saveTeamPreview}
        errorLabel="team preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TestimonialsPreviewSection() {
  const [form, setForm] = useState(DEFAULT_TESTIMONIALS_PREVIEW);
  return (
    <SectionFrame index={8} icon={MessageSquareQuote} title="Testimonials Preview" subtitle="Intro copy above the testimonials." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="Testimonials Preview Section"
        title="Testimonials preview content"
        defaults={DEFAULT_TESTIMONIALS_PREVIEW}
        subscribe={subscribeTestimonialsPreview}
        save={saveTestimonialsPreview}
        errorLabel="testimonials preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function FaqPreviewSection() {
  const [form, setForm] = useState(DEFAULT_FAQ_PREVIEW);
  return (
    <SectionFrame index={9} icon={HelpCircle} title="FAQ Preview" subtitle="Intro copy above the FAQ accordion." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="FAQ Preview Section"
        title="FAQ preview content"
        defaults={DEFAULT_FAQ_PREVIEW}
        subscribe={subscribeFaqPreview}
        save={saveFaqPreview}
        errorLabel="FAQ preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function BlogPreviewSection() {
  const [form, setForm] = useState(DEFAULT_BLOG_PREVIEW);
  return (
    <SectionFrame index={10} icon={Newspaper} title="Blog Preview" subtitle="Intro copy above the latest posts." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Blog Preview Section"
        title="Blog preview content"
        defaults={DEFAULT_BLOG_PREVIEW}
        subscribe={subscribeBlogPreview}
        save={saveBlogPreview}
        errorLabel="blog preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function CtaSection() {
  const [form, setForm] = useState(DEFAULT_CTA);
  return (
    <SectionFrame index={11} icon={Megaphone} title="CTA" subtitle="Closing call-to-action band." preview={<CtaPreview data={form} />}>
      <SettingsCard
        eyebrow="CTA Section"
        title="CTA content"
        defaults={DEFAULT_CTA}
        subscribe={subscribeCta}
        save={saveCta}
        errorLabel="CTA"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "headingItalic", label: "Heading (italic portion)", type: "text" },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaPrimary", label: "Primary CTA", type: "cta" },
          { key: "ctaSecondary", label: "Secondary CTA", type: "cta" },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={12} icon={Mail} title="Newsletter" subtitle="Email sign-up block." preview={<NewsletterPreview data={form} />}>
      <SettingsCard
        eyebrow="Newsletter Section"
        title="Newsletter content"
        defaults={DEFAULT_NEWSLETTER}
        subscribe={subscribeNewsletter}
        save={saveNewsletter}
        errorLabel="newsletter"
        onChange={setForm}
        fields={[
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "placeholder", label: "Input Placeholder", type: "text", half: true },
          { key: "cta", label: "Button Label", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews (light Samvatsara look)                                   */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="grid gap-6 p-6 sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.headlineLead} italic={data.headlineItalic} className="mt-3 text-2xl" />
          {data.subcopy ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryBtn>{data.ctaPrimary?.label || "Primary"}</PrimaryBtn>
            <SecondaryBtn>{data.ctaSecondary?.label || "Secondary"}</SecondaryBtn>
          </div>
          {data.scrollLabel ? (
            <p className="mt-6 text-[10px] uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>{data.scrollLabel}</p>
          ) : null}
        </div>
        <div className="hidden items-center justify-center sm:flex">
          {data.imageUrl ? (
            <img src={data.imageUrl} alt="" className="max-h-44 w-full object-contain" />
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-xl border text-xs" style={{ borderColor: HEX.border, color: HEX.dim }}>
              Hero image
            </div>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ label, logos }) {
  const active = (logos || []).filter((logo) => logo.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>
          {label || "Trusted by teams"}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <div key={logo.id} className="flex h-10 items-center justify-center rounded-md border px-3" style={{ borderColor: HEX.border }}>
                <span className="text-xs font-medium" style={{ color: HEX.fg }}>{logo.name || "Logo"}</span>
              </div>
            ))
          ) : (
            <span className="text-xs" style={{ color: HEX.dim }}>No active logos yet</span>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function StatsPreview({ items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        {active.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {active.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold" style={{ color: HEX.fg }}>{`${item.value ?? 0}${item.suffix || ""}`}</span>
                <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs" style={{ color: HEX.dim }}>No active stats yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

function AboutTeaserPreview({ data }) {
  const points = asLines(data.points);
  return (
    <PreviewShell>
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} italic={data.headingItalic} className="mt-3 text-xl" />
          {data.body ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-4">
          {points.length ? (
            <ul className="flex flex-col gap-2">
              {points.map((point, index) => (
                <li key={`${point}-${index}`} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.fg }} />
                  <span className="text-sm" style={{ color: HEX.dim }}>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {data.quote ? (
            <blockquote className="border-l-2 pl-3 text-sm italic" style={{ borderColor: HEX.border, color: HEX.fg }}>
              &ldquo;{data.quote}&rdquo;
              {data.quoteAuthor ? (
                <footer className="mt-2 text-[11px] not-italic uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>{data.quoteAuthor}</footer>
              ) : null}
            </blockquote>
          ) : null}
          <div>
            <SecondaryBtn>{data.cta?.label || "About us"}</SecondaryBtn>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function WhyChooseUsPreview({ data, reasons }) {
  const active = (reasons || []).filter((reason) => reason.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} italic={data.headingItalic} className="mt-3 text-xl" />
        {active.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {active.map((reason) => (
              <div key={reason.id} className="rounded-lg border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
                <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>{reason.icon}</span>
                <h4 className="mt-2 text-sm font-semibold" style={{ color: HEX.fg }}>{reason.title}</h4>
                {reason.description ? (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: HEX.dim }}>{reason.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active reasons yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

/** Generic centered eyebrow + heading (+ optional CTA) preview. */
function HeadingPreview({ data, cta }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} italic={data.headingItalic} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        {cta ? (
          <div className="mt-2">
            <PrimaryBtn>{cta}</PrimaryBtn>
          </div>
        ) : null}
      </div>
    </PreviewShell>
  );
}

function CtaPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} italic={data.headingItalic} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <PrimaryBtn>{data.ctaPrimary?.label || "Start a Project"}</PrimaryBtn>
          <SecondaryBtn>{data.ctaSecondary?.label || "View Our Work"}</SecondaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}

function NewsletterPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <PreviewHeading lead={data.heading} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        <div className="mt-2 flex w-full max-w-sm items-stretch gap-2">
          <div className="flex flex-1 items-center rounded-full border px-3 py-2.5 text-left text-xs" style={{ borderColor: HEX.border, color: HEX.dim }}>
            {data.placeholder || "you@yourbrand.com"}
          </div>
          <span className="inline-flex items-center rounded-full px-4 py-2.5 text-xs font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
            {data.cta || "Subscribe"}
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}
