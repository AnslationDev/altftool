"use client";

import { useState, useEffect } from "react";
import {
  X, Save, Loader2, ChevronDown, ChevronRight, Plus, Trash2,
  GripVertical, Star
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ImageUpload from "../../../components/ImageUpload";

const COLLECTION = "projects/marketys/home";
const DOC_ID = "config";

const EMPTY_FEATURE = {
  subtitle: "", heading: "", description: "",
  stats: [{ val: "", label: "" }, { val: "", label: "" }, { val: "", label: "" }],
  features: ["", "", ""],
  images: ["", "", ""],
  floatingStats: [
    { label: "", value: "", bgWhite: true },
    { label: "", value: "", bgWhite: false },
  ],
};

const EMPTY_PRICING = {
  name: "", desc: "", priceMonthly: "", priceAnnually: "",
  features: [""], buttonText: "", popular: false,
};

const INITIAL = {
  hero: {
    headline: ["Drive growth.", "Scale faster.", "Win markets."],
    highlightIndex: 1,
    subtitle: "Take a data-driven approach to digital marketing. Scale your brand with high-performing campaigns and custom strategies.",
    ctaText: "Book a Schedule",
    exploreText: "Explore Services",
    rating: { score: "4.8/5", label: "(Based on over 1,200+ reviews)" },
    bgImage: "",
    videoMov: "",
    videoWebm: "",
  },
  stats: [
    { value: "48", suffix: "%", label: "Average lift in qualified traffic" },
    { value: "62", suffix: "%", label: "Increase in affiliate conversion rate" },
    { value: "3.4", suffix: "x", label: "Faster campaign learning cycles" },
  ],
  partners: [
    { name: "BBC", logo: "https://www.pngmart.com/files/23/Bbc-Logo-PNG-Pic.png" },
    { name: "Mashable", logo: "https://tse3.mm.bing.net/th/id/OIP.-QZ4oYFZsBD1ac0QWb4vwAHaBo?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "TikTok", logo: "https://tse1.mm.bing.net/th/id/OIP.wwkk7rp66RXwr7o8FuZKagAAAA?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Walmart", logo: "https://tse1.mm.bing.net/th/id/OIP.WZP4TRLFNHn2Buns9iYeegHaCs?r=0&cb=thfc1falcon4&w=4390&h=1600&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Lenovo", logo: "https://freepngimg.com/thumb/lenovo_logo/32023-4-lenovo-logo-transparent.png" },
    { name: "Uber", logo: "https://tse3.mm.bing.net/th/id/OIP.Oy5wfKuZ37KcuXONE7zjnQHaEK?r=0&cb=thfc1falcon4&rs=1&pid=ImgDetMain&o=7&rm=3" },
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "LinkedIn", logo: "https://2.bp.blogspot.com/-DpLm5zpr3sU/W1dE0g2C1WI/AAAAAAAAq5w/WY2qL91vyvAoQ_aImF1zi5xsvwGcFygwACLcBGAs/s1600/linkedin.jpg" },
    { name: "Meta", logo: "https://www.pngall.com/wp-content/uploads/13/Meta-Logo.png" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
  ],
  features: [
    {
      subtitle: "Growth Channels",
      heading: "Digital Marketing that converts",
      description: "Since 2019, we've helped 200+ brands dominate organic and paid channels. Our data-first strategy combines SEO authority, CRM automation, and CRO science to turn traffic into measurable revenue.",
      stats: [
        { val: "+460%", label: "Organic traffic lift" },
        { val: "99.8%", label: "Data accuracy rate" },
        { val: "4.5x", label: "Conversion boost avg." },
      ],
      features: [
        "Custom channel & keyword targeting",
        "Real-time performance tracking & reporting",
        "Data-backed CRO & funnel optimization",
      ],
      images: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80",
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      ],
      floatingStats: [
        { label: "Organic Sessions", value: "68,000", sub: "\u2191 460%", bgWhite: true },
        { label: "Conversion Rate", value: "5.4%", sub: "\u2191 4.5x", bgWhite: false },
      ],
    },
    {
      subtitle: "Affiliate Networks",
      heading: "Affiliate programs that scale",
      description: "We've built affiliate ecosystems for brands from scratch since 2020 — growing networks from 0 to 2,600+ active publishers. Our risk-free CPA model means you only pay for results, not promises.",
      stats: [
        { val: "2.6k+", label: "Publisher partners" },
        { val: "$580k", label: "Monthly volume" },
        { val: "\u201361%", label: "CAC reduction" },
      ],
      features: [
        "Sub-affiliate networks & media partnerships",
        "Custom CPA commission structures & fraud shields",
        "Creator ambassador & influencer referral arrays",
      ],
      images: [
        "https://landingi.com/wp-content/uploads/2024/11/Affiliate-Digital-Marketing-1.webp",
        "https://pureresiduals.com/wp-content/uploads/top-Social-Media-Marketing-Affiliate-Programs.jpg",
        "https://assets-au-01.kc-usercontent.com/df4a25df-7d25-0294-ad5c-62528c8f82da/c234e5ea-d77b-4f6c-b74e-f19bbbf11925/Affiliate%20Marketing.jpg",
      ],
      floatingStats: [
        { label: "Active Partners", value: "2,600+", sub: "", bgWhite: true },
        { label: "Avg. CAC Drop", value: "\u201361.2%", sub: "", bgWhite: false },
      ],
    },
    {
      subtitle: "Paid Ads",
      heading: "Advertising that pays for itself",
      description: "From Google PMAX and Meta funnels to TikTok UGC and programmatic native ads — we've scaled paid channels for 150+ brands since 2021, achieving an average blended ROAS of 4.8x across portfolios.",
      stats: [
        { val: "4.8x", label: "Avg. ROAS achieved" },
        { val: "+2,060%", label: "Scaled conversions" },
        { val: "4.3%", label: "Peak CTR delivered" },
      ],
      features: [
        "Google, Meta, TikTok & YouTube ad management",
        "Creative UGC testing & audience validation",
        "Server-side attribution & daily negative pruning",
      ],
      images: [
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&q=80",
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
      ],
      floatingStats: [
        { label: "Blended ROAS", value: "4.8x", sub: "", bgWhite: false },
        { label: "CTR Achieved", value: "4.3%", sub: "", bgWhite: true },
      ],
    },
  ],
  process: [
    { title: "Research", desc: "Audience, offer and competitor signals are mapped before we spend a rupee on traffic.", img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&q=90" },
    { title: "Strategy", desc: "We design a custom campaign architecture, mapping budgets, creatives, and funnels to match target ROI thresholds.", img: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=900&q=90" },
    { title: "Execution", desc: "Launch campaigns, set up exact server-side tracking, build dynamic ad copy, and push live.", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&q=90" },
    { title: "Delivery", desc: "We report transparent results and scale budgets on high-yielding channels weekly.", img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=90" },
  ],
  testimonials: [
    { quote: "VELOX helped us turn scattered campaigns into a clean acquisition system. The tracking, creative tests and landing pages exceeded our targets.", author: "Rohan Mehta", role: "Founder, D2C Brand", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
    { quote: "Working with VELOX felt like having an in-house growth team. Clear communication, strong ideas and real impact on revenue.", author: "Sarah Chen", role: "Product Owner", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
    { quote: "The programmatic campaigns and custom attribution setup saved us thousands in waste. Scaling was fast, efficient, and transparent.", author: "David Miller", role: "Growth VP, SaaS", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80" },
    { quote: "A dedicated marketing partner that values margins as much as revenue. Their team went above and beyond to launch complex funnels.", author: "Naomi Watts", role: "E-commerce Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80" },
  ],
  pricing: [
    { name: "Growth", desc: "Best for startups and small teams looking to establish their digital presence.", priceMonthly: "499", priceAnnually: "399", features: ["Google Ads management", "Basic SEO & Keyword research", "Monthly reports & analytics", "Standard email support"], buttonText: "Get started today", popular: false },
    { name: "Scale", desc: "Best for mid-sized businesses looking to accelerate their growth.", priceMonthly: "999", priceAnnually: "799", features: ["All Growth features", "Multi-channel ad management", "Advanced SEO strategy", "Creative A/B testing", "Priority Slack support", "Weekly performance updates"], buttonText: "Choose Scale Plan", popular: true },
    { name: "Enterprise", desc: "Custom solutions for large corporations with complex marketing needs.", priceMonthly: "Custom", priceAnnually: "Custom", features: ["All Scale features", "Dedicated Account Manager", "Custom analytics & reporting dashboard", "24/7 Phone & email support", "Quarterly strategy consulting"], buttonText: "Contact Sales", popular: false },
  ],
  blogSection: {
    badge: "Blog & Insights",
    heading: "Expert Marketing Ideas To Fuel Your Growth",
    buttonText: "Read All Articles",
  },
  ctaSection: {
    heading: "Ready to grow your website ?",
    description: "Bring affiliate partnerships, search, campaigns, and reporting into one practical operating system for measurable growth.",
    buttonText: "Book a Schedule",
    linkText: "Explore Services",
  },
};

function Section({ title, defaultOpen, children }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 hover:bg-gray-100 transition text-left">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

function ArrayField({ label, items, onChange, renderItem, onAdd, addLabel }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
        {onAdd && (
          <button type="button" onClick={onAdd}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
            <Plus className="h-3.5 w-3.5" /> {addLabel || "Add"}
          </button>
        )}
      </div>
      {items.map((item, i) => (
        <div key={i} className="relative rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">{label} {i + 1}</span>
            {items.length > 1 && (
              <button type="button" onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="rounded p-0.5 text-gray-300 hover:text-red-500 transition">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {renderItem(item, i, (updated) => {
            const next = [...items];
            next[i] = updated;
            onChange(next);
          })}
        </div>
      ))}
    </div>
  );
}

export default function EditHomeModal({ existingData, onClose, onSaved, inline }) {
  const [form, setForm] = useState(INITIAL);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingData) {
      const merged = deepMerge(INITIAL, existingData);
      setForm(merged);
    }
  }, [existingData]);

  const update = (path, value) => {
    setForm((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await setDoc(doc(db, COLLECTION, DOC_ID), {
        ...form,
        updatedAt: serverTimestamp(),
      });
      emitAlert({ type: "success", message: "Home page updated" });
      onSaved?.();
      onClose?.();
    } catch {
      emitAlert({ type: "error", message: "Failed to update home page" });
    } finally {
      setSubmitting(false);
    }
  };

  if (inline) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Home Page</h2>
          <button type="button" onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <Section title="Hero Section">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Headline Lines</label>
              {form.hero.headline.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={line} onChange={(e) => {
                    const next = [...form.hero.headline];
                    next[i] = e.target.value;
                    update("hero.headline", next);
                  }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <input type="radio" name="highlight" checked={form.hero.highlightIndex === i}
                      onChange={() => update("hero.highlightIndex", i)} className="h-3.5 w-3.5" />
                    Highlight
                  </label>
                  <button type="button" onClick={() => {
                    const next = form.hero.headline.filter((_, idx) => idx !== i);
                    update("hero.headline", next.length ? next : [""]);
                  }}
                    className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {form.hero.headline.length < 5 && (
                <button type="button" onClick={() => update("hero.headline", [...form.hero.headline, ""])}
                  className="text-xs text-blue-600 font-medium">+ Add line</button>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
              <textarea value={form.hero.subtitle} onChange={(e) => update("hero.subtitle", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Button Text</label>
                <input value={form.hero.ctaText} onChange={(e) => update("hero.ctaText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Explore Button Text</label>
                <input value={form.hero.exploreText} onChange={(e) => update("hero.exploreText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Score</label>
                <input value={form.hero.rating.score} onChange={(e) => update("hero.rating.score", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Label</label>
                <input value={form.hero.rating.label} onChange={(e) => update("hero.rating.label", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
            <ImageUpload value={form.hero.bgImage} onChange={(v) => update("hero.bgImage", v)} label="Background Image" folder="marketys/home" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Video URL (.mov)</label>
                <input value={form.hero.videoMov} onChange={(e) => update("hero.videoMov", e.target.value)}
                  placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Video URL (.webm/.mp4)</label>
                <input value={form.hero.videoWebm} onChange={(e) => update("hero.videoWebm", e.target.value)}
                  placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          {/* Hero Stats */}
          <Section title="Hero Stats" defaultOpen={false}>
            <ArrayField
              label="Stat"
              items={form.stats}
              onChange={(v) => update("stats", v)}
              renderItem={(item, i, onChange) => (
                <div className="grid grid-cols-3 gap-2">
                  <input value={item.value} onChange={(e) => onChange({ ...item, value: e.target.value })}
                    placeholder="Value (48)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={item.suffix} onChange={(e) => onChange({ ...item, suffix: e.target.value })}
                    placeholder="Suffix (%)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })}
                    placeholder="Label" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              )}
              onAdd={() => update("stats", [...form.stats, { value: "", suffix: "", label: "" }])}
              addLabel="Add Stat"
            />
          </Section>

          {/* Partners */}
          <Section title="Partner Logos" defaultOpen={false}>
            <ArrayField
              label="Partner"
              items={form.partners}
              onChange={(v) => update("partners", v)}
              renderItem={(item, i, onChange) => (
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })}
                    placeholder="Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <ImageUpload value={item.logo} onChange={(v) => onChange({ ...item, logo: v })} label="Logo" folder="marketys/partners" />
                </div>
              )}
              onAdd={() => update("partners", [...form.partners, { name: "", logo: "" }])}
              addLabel="Add Partner"
            />
          </Section>

          {/* Features */}
          <Section title="Service Features (3 sections)" defaultOpen={false}>
            <ArrayField
              label="Feature Section"
              items={form.features}
              onChange={(v) => update("features", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.subtitle} onChange={(e) => onChange({ ...item, subtitle: e.target.value })}
                      placeholder="Subtitle" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.heading} onChange={(e) => onChange({ ...item, heading: e.target.value })}
                      placeholder="Heading" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <textarea value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stats</p>
                    <div className="space-y-1">
                      {item.stats.map((s, si) => (
                        <div key={si} className="flex gap-2">
                          <input value={s.val} onChange={(e) => {
                            const ns = [...item.stats]; ns[si] = { ...ns[si], val: e.target.value }; onChange({ ...item, stats: ns });
                          }} placeholder="Value" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                          <input value={s.label} onChange={(e) => {
                            const ns = [...item.stats]; ns[si] = { ...ns[si], label: e.target.value }; onChange({ ...item, stats: ns });
                          }} placeholder="Label" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Bullets</p>
                    {item.features.map((f, fi) => (
                      <input key={fi} value={f} onChange={(e) => {
                        const nf = [...item.features]; nf[fi] = e.target.value; onChange({ ...item, features: nf });
                      }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none mb-1" />
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Images</p>
                    {item.images.map((img, ii) => (
                      <div key={ii} className="mb-2">
                        <ImageUpload value={img} onChange={(v) => {
                          const ni = [...item.images]; ni[ii] = v; onChange({ ...item, images: ni });
                        }} label={`Image ${ii + 1}`} folder="marketys/features" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          </Section>

          {/* Process */}
          <Section title="Process Steps" defaultOpen={false}>
            <ArrayField
              label="Step"
              items={form.process}
              onChange={(v) => update("process", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
                    placeholder="Title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <ImageUpload value={item.img} onChange={(v) => onChange({ ...item, img: v })} label="Image" folder="marketys/process" />
                </div>
              )}
              onAdd={() => update("process", [...form.process, { title: "", desc: "", img: "" }])}
              addLabel="Add Step"
            />
          </Section>

          {/* Testimonials */}
          <Section title="Testimonials" defaultOpen={false}>
            <ArrayField
              label="Testimonial"
              items={form.testimonials}
              onChange={(v) => update("testimonials", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <textarea value={item.quote} onChange={(e) => onChange({ ...item, quote: e.target.value })}
                    placeholder="Quote" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={item.author} onChange={(e) => onChange({ ...item, author: e.target.value })}
                      placeholder="Author" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.role} onChange={(e) => onChange({ ...item, role: e.target.value })}
                      placeholder="Role" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <ImageUpload value={item.image} onChange={(v) => onChange({ ...item, image: v })} label="Photo" folder="marketys/testimonials" />
                  </div>
                </div>
              )}
              onAdd={() => update("testimonials", [...form.testimonials, { quote: "", author: "", role: "", image: "" }])}
              addLabel="Add Testimonial"
            />
          </Section>

          {/* Pricing */}
          <Section title="Pricing Plans" defaultOpen={false}>
            <ArrayField
              label="Plan"
              items={form.pricing}
              onChange={(v) => update("pricing", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })}
                      placeholder="Plan name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={item.popular} onChange={(e) => onChange({ ...item, popular: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      Popular
                    </label>
                  </div>
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={item.priceMonthly} onChange={(e) => onChange({ ...item, priceMonthly: e.target.value })}
                      placeholder="Monthly price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.priceAnnually} onChange={(e) => onChange({ ...item, priceAnnually: e.target.value })}
                      placeholder="Annual price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.buttonText} onChange={(e) => onChange({ ...item, buttonText: e.target.value })}
                      placeholder="Button text" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Features</p>
                    {item.features.map((f, fi) => (
                      <input key={fi} value={f} onChange={(e) => {
                        const nf = [...item.features]; nf[fi] = e.target.value; onChange({ ...item, features: nf });
                      }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none mb-1" />
                    ))}
                    <button type="button" onClick={() => onChange({ ...item, features: [...item.features, ""] })}
                      className="text-xs text-blue-600 font-medium">+ Add feature</button>
                  </div>
                </div>
              )}
            />
          </Section>

          {/* Blog Section */}
          <Section title="Blog Section Heading" defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                <input value={form.blogSection.badge} onChange={(e) => update("blogSection.badge", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                <input value={form.blogSection.heading} onChange={(e) => update("blogSection.heading", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
                <input value={form.blogSection.buttonText} onChange={(e) => update("blogSection.buttonText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          {/* CTA Section */}
          <Section title="Bottom CTA Section" defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                <input value={form.ctaSection.heading} onChange={(e) => update("ctaSection.heading", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.ctaSection.description} onChange={(e) => update("ctaSection.description", e.target.value)} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={form.ctaSection.buttonText} onChange={(e) => update("ctaSection.buttonText", e.target.value)}
                  placeholder="Button text" className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
                <input value={form.ctaSection.linkText} onChange={(e) => update("ctaSection.linkText", e.target.value)}
                  placeholder="Link text" className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Home Page
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Edit Home Page</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <Section title="Hero Section">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Headline Lines</label>
              {form.hero.headline.map((line, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={line} onChange={(e) => {
                    const next = [...form.hero.headline];
                    next[i] = e.target.value;
                    update("hero.headline", next);
                  }}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                  <label className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
                    <input type="radio" name="highlight" checked={form.hero.highlightIndex === i}
                      onChange={() => update("hero.highlightIndex", i)} className="h-3.5 w-3.5" />
                    Highlight
                  </label>
                  <button type="button" onClick={() => {
                    const next = form.hero.headline.filter((_, idx) => idx !== i);
                    update("hero.headline", next.length ? next : [""]);
                  }}
                    className="rounded p-1 text-gray-300 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
              {form.hero.headline.length < 5 && (
                <button type="button" onClick={() => update("hero.headline", [...form.hero.headline, ""])}
                  className="text-xs text-blue-600 font-medium">+ Add line</button>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
              <textarea value={form.hero.subtitle} onChange={(e) => update("hero.subtitle", e.target.value)} rows={2}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CTA Button Text</label>
                <input value={form.hero.ctaText} onChange={(e) => update("hero.ctaText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Explore Button Text</label>
                <input value={form.hero.exploreText} onChange={(e) => update("hero.exploreText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Score</label>
                <input value={form.hero.rating.score} onChange={(e) => update("hero.rating.score", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Rating Label</label>
                <input value={form.hero.rating.label} onChange={(e) => update("hero.rating.label", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
            <ImageUpload value={form.hero.bgImage} onChange={(v) => update("hero.bgImage", v)} label="Background Image" folder="marketys/home" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Video URL (.mov)</label>
                <input value={form.hero.videoMov} onChange={(e) => update("hero.videoMov", e.target.value)}
                  placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Hero Video URL (.webm/.mp4)</label>
                <input value={form.hero.videoWebm} onChange={(e) => update("hero.videoWebm", e.target.value)}
                  placeholder="https://..." className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          <Section title="Hero Stats" defaultOpen={false}>
            <ArrayField
              label="Stat"
              items={form.stats}
              onChange={(v) => update("stats", v)}
              renderItem={(item, i, onChange) => (
                <div className="grid grid-cols-3 gap-2">
                  <input value={item.value} onChange={(e) => onChange({ ...item, value: e.target.value })}
                    placeholder="Value (48)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={item.suffix} onChange={(e) => onChange({ ...item, suffix: e.target.value })}
                    placeholder="Suffix (%)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <input value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })}
                    placeholder="Label" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                </div>
              )}
              onAdd={() => update("stats", [...form.stats, { value: "", suffix: "", label: "" }])}
              addLabel="Add Stat"
            />
          </Section>

          <Section title="Partner Logos" defaultOpen={false}>
            <ArrayField
              label="Partner"
              items={form.partners}
              onChange={(v) => update("partners", v)}
              renderItem={(item, i, onChange) => (
                <div className="grid grid-cols-2 gap-2">
                  <input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })}
                    placeholder="Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <ImageUpload value={item.logo} onChange={(v) => onChange({ ...item, logo: v })} label="Logo" folder="marketys/partners" />
                </div>
              )}
              onAdd={() => update("partners", [...form.partners, { name: "", logo: "" }])}
              addLabel="Add Partner"
            />
          </Section>

          <Section title="Service Features (3 sections)" defaultOpen={false}>
            <ArrayField
              label="Feature Section"
              items={form.features}
              onChange={(v) => update("features", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.subtitle} onChange={(e) => onChange({ ...item, subtitle: e.target.value })}
                      placeholder="Subtitle" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.heading} onChange={(e) => onChange({ ...item, heading: e.target.value })}
                      placeholder="Heading" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <textarea value={item.description} onChange={(e) => onChange({ ...item, description: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Stats</p>
                    <div className="space-y-1">
                      {item.stats.map((s, si) => (
                        <div key={si} className="flex gap-2">
                          <input value={s.val} onChange={(e) => {
                            const ns = [...item.stats]; ns[si] = { ...ns[si], val: e.target.value }; onChange({ ...item, stats: ns });
                          }} placeholder="Value" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                          <input value={s.label} onChange={(e) => {
                            const ns = [...item.stats]; ns[si] = { ...ns[si], label: e.target.value }; onChange({ ...item, stats: ns });
                          }} placeholder="Label" className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Feature Bullets</p>
                    {item.features.map((f, fi) => (
                      <input key={fi} value={f} onChange={(e) => {
                        const nf = [...item.features]; nf[fi] = e.target.value; onChange({ ...item, features: nf });
                      }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none mb-1" />
                    ))}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Images</p>
                    {item.images.map((img, ii) => (
                      <div key={ii} className="mb-2">
                        <ImageUpload value={img} onChange={(v) => {
                          const ni = [...item.images]; ni[ii] = v; onChange({ ...item, images: ni });
                        }} label={`Image ${ii + 1}`} folder="marketys/features" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          </Section>

          <Section title="Process Steps" defaultOpen={false}>
            <ArrayField
              label="Step"
              items={form.process}
              onChange={(v) => update("process", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <input value={item.title} onChange={(e) => onChange({ ...item, title: e.target.value })}
                    placeholder="Title" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <ImageUpload value={item.img} onChange={(v) => onChange({ ...item, img: v })} label="Image" folder="marketys/process" />
                </div>
              )}
              onAdd={() => update("process", [...form.process, { title: "", desc: "", img: "" }])}
              addLabel="Add Step"
            />
          </Section>

          <Section title="Testimonials" defaultOpen={false}>
            <ArrayField
              label="Testimonial"
              items={form.testimonials}
              onChange={(v) => update("testimonials", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <textarea value={item.quote} onChange={(e) => onChange({ ...item, quote: e.target.value })}
                    placeholder="Quote" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={item.author} onChange={(e) => onChange({ ...item, author: e.target.value })}
                      placeholder="Author" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.role} onChange={(e) => onChange({ ...item, role: e.target.value })}
                      placeholder="Role" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <ImageUpload value={item.image} onChange={(v) => onChange({ ...item, image: v })} label="Photo" folder="marketys/testimonials" />
                  </div>
                </div>
              )}
              onAdd={() => update("testimonials", [...form.testimonials, { quote: "", author: "", role: "", image: "" }])}
              addLabel="Add Testimonial"
            />
          </Section>

          <Section title="Pricing Plans" defaultOpen={false}>
            <ArrayField
              label="Plan"
              items={form.pricing}
              onChange={(v) => update("pricing", v)}
              renderItem={(item, i, onChange) => (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={item.name} onChange={(e) => onChange({ ...item, name: e.target.value })}
                      placeholder="Plan name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="checkbox" checked={item.popular} onChange={(e) => onChange({ ...item, popular: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                      Popular
                    </label>
                  </div>
                  <textarea value={item.desc} onChange={(e) => onChange({ ...item, desc: e.target.value })}
                    placeholder="Description" rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={item.priceMonthly} onChange={(e) => onChange({ ...item, priceMonthly: e.target.value })}
                      placeholder="Monthly price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.priceAnnually} onChange={(e) => onChange({ ...item, priceAnnually: e.target.value })}
                      placeholder="Annual price" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                    <input value={item.buttonText} onChange={(e) => onChange({ ...item, buttonText: e.target.value })}
                      placeholder="Button text" className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Features</p>
                    {item.features.map((f, fi) => (
                      <input key={fi} value={f} onChange={(e) => {
                        const nf = [...item.features]; nf[fi] = e.target.value; onChange({ ...item, features: nf });
                      }} className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs outline-none mb-1" />
                    ))}
                    <button type="button" onClick={() => onChange({ ...item, features: [...item.features, ""] })}
                      className="text-xs text-blue-600 font-medium">+ Add feature</button>
                  </div>
                </div>
              )}
            />
          </Section>

          <Section title="Blog Section Heading" defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Badge</label>
                <input value={form.blogSection.badge} onChange={(e) => update("blogSection.badge", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                <input value={form.blogSection.heading} onChange={(e) => update("blogSection.heading", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Button Text</label>
                <input value={form.blogSection.buttonText} onChange={(e) => update("blogSection.buttonText", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          <Section title="Bottom CTA Section" defaultOpen={false}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                <input value={form.ctaSection.heading} onChange={(e) => update("ctaSection.heading", e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea value={form.ctaSection.description} onChange={(e) => update("ctaSection.description", e.target.value)} rows={2}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input value={form.ctaSection.buttonText} onChange={(e) => update("ctaSection.buttonText", e.target.value)}
                  placeholder="Button text" className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
                <input value={form.ctaSection.linkText} onChange={(e) => update("ctaSection.linkText", e.target.value)}
                  placeholder="Link text" className="rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none" />
              </div>
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Home Page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
