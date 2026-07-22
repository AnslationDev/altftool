"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
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
  DEFAULT_STATS,
  DEFAULT_TEAM_PREVIEW,
  DEFAULT_TESTIMONIALS_INTRO,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  createAboutPoint,
  createHeroCredential,
  createStat,
  createTrustedLogo,
  createWhyItem,
  deleteAboutPoint,
  deleteHeroCredential,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyItem,
  saveAbout,
  saveContactCta,
  saveFaqIntro,
  saveHero,
  saveLatestBlogs,
  saveNewsletter,
  saveStats,
  saveTeamPreview,
  saveTestimonialsIntro,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAbout,
  subscribeAboutPointItems,
  subscribeContactCta,
  subscribeFaqIntro,
  subscribeHero,
  subscribeHeroCredentialItems,
  subscribeLatestBlogs,
  subscribeNewsletter,
  subscribeStatItems,
  subscribeStats,
  subscribeTeamPreview,
  subscribeTestimonialsIntro,
  subscribeTrustedLogoItems,
  subscribeTrustedLogos,
  subscribeWhyChooseUs,
  subscribeWhyItemItems,
  toggleAboutPointStatus,
  toggleHeroCredentialStatus,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyItemStatus,
  updateAboutPoint,
  updateHeroCredential,
  updateStat,
  updateTrustedLogo,
  updateWhyItem,
  uploadAboutImage,
  uploadTrustedLogoImage,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function ExclusInsiderHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ExclusInsider Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the ExclusInsider home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutSection />
        <WhyChooseUsSection />
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
  const [credentials, setCredentials] = useState([]);
  return (
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, subcopy, and credential badges." preview={<HeroPreview data={form} credentials={credentials} />}>
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
        ]}
      />
      <CollectionManager
        eyebrow="Hero"
        title="Credentials"
        itemNoun="credential"
        subscribe={subscribeHeroCredentialItems}
        create={createHeroCredential}
        update={updateHeroCredential}
        remove={deleteHeroCredential}
        toggle={toggleHeroCredentialStatus}
        onItems={setCredentials}
        fields={[{ key: "text", label: "Text", type: "text", required: true }]}
        columns={[{ key: "text", label: "Text", primary: true }]}
        itemLabel={(item) => item.text}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [settings, setSettings] = useState(DEFAULT_TRUSTED_LOGOS);
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="Heading and the trust-bar brand logos." preview={<TrustedLogosPreview data={settings} logos={logos} />}>
      <SettingsCard
        eyebrow="Trusted Logos Section"
        title="Heading"
        defaults={DEFAULT_TRUSTED_LOGOS}
        subscribe={subscribeTrustedLogos}
        save={saveTrustedLogos}
        errorLabel="trusted logos"
        onChange={setSettings}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
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
        fields={[
          { key: "name", label: "Name", type: "text", required: true },
          { key: "logo", label: "Logo", type: "image", upload: uploadTrustedLogoImage },
        ]}
        columns={[
          { key: "name", label: "Name", primary: true },
          { key: "logo", label: "Logo", image: true },
        ]}
        imageColumnLabel="Logo"
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [settings, setSettings] = useState(DEFAULT_STATS);
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame index={3} icon={BarChart3} title="Stats" subtitle="Heading and the animated stat counters." preview={<StatsPreview data={settings} items={stats} />}>
      <SettingsCard
        eyebrow="Stats Section"
        title="Heading"
        defaults={DEFAULT_STATS}
        subscribe={subscribeStats}
        save={saveStats}
        errorLabel="stats"
        onChange={setSettings}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "heading", label: "Heading", type: "text", required: true },
        ]}
      />
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
    <SectionFrame index={4} icon={Sparkles} title="About" subtitle="Intro block with image and point list." preview={<AboutPreview data={form} points={points} />}>
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
          { key: "image", label: "Image", type: "image", upload: uploadAboutImage },
          { key: "heading", label: "Heading", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 4, required: true },
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
        fields={[{ key: "text", label: "Text", type: "text", required: true }]}
        columns={[{ key: "text", label: "Text", primary: true }]}
        itemLabel={(item) => item.text}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [settings, setSettings] = useState(DEFAULT_WHY_CHOOSE_US);
  const [items, setItems] = useState([]);
  return (
    <SectionFrame index={5} icon={Star} title="Why Choose Us" subtitle="Heading and the list of reasons." preview={<WhyChooseUsPreview data={settings} items={items} />}>
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
    <SectionFrame index={6} icon={Users} title="Team Preview" subtitle="Heading above the team preview block." preview={<HeadingOnlyPreview data={form} />}>
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
        ]}
      />
    </SectionFrame>
  );
}

function TestimonialsIntroSection() {
  const [form, setForm] = useState(DEFAULT_TESTIMONIALS_INTRO);
  return (
    <SectionFrame index={7} icon={MessageSquareQuote} title="Testimonials Intro" subtitle="Heading above the testimonials preview." preview={<HeadingOnlyPreview data={form} />}>
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
    <SectionFrame index={8} icon={HelpCircle} title="FAQ Intro" subtitle="Heading above the home-page FAQ list." preview={<HeadingOnlyPreview data={form} />}>
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

function LatestBlogsSection() {
  const [form, setForm] = useState(DEFAULT_LATEST_BLOGS);
  return (
    <SectionFrame index={9} icon={Newspaper} title="Latest Blogs" subtitle="Heading above the latest blog preview cards." preview={<HeadingOnlyPreview data={form} />}>
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
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={10} icon={Mail} title="Newsletter" subtitle="Email sign-up block." preview={<NewsletterPreview data={form} />}>
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
          { key: "ctaLabel", label: "CTA Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={11} icon={Megaphone} title="Contact CTA" subtitle="Closing call-to-action band." preview={<ContactCtaPreview data={form} />}>
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
          { key: "ctaLabel", label: "CTA Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews (light theme)                                            */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data, credentials }) {
  const active = (credentials || []).filter((item) => item.active !== false);
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="mt-3 text-2xl" />
        {data.subcopy ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryBtn>{data.primaryCtaLabel || "Primary"}</PrimaryBtn>
          {data.secondaryCtaLabel ? (
            <span className="inline-flex rounded-full border px-4 py-2 text-xs font-semibold" style={{ borderColor: HEX.border, color: HEX.fg }}>
              {data.secondaryCtaLabel}
            </span>
          ) : null}
        </div>
        {active.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {active.map((item) => (
              <span key={item.id} className="inline-flex rounded-md border px-3 py-1.5 text-xs font-medium" style={{ borderColor: HEX.border, color: HEX.fg }}>
                {item.text}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active credentials yet</p>
        )}
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ data, logos }) {
  const active = (logos || []).filter((logo) => logo.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <div key={logo.id} className="flex items-center gap-2 rounded-md border px-3 py-1.5" style={{ borderColor: HEX.border }}>
                {logo.logo ? (
                  <img src={logo.logo} alt={logo.name || ""} className="h-5 w-5 object-contain" />
                ) : null}
                <span className="text-xs font-medium" style={{ color: HEX.fg }}>{logo.name || "Brand"}</span>
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

function StatsPreview({ data, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.heading} className="mt-3 text-xl" />
        {active.length ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {active.map((item) => (
              <div key={item.id} className="flex flex-col gap-1">
                <span className="text-2xl font-semibold" style={{ color: HEX.fg }}>{`${item.value ?? 0}${item.suffix || ""}`}</span>
                <span className="text-[10px] uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>{item.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>No active stats yet</p>
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
        <div className="flex flex-col justify-center">
          {data.image ? (
            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg border" style={{ borderColor: HEX.border }}>
              <img src={data.image} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
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
                  <p className="text-sm" style={{ color: HEX.fg }}>{point.text}</p>
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
            you@yourbrand.com
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
