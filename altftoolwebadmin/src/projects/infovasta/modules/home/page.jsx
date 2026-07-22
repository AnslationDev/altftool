"use client";

import { useState } from "react";
import {
  Building2,
  HelpCircle,
  Home,
  Layers3,
  Mail,
  MessageSquareQuote,
  Newspaper,
  Sparkles,
  Users,
} from "lucide-react";
import {
  Eyebrow,
  HEX,
  PreviewHeading,
  PreviewShell,
  PrimaryBtn,
  SecondaryBtn,
  SectionFrame,
  SettingsCard,
} from "./components/HomeAdminShared";
import {
  DEFAULT_BLOG,
  DEFAULT_FAQ,
  DEFAULT_HERO,
  DEFAULT_NEWSLETTER,
  DEFAULT_PORTFOLIO,
  DEFAULT_SERVICES,
  DEFAULT_TEAM,
  DEFAULT_TESTIMONIALS,
  DEFAULT_WHY_CHOOSE,
  saveBlog,
  saveFaq,
  saveHero,
  saveNewsletter,
  savePortfolio,
  saveServices,
  saveTeam,
  saveTestimonials,
  saveWhyChoose,
  subscribeBlog,
  subscribeFaq,
  subscribeHero,
  subscribeNewsletter,
  subscribePortfolio,
  subscribeServices,
  subscribeTeam,
  subscribeTestimonials,
  subscribeWhyChoose,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function InfovastaHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Infovasta Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Infovasta home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <ServicesSection />
        <WhyChooseSection />
        <TeamSection />
        <TestimonialsSection />
        <NewsletterSection />
        <BlogSection />
        <FaqSection />
        <PortfolioSection />
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
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, badges, CTAs, and image." preview={<HeroPreview data={form} />}>
      <SettingsCard
        eyebrow="Hero Section"
        title="Hero content"
        defaults={DEFAULT_HERO}
        subscribe={subscribeHero}
        save={saveHero}
        errorLabel="hero"
        onChange={setForm}
        fields={[
          { key: "badges", label: "Trust Badges (icon + label)", type: "objectList", columns: [{ key: "icon", label: "Icon", placeholder: "shield-checkmark-outline" }, { key: "label", label: "Label", placeholder: "Google Partner" }] },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
          { key: "description", label: "Description", type: "textarea", rows: 4, required: true },
          { key: "primaryCta", label: "Primary CTA", type: "cta" },
          { key: "secondaryCta", label: "Secondary CTA", type: "cta" },
          { key: "image", label: "Hero Image URL", type: "text", placeholder: "/assets/images/hero-banner.png" },
          { key: "imageAlt", label: "Hero Image Alt Text", type: "text" },
          { key: "marqueeLabel", label: "Marquee Label", type: "text" },
          { key: "marqueeLogos", label: "Marquee Logos (repeatable)", type: "lines", placeholder: "Acme Co." },
        ]}
      />
    </SectionFrame>
  );
}

function ServicesSection() {
  const [form, setForm] = useState(DEFAULT_SERVICES);
  return (
    <SectionFrame index={2} icon={Layers3} title="Services" subtitle="Intro copy above the services grid." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Services Section"
        title="Services content"
        defaults={DEFAULT_SERVICES}
        subscribe={subscribeServices}
        save={saveServices}
        errorLabel="services"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
          { key: "ctaHref", label: "CTA Href", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function WhyChooseSection() {
  const [form, setForm] = useState(DEFAULT_WHY_CHOOSE);
  return (
    <SectionFrame index={3} icon={Sparkles} title="Why Choose Us" subtitle="Intro copy above the why-choose-us grid." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="Why Choose Us Section"
        title="Why choose us content"
        defaults={DEFAULT_WHY_CHOOSE}
        subscribe={subscribeWhyChoose}
        save={saveWhyChoose}
        errorLabel="why choose us"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TeamSection() {
  const [form, setForm] = useState(DEFAULT_TEAM);
  return (
    <SectionFrame index={4} icon={Users} title="Team" subtitle="Intro copy above the team grid." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Team Section"
        title="Team content"
        defaults={DEFAULT_TEAM}
        subscribe={subscribeTeam}
        save={saveTeam}
        errorLabel="team"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
          { key: "ctaHref", label: "CTA Href", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TestimonialsSection() {
  const [form, setForm] = useState(DEFAULT_TESTIMONIALS);
  return (
    <SectionFrame index={5} icon={MessageSquareQuote} title="Testimonials" subtitle="Intro copy above the testimonials." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="Testimonials Section"
        title="Testimonials content"
        defaults={DEFAULT_TESTIMONIALS}
        subscribe={subscribeTestimonials}
        save={saveTestimonials}
        errorLabel="testimonials"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={6} icon={Mail} title="Newsletter" subtitle="Email sign-up band." preview={<NewsletterPreview data={form} />}>
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
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "placeholder", label: "Input Placeholder", type: "text" },
          { key: "buttonLabel", label: "Button Label", type: "text" },
          { key: "bgImage", label: "Background Image URL", type: "text" },
          { key: "bannerImage", label: "Banner Image URL", type: "text" },
          { key: "bannerAlt", label: "Banner Alt Text", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function BlogSection() {
  const [form, setForm] = useState(DEFAULT_BLOG);
  return (
    <SectionFrame index={7} icon={Newspaper} title="Blog" subtitle="Intro copy above the latest posts." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Blog Section"
        title="Blog content"
        defaults={DEFAULT_BLOG}
        subscribe={subscribeBlog}
        save={saveBlog}
        errorLabel="blog"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
          { key: "ctaHref", label: "CTA Href", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function FaqSection() {
  const [form, setForm] = useState(DEFAULT_FAQ);
  return (
    <SectionFrame index={8} icon={HelpCircle} title="FAQ" subtitle="Intro copy above the FAQ accordion." preview={<HeadingPreview data={form} />}>
      <SettingsCard
        eyebrow="FAQ Section"
        title="FAQ content"
        defaults={DEFAULT_FAQ}
        subscribe={subscribeFaq}
        save={saveFaq}
        errorLabel="FAQ"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
          { key: "searchPlaceholder", label: "Search Placeholder", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function PortfolioSection() {
  const [form, setForm] = useState(DEFAULT_PORTFOLIO);
  return (
    <SectionFrame index={9} icon={Building2} title="Portfolio" subtitle="Intro copy above the portfolio grid." preview={<HeadingPreview data={form} cta={form.ctaLabel} />}>
      <SettingsCard
        eyebrow="Portfolio Section"
        title="Portfolio content"
        defaults={DEFAULT_PORTFOLIO}
        subscribe={subscribePortfolio}
        save={savePortfolio}
        errorLabel="portfolio"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headingBefore", label: "Heading (before highlight)", type: "text", required: true },
          { key: "headingHighlight", label: "Heading (highlighted)", type: "text" },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
          { key: "ctaHref", label: "CTA Href", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews (light Infovasta look)                                    */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data }) {
  const badges = Array.isArray(data.badges) ? data.badges.filter((badge) => badge.label) : [];
  const logos = Array.isArray(data.marqueeLogos) ? data.marqueeLogos.filter(Boolean) : [];
  return (
    <PreviewShell>
      <div className="p-6">
        {badges.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span key={index} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold" style={{ borderColor: HEX.border, color: HEX.dim }}>
                {badge.label}
              </span>
            ))}
          </div>
        ) : null}
        <PreviewHeading before={data.headingBefore} highlight={data.headingHighlight} className="text-2xl" />
        {data.description ? <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.description}</p> : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryBtn>{data.primaryCta?.label || "Primary"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCta?.label || "Secondary"}</SecondaryBtn>
        </div>
        {data.image ? (
          <div className="mt-5 flex h-32 w-full items-center justify-center overflow-hidden rounded-xl border" style={{ borderColor: HEX.border }}>
            <img src={data.image} alt={data.imageAlt || ""} className="h-full w-full object-cover" />
          </div>
        ) : null}
        {logos.length ? (
          <div className="mt-5 border-t pt-4" style={{ borderColor: HEX.border }}>
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: HEX.dim }}>{data.marqueeLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {logos.map((logo, index) => (
                <span key={index} className="rounded-md px-2 py-0.5 text-[10px]" style={{ background: HEX.raised, color: HEX.dim }}>{logo}</span>
              ))}
            </div>
          </div>
        ) : null}
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
        <PreviewHeading before={data.headingBefore || data.heading} highlight={data.headingHighlight} className="max-w-md text-2xl" />
        {cta ? (
          <div className="mt-2">
            <PrimaryBtn>{cta}</PrimaryBtn>
          </div>
        ) : null}
      </div>
    </PreviewShell>
  );
}

function NewsletterPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading before={data.heading} className="max-w-md text-2xl" />
        <div className="mt-2 flex w-full max-w-sm items-stretch gap-2">
          <div className="flex flex-1 items-center rounded-full border px-3 py-2.5 text-left text-xs" style={{ borderColor: HEX.border, color: HEX.dim }}>
            {data.placeholder || "Enter your mail"}
          </div>
          <span className="inline-flex items-center rounded-full px-4 py-2.5 text-xs font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
            {data.buttonLabel || "Subscribe"}
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}
