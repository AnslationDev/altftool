"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Star,
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
} from "./components/HomeAdminShared";
import {
  DEFAULT_ABOUT,
  DEFAULT_BLOG_INTRO,
  DEFAULT_CONTACT_CTA,
  DEFAULT_FAQ_INTRO,
  DEFAULT_HERO,
  DEFAULT_NEWSLETTER,
  DEFAULT_SERVICES_INTRO,
  DEFAULT_TEAM_PREVIEW,
  DEFAULT_TESTIMONIALS_INTRO,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  createAboutPoint,
  createStat,
  createTrustedLogo,
  createVisualCard,
  createWhyItem,
  deleteAboutPoint,
  deleteStat,
  deleteTrustedLogo,
  deleteVisualCard,
  deleteWhyItem,
  saveAbout,
  saveBlogIntro,
  saveContactCta,
  saveFaqIntro,
  saveHero,
  saveNewsletter,
  saveServicesIntro,
  saveTeamPreview,
  saveTestimonialsIntro,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAbout,
  subscribeAboutPointItems,
  subscribeBlogIntro,
  subscribeContactCta,
  subscribeFaqIntro,
  subscribeHero,
  subscribeNewsletter,
  subscribeServicesIntro,
  subscribeStatItems,
  subscribeTeamPreview,
  subscribeTestimonialsIntro,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeVisualCardItems,
  subscribeWhyChooseUs,
  subscribeWhyItemItems,
  toggleAboutPointStatus,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleVisualCardStatus,
  toggleWhyItemStatus,
  updateAboutPoint,
  updateStat,
  updateTrustedLogo,
  updateVisualCard,
  updateWhyItem,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function DealnbookHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dealnbook Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the Dealnbook home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutSection />
        <ServicesIntroSection />
        <WhyChooseUsSection />
        <TeamPreviewSection />
        <TestimonialsIntroSection />
        <FaqIntroSection />
        <BlogIntroSection />
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
  const [cards, setCards] = useState([]);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, stat, and visual cards." preview={<HeroPreview data={form} cards={cards} />}>
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
          { key: "headlineLines", label: "Headline Lines", type: "list", placeholder: "e.g. Every deal," },
          { key: "supportCopy", label: "Support Copy", type: "textarea", rows: 4, required: true },
          { key: "primaryCtaLabel", label: "Primary CTA Label", type: "text", half: true },
          { key: "primaryCtaHref", label: "Primary CTA Href", type: "text", half: true },
          { key: "secondaryCtaLabel", label: "Secondary CTA Label", type: "text", half: true },
          { key: "secondaryCtaHref", label: "Secondary CTA Href", type: "text", half: true },
          { key: "statValue", label: "Stat Value", type: "text", half: true, placeholder: "10k+" },
          { key: "statSuffix", label: "Stat Suffix", type: "text", half: true },
          { key: "statLabel", label: "Stat Label", type: "text" },
        ]}
      />
      <CollectionManager
        eyebrow="Hero"
        title="Visual cards"
        itemNoun="card"
        subscribe={subscribeVisualCardItems}
        create={createVisualCard}
        update={updateVisualCard}
        remove={deleteVisualCard}
        toggle={toggleVisualCardStatus}
        onItems={setCards}
        fields={[
          { key: "image", label: "Image URL", type: "text", required: true, hint: "Direct image URL for the card." },
          { key: "alt", label: "Alt Text", type: "text" },
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

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Heading label and the trust-bar brand names." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
      <SettingsCard
        eyebrow="Trusted Logos Section"
        title="Heading"
        defaults={DEFAULT_TRUSTED_LOGOS}
        subscribe={subscribeTrustedLogos}
        save={saveTrustedLogos}
        errorLabel="trusted logos"
        onChange={setSettings}
        fields={[{ key: "label", label: "Label", type: "text" }]}
      />
      <CollectionManager
        eyebrow="Trusted Logos"
        title="Names"
        itemNoun="name"
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
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+ / % / x / yrs" },
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

function AboutSection() {
  const [form, setForm] = useState(DEFAULT_ABOUT);
  const [points, setPoints] = useState([]);
  return (
    <SectionFrame index={4} icon={Sparkles} title="About" subtitle="Intro block with image and point cards." preview={<AboutPreview data={form} points={points} />}>
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
          { key: "headingHighlight", label: "Heading Highlight", type: "text", hint: "Substring of the heading to emphasize." },
          { key: "body", label: "Body", type: "textarea", rows: 4, required: true },
          { key: "imageSrc", label: "Image URL", type: "text", half: true },
          { key: "imageAlt", label: "Image Alt Text", type: "text", half: true },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
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
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
          { key: "icon", label: "Icon Key", type: "text", hint: "e.g. shield, badge-check, sparkles" },
        ]}
        columns={[{ key: "title", label: "Title", primary: true }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function ServicesIntroSection() {
  const [form, setForm] = useState(DEFAULT_SERVICES_INTRO);
  return (
    <SectionFrame index={5} icon={Layers3} title="Services Intro" subtitle="Heading above the services preview list." preview={<HeadingBodyPreview data={form} />}>
      <SettingsCard
        eyebrow="Services Intro Section"
        title="Intro content"
        defaults={DEFAULT_SERVICES_INTRO}
        subscribe={subscribeServicesIntro}
        save={saveServicesIntro}
        errorLabel="services intro"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
        ]}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [settings, setSettings] = useState(DEFAULT_WHY_CHOOSE_US);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame index={6} icon={Star} title="Why Choose Us" subtitle="Heading and the list of reasons." preview={<WhyChooseUsPreview data={settings} items={items} />}>
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
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "hint", label: "Hint", type: "text" },
        ]}
      />
      <CollectionManager
        eyebrow="Why Choose Us"
        title="Items"
        itemNoun="item"
        subscribe={subscribeWhyItemItems}
        create={createWhyItem}
        update={updateWhyItem}
        remove={deleteWhyItem}
        toggle={toggleWhyItemStatus}
        onItems={setItems}
        fields={[
          { key: "title", label: "Title", type: "text", required: true },
          { key: "description", label: "Description", type: "textarea", rows: 3, required: true },
          { key: "icon", label: "Icon Key", type: "text", half: true },
          { key: "tag", label: "Tag", type: "text", half: true },
        ]}
        columns={[{ key: "title", label: "Title", primary: true }]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function TeamPreviewSection() {
  const [form, setForm] = useState(DEFAULT_TEAM_PREVIEW);
  return (
    <SectionFrame index={7} icon={Users} title="Team Preview" subtitle="Short intro block linking to the team page." preview={<HeadingBodyPreview data={form} showCta />}>
      <SettingsCard
        eyebrow="Team Preview Section"
        title="Intro content"
        defaults={DEFAULT_TEAM_PREVIEW}
        subscribe={subscribeTeamPreview}
        save={saveTeamPreview}
        errorLabel="team preview"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function TestimonialsIntroSection() {
  const [form, setForm] = useState(DEFAULT_TESTIMONIALS_INTRO);
  return (
    <SectionFrame index={8} icon={MessageSquareQuote} title="Testimonials Intro" subtitle="Heading above the testimonials preview." preview={<HeadingOnlyPreview data={form} />}>
      <SettingsCard
        eyebrow="Testimonials Intro Section"
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
    <SectionFrame index={9} icon={HelpCircle} title="FAQ Intro" subtitle="Heading above the home-page FAQ list." preview={<HeadingOnlyPreview data={form} />}>
      <SettingsCard
        eyebrow="FAQ Intro Section"
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

function BlogIntroSection() {
  const [form, setForm] = useState(DEFAULT_BLOG_INTRO);
  return (
    <SectionFrame index={10} icon={Newspaper} title="Blog Intro" subtitle="Heading above the blog preview cards." preview={<HeadingBodyPreview data={form} showCta />}>
      <SettingsCard
        eyebrow="Blog Intro Section"
        title="Intro content"
        defaults={DEFAULT_BLOG_INTRO}
        subscribe={subscribeBlogIntro}
        save={saveBlogIntro}
        errorLabel="blog intro"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={11} icon={Mail} title="Newsletter" subtitle="Email sign-up block." preview={<NewsletterPreview data={form} />}>
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
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "placeholder", label: "Input Placeholder", type: "text", half: true },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={12} icon={Megaphone} title="Contact CTA" subtitle="Closing call-to-action band." preview={<ContactCtaPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact CTA Section"
        title="CTA content"
        defaults={DEFAULT_CONTACT_CTA}
        subscribe={subscribeContactCta}
        save={saveContactCta}
        errorLabel="contact CTA"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "ctaLabel", label: "CTA Label", type: "text", half: true },
          { key: "ctaHref", label: "CTA Href", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews (light Dealnbook look)                                   */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data, cards }) {
  const lines = Array.isArray(data.headlineLines) ? data.headlineLines : [];
  const activeCards = (cards || []).filter((card) => card.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={lines.join(" ") || "Headline goes here"} className="mt-3 text-2xl" />
        {data.supportCopy ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.supportCopy}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryBtn>{data.primaryCtaLabel || "Primary"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCtaLabel || "Secondary"}</SecondaryBtn>
        </div>
        {data.statValue ? (
          <div className="mt-5 flex items-baseline gap-2">
            <span className="text-2xl font-semibold" style={{ color: HEX.fg }}>{data.statValue}{data.statSuffix}</span>
            <span className="text-[11px] uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>{data.statLabel}</span>
          </div>
        ) : null}
        {activeCards.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {activeCards.map((card) => (
              <div key={card.id} className="h-14 w-20 overflow-hidden rounded-lg border" style={{ borderColor: HEX.border }}>
                {card.image ? <img src={card.image} alt={card.alt || ""} className="h-full w-full object-cover" /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ data, logos }) {
  const active = (logos || []).filter((logo) => logo.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.label}</Eyebrow>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <span key={logo.id} className="inline-flex rounded-md border px-3 py-1.5 text-xs font-medium" style={{ borderColor: HEX.border, color: HEX.fg }}>
                {logo.name || "Brand"}
              </span>
            ))
          ) : (
            <span className="text-xs" style={{ color: HEX.dim }}>No active names yet</span>
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

function AboutPreview({ data, points }) {
  const active = (points || []).filter((point) => point.active !== false);
  return (
    <PreviewShell>
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
          {data.body ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
          ) : null}
          <div className="mt-4">
            <PrimaryBtn>{data.ctaLabel || "Learn More"}</PrimaryBtn>
          </div>
        </div>
        <div className="flex flex-col justify-center gap-2">
          {active.length ? (
            <ul className="flex flex-col gap-2">
              {active.map((point) => (
                <li key={point.id} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEX.fg }} />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: HEX.fg }}>{point.title}</p>
                    {point.description ? <p className="text-xs" style={{ color: HEX.dim }}>{point.description}</p> : null}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-xs" style={{ color: HEX.dim }}>No active points yet</span>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function WhyChooseUsPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        {data.body ? <p className="mt-2 text-sm" style={{ color: HEX.dim }}>{data.body}</p> : null}
        {active.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {active.map((item) => (
              <div key={item.id} className="rounded-lg border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
                <h4 className="text-sm font-semibold" style={{ color: HEX.fg }}>{item.title}</h4>
                {item.description ? (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: HEX.dim }}>{item.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active items yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

function HeadingOnlyPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-2 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="max-w-md text-2xl" />
      </div>
    </PreviewShell>
  );
}

function HeadingBodyPreview({ data, showCta }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        {showCta && data.ctaLabel ? (
          <div className="mt-2">
            <PrimaryBtn>{data.ctaLabel}</PrimaryBtn>
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
        <PreviewHeading lead={data.heading} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        <div className="mt-2 flex w-full max-w-sm items-stretch gap-2">
          <div className="flex flex-1 items-center rounded-full border px-3 py-2.5 text-left text-xs" style={{ borderColor: HEX.border, color: HEX.dim }}>
            {data.placeholder || "you@yourbrand.com"}
          </div>
          <span className="inline-flex items-center rounded-full px-4 py-2.5 text-xs font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
            {data.ctaLabel || "Subscribe"}
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

function ContactCtaPreview({ data }) {
  return (
    <PreviewShell>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="max-w-md text-2xl" />
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
        ) : null}
        <div className="mt-2">
          <PrimaryBtn>{data.ctaLabel || "Contact Us"}</PrimaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}
