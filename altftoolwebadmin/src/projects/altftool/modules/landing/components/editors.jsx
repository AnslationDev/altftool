"use client";

// Per-section-type editors. Each editor receives ({ props, patch, landerId })
// where `props` is the section's data and `patch(partial)` merges into it. The
// EDITORS registry maps a section `type` to its editor; unmapped types fall
// back to a "coming soon" note so the builder never crashes on a new type.

import { Field, Input, Textarea, Select, ImageField, ListEditor } from "./fields";
import { sectionLabel } from "../lib/schema";

function HeroEditor({ props, patch, landerId }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Badge (optional)"><Input value={props.badge} onChange={(v) => patch({ badge: v })} placeholder="New · 2026" /></Field>
        <Field label="Alignment">
          <Select value={props.align || "left"} onChange={(v) => patch({ align: v })} options={[{ value: "left", label: "Left" }, { value: "center", label: "Center" }]} />
        </Field>
      </div>
      <Field label="Heading"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="The headline of your page" /></Field>
      <Field label="Subheading"><Input value={props.subheading} onChange={(v) => patch({ subheading: v })} placeholder="A supporting line" /></Field>
      <Field label="Description"><Textarea value={props.description} onChange={(v) => patch({ description: v })} placeholder="A short paragraph that sells the page." /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Primary button label"><Input value={props.primaryLabel} onChange={(v) => patch({ primaryLabel: v })} placeholder="Get started" /></Field>
        <Field label="Primary button URL"><Input value={props.primaryUrl} onChange={(v) => patch({ primaryUrl: v })} placeholder="https://…" /></Field>
        <Field label="Secondary button label"><Input value={props.secondaryLabel} onChange={(v) => patch({ secondaryLabel: v })} placeholder="Learn more" /></Field>
        <Field label="Secondary button URL"><Input value={props.secondaryUrl} onChange={(v) => patch({ secondaryUrl: v })} placeholder="https://…" /></Field>
      </div>
      <ImageField value={props.image} onChange={(v) => patch({ image: v })} landerId={landerId} label="Hero image" />
    </div>
  );
}

function FeaturesEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Why choose us" /></Field>
      <ListEditor
        items={props.items}
        onChange={(items) => patch({ items })}
        addLabel="Add feature"
        newItem={{ title: "", description: "", icon: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <Input value={item.title} onChange={(v) => set({ title: v })} placeholder="Feature title" />
            <Textarea rows={2} value={item.description} onChange={(v) => set({ description: v })} placeholder="Feature description" />
          </div>
        )}
      />
    </div>
  );
}

function FaqEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Frequently asked questions" /></Field>
      <ListEditor
        items={props.items}
        onChange={(items) => patch({ items })}
        addLabel="Add question"
        newItem={{ question: "", answer: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <Input value={item.question} onChange={(v) => set({ question: v })} placeholder="Question" />
            <Textarea rows={2} value={item.answer} onChange={(v) => set({ answer: v })} placeholder="Answer" />
          </div>
        )}
      />
    </div>
  );
}

function CtaEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Heading"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Ready to get started?" /></Field>
      <Field label="Description"><Textarea value={props.description} onChange={(v) => patch({ description: v })} placeholder="One last nudge before the button." /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button label"><Input value={props.buttonLabel} onChange={(v) => patch({ buttonLabel: v })} placeholder="Get started" /></Field>
        <Field label="Button URL"><Input value={props.buttonUrl} onChange={(v) => patch({ buttonUrl: v })} placeholder="https://…" /></Field>
      </div>
    </div>
  );
}

function TextEditor({ props, patch }) {
  return (
    <Field label="Content" hint="Plain text or simple HTML. A rich-text editor arrives in a later phase.">
      <Textarea rows={6} value={props.html} onChange={(v) => patch({ html: v })} placeholder="Write your content…" />
    </Field>
  );
}

function BannerEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Heading"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Limited-time offer" /></Field>
        <Field label="Tone">
          <Select value={props.tone || "info"} onChange={(v) => patch({ tone: v })} options={[
            { value: "info", label: "Info" }, { value: "success", label: "Success" },
            { value: "warning", label: "Warning" }, { value: "primary", label: "Primary" },
          ]} />
        </Field>
      </div>
      <Field label="Text"><Textarea rows={2} value={props.text} onChange={(v) => patch({ text: v })} placeholder="A short banner message." /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button label"><Input value={props.ctaLabel} onChange={(v) => patch({ ctaLabel: v })} placeholder="Claim now" /></Field>
        <Field label="Button URL"><Input value={props.ctaUrl} onChange={(v) => patch({ ctaUrl: v })} placeholder="https://…" /></Field>
      </div>
    </div>
  );
}

function IntroEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Heading"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="About this tool" /></Field>
      <Field label="Body"><Textarea rows={4} value={props.body} onChange={(v) => patch({ body: v })} placeholder="An introductory paragraph." /></Field>
    </div>
  );
}

function StatsEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="By the numbers" /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel="Add stat"
        newItem={{ value: "", label: "" }}
        renderItem={(item, set) => (
          <div className="grid gap-2 sm:grid-cols-2">
            <Input value={item.value} onChange={(v) => set({ value: v })} placeholder="10M+" />
            <Input value={item.label} onChange={(v) => set({ label: v })} placeholder="Users" />
          </div>
        )}
      />
    </div>
  );
}

function BenefitsEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Benefits" /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel="Add benefit"
        newItem={{ title: "", description: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <Input value={item.title} onChange={(v) => set({ title: v })} placeholder="Benefit title" />
            <Textarea rows={2} value={item.description} onChange={(v) => set({ description: v })} placeholder="Benefit description" />
          </div>
        )}
      />
    </div>
  );
}

function StepsEditor({ props, patch }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="How it works" /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel="Add step"
        newItem={{ title: "", description: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <Input value={item.title} onChange={(v) => set({ title: v })} placeholder="Step title" />
            <Textarea rows={2} value={item.description} onChange={(v) => set({ description: v })} placeholder="What happens in this step" />
          </div>
        )}
      />
    </div>
  );
}

function TestimonialsEditor({ props, patch, landerId }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="What people say" /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel="Add testimonial"
        newItem={{ quote: "", author: "", role: "", avatar: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <Textarea rows={2} value={item.quote} onChange={(v) => set({ quote: v })} placeholder="“This tool is amazing…”" />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={item.author} onChange={(v) => set({ author: v })} placeholder="Full name" />
              <Input value={item.role} onChange={(v) => set({ role: v })} placeholder="Role / company" />
            </div>
            <ImageField value={item.avatar} onChange={(v) => set({ avatar: v })} landerId={landerId} label="Avatar (optional)" />
          </div>
        )}
      />
    </div>
  );
}

function GalleryEditor({ props, patch, landerId }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder="Screenshots" /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel="Add image"
        newItem={{ image: "", caption: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <ImageField value={item.image} onChange={(v) => set({ image: v })} landerId={landerId} label="Image" />
            <Input value={item.caption} onChange={(v) => set({ caption: v })} placeholder="Caption (optional)" />
          </div>
        )}
      />
    </div>
  );
}

function VideoEditor({ props, patch, landerId }) {
  return (
    <div className="space-y-3">
      <Field label="Video URL" hint="YouTube, Vimeo, or a direct .mp4 URL."><Input value={props.url} onChange={(v) => patch({ url: v })} placeholder="https://youtube.com/watch?v=…" /></Field>
      <ImageField value={props.poster} onChange={(v) => patch({ poster: v })} landerId={landerId} label="Poster image (optional)" />
    </div>
  );
}

function ImageEditor({ props, patch, landerId }) {
  return (
    <div className="space-y-3">
      <ImageField value={props.url} onChange={(v) => patch({ url: v })} landerId={landerId} label="Image" />
      <Field label="Alt text" hint="Describe the image for accessibility & SEO."><Input value={props.alt} onChange={(v) => patch({ alt: v })} placeholder="Descriptive alt text" /></Field>
    </div>
  );
}

function CustomHtmlEditor({ props, patch }) {
  return (
    <Field label="Custom HTML" hint="Raw HTML rendered as-is. Only paste trusted markup.">
      <Textarea rows={6} value={props.html} onChange={(v) => patch({ html: v })} placeholder="<div>…</div>" />
    </Field>
  );
}

function EmbedEditor({ props, patch }) {
  return (
    <Field label="Embed code" hint="Paste an iframe / embed snippet (maps, forms, widgets).">
      <Textarea rows={5} value={props.html} onChange={(v) => patch({ html: v })} placeholder="<iframe src=…></iframe>" />
    </Field>
  );
}

function AdsEditor({ props, patch }) {
  return (
    <Field label="Ad placement key" hint="Placement id from the Ads module (e.g. lander-inline). Leave blank to disable.">
      <Input value={props.placement} onChange={(v) => patch({ placement: v })} placeholder="lander-inline" />
    </Field>
  );
}

function LinkListEditor({ props, patch, placeholder }) {
  return (
    <div className="space-y-3">
      <Field label="Section heading (optional)"><Input value={props.heading} onChange={(v) => patch({ heading: v })} placeholder={placeholder.heading} /></Field>
      <ListEditor
        items={props.items} onChange={(items) => patch({ items })} addLabel={placeholder.add}
        newItem={{ title: "", url: "", description: "" }}
        renderItem={(item, set) => (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <Input value={item.title} onChange={(v) => set({ title: v })} placeholder="Title" />
              <Input value={item.url} onChange={(v) => set({ url: v })} placeholder="/tools/all/…" />
            </div>
            <Input value={item.description} onChange={(v) => set({ description: v })} placeholder="Short description (optional)" />
          </div>
        )}
      />
    </div>
  );
}

function RelatedToolsEditor(p) {
  return <LinkListEditor {...p} placeholder={{ heading: "Related tools", add: "Add tool", }} />;
}
function BlogRecommendEditor(p) {
  return <LinkListEditor {...p} placeholder={{ heading: "Recommended reading", add: "Add article" }} />;
}

function ComingSoon({ type }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-4 text-center text-xs text-[var(--muted)]">
      The <span className="font-bold text-[var(--foreground)]">{sectionLabel(type)}</span> editor arrives in a later phase.
    </p>
  );
}

export const EDITORS = {
  hero: HeroEditor,
  banner: BannerEditor,
  intro: IntroEditor,
  features: FeaturesEditor,
  stats: StatsEditor,
  benefits: BenefitsEditor,
  steps: StepsEditor,
  gallery: GalleryEditor,
  video: VideoEditor,
  testimonials: TestimonialsEditor,
  faq: FaqEditor,
  cta: CtaEditor,
  relatedTools: RelatedToolsEditor,
  blogRecommend: BlogRecommendEditor,
  text: TextEditor,
  image: ImageEditor,
  customHtml: CustomHtmlEditor,
  embed: EmbedEditor,
  ads: AdsEditor,
};

export function SectionEditor({ type, props, patch, landerId }) {
  const Cmp = EDITORS[type];
  if (!Cmp) return <ComingSoon type={type} />;
  return <Cmp props={props || {}} patch={patch} landerId={landerId} />;
}
