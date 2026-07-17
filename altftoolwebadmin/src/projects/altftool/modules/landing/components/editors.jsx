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

function ComingSoon({ type }) {
  return (
    <p className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] px-3 py-4 text-center text-xs text-[var(--muted)]">
      The <span className="font-bold text-[var(--foreground)]">{sectionLabel(type)}</span> editor arrives in a later phase.
    </p>
  );
}

export const EDITORS = {
  hero: HeroEditor,
  features: FeaturesEditor,
  faq: FaqEditor,
  cta: CtaEditor,
  text: TextEditor,
};

export function SectionEditor({ type, props, patch, landerId }) {
  const Cmp = EDITORS[type];
  if (!Cmp) return <ComingSoon type={type} />;
  return <Cmp props={props || {}} patch={patch} landerId={landerId} />;
}
