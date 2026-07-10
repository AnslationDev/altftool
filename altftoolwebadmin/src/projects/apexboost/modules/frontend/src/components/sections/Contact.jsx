import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { Mail, Phone, MapPin, Clock, Send, Loader2, CalendarCheck } from "lucide-react";
import Container from "../ui/Container";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";

const requirements = ["Digital Marketing", "Affiliate Marketing", "Advertising Marketing", "All of the above"];

const info = [
  { icon: Mail, label: "Email us", value: "hello@apexboost.com" },
  { icon: Phone, label: "Call us", value: "+1 (555) 123-4567" },
  { icon: MapPin, label: "Visit us", value: "24 Growth Avenue, New York" },
  { icon: Clock, label: "Business hours", value: "Mon–Sat · 9AM–8PM" },
];

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-danger">{error.message}</span>}
    </label>
  );
}

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({ defaultValues: { requirement: requirements[0] } });

  const onSubmit = async (data) => {
    try { await axios.post("https://api.apexboost.com/leads", data, { timeout: 1500 }); } catch { /* illustrative */ }
    toast.success("🚀 Thanks! Our growth team will contact you within 24 hours.");
    reset({ requirement: requirements[0] });
  };

  return (
    <section id="contact" className="sec">
      <Container>
        <SectionHeading eyebrow="Contact" title="Let's build your" highlight="growth engine" subtitle="Book a free consultation and get a custom Digital, Affiliate & Advertising roadmap for your brand." />
        <div className="mt-14 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl bg-gradient-to-br from-brand to-brand-purple p-8 text-white">
              <h3 className="text-2xl font-bold text-white">Get in touch</h3>
              <p className="mt-2 text-sm text-white/80">Reach out through any channel — we typically reply within a few hours.</p>
              <div className="mt-8 space-y-5">
                {info.map((it) => (
                  <div key={it.label} className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15"><it.icon size={18} /></div>
                    <div><div className="text-xs text-white/70">{it.label}</div><div className="text-sm font-semibold">{it.value}</div></div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <div className="relative grid h-40 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-white/10">
                  <div className="absolute inset-0 bg-g opacity-30" />
                  <MapPin size={28} className="relative text-white" />
                  <span className="relative mt-2 text-xs font-medium text-white/80">New York · London · Singapore</span>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full Name" error={errors.name}>
                  <input className={`fld ${errors.name ? "fld-err" : ""}`} placeholder="John Carter" {...register("name", { required: "Name is required" })} />
                </Field>
                <Field label="Email Address" error={errors.email}>
                  <input type="email" className={`fld ${errors.email ? "fld-err" : ""}`} placeholder="john@company.com" {...register("email", { required: "Email is required", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" } })} />
                </Field>
                <Field label="Phone Number"><input className="fld" placeholder="+1 (555) 000-0000" {...register("phone")} /></Field>
                <Field label="Business Name"><input className="fld" placeholder="Acme Inc." {...register("business")} /></Field>
              </div>
              <div className="mt-5">
                <Field label="Marketing Requirement">
                  <select className="fld" {...register("requirement")}>{requirements.map((r) => <option key={r} value={r}>{r}</option>)}</select>
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Message" error={errors.message}>
                  <textarea rows={4} className={`fld resize-none ${errors.message ? "fld-err" : ""}`} placeholder="Tell us about your goals…" {...register("message", { required: "Please add a short message" })} />
                </Field>
              </div>
              <button type="submit" disabled={isSubmitting} className="btn btn-p mt-6 w-full disabled:opacity-70">
                {isSubmitting ? (<><Loader2 size={16} className="animate-spin" /> Sending…</>) : (<><CalendarCheck size={16} /> Book Free Consultation <Send size={15} /></>)}
              </button>
              <p className="mt-4 text-center text-xs text-slate-400">By submitting you agree to our privacy policy. We'll never spam you.</p>
            </form>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
