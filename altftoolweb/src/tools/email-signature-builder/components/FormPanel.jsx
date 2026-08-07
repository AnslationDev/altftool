"use client";

import { useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  User,
  LayoutTemplate,
  ImagePlus,
  Building2,
  Share2,
  MousePointerClick,
  CalendarClock,
  Megaphone,
  QrCode,
  Scale,
  Palette,
  ListOrdered,
  GripVertical,
  Upload,
  Sparkles,
} from "lucide-react";
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  EMAIL_SAFE_FONTS,
  SOCIAL_NETWORKS,
  MEETING_SERVICES,
  ORDERABLE_SECTIONS,
  SAMPLE_PROFILE,
  applyTemplate,
} from "../lib/signatureData";

const INPUT_CLASS =
  "w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/25";
const LABEL_CLASS = "mb-1 block text-xs font-semibold text-(--muted-foreground)";

const PERSONAL_FIELDS = [
  ["fullName", "Full name", "Aarav Sharma"],
  ["title", "Job title", "Head of Growth"],
  ["company", "Company", "Anslation"],
  ["department", "Department", "Marketing"],
  ["email", "Email", "you@company.com"],
  ["phone", "Phone", "+91 11 4155 0000"],
  ["mobile", "Mobile", "+91 98100 00000"],
  ["website", "Website", "https://company.com"],
  ["address", "Address", "City, Country"],
  ["hours", "Working hours", "Mon–Fri, 9:30–18:30"],
  ["tagline", "Tagline", "One line about what you do"],
];

// Reads an image file into a data URL. Profile photos are center-cropped to a
// square on a canvas so the exported <img> never distorts; logos/banners keep
// their aspect ratio, capped at a sane width.
function fileToDataUrl(file, { square = false, max = 640 } = {}) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode failed"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (square) {
          const side = Math.min(img.width, img.height);
          const size = Math.min(max, side);
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
        } else {
          const scale = Math.min(1, max / img.width);
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function Section({ icon: Icon, title, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-(--border) bg-(--card)/70">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-(--foreground) [&::-webkit-details-marker]:hidden">
        <Icon className="h-4 w-4 text-(--primary)" aria-hidden="true" />
        {title}
        <span className="ml-auto text-(--muted-foreground) transition-transform group-open:rotate-90">›</span>
      </summary>
      <div className="border-t border-(--border) p-4">{children}</div>
    </details>
  );
}

function ImagePicker({ label, src, onSrc, square }) {
  const fileRef = useRef(null);
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={src.startsWith("data:") ? "" : src}
          onChange={(e) => onSrc(e.target.value)}
          placeholder={src.startsWith("data:") ? "Uploaded image in use" : "https://…/image.png (recommended)"}
          aria-label={label}
          className={INPUT_CLASS}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) px-3 py-2 text-xs font-medium text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)"
        >
          <Upload className="h-3.5 w-3.5" aria-hidden="true" /> Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              onSrc(await fileToDataUrl(file, { square, max: square ? 320 : 640 }));
            } catch {
              // unreadable file — keep the existing value
            }
            e.target.value = "";
          }}
        />
      </div>
      {src && (
        <button type="button" onClick={() => onSrc("")} className="mt-1.5 cursor-pointer text-xs text-(--muted-foreground) hover:text-danger">
          Remove image
        </button>
      )}
      <p className="mt-1 text-[11px] text-(--muted-foreground)">Hosted https:// URLs display most reliably in email clients; uploads are embedded as base64.</p>
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div>
      <label className={LABEL_CLASS}>{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-(--border) bg-transparent p-0.5" aria-label={label} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={`${INPUT_CLASS} font-mono uppercase`} maxLength={7} />
      </div>
    </div>
  );
}

export default function FormPanel({ state, setState }) {
  const [category, setCategory] = useState("Professional");

  const patch = (key, value) => setState((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }));
  const setVisible = (id, visible) =>
    setState((prev) => ({
      ...prev,
      sections: { ...prev.sections, visible: { ...prev.sections.visible, [id]: visible } },
    }));

  function handleDragEnd(result) {
    if (!result.destination) return;
    setState((prev) => {
      const order = [...prev.sections.order];
      const [moved] = order.splice(result.source.index, 1);
      order.splice(result.destination.index, 0, moved);
      return { ...prev, sections: { ...prev.sections, order } };
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => patch("personal", SAMPLE_PROFILE)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--border) bg-(--background) px-3 py-1.5 text-xs font-medium text-(--muted-foreground) hover:border-(--primary) hover:text-(--primary)"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Fill sample details
      </button>

      <Section icon={LayoutTemplate} title="Template" defaultOpen>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${category === cat ? "bg-(--primary) text-(--primary-foreground)" : "bg-(--muted) text-(--muted-foreground)"}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TEMPLATES.filter((t) => t.category === category).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setState((prev) => applyTemplate(prev, t))}
              className={`cursor-pointer rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 ${state.templateId === t.id ? "border-(--primary) ring-2 ring-(--primary)/30" : "border-(--border)"}`}
            >
              <span className="block h-2.5 w-10 rounded-full" style={{ backgroundColor: t.accent }} />
              <span className="mt-2 block text-xs font-semibold text-(--foreground)">{t.name}</span>
              <span className="block text-[10px] text-(--muted-foreground)">{t.layout.replace("-", " ")}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section icon={User} title="Personal details" defaultOpen>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PERSONAL_FIELDS.map(([key, label, placeholder]) => (
            <div key={key} className={key === "tagline" || key === "address" ? "sm:col-span-2" : ""}>
              <label htmlFor={`esb-${key}`} className={LABEL_CLASS}>
                {label}
              </label>
              <input
                id={`esb-${key}`}
                type={key === "email" ? "email" : key === "website" ? "url" : "text"}
                value={state.personal[key]}
                onChange={(e) => patch("personal", { [key]: e.target.value })}
                placeholder={placeholder}
                className={INPUT_CLASS}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={ImagePlus} title="Profile photo">
        <div className="space-y-3">
          <ImagePicker label="Photo" src={state.photo.src} onSrc={(src) => patch("photo", { src })} square />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Size: {state.photo.size}px</label>
              <input type="range" min={48} max={140} value={state.photo.size} onChange={(e) => patch("photo", { size: Number(e.target.value) })} className="w-full accent-(--primary)" />
            </div>
            <div>
              <label className={LABEL_CLASS}>Shape</label>
              <select value={state.photo.shape} onChange={(e) => patch("photo", { shape: e.target.value })} className={INPUT_CLASS}>
                <option value="circle">Circle</option>
                <option value="rounded">Rounded corners</option>
                <option value="square">Square</option>
              </select>
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Building2} title="Company logo">
        <div className="space-y-3">
          <ImagePicker label="Logo" src={state.logo.src} onSrc={(src) => patch("logo", { src })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL_CLASS}>Logo link (optional)</label>
              <input type="url" value={state.logo.url} onChange={(e) => patch("logo", { url: e.target.value })} placeholder="https://company.com" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Width: {state.logo.width}px</label>
              <input type="range" min={60} max={220} value={state.logo.width} onChange={(e) => patch("logo", { width: Number(e.target.value) })} className="w-full accent-(--primary)" />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Share2} title="Social links">
        <p className="mb-3 text-[11px] text-(--muted-foreground)">Only networks with a URL appear in the signature.</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SOCIAL_NETWORKS.map((n) => (
            <div key={n.id}>
              <label htmlFor={`esb-soc-${n.id}`} className={LABEL_CLASS}>
                {n.label}
              </label>
              <input
                id={`esb-soc-${n.id}`}
                type="url"
                value={state.socials[n.id] || ""}
                onChange={(e) => setState((prev) => ({ ...prev, socials: { ...prev.socials, [n.id]: e.target.value } }))}
                placeholder={n.placeholder}
                className={INPUT_CLASS}
              />
            </div>
          ))}
        </div>
        <div className="mt-3">
          <label className={LABEL_CLASS}>Icon style</label>
          <select value={state.design.iconStyle} onChange={(e) => patch("design", { iconStyle: e.target.value })} className={INPUT_CLASS}>
            <option value="badge">Color badges (self-contained, no external images)</option>
            <option value="text">Text links</option>
          </select>
        </div>
      </Section>

      <Section icon={MousePointerClick} title="CTA button">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Button text</label>
            <input type="text" value={state.cta.label} onChange={(e) => patch("cta", { label: e.target.value })} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Button URL</label>
            <input type="url" value={state.cta.url} onChange={(e) => patch("cta", { url: e.target.value })} placeholder="https://…" className={INPUT_CLASS} />
          </div>
          <ColorField label="Background" value={state.cta.bg} onChange={(bg) => patch("cta", { bg })} />
          <ColorField label="Text color" value={state.cta.color} onChange={(color) => patch("cta", { color })} />
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Corner radius: {state.cta.radius}px (Outlook shows square corners)</label>
            <input type="range" min={0} max={24} value={state.cta.radius} onChange={(e) => patch("cta", { radius: Number(e.target.value) })} className="w-full accent-(--primary)" />
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} title="Meeting buttons">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {MEETING_SERVICES.map((s) => (
            <div key={s.id}>
              <label htmlFor={`esb-meet-${s.id}`} className={LABEL_CLASS}>
                {s.label}
              </label>
              <input
                id={`esb-meet-${s.id}`}
                type="url"
                value={state.meetings[s.id]}
                onChange={(e) => patch("meetings", { [s.id]: e.target.value })}
                placeholder={`https://${s.id === "gmeet" ? "meet.google.com" : `${s.id}.com`}/…`}
                className={INPUT_CLASS}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section icon={Megaphone} title="Promotional banner">
        <div className="space-y-3">
          <ImagePicker label="Banner image" src={state.banner.src} onSrc={(src) => patch("banner", { src })} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Banner link</label>
              <input type="url" value={state.banner.url} onChange={(e) => patch("banner", { url: e.target.value })} placeholder="https://…" className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Alt text</label>
              <input type="text" value={state.banner.alt} onChange={(e) => patch("banner", { alt: e.target.value })} className={INPUT_CLASS} />
            </div>
            <div>
              <label className={LABEL_CLASS}>Width: {state.banner.width}px</label>
              <input type="range" min={200} max={560} value={state.banner.width} onChange={(e) => patch("banner", { width: Number(e.target.value) })} className="w-full accent-(--primary)" />
            </div>
          </div>
        </div>
      </Section>

      <Section icon={QrCode} title="QR code">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>QR contents</label>
            <select value={state.qr.mode} onChange={(e) => patch("qr", { mode: e.target.value })} className={INPUT_CLASS}>
              <option value="website">My website URL</option>
              <option value="vcard">vCard (save my contact)</option>
              <option value="custom">Custom text / URL</option>
            </select>
          </div>
          {state.qr.mode === "custom" && (
            <div>
              <label className={LABEL_CLASS}>Custom value</label>
              <input type="text" value={state.qr.custom} onChange={(e) => patch("qr", { custom: e.target.value })} className={INPUT_CLASS} />
            </div>
          )}
        </div>
      </Section>

      <Section icon={Scale} title="Legal disclaimer">
        <textarea
          rows={3}
          value={state.disclaimer}
          onChange={(e) => setState((prev) => ({ ...prev, disclaimer: e.target.value }))}
          placeholder="This email and any attachments are confidential…"
          className={`${INPUT_CLASS} resize-y`}
        />
      </Section>

      <Section icon={Palette} title="Design">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS}>Font (email-safe)</label>
            <select value={state.design.font} onChange={(e) => patch("design", { font: e.target.value })} className={INPUT_CLASS}>
              {EMAIL_SAFE_FONTS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Layout</label>
            <select value={state.design.layout} onChange={(e) => patch("design", { layout: e.target.value })} className={INPUT_CLASS}>
              <option value="horizontal">Photo left</option>
              <option value="stacked">Photo on top</option>
              <option value="vertical-line">Accent line</option>
              <option value="accent-bar">Accent bar (top)</option>
              <option value="text-only">Text only</option>
            </select>
          </div>
          <ColorField label="Accent color" value={state.design.accent} onChange={(accent) => patch("design", { accent })} />
          <ColorField label="Text color" value={state.design.text} onChange={(text) => patch("design", { text })} />
          <div>
            <label className={LABEL_CLASS}>Font size: {state.design.fontSize}px</label>
            <input type="range" min={11} max={17} value={state.design.fontSize} onChange={(e) => patch("design", { fontSize: Number(e.target.value) })} className="w-full accent-(--primary)" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Line spacing: {state.design.lineHeight}</label>
            <input type="range" min={1.2} max={2} step={0.1} value={state.design.lineHeight} onChange={(e) => patch("design", { lineHeight: Number(e.target.value) })} className="w-full accent-(--primary)" />
          </div>
          <div>
            <label className={LABEL_CLASS}>Divider</label>
            <select value={state.design.divider} onChange={(e) => patch("design", { divider: e.target.value })} className={INPUT_CLASS}>
              <option value="line">Solid line</option>
              <option value="dots">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS}>Signature width: {state.design.width}px</label>
            <input type="range" min={360} max={640} step={10} value={state.design.width} onChange={(e) => patch("design", { width: Number(e.target.value) })} className="w-full accent-(--primary)" />
          </div>
        </div>
      </Section>

      <Section icon={ListOrdered} title="Sections & order">
        <p className="mb-3 text-[11px] text-(--muted-foreground)">Drag to reorder; toggle to show or hide. Sections stack below your contact details.</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="esb-sections">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                {state.sections.order.map((id, index) => {
                  const meta = ORDERABLE_SECTIONS.find((s) => s.id === id);
                  return (
                    <Draggable key={id} draggableId={id} index={index}>
                      {(p, snapshot) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          className={`flex items-center gap-2.5 rounded-lg border bg-(--background) px-3 py-2 ${snapshot.isDragging ? "border-(--primary) shadow-lg" : "border-(--border)"}`}
                        >
                          <span {...p.dragHandleProps} aria-label={`Reorder ${meta.label}`} className="cursor-grab text-(--muted-foreground)">
                            <GripVertical className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="flex-1 text-sm text-(--foreground)">{meta.label}</span>
                          <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-(--muted-foreground)">
                            <input
                              type="checkbox"
                              checked={state.sections.visible[id]}
                              onChange={(e) => setVisible(id, e.target.checked)}
                              className="h-4 w-4 accent-(--primary)"
                            />
                            Show
                          </label>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Section>
    </div>
  );
}
