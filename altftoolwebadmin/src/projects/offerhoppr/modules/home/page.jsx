"use client";

import { useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Home,
  Mail,
  Megaphone,
  Sparkles,
  Star,
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
  DEFAULT_CONTACT_CTA,
  DEFAULT_HERO,
  DEFAULT_NEWSLETTER,
  DEFAULT_WHY_CHOOSE_US,
  createStat,
  createTrustedLogo,
  createWhyReason,
  deleteStat,
  deleteTrustedLogo,
  deleteWhyReason,
  saveAbout,
  saveContactCta,
  saveHero,
  saveNewsletter,
  saveWhyChooseUs,
  subscribeAbout,
  subscribeContactCta,
  subscribeHero,
  subscribeNewsletter,
  subscribeStatItems,
  subscribeTrustedLogoItems,
  subscribeWhyChooseUs,
  subscribeWhyReasonItems,
  toggleStatStatus,
  toggleTrustedLogoStatus,
  toggleWhyReasonStatus,
  updateStat,
  updateTrustedLogo,
  updateWhyReason,
} from "./service/home.service";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function OfferHopprHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">OfferHoppr Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the OfferHoppr home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutSection />
        <WhyChooseUsSection />
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
    <SectionFrame index={1} icon={Sparkles} title="Hero" subtitle="Top-of-page headline, stickers, and CTAs." preview={<HeroPreview data={form} />}>
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
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 4, required: true },
          { key: "stickers", label: "Stickers", type: "list", placeholder: "e.g. +63% avg. conversion lift" },
          { key: "ctaPrimary", label: "Primary CTA Label", type: "text", half: true },
          { key: "ctaSecondary", label: "Secondary CTA Label", type: "text", half: true },
        ]}
      />
    </SectionFrame>
  );
}

function TrustedLogosSection() {
  const [logos, setLogos] = useState([]);
  return (
    <SectionFrame index={2} icon={BadgeCheck} title="Trusted Logos" subtitle="The brand logos shown in the trust bar." preview={<TrustedLogosPreview logos={logos} />}>
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
          { key: "logo", label: "Logo URL", type: "text", required: true, hint: "Direct image URL for the logo." },
        ]}
        columns={[
          { key: "name", label: "Name", primary: true },
          { key: "logo", label: "Logo", image: true },
        ]}
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
  return (
    <SectionFrame index={4} icon={Sparkles} title="About" subtitle="Short intro block with highlight bullets." preview={<AboutPreview data={form} />}>
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
          { key: "body", label: "Body", type: "textarea", rows: 4, required: true },
          { key: "highlights", label: "Highlights", type: "list", placeholder: "e.g. Full-funnel in-house team" },
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

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame index={6} icon={Mail} title="Newsletter" subtitle="Email sign-up block." preview={<NewsletterPreview data={form} />}>
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
        ]}
      />
    </SectionFrame>
  );
}

function ContactCtaSection() {
  const [form, setForm] = useState(DEFAULT_CONTACT_CTA);
  return (
    <SectionFrame index={7} icon={Megaphone} title="Contact CTA" subtitle="Closing call-to-action band." preview={<ContactCtaPreview data={form} />}>
      <SettingsCard
        eyebrow="Contact CTA Section"
        title="CTA content"
        defaults={DEFAULT_CONTACT_CTA}
        subscribe={subscribeContactCta}
        save={saveContactCta}
        errorLabel="contact CTA"
        onChange={setForm}
        fields={[
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3 },
          { key: "buttonLabel", label: "Button Label", type: "text" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews (light OfferHoppr look)                                   */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data }) {
  const stickers = Array.isArray(data.stickers) ? data.stickers : [];
  return (
    <PreviewShell>
      <div className="p-6">
        <Eyebrow>{data.eyebrow}</Eyebrow>
        <PreviewHeading lead={data.headline} className="mt-3 text-2xl" />
        {data.subcopy ? (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        ) : null}
        {stickers.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {stickers.map((sticker, index) => (
              <span
                key={`${sticker}-${index}`}
                className="inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold"
                style={{ borderColor: HEX.border, color: HEX.fg }}
              >
                {sticker}
              </span>
            ))}
          </div>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryBtn>{data.ctaPrimary || "Primary"}</PrimaryBtn>
          <SecondaryBtn>{data.ctaSecondary || "Secondary"}</SecondaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}

function TrustedLogosPreview({ logos }) {
  const active = (logos || []).filter((logo) => logo.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <div key={logo.id} className="flex h-10 items-center justify-center rounded-md border px-3" style={{ borderColor: HEX.border }}>
                {logo.logo ? (
                  <img src={logo.logo} alt={logo.name} className="h-5 w-5 object-contain" />
                ) : null}
                <span className="ml-2 text-xs font-medium" style={{ color: HEX.fg }}>{logo.name || "Logo"}</span>
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

function AboutPreview({ data }) {
  const highlights = Array.isArray(data.highlights) ? data.highlights : [];
  return (
    <PreviewShell>
      <div className="grid gap-6 p-6 sm:grid-cols-2">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <PreviewHeading lead={data.headline} className="mt-3 text-xl" />
          {data.body ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.body}</p>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-2">
          {highlights.length ? (
            <ul className="flex flex-col gap-2">
              {highlights.map((point, index) => (
                <li key={`${point}-${index}`} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: HEX.fg }} />
                  <span className="text-sm" style={{ color: HEX.dim }}>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
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
        <PreviewHeading lead={data.headline} className="mt-3 text-xl" />
        {active.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {active.map((reason) => (
              <div key={reason.id} className="rounded-lg border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
                <h4 className="text-sm font-semibold" style={{ color: HEX.fg }}>{reason.title}</h4>
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

function NewsletterPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <PreviewHeading lead={data.headline} className="max-w-md text-2xl" />
        {data.subcopy ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        ) : null}
        <div className="mt-2 flex w-full max-w-sm items-stretch gap-2">
          <div className="flex flex-1 items-center rounded-full border px-3 py-2.5 text-left text-xs" style={{ borderColor: HEX.border, color: HEX.dim }}>
            you@yourbrand.com
          </div>
          <span className="inline-flex items-center rounded-full px-4 py-2.5 text-xs font-semibold" style={{ background: HEX.accent, color: "#ffffff" }}>
            Subscribe
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
        <PreviewHeading lead={data.headline} className="max-w-md text-2xl" />
        {data.subcopy ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>{data.subcopy}</p>
        ) : null}
        <div className="mt-2">
          <PrimaryBtn>{data.buttonLabel || "Grab the Deal"}</PrimaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}
