"use client";

import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save } from "lucide-react";

import { LoadingState } from "@/ansets";
import { emitAlert } from "@/lib/alertBus";
import { DEFAULT_HOME_CONTENT, fetchHome, saveHome } from "./service/home.service";
import { Field, Grid, IconSelect, ImageField, ListEditor, TextArea } from "./components/fields";

const TABS = [
  { key: "header", label: "Header" },
  { key: "hero", label: "Hero" },
  { key: "insights", label: "Insights" },
  { key: "destinations", label: "Destinations" },
  { key: "about", label: "About" },
  { key: "newsletter", label: "Newsletter" },
  { key: "footer", label: "Footer" },
];

function deepMerge(base, override) {
  if (Array.isArray(base)) return Array.isArray(override) ? override : base;
  if (base && typeof base === "object") {
    const out = { ...base };
    const src = override && typeof override === "object" ? override : {};
    for (const key of Object.keys(base)) out[key] = deepMerge(base[key], src[key]);
    return out;
  }
  return override === undefined || override === null ? base : override;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

export default function TripFindBoxModule() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [tab, setTab] = useState("header");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const stored = await fetchHome();
        if (active) setContent(deepMerge(DEFAULT_HOME_CONTENT, stored || {}));
      } catch (err) {
        if (active) {
          setContent(clone(DEFAULT_HOME_CONTENT));
          emitAlert({ type: "error", title: "Load failed", message: err?.message || "Showing defaults." });
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const set = (path, value) => {
    setDirty(true);
    setContent((prev) => {
      const next = clone(prev);
      let node = next;
      for (let i = 0; i < path.length - 1; i += 1) node = node[path[i]];
      node[path[path.length - 1]] = value;
      return next;
    });
  };
  const sectionSetter = (section) => (key, value) => set([section, key], value);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveHome(content);
      setDirty(false);
      emitAlert({ type: "success", title: "Saved", message: "Refresh the site to see your changes." });
    } catch (err) {
      emitAlert({ type: "error", title: "Save failed", message: err?.message || "Could not save." });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm("Reset all fields to the original defaults? (Nothing is saved until you click Save.)")) {
      setContent(clone(DEFAULT_HOME_CONTENT));
      setDirty(true);
    }
  };

  if (loading || !content) {
    return <LoadingState variant="detail" />;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 sm:px-6">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 mb-5 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold text-[var(--foreground)] sm:text-xl">
              TripFindBox · Home Page
            </h1>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Edit every section of <code className="rounded bg-[var(--surface-soft)] px-1 py-0.5">/tripfindbox</code>. Changes go live on the next refresh.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              <RotateCcw size={14} /> <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-4 py-2 text-xs font-bold text-[var(--primary-foreground)] shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 -mb-px flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2 text-sm font-semibold transition ${
                tab === t.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "header" && <HeaderTab content={content} set={set} setField={sectionSetter("header")} />}
      {tab === "hero" && <HeroTab content={content} set={set} setField={sectionSetter("hero")} />}
      {tab === "insights" && <InsightsTab content={content} set={set} />}
      {tab === "destinations" && <DestinationsTab content={content} set={set} setField={sectionSetter("destinations")} />}
      {tab === "about" && <AboutTab content={content} set={set} setField={sectionSetter("about")} />}
      {tab === "newsletter" && <NewsletterTab content={content} set={set} setField={sectionSetter("newsletter")} />}
      {tab === "footer" && <FooterTab content={content} set={set} setField={sectionSetter("footer")} />}
    </div>
  );
}

function Card({ title, hint, children }) {
  return (
    <section className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      {title ? (
        <header className="mb-4">
          <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
          {hint ? <p className="mt-0.5 text-xs text-[var(--muted)]">{hint}</p> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

function HeaderTab({ content, set, setField }) {
  const h = content.header;
  return (
    <Card title="Header & top bar" hint="Logo text, phone CTA and navigation links.">
      <Field label="Logo alt text" value={h.logoAlt} onChange={(v) => setField("logoAlt", v)} />
      <Grid>
        <Field label="Phone number" value={h.phone} onChange={(v) => setField("phone", v)} />
        <Field label="Call subtext" value={h.callSubtext} onChange={(v) => setField("callSubtext", v)} />
      </Grid>
      <div className="mt-2">
        <ListEditor
          title="Navigation links"
          itemLabel="Link"
          items={h.nav}
          onChange={(v) => set(["header", "nav"], v)}
          makeEmpty={() => ({ label: "", href: "#" })}
          renderItem={(item, on) => (
            <Grid>
              <Field label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
              <Field label="Link (href)" value={item.href} onChange={(v) => on({ ...item, href: v })} />
            </Grid>
          )}
        />
      </div>
    </Card>
  );
}

function HeroTab({ content, set, setField }) {
  const hero = content.hero;
  const r = hero.reviewStrip;
  return (
    <>
      <Card title="Hero" hint="The main headline area at the top of the page.">
        <Field label="Eyebrow" value={hero.eyebrow} onChange={(v) => setField("eyebrow", v)} />
        <Field label="Title (H1)" value={hero.title} onChange={(v) => setField("title", v)} />
        <TextArea label="Lead paragraph" value={hero.lead} onChange={(v) => setField("lead", v)} />
        <Field label="Mobile call-bar text" value={hero.mobileCallText} onChange={(v) => setField("mobileCallText", v)} />
      </Card>

      <Card title="Trust badges" hint="Small badges shown under the headline.">
        <ListEditor
          itemLabel="Badge"
          items={hero.trustBadges}
          onChange={(v) => set(["hero", "trustBadges"], v)}
          makeEmpty={() => ({ iconKey: "ShieldCheck", label: "" })}
          renderItem={(item, on) => (
            <Grid>
              <IconSelect label="Icon" value={item.iconKey} onChange={(v) => on({ ...item, iconKey: v })} />
              <Field label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
            </Grid>
          )}
        />
      </Card>

      <Card title="Review strip" hint="The trust / rating line below the search box.">
        <Grid>
          <Field label="Trusted-by count" value={r.trustedByCount} onChange={(v) => set(["hero", "reviewStrip", "trustedByCount"], v)} />
          <Field label="Rating word" value={r.excellentLabel} onChange={(v) => set(["hero", "reviewStrip", "excellentLabel"], v)} />
          <Field label="Filled stars (0-5)" value={r.filledStars} onChange={(v) => set(["hero", "reviewStrip", "filledStars"], Number(v) || 0)} />
          <Field label="Review score" value={r.reviewScore} onChange={(v) => set(["hero", "reviewStrip", "reviewScore"], v)} />
          <Field label="Review count" value={r.reviewCount} onChange={(v) => set(["hero", "reviewStrip", "reviewCount"], v)} />
        </Grid>
      </Card>
    </>
  );
}

function InsightsTab({ content, set }) {
  return (
    <Card title="Insights" hint="The three highlight cards (icon + title + text).">
      <ListEditor
        itemLabel="Card"
        items={content.insights}
        onChange={(v) => set(["insights"], v)}
        makeEmpty={() => ({ iconKey: "Headphones", title: "", text: "" })}
        renderItem={(item, on) => (
          <>
            <Grid>
              <IconSelect label="Icon" value={item.iconKey} onChange={(v) => on({ ...item, iconKey: v })} />
              <Field label="Title" value={item.title} onChange={(v) => on({ ...item, title: v })} />
            </Grid>
            <TextArea label="Text" value={item.text} onChange={(v) => on({ ...item, text: v })} />
          </>
        )}
      />
    </Card>
  );
}

function DestinationsTab({ content, set, setField }) {
  const d = content.destinations;
  return (
    <Card title="Destinations" hint="The scrolling destination cards.">
      <Field label="Section title" value={d.sectionTitle} onChange={(v) => setField("sectionTitle", v)} />
      <ListEditor
        itemLabel="Destination"
        items={d.items}
        onChange={(v) => set(["destinations", "items"], v)}
        makeEmpty={() => ({ city: "", price: "", description: "", image: "" })}
        renderItem={(item, on) => {
          const obj = Array.isArray(item)
            ? { city: item[0] || "", price: item[1] || "", description: item[2] || "", image: item[3] || "" }
            : { city: "", price: "", description: "", image: "", ...(item || {}) };
          const upd = (key, val) => on({ ...obj, [key]: val });
          return (
            <>
              <Grid>
                <Field label="City" value={obj.city} onChange={(v) => upd("city", v)} />
                <Field label="Price label" value={obj.price} onChange={(v) => upd("price", v)} />
              </Grid>
              <Field label="Description" value={obj.description} onChange={(v) => upd("description", v)} />
              <ImageField label="Image" value={obj.image} onChange={(v) => upd("image", v)} />
            </>
          );
        }}
      />
    </Card>
  );
}

function AboutTab({ content, set, setField }) {
  const a = content.about;
  return (
    <Card title="About section" hint="Heading, image and story paragraphs.">
      <Field label="Heading" value={a.heading} onChange={(v) => setField("heading", v)} />
      <ImageField label="Image" value={a.image} onChange={(v) => setField("image", v)} />
      <Field label="Image alt text" value={a.imageAlt} onChange={(v) => setField("imageAlt", v)} />
      <div className="mt-2">
        <ListEditor
          title="Paragraphs"
          itemLabel="Paragraph"
          items={a.paragraphs}
          onChange={(v) => set(["about", "paragraphs"], v)}
          makeEmpty={() => ""}
          renderItem={(item, on) => <TextArea label="" value={item} onChange={on} rows={4} />}
        />
      </div>
    </Card>
  );
}

function NewsletterTab({ content, set, setField }) {
  const n = content.newsletter;
  return (
    <Card title="Newsletter" hint="Sign-up block with perks.">
      <Field label="Kicker" value={n.kicker} onChange={(v) => setField("kicker", v)} />
      <Grid>
        <Field label="Title (before highlight)" value={n.title} onChange={(v) => setField("title", v)} />
        <Field label="Highlighted word" value={n.titleHighlight} onChange={(v) => setField("titleHighlight", v)} />
      </Grid>
      <TextArea label="Copy" value={n.copy} onChange={(v) => setField("copy", v)} />
      <Grid>
        <Field label="Email placeholder" value={n.placeholder} onChange={(v) => setField("placeholder", v)} />
        <Field label="Button text" value={n.buttonText} onChange={(v) => setField("buttonText", v)} />
      </Grid>
      <Field label="Proof text" value={n.proof} onChange={(v) => setField("proof", v)} />
      <ImageField label="Image" value={n.image} onChange={(v) => setField("image", v)} />
      <Field label="Image alt text" value={n.imageAlt} onChange={(v) => setField("imageAlt", v)} />
      <div className="mt-2">
        <ListEditor
          title="Perks"
          itemLabel="Perk"
          items={n.perks}
          onChange={(v) => set(["newsletter", "perks"], v)}
          makeEmpty={() => ({ iconKey: "HandCoins", label: "", text: "" })}
          renderItem={(item, on) => (
            <>
              <Grid>
                <IconSelect label="Icon" value={item.iconKey} onChange={(v) => on({ ...item, iconKey: v })} />
                <Field label="Label" value={item.label} onChange={(v) => on({ ...item, label: v })} />
              </Grid>
              <Field label="Text" value={item.text} onChange={(v) => on({ ...item, text: v })} />
            </>
          )}
        />
      </div>
    </Card>
  );
}

function FooterTab({ content, set, setField }) {
  const f = content.footer;
  const s = f.social;
  return (
    <>
      <Card title="Footer content" hint="Newsletter block, disclaimer and legal lines.">
        <Grid>
          <Field label="Newsletter heading" value={f.newsletterHeading} onChange={(v) => setField("newsletterHeading", v)} />
          <Field label="Newsletter text" value={f.newsletterText} onChange={(v) => setField("newsletterText", v)} />
        </Grid>
        <TextArea label="Consent text" value={f.consentText} onChange={(v) => setField("consentText", v)} rows={3} />
        <TextArea label="Disclaimer" value={f.disclaimer} onChange={(v) => setField("disclaimer", v)} rows={5} />
        <Field label="Copyright line" value={f.copyright} onChange={(v) => setField("copyright", v)} />
      </Card>

      <Card title="Social links">
        <Grid>
          <Field label="Facebook URL" value={s.facebook} onChange={(v) => set(["footer", "social", "facebook"], v)} />
          <Field label="Instagram URL" value={s.instagram} onChange={(v) => set(["footer", "social", "instagram"], v)} />
          <Field label="X (Twitter) URL" value={s.x} onChange={(v) => set(["footer", "social", "x"], v)} />
          <Field label="LinkedIn URL" value={s.linkedin} onChange={(v) => set(["footer", "social", "linkedin"], v)} />
        </Grid>
      </Card>

      <Card title="Footer columns" hint="Link columns at the bottom of the page.">
        <ListEditor
          itemLabel="Column"
          items={f.columns}
          onChange={(v) => set(["footer", "columns"], v)}
          makeEmpty={() => ({ title: "", items: [] })}
          renderItem={(col, onCol) => (
            <>
              <Field label="Column title" value={col.title} onChange={(v) => onCol({ ...col, title: v })} />
              <ListEditor
                title="Links"
                itemLabel="Link"
                items={col.items}
                onChange={(v) => onCol({ ...col, items: v })}
                makeEmpty={() => ({ label: "", href: "/" })}
                renderItem={(link, onLink) => (
                  <Grid>
                    <Field label="Label" value={link.label} onChange={(v) => onLink({ ...link, label: v })} />
                    <Field label="Link (href)" value={link.href} onChange={(v) => onLink({ ...link, href: v })} />
                  </Grid>
                )}
              />
            </>
          )}
        />
      </Card>
    </>
  );
}
