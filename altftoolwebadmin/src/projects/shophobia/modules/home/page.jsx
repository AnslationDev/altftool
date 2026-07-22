"use client";

import { useState } from "react";
import {
  BadgeCheck,
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
  createTrustedLogo,
  createWhyItem,
  deleteAboutHighlight,
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
  subscribeTeamPreview,
  subscribeTestimonialsIntro,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeWhyChooseUs,
  subscribeWhyItemItems,
  toggleAboutHighlightStatus,
  toggleTrustedLogoStatus,
  toggleWhyItemStatus,
  updateAboutHighlight,
  updateTrustedLogo,
  updateWhyItem,
  uploadAboutImage,
  uploadTrustedLogoImage,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function ShophobiaHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Shophobia Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Shophobia home page — edit on the left, see a live preview on the right. Each block saves on its own.
              Stats come from Site Settings; services, team, testimonials, FAQs, and blogs come from their own modules.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
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
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline (with glitch word), subcopy, and CTAs." preview={<HeroPreview data={form} />}>
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
          { key: "glitchWord", label: "Glitch Word", type: "text", hint: "Must appear inside the headline — that part renders with the chrome glitch effect." },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 4 },
          { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text", half: true },
          { key: "primaryCtaHref", label: "Primary CTA Href", type: "text", half: true },
          { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text", half: true },
          { key: "secondaryCtaHref", label: "Secondary CTA Href", type: "text", half: true },
          { key: "scrollLabel", label: "Scroll Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Marquee heading and the scrolling brand logos." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
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
        imageColumnLabel="Logo"
        fields={[
          { key: "name", label: "Brand Name", type: "text", required: true, placeholder: "MERIDIAN & CO" },
          { key: "logo", label: "Logo Image", type: "image", upload: uploadTrustedLogoImage },
        ]}
        columns={[{ key: "logo", label: "Logo", image: true }, { key: "name", label: "Brand" }]}
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function AboutSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [highlights, setHighlights] = useState([]);
  return (
    <SectionFrame index={3} icon={Users} title="About" subtitle="Who-we-are copy, highlight bullets, image, and the Since badge." preview={<AboutPreview data={form} highlights={highlights} />}>
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
          { key: "body", label: "Body", type: "textarea", rows: 5, hint: "Also opens the About page's story section." },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
          { key: "image", label: "Image", type: "image", upload: uploadAboutImage },
          { key: "imageAlt", label: "Image Alt Text", type: "text", half: true },
          { key: "sinceLabel", label: "Badge Label", type: "text", half: true, placeholder: "Since" },
          { key: "sinceYear", label: "Badge Year", type: "text", half: true, placeholder: "2021" },
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
    <SectionFrame index={4} icon={Megaphone} title="Why Choose Us" subtitle="Heading, supporting copy, CTA, and the four value cards." preview={<WhyPreview data={form} items={items} />}>
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
          { key: "subcopy", label: "Supporting Copy", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "CTA Label", type: "text" },
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
    <SectionFrame index={5} icon={Layers3} title="Services Intro" subtitle="Heading above the services grid (cards come from the Services module)." preview={<IntroPreview data={form} />}>
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
    <SectionFrame index={6} icon={Users} title="Team Preview" subtitle="Heading above the four featured members (members come from the Team module)." preview={<IntroPreview data={form} cta />}>
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
    <SectionFrame index={7} icon={MessageSquareQuote} title="Testimonials Intro" subtitle="Heading above the testimonial slider (quotes come from the Testimonials module)." preview={<IntroPreview data={form} />}>
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
    <SectionFrame index={8} icon={HelpCircle} title="FAQ Intro" subtitle="Heading above the accordion (questions come from the FAQ module)." preview={<IntroPreview data={form} />}>
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
    <SectionFrame index={9} icon={Newspaper} title="Latest Blogs" subtitle="Heading above the three newest posts (posts come from the Blog module)." preview={<IntroPreview data={form} cta />}>
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
    <SectionFrame index={10} icon={Mail} title="Newsletter" subtitle="Signup panel copy — also feeds the footer form." preview={<NewsletterPreview data={form} />}>
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
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "placeholder", label: "Input Placeholder", type: "text", half: true },
          { key: "buttonLabel", label: "Button Label", type: "text", half: true },
          { key: "successMessage", label: "Success Message", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={11} icon={Megaphone} title="Contact CTA" subtitle="Closing banner used across the site's pages." preview={<ContactCtaPreview data={form} />}>
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
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "buttonLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Previews (Shophobia chrome-on-void look)                                    */
/* -------------------------------------------------------------------------- */

function GlitchHeadline({ headline, glitchWord }) {
  const word = glitchWord && headline?.includes(glitchWord) ? glitchWord : null;
  if (!word) {
    return <PreviewHeading lead={headline} className="text-2xl" />;
  }
  const [before, after] = headline.split(word);
  return (
    <h3 className="text-2xl font-semibold leading-tight" style={{ color: HEX.fg }}>
      {before}
      <span
        style={{
          background: `linear-gradient(90deg, ${HEX.accentAlt}, ${HEX.violet}, ${HEX.accent})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {word}
      </span>
      {after}
    </h3>
  );
}

function HeroPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <GlitchHeadline headline={data.headline || "Headline goes here"} glitchWord={data.glitchWord} />
        <p className="max-w-md text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <PrimaryBtn>{data.primaryCtaLabel || "Primary CTA"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCtaLabel || "Secondary CTA"}</SecondaryBtn>
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: HEX.dim }}>{data.scrollLabel}</p>
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
          {data.heading || "Trusted By Brands Who Refuse To Blend In"}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
          {active.length ? (
            active.map((logo) => (
              <span key={logo.id} className="flex h-12 min-w-[90px] items-center justify-center rounded-lg border px-3" style={{ borderColor: HEX.border, background: HEX.raised }}>
                {logo.logo ? (
                  <img src={logo.logo} alt={logo.name} className="max-h-8 w-auto object-contain" />
                ) : (
                  <span className="text-[10px] font-semibold uppercase" style={{ color: HEX.dim }}>{logo.name}</span>
                )}
              </span>
            ))
          ) : (
            <span className="text-[11px]" style={{ color: HEX.dim }}>No brand logos yet</span>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function AboutPreview({ data, highlights }) {
  const active = (highlights || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="grid gap-5 p-6 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-3">
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="text-lg" />
          <p className="text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
          <ul className="flex flex-col gap-1.5">
            {active.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-xs" style={{ color: HEX.dim }}>
                <span className="mt-0.5 h-3 w-3 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${HEX.accentAlt}, ${HEX.accent})` }} />
                {item.text}
              </li>
            ))}
          </ul>
          <div><SecondaryBtn>{data.ctaLabel || "More About Us"}</SecondaryBtn></div>
        </div>
        <div className="relative overflow-hidden rounded-xl border" style={{ borderColor: HEX.border, background: HEX.raised, minHeight: 160 }}>
          {data.image ? <img src={data.image} alt="" className="h-full w-full object-cover" /> : null}
          <div className="absolute bottom-2 left-2 rounded-lg px-2.5 py-1.5" style={{ background: "rgba(0,0,0,0.55)" }}>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: HEX.dim }}>{data.sinceLabel || "Since"}</p>
            <p className="text-sm font-bold" style={{ color: HEX.fg }}>{data.sinceYear || "2021"}</p>
          </div>
        </div>
      </div>
    </PreviewShell>
  );
}

function WhyPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-2 text-lg" />
        <p className="mt-2 text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="mt-3"><PrimaryBtn>{data.ctaLabel || "Let's Work Together"}</PrimaryBtn></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {active.length ? (
            active.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border p-3"
                style={{
                  borderColor: index === 0 || index === 3 ? HEX.accent : HEX.border,
                  background: HEX.raised,
                }}
              >
                <p className="text-xs font-semibold" style={{ color: HEX.fg }}>{item.title || "Untitled"}</p>
                <p className="mt-1 text-[11px] leading-snug" style={{ color: HEX.dim }}>{item.description}</p>
              </div>
            ))
          ) : (
            <p className="text-[11px]" style={{ color: HEX.dim }}>No cards yet</p>
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
        <PreviewHeading lead={data.heading} className="text-lg" />
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <div className="flex w-full max-w-xs items-center gap-2">
          <span className="flex-1 rounded-full border px-3 py-2 text-left text-[11px]" style={{ borderColor: HEX.border, color: HEX.dim }}>
            {data.placeholder || "your@email.com"}
          </span>
          <PrimaryBtn>{data.buttonLabel || "Subscribe"}</PrimaryBtn>
        </div>
        <p className="text-[10px]" style={{ color: HEX.accent }}>✓ {data.successMessage || "You're in. Watch your inbox."}</p>
      </div>
    </PreviewShell>
  );
}

function ContactCtaPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 px-6 py-8 text-center">
        <PreviewHeading lead={data.heading} className="text-lg" />
        <p className="max-w-sm text-xs leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        <PrimaryBtn>{data.buttonLabel || "Start The Conversation"}</PrimaryBtn>
      </div>
    </PreviewShell>
  );
}
