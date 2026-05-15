import { motion } from "framer-motion";
import { Building2, Check, Cookie, Mail, MousePointerClick } from "lucide-react";
import ProgressTracker from "./ProgressTracker";

const dataOptions = ["Name", "Email", "Phone", "Payment Info", "Usage Data", "Device Info", "IP Address", "Location"];
const cookieOptions = ["Essential", "Analytics", "Marketing", "Preferences"];
const analyticsOptions = ["Google Analytics", "Mixpanel", "Hotjar", "Meta Pixel", "Custom Analytics"];
const adsOptions = ["Google AdSense", "Facebook Ads", "Affiliate Marketing", "Sponsored Content"];
const thirdPartyOptions = ["Stripe", "PayPal", "Firebase", "AWS", "Cloudflare", "OpenAI API"];

function TextField({ label, icon: Icon, value, onChange, placeholder }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-black text-(--foreground)">
        <Icon className="h-4 w-4 shrink-0 text-blue-600" />
        {label}
      </span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="pp-input" />
    </label>
  );
}

function OptionGroup({ title, options, selected, onToggle }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background)/55 p-4">
      <div className="mb-3 text-sm font-black text-(--foreground)">{title}</div>
      <div className="flex min-w-0 flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button key={option} type="button" onClick={() => onToggle(option)} className={`pp-chip ${active ? "pp-chip-active" : ""}`}>
              {active && <Check className="h-3.5 w-3.5 text-teal-400" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function InputSection({ form, updateField, toggleList, readiness }) {
  return (
    <div className="pp-glass min-w-0 rounded-3xl p-4 sm:p-5 lg:p-6">
      <div className="mb-5 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-(--foreground)">Privacy Policy Details</h2>
          <p className="text-sm leading-6 text-(--muted-foreground)">Fill basic business details. Policy updates instantly.</p>
        </div>
        <span className="w-fit rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-600">
          Required fields
        </span>
      </div>

      <ProgressTracker readiness={readiness} />

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <TextField label="Website/App Name" icon={Building2} value={form.appName} onChange={(value) => updateField("appName", value)} placeholder="e.g., Amazon, Flipkart, MyApp" />
        <TextField label="Website URL" icon={MousePointerClick} value={form.websiteUrl} onChange={(value) => updateField("websiteUrl", value)} placeholder="https://example.com" />
        <TextField label="Company/Owner Name" icon={Building2} value={form.companyName} onChange={(value) => updateField("companyName", value)} placeholder="e.g., ABC Corp, John Doe" />
        <TextField label="Contact Email" icon={Mail} value={form.contactEmail} onChange={(value) => updateField("contactEmail", value)} placeholder="privacy@example.com" />
        
        {/* Business Type - Text input */}
        <label className="block min-w-0">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-black">
            <Building2 className="h-4 w-4 shrink-0 text-blue-600" />
            Business Type
          </span>
          <input 
            value={form.businessType} 
            onChange={(event) => updateField("businessType", event.target.value)} 
            placeholder="e.g., Ecommerce, SaaS, Mobile App, AI Tool, Blog, Startup, Website" 
            className="pp-input" 
          />
        </label>
        
        <TextField label="Country" icon={Building2} value={form.country} onChange={(value) => updateField("country", value)} placeholder="e.g., United States, India, United Kingdom" />
      </div>

      <div className="mt-4 grid min-w-0 gap-4">
        <OptionGroup title="Data Collected" options={dataOptions} selected={form.dataTypes} onToggle={(value) => toggleList("dataTypes", value)} />

        <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background)/55 p-4">
          <div className="mb-3 flex min-w-0 items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2 text-sm font-black">
              <Cookie className="h-4 w-4 shrink-0 text-blue-600" />
              Uses Cookies
            </div>
            <button
              type="button"
              onClick={() => updateField("cookies", !form.cookies)}
              className={`h-7 w-12 rounded-full p-1 transition ${form.cookies ? "bg-blue-500" : "bg-(--muted)"}`}
            >
              <span className={`block h-5 w-5 rounded-full bg-white transition ${form.cookies ? "translate-x-5" : ""}`} />
            </button>
          </div>
          {form.cookies && (
            <OptionGroup title="Cookie Types" options={cookieOptions} selected={form.cookieTypes} onToggle={(value) => toggleList("cookieTypes", value)} />
          )}
        </div>

        <OptionGroup title="Analytics" options={analyticsOptions} selected={form.analytics} onToggle={(value) => toggleList("analytics", value)} />
        <OptionGroup title="Ads / Monetization" options={adsOptions} selected={form.ads} onToggle={(value) => toggleList("ads", value)} />
        <OptionGroup title="Third-Party Services" options={thirdPartyOptions} selected={form.thirdParties} onToggle={(value) => toggleList("thirdParties", value)} />

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["gdpr", "GDPR-ready section"],
            ["ccpa", "CCPA-ready section"],
          ].map(([field, label]) => (
            <motion.button
              key={field}
              layout
              type="button"
              onClick={() => updateField(field, !form[field])}
              className={`rounded-2xl border p-4 text-left font-black transition ${
                form[field] ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-600" : "border-(--border) bg-(--background)/55 text-(--foreground)"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
