"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Home,
  Image as ImageIcon,
  Loader2,
  Mail,
  Megaphone,
  Plus,
  Save,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ABOUT_TEASER,
  DEFAULT_CTA,
  DEFAULT_HERO,
  DEFAULT_NEWSLETTER,
  DEFAULT_STATS,
  DEFAULT_TRUSTED_LOGOS,
  DEFAULT_WHY_CHOOSE_US,
  createStat,
  createTrustedLogo,
  createWhyReason,
  deleteHeroImage,
  deleteStat,
  deleteTrustedLogo,
  deleteTrustedLogoImage,
  deleteWhyImage,
  deleteWhyReason,
  saveAboutTeaser,
  saveCta,
  saveHero,
  saveNewsletter,
  saveStats,
  saveTrustedLogos,
  saveWhyChooseUs,
  subscribeAboutTeaser,
  subscribeCta,
  subscribeHero,
  subscribeNewsletter,
  subscribeStatItems,
  subscribeStats,
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
  uploadTrustedLogoImage,
  uploadWhyImage,
} from "./service/home.service";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

/* -------------------------------------------------------------------------- */
/* DailyHnt frontend theme (inline hex — preview only)                        */
/* -------------------------------------------------------------------------- */
const HEX = {
  bg: "#0a0a0a",
  raised: "#111111",
  fg: "#ededed",
  dim: "#8a8a8a",
  accent: "#c6f135",
  amber: "#ffb020",
  border: "#262626",
};

const GRID_BG = {
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/** Accept either a string[] or a newline-joined string (the SettingsCard form shape). */
function asLines(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function DailyHntHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DailyHnt Home</h1>
            <p className="text-sm text-gray-500">
              Manage every section of the DailyHnt home page — edit on the left, see a live preview on the right. Each block saves on its own.
            </p>
          </div>
        </div>

        <HeroSection />
        <TrustedLogosSection />
        <StatsSection />
        <AboutTeaserSection />
        <WhyChooseUsSection />
        <CtaSection />
        <NewsletterSection />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Section frame — numbered heading + LEFT management / RIGHT live preview     */
/* -------------------------------------------------------------------------- */
function SectionFrame({ index, icon: Icon, title, subtitle, children, preview }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-gray-200 pb-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-xs font-bold text-white">
          {index}
        </span>
        <div className="flex items-center gap-2">
          {Icon ? <Icon className="h-4 w-4 text-gray-400" /> : null}
          <div>
            <h2 className="text-sm font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">{children}</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Eye className="h-4 w-4 text-gray-400" /> Live preview
          </div>
          <div className="xl:sticky xl:top-6">{preview}</div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Section wrappers — each owns the preview state pulled up from the forms     */
/* -------------------------------------------------------------------------- */
function HeroSection() {
  const [form, setForm] = useState(DEFAULT_HERO);
  return (
    <SectionFrame
      index={1}
      icon={Sparkles}
      title="Hero"
      subtitle="Top-of-page headline, CTAs, and image."
      preview={<HeroPreview data={form} />}
    >
      <SettingsCard
        eyebrow="Hero Section"
        title="Hero content"
        defaults={DEFAULT_HERO}
        subscribe={subscribeHero}
        save={saveHero}
        errorLabel="hero"
        onChange={setForm}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text", placeholder: "DAILY HEADLINES & TRENDS" },
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "subcopy", label: "Subcopy", type: "textarea", rows: 3, required: true },
          { key: "primaryCta", label: "Primary CTA", type: "cta" },
          { key: "secondaryCta", label: "Secondary CTA", type: "cta" },
          {
            key: "meta",
            label: "Meta items (one per line)",
            type: "lines",
            rows: 3,
            hint: "Small labels shown beside the hero (e.g. reading stats).",
          },
          {
            key: "image",
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
    <SectionFrame
      index={2}
      icon={BadgeCheck}
      title="Trusted Logos"
      subtitle="Social-proof label and the logo strip."
      preview={<TrustedLogosPreview label={settings.label} logos={logos} />}
    >
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
        imageField={{
          key: "src",
          pathKey: "imagePath",
          label: "Logo Image",
          required: true,
          aspect: "aspect-video",
          uploader: { upload: uploadTrustedLogoImage, remove: deleteTrustedLogoImage },
        }}
        fields={[{ key: "name", label: "Name", type: "text", required: true }]}
        columns={[{ key: "name", label: "Name", primary: true }]}
        itemLabel={(item) => item.name}
      />
    </SectionFrame>
  );
}

function StatsSection() {
  const [settings, setSettings] = useState(DEFAULT_STATS);
  const [stats, setStats] = useState([]);
  return (
    <SectionFrame
      index={3}
      icon={BarChart3}
      title="Stats"
      subtitle="Section label and animated stat counters."
      preview={<StatsPreview label={settings.label} items={stats} />}
    >
      <SettingsCard
        eyebrow="Stats Section"
        title="Section label"
        defaults={DEFAULT_STATS}
        subscribe={subscribeStats}
        save={saveStats}
        errorLabel="stats"
        onChange={setSettings}
        fields={[{ key: "label", label: "Label", type: "text", required: true }]}
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
          { key: "label", label: "Label", type: "text", required: true },
          { key: "prefix", label: "Prefix", type: "text", half: true, placeholder: "$" },
          { key: "suffix", label: "Suffix", type: "text", half: true, placeholder: "+" },
        ]}
        columns={[
          {
            key: "value",
            label: "Value",
            primary: true,
            render: (item) => `${item.prefix || ""}${item.value ?? 0}${item.suffix || ""}`,
          },
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
    <SectionFrame
      index={4}
      icon={Sparkles}
      title="About Teaser"
      subtitle="Short intro block with bullet points."
      preview={<AboutTeaserPreview data={form} />}
    >
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
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3, required: true },
          { key: "points", label: "Points (one per line)", type: "lines", rows: 4 },
          { key: "cta", label: "CTA", type: "cta" },
        ]}
      />
    </SectionFrame>
  );
}

function WhyChooseUsSection() {
  const [settings, setSettings] = useState(DEFAULT_WHY_CHOOSE_US);
  const [reasons, setReasons] = useState([]);
  return (
    <SectionFrame
      index={5}
      icon={Star}
      title="Why Choose Us"
      subtitle="Heading, image, and the list of reasons."
      preview={<WhyChooseUsPreview data={settings} reasons={reasons} />}
    >
      <SettingsCard
        eyebrow="Why Choose Us Section"
        title="Heading & image"
        defaults={DEFAULT_WHY_CHOOSE_US}
        subscribe={subscribeWhyChooseUs}
        save={saveWhyChooseUs}
        errorLabel="why choose us"
        onChange={setSettings}
        fields={[
          { key: "eyebrow", label: "Eyebrow", type: "text" },
          { key: "headline", label: "Headline", type: "text", required: true },
          {
            key: "image",
            label: "Section Image",
            type: "image",
            pathKey: "imagePath",
            uploader: { upload: uploadWhyImage, remove: deleteWhyImage },
            aspect: "aspect-video",
          },
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
        columns={[
          { key: "title", label: "Title", primary: true },
          { key: "description", label: "Description" },
        ]}
        itemLabel={(item) => item.title}
      />
    </SectionFrame>
  );
}

function CtaSection() {
  const [form, setForm] = useState(DEFAULT_CTA);
  return (
    <SectionFrame
      index={6}
      icon={Megaphone}
      title="CTA"
      subtitle="Closing call-to-action band."
      preview={<CtaPreview data={form} />}
    >
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
          { key: "headline", label: "Headline", type: "text", required: true },
          { key: "body", label: "Body", type: "textarea", rows: 3 },
          { key: "primaryCta", label: "Primary CTA", type: "cta" },
          { key: "secondaryCta", label: "Secondary CTA", type: "cta" },
        ]}
      />
    </SectionFrame>
  );
}

function NewsletterSection() {
  const [form, setForm] = useState(DEFAULT_NEWSLETTER);
  return (
    <SectionFrame
      index={7}
      icon={Mail}
      title="Newsletter"
      subtitle="Email sign-up block."
      preview={<NewsletterPreview data={form} />}
    >
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
          { key: "placeholder", label: "Input Placeholder", type: "text", half: true, placeholder: "Enter your email" },
          { key: "cta", label: "Button Label", type: "text", half: true, placeholder: "Subscribe" },
        ]}
      />
    </SectionFrame>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview primitives (dark DailyHnt look)                                    */
/* -------------------------------------------------------------------------- */
function PreviewShell({ children, grid, raised }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-sm"
      style={{
        borderColor: HEX.border,
        background: raised ? HEX.raised : HEX.bg,
        color: HEX.fg,
        ...(grid ? GRID_BG : {}),
      }}
    >
      {children}
    </div>
  );
}

function Eyebrow({ children, terminal }) {
  return (
    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em]" style={{ color: HEX.accent }}>
      {terminal ? <span className="mr-1">&gt;</span> : null}
      {children || "EYEBROW"}
    </p>
  );
}

function PrimaryBtn({ children }) {
  return (
    <span className="inline-flex rounded-md px-4 py-2 text-xs font-semibold" style={{ background: HEX.accent, color: "#0a0a0a" }}>
      {children}
    </span>
  );
}

function SecondaryBtn({ children }) {
  return (
    <span className="inline-flex rounded-md border px-4 py-2 text-xs font-semibold" style={{ borderColor: HEX.border, color: HEX.fg }}>
      {children}
    </span>
  );
}

function OutlineBtn({ children }) {
  return (
    <span className="inline-flex rounded-md border px-4 py-2 text-xs font-semibold" style={{ borderColor: HEX.accent, color: HEX.accent }}>
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section previews                                                           */
/* -------------------------------------------------------------------------- */
function HeroPreview({ data }) {
  const meta = asLines(data.meta);
  return (
    <PreviewShell grid>
      <div className="grid gap-6 p-6 sm:grid-cols-[1.15fr_0.85fr] sm:items-center">
        <div>
          <Eyebrow>{data.eyebrow}</Eyebrow>
          <h3 className="mt-3 text-2xl font-bold leading-tight" style={{ color: HEX.fg }}>
            {data.headline || "Headline goes here"}
          </h3>
          {data.subcopy ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>
              {data.subcopy}
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryBtn>{data.primaryCta?.label || "Primary"}</PrimaryBtn>
            <SecondaryBtn>{data.secondaryCta?.label || "Secondary"}</SecondaryBtn>
          </div>
          {meta.length ? (
            <div
              className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 font-mono text-[10px] uppercase tracking-[0.15em]"
              style={{ borderColor: HEX.border, color: HEX.dim }}
            >
              {meta.map((item, index) => (
                <span key={`${item}-${index}`} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5" style={{ background: HEX.accent }} />
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className="hidden items-center justify-center sm:flex">
          {data.image ? (
            <img src={data.image} alt="" className="max-h-44 w-full object-contain" />
          ) : (
            <div
              className="flex h-32 w-full items-center justify-center rounded-xl border text-xs"
              style={{ borderColor: HEX.border, color: HEX.dim }}
            >
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
    <PreviewShell>
      <div className="p-6">
        <p className="text-center font-mono text-xs font-bold uppercase tracking-[0.25em]" style={{ color: HEX.dim }}>
          {label || "Trusted by teams"}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {active.length ? (
            active.map((logo) => (
              <div
                key={logo.id}
                className="flex h-11 items-center justify-center rounded-md border px-3"
                style={{ borderColor: HEX.border, background: HEX.raised }}
              >
                {logo.src ? (
                  <img src={logo.src} alt={logo.name || ""} className="max-h-6 max-w-[92px] object-contain" />
                ) : (
                  <span className="font-mono text-xs" style={{ color: HEX.fg }}>
                    {logo.name || "Logo"}
                  </span>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs" style={{ color: HEX.dim }}>
              No active logos yet
            </span>
          )}
        </div>
      </div>
    </PreviewShell>
  );
}

function StatsPreview({ label, items }) {
  const active = (items || []).filter((item) => item.active !== false);
  return (
    <PreviewShell raised>
      <div className="p-6">
        <Eyebrow terminal>{label || "By the numbers"}</Eyebrow>
        {active.length ? (
          <div className="mt-5 grid grid-cols-2 gap-px sm:grid-cols-4" style={{ background: HEX.border }}>
            {active.map((item) => (
              <div key={item.id} className="flex flex-col gap-1 p-4" style={{ background: HEX.raised }}>
                <span className="text-2xl font-bold" style={{ color: HEX.accent }}>
                  {`${item.prefix || ""}${item.value ?? 0}${item.suffix || ""}`}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: HEX.dim }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>
            No active stats yet
          </p>
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
          <h3 className="mt-3 text-xl font-bold leading-tight" style={{ color: HEX.fg }}>
            {data.headline || "Headline goes here"}
          </h3>
          {data.body ? (
            <p className="mt-3 text-sm leading-relaxed" style={{ color: HEX.dim }}>
              {data.body}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col justify-center gap-4">
          {points.length ? (
            <ul className="flex flex-col gap-2">
              {points.map((point, index) => (
                <li
                  key={`${point}-${index}`}
                  className="flex items-start gap-2 border p-3"
                  style={{ borderColor: HEX.border }}
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: HEX.accent }} />
                  <span className="text-sm" style={{ color: HEX.dim }}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <div>
            <OutlineBtn>{data.cta?.label || "About us"}</OutlineBtn>
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
        <h3 className="mt-3 text-xl font-bold leading-tight" style={{ color: HEX.fg }}>
          {data.headline || "Why readers choose us"}
        </h3>
        {data.image ? (
          <div className="mx-auto mt-5 max-w-[220px] overflow-hidden border" style={{ borderColor: HEX.border }}>
            <img src={data.image} alt="" className="w-full object-cover" />
          </div>
        ) : null}
        {active.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {active.map((reason, index) => (
              <div key={reason.id} className="border p-4" style={{ borderColor: HEX.border, background: HEX.bg }}>
                <span className="font-mono text-xs" style={{ color: HEX.dim }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h4 className="mt-2 text-sm font-bold" style={{ color: HEX.fg }}>
                  {reason.title}
                </h4>
                {reason.description ? (
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: HEX.dim }}>
                    {reason.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-xs" style={{ color: HEX.dim }}>
            No active reasons yet
          </p>
        )}
        <div className="mt-6 text-center">
          <PrimaryBtn>Get Started</PrimaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}

function CtaPreview({ data }) {
  return (
    <PreviewShell grid>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow terminal>{data.eyebrow}</Eyebrow>
        <h3 className="max-w-md text-2xl font-bold leading-tight" style={{ color: HEX.fg }}>
          {data.headline || "Get the stories that matter, first."}
        </h3>
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>
            {data.body}
          </p>
        ) : null}
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <PrimaryBtn>{data.primaryCta?.label || "Get Started"}</PrimaryBtn>
          <SecondaryBtn>{data.secondaryCta?.label || "See Services"}</SecondaryBtn>
        </div>
      </div>
    </PreviewShell>
  );
}

function NewsletterPreview({ data }) {
  return (
    <PreviewShell raised>
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <Eyebrow terminal>{data.eyebrow}</Eyebrow>
        <h3 className="max-w-md text-2xl font-bold leading-tight" style={{ color: HEX.fg }}>
          {data.headline || "One email. Everything worth knowing."}
        </h3>
        {data.body ? (
          <p className="max-w-md text-sm leading-relaxed" style={{ color: HEX.dim }}>
            {data.body}
          </p>
        ) : null}
        <div className="mt-2 flex w-full max-w-sm items-stretch">
          <div
            className="flex flex-1 items-center border px-3 py-2.5 text-left text-xs"
            style={{ borderColor: HEX.border, background: HEX.bg, color: HEX.dim }}
          >
            {data.placeholder || "Enter your email"}
          </div>
          <span
            className="inline-flex items-center px-4 py-2.5 text-xs font-semibold"
            style={{ background: HEX.accent, color: "#0a0a0a" }}
          >
            {data.cta || "Subscribe"}
          </span>
        </div>
      </div>
    </PreviewShell>
  );
}

/* -------------------------------------------------------------------------- */
/* Field primitives                                                           */
/* -------------------------------------------------------------------------- */
function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function CtaField({ label, value, onChange }) {
  const cta = value || { label: "", href: "" };
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          value={cta.label || ""}
          onChange={(event) => onChange({ ...cta, label: event.target.value })}
          className={inputClass}
          placeholder="Button label"
        />
        <input
          value={cta.href || ""}
          onChange={(event) => onChange({ ...cta, href: event.target.value })}
          className={inputClass}
          placeholder="/link-or-url"
        />
      </div>
    </div>
  );
}

function ImagePicker({ label, url, error, aspect = "aspect-video", uploading, progress, onUpload, onRemove }) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <div className={`flex ${aspect} items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50`}>
        {url ? (
          <img src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-8 w-8 text-gray-300" />
        )}
      </div>
      {uploading ? (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full bg-gray-900 transition-all" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
      <div className="mt-3 flex gap-2">
        <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
          <Upload className="h-3.5 w-3.5" /> Upload
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(event) => onUpload(event.target.files?.[0])}
          />
        </label>
        {url ? (
          <button onClick={onRemove} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-2 text-xs font-medium text-red-500">{error}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Settings card — config-driven singleton doc editor                         */
/* -------------------------------------------------------------------------- */
function hydrate(fields, data) {
  const form = { ...data };
  fields.forEach((field) => {
    if (field.type === "lines") {
      form[field.key] = Array.isArray(data[field.key]) ? data[field.key].join("\n") : data[field.key] || "";
    } else if (field.type === "cta") {
      form[field.key] = { label: data[field.key]?.label || "", href: data[field.key]?.href || "" };
    } else if (field.type === "image") {
      form[field.key] = data[field.key] || "";
      form[field.pathKey || "imagePath"] = data[field.pathKey || "imagePath"] || "";
    } else {
      form[field.key] = data[field.key] ?? "";
    }
  });
  return form;
}

function SettingsCard({ eyebrow, title, defaults, subscribe, save, fields, errorLabel, onChange }) {
  const [form, setForm] = useState(() => hydrate(fields, defaults));
  const [saved, setSaved] = useState(() => hydrate(fields, defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploads, setUploads] = useState({});

  useEffect(() => {
    const unsub = subscribe(
      (data) => {
        const next = hydrate(fields, data);
        setForm(next);
        setSaved(next);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: `Failed to load ${errorLabel} content.` });
        setLoading(false);
      },
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Report the live form up so the section can mirror it in the preview.
  useEffect(() => {
    onChange?.(form);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  function setValue(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(field, file) {
    if (!file) return;
    setUploads((prev) => ({ ...prev, [field.key]: { uploading: true, progress: 0 } }));
    try {
      const uploaded = await field.uploader.upload({
        file,
        onProgress: (progress) => setUploads((prev) => ({ ...prev, [field.key]: { uploading: true, progress } })),
      });
      setForm((prev) => ({ ...prev, [field.key]: uploaded.url, [field.pathKey || "imagePath"]: uploaded.path }));
      setErrors((prev) => ({ ...prev, [field.key]: "" }));
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploads((prev) => ({ ...prev, [field.key]: { uploading: false, progress: 0 } }));
    }
  }

  async function removeImage(field) {
    const path = form[field.pathKey || "imagePath"];
    setForm((prev) => ({ ...prev, [field.key]: "", [field.pathKey || "imagePath"]: "" }));
    try {
      await field.uploader.remove(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function handleSave() {
    const nextErrors = {};
    fields.forEach((field) => {
      if (!field.required) return;
      if (field.type === "cta") return;
      const value = form[field.key];
      const empty = field.type === "image" ? !value : !String(value || "").trim();
      if (empty) nextErrors[field.key] = `${field.label} is required.`;
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await save(form);
      emitAlert({ type: "success", message: `${title} saved.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to save ${errorLabel}.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{title}</h3>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
          {dirty ? "Unsaved" : "Saved"}
        </span>
      </div>

      {loading ? (
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {fields.map((field) => {
            if (field.type === "cta") {
              return (
                <CtaField key={field.key} label={field.label} value={form[field.key]} onChange={(value) => setValue(field.key, value)} />
              );
            }
            if (field.type === "image") {
              const state = uploads[field.key] || {};
              return (
                <ImagePicker
                  key={field.key}
                  label={field.label}
                  url={form[field.key]}
                  aspect={field.aspect}
                  error={errors[field.key]}
                  uploading={state.uploading}
                  progress={state.progress || 0}
                  onUpload={(file) => uploadImage(field, file)}
                  onRemove={() => removeImage(field)}
                />
              );
            }
            if (field.type === "textarea" || field.type === "lines") {
              return (
                <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                  <textarea
                    value={form[field.key] || ""}
                    onChange={(event) => setValue(field.key, event.target.value)}
                    rows={field.rows || 3}
                    className={textareaClass}
                    placeholder={field.placeholder}
                  />
                </Field>
              );
            }
            return (
              <Field key={field.key} label={field.label} error={errors[field.key]} hint={field.hint}>
                <input
                  value={form[field.key] || ""}
                  onChange={(event) => setValue(field.key, event.target.value)}
                  className={inputClass}
                  placeholder={field.placeholder}
                />
              </Field>
            );
          })}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Collection manager — config-driven list + add/edit modal                   */
/* -------------------------------------------------------------------------- */
function CollectionManager({
  eyebrow,
  title,
  itemNoun,
  subscribe,
  create,
  update,
  remove,
  toggle,
  fields,
  columns,
  imageField,
  itemLabel,
  onItems,
}) {
  const [items, setItems] = useState([]);
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribe(
      (list) => setItems(list),
      () => emitAlert({ type: "error", message: `Failed to load ${itemNoun}s.` }),
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [items],
  );

  // Report the live list up so the section can mirror it in the preview.
  useEffect(() => {
    onItems?.(sorted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted]);

  async function toggleItem(item) {
    try {
      await toggle(item.id, item.active === false);
      emitAlert({ type: "success", message: "Status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await remove(deleteTarget.id);
      if (imageField && deleteTarget[imageField.pathKey || "imagePath"]) {
        try {
          await imageField.uploader.remove(deleteTarget[imageField.pathKey || "imagePath"]);
        } catch {
          emitAlert({ type: "warning", message: `${title} item deleted, but image cleanup failed.` });
        }
      }
      emitAlert({ type: "success", message: `${itemNoun} deleted.` });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to delete ${itemNoun}.` });
    } finally {
      setDeleteLoading(false);
    }
  }

  const gridCols = imageField
    ? "grid-cols-[64px_1fr_90px_120px]"
    : "grid-cols-[1fr_90px_120px]";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{eyebrow}</p>
          <h3 className="mt-1 text-base font-bold text-gray-900">{items.length} {title.toLowerCase()}</h3>
        </div>
        <button
          onClick={() => setModalState({ mode: "create", item: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add {itemNoun}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
        <div className="min-w-[560px]">
          <div className={`grid ${gridCols} bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400`}>
            {imageField ? <span>Image</span> : null}
            <span>{columns[0]?.label}</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {sorted.length ? (
            sorted.map((item) => (
              <div key={item.id} className={`grid ${gridCols} items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm`}>
                {imageField ? (
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {item[imageField.key] ? (
                      <img src={item[imageField.key]} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="m-3.5 h-5 w-5 text-gray-300" />
                    )}
                  </div>
                ) : null}
                <div className="min-w-0">
                  {columns.map((col, colIndex) => (
                    <p
                      key={col.key}
                      className={`truncate ${colIndex === 0 ? "font-bold text-gray-900" : "text-xs font-semibold text-gray-500"}`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </p>
                  ))}
                </div>
                <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${item.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>
                  {item.active === false ? "Inactive" : "Active"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => toggleItem(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                    {item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                  <button onClick={() => setModalState({ mode: "edit", item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">
              No {itemNoun}s yet.
            </div>
          )}
        </div>
      </div>

      {modalState ? (
        <CollectionModal
          mode={modalState.mode}
          item={modalState.item}
          items={items}
          fields={fields}
          imageField={imageField}
          title={title}
          itemNoun={itemNoun}
          create={create}
          update={update}
          onClose={() => setModalState(null)}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title={`Delete ${itemNoun}`}
          message={`Delete "${itemLabel(deleteTarget) || "this item"}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function CollectionModal({ mode, item, items, fields, imageField, title, itemNoun, create, update, onClose }) {
  const nextOrder = useMemo(
    () => items.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), 0) + 1,
    [items],
  );

  const [form, setForm] = useState(() => {
    const base = { order: Number(item?.order) || nextOrder, active: item?.active !== false };
    fields.forEach((field) => {
      base[field.key] = item?.[field.key] ?? "";
    });
    if (imageField) {
      base[imageField.key] = item?.[imageField.key] || "";
      base[imageField.pathKey || "imagePath"] = item?.[imageField.pathKey || "imagePath"] || "";
    }
    return base;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(file) {
    if (!file || !imageField) return;
    setUploading(true);
    setProgress(0);
    try {
      const uploaded = await imageField.uploader.upload({ file, onProgress: setProgress });
      setForm((prev) => ({ ...prev, [imageField.key]: uploaded.url, [imageField.pathKey || "imagePath"]: uploaded.path }));
      setErrors((prev) => ({ ...prev, [imageField.key]: "" }));
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    if (!imageField) return;
    const path = form[imageField.pathKey || "imagePath"];
    setForm((prev) => ({ ...prev, [imageField.key]: "", [imageField.pathKey || "imagePath"]: "" }));
    try {
      await imageField.uploader.remove(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    fields.forEach((field) => {
      if (field.required && !String(form[field.key] ?? "").trim()) {
        nextErrors[field.key] = `${field.label} is required.`;
      }
    });
    if (imageField?.required && !form[imageField.key]) {
      nextErrors[imageField.key] = `${imageField.label} is required.`;
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await update(item.id, form);
        emitAlert({ type: "success", message: `${itemNoun} updated.` });
      } else {
        await create(form);
        emitAlert({ type: "success", message: `${itemNoun} added.` });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || `Failed to save ${itemNoun}.` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              {mode === "edit" ? `Edit ${itemNoun}` : `Add ${itemNoun}`}
            </p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">{title} details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          {imageField ? (
            <ImagePicker
              label={imageField.label}
              url={form[imageField.key]}
              aspect={imageField.aspect}
              error={errors[imageField.key]}
              uploading={uploading}
              progress={progress}
              onUpload={uploadImage}
              onRemove={removeImage}
            />
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key} className={field.half ? "" : "sm:col-span-2"}>
                <Field label={field.label} error={errors[field.key]} hint={field.hint}>
                  {field.type === "textarea" ? (
                    <textarea
                      value={form[field.key] || ""}
                      onChange={(event) => setField(field.key, event.target.value)}
                      rows={field.rows || 3}
                      className={textareaClass}
                      placeholder={field.placeholder}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      value={form[field.key] ?? ""}
                      onChange={(event) => setField(field.key, event.target.value)}
                      className={inputClass}
                      placeholder={field.placeholder}
                    />
                  )}
                </Field>
              </div>
            ))}

            <Field label="Display Order">
              <input
                type="number"
                value={form.order}
                onChange={(event) => setField("order", event.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Status">
              <button
                onClick={() => setField("active", !form.active)}
                className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}
              >
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? `Update ${itemNoun}` : `Add ${itemNoun}`}
          </button>
        </div>
      </div>
    </div>
  );
}
