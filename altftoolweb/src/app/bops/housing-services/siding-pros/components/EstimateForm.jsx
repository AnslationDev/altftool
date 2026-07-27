import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Award, CalendarCheck, CheckCircle2, Clock, Home, Mail, MessageSquare, Phone, Shield, User, Wrench, X } from "lucide-react";

const CONTACT_URL = "/policypages/contact";

const initial = { name: "", phone: "", email: "", propertyType: "", service: "", message: "" };

export default function EstimateForm() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [callBooked, setCallBooked] = useState(false);
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setLiveTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[\d\s()+-]{10,}$/.test(form.phone)) e.phone = "Enter a valid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
    if (!form.propertyType) e.propertyType = "Select a property type";
    if (!form.service) e.service = "Select a service";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setShowCallPopup(true);
      setCallBooked(false);
    }, 1200);
  };

  const update = (k) => (v) => setForm({ ...form, [k]: v });

  return (
    <section id="contact" className="pt-12 pb-12 lg:pt-16 lg:pb-16 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[40rem] h-[40rem] bg-[#00AEEF]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-5 lg:px-8 grid lg:grid-cols-12 gap-10 items-center">
        {/* Left text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00AEEF]/10 text-[#0D3B66] text-xs font-bold tracking-wider uppercase mb-4">
            Free Estimate
          </div>
          <h2 className="font-display font-extrabold text-4xl lg:text-5xl text-[#0D3B66] leading-tight">
            Get a Custom Quote in Under 60 Seconds
          </h2>
          <p className="mt-5 text-lg text-slate-600 leading-relaxed">
            Tell us about your project and a senior design specialist will reach out within
            one business day with samples, pricing, and a flexible install schedule.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              { icon: Shield, t: "No-pressure, no-obligation estimate" },
              { icon: Clock, t: "Response within 1 business day" },
              { icon: Award, t: "Lifetime craftsmanship warranty included" },
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00AEEF]/10 text-[#0D3B66] flex items-center justify-center flex-shrink-0">
                  <b.icon className="w-5 h-5" />
                </div>
                <span className="text-slate-700 font-medium pt-2">{b.t}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="lg:col-span-7"
        >
          <div className="relative rounded-3xl bg-white border border-slate-100 shadow-premium p-7 lg:p-10">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="mt-6 font-display font-extrabold text-2xl text-[#0D3B66]">Thank you, {form.name.split(" ")[0]}!</h3>
                <p className="mt-3 text-slate-600 max-w-md mx-auto">
                  Your request has been received. A design specialist will be in touch within one business day at
                  <span className="font-semibold text-[#0D3B66]"> {form.email}</span>.
                </p>
                <button
                  onClick={() => { setForm(initial); setSubmitted(false); setShowCallPopup(false); setCallBooked(false); }}
                  className="mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 text-[#0D3B66] font-semibold hover:bg-slate-50"
                >
                  Submit another request
                </button>
              </motion.div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <Field icon={User}  label="Full Name"    placeholder="Jane Doe"            value={form.name}  error={errors.name}  onChange={update("name")} />
                  <Field icon={Phone} label="Phone Number" placeholder="(555) 123-4567"      value={form.phone} error={errors.phone} onChange={update("phone")} type="tel" />
                </div>
                <Field icon={Mail} label="Email Address" placeholder="jane@example.com" value={form.email} error={errors.email} onChange={update("email")} type="email" />

                <div className="grid sm:grid-cols-2 gap-5">
                  <SelectField icon={Home}   label="Property Type"  value={form.propertyType} error={errors.propertyType} onChange={update("propertyType")}
                    options={["Single-Family Home", "Townhouse / Condo", "Multi-Family", "Commercial Property"]} />
                  <SelectField icon={Wrench} label="Service Needed" value={form.service}      error={errors.service}      onChange={update("service")}
                    options={["Vinyl Siding", "Fiber Cement", "Wood Siding", "Composite Siding", "Insulated Siding", "Commercial Siding", "Repair / Inspection"]} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0D3B66] mb-2">Project Details (optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute top-3.5 left-3.5 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={4}
                      value={form.message}
                      onChange={(e) => update("message")(e.target.value)}
                      placeholder="Tell us about your home, timeline, or anything else…"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20 outline-none transition resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#0D3B66] to-[#1E5AA8] text-white font-semibold shadow-premium hover:shadow-glow hover:scale-[1.01] transition-all disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Request My Free Estimate
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-xs text-center text-slate-500">
                  By submitting, you agree to be contacted by EliteShield. We respect your privacy and never share your data.
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCallPopup && (
          <CallPopup
            name={form.name}
            phone={form.phone}
            service={form.service}
            liveTime={liveTime}
            callBooked={callBooked}
            onBook={() => setCallBooked(true)}
            onClose={() => setShowCallPopup(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function CallPopup({
  name, phone, service, liveTime, callBooked, onBook, onClose,
}) {
  const firstName = name.trim().split(" ")[0] || "there";
  const displayTime = liveTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const callbackWindow = new Date(liveTime.getTime() + 15 * 60 * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.div
      data-siding-call-popup
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-[#0D3B66]/70 backdrop-blur-md flex items-center justify-center p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="call-popup-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-premium overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 border border-slate-100 text-[#0D3B66] flex items-center justify-center hover:bg-slate-50 transition"
          aria-label="Close call popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative p-7 lg:p-8 bg-gradient-to-br from-[#0D3B66] via-[#1E5AA8] to-[#00AEEF] text-white overflow-hidden">
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-white/15 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-[#00AEEF]/25 blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur text-xs font-bold tracking-wider uppercase mb-4">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300" />
              </span>
              Live Call Desk Online
            </div>
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-5 shadow-glow">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 id="call-popup-title" className="font-display font-extrabold text-2xl lg:text-3xl leading-tight">
              {callBooked ? "Callback Request Confirmed" : `Thanks, ${firstName}! Want a Faster Call?`}
            </h3>
            <p className="mt-3 text-white/85 leading-relaxed">
              {callBooked
                ? `Our estimate team will call ${phone} by ${callbackWindow}. Keep your phone nearby.`
                : "Your form is submitted. You can call now or request a priority callback from our siding specialist."}
            </p>
          </div>
        </div>

        <div className="p-7 lg:p-8">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
              <div className="text-xs font-bold tracking-wider uppercase text-slate-400">Current Time</div>
              <div className="mt-1 font-display font-extrabold text-xl text-[#0D3B66]">{displayTime}</div>
            </div>
            <div className="rounded-2xl bg-[#F8FAFC] border border-slate-100 p-4">
              <div className="text-xs font-bold tracking-wider uppercase text-slate-400">Requested Service</div>
              <div className="mt-1 font-semibold text-[#0D3B66] truncate">{service}</div>
            </div>
          </div>

          {callBooked ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center"
            >
              <CalendarCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <div className="mt-3 font-display font-bold text-lg text-emerald-800">Priority callback is active</div>
              <p className="mt-1 text-sm text-emerald-700">
                A specialist will call you at <span className="font-bold">{phone}</span> within the next 15 minutes.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <a
                href={CONTACT_URL}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-gradient-to-r from-[#0D3B66] to-[#1E5AA8] text-white font-bold shadow-premium hover:shadow-glow hover:scale-[1.02] transition-all"
              >
                <MessageSquare className="w-5 h-5" />
                Contact us
              </a>
              <button
                onClick={onBook}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full border-2 border-[#0D3B66] text-[#0D3B66] font-bold hover:bg-[#0D3B66] hover:text-white transition-all"
              >
                <CalendarCheck className="w-5 h-5" />
                Request Callback in 15 Minutes
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-5 w-full text-sm font-semibold text-slate-500 hover:text-[#0D3B66] transition"
          >
            Continue browsing website
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  icon: Icon, label, value, error, onChange, placeholder, type = "text",
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0D3B66] mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute top-1/2 -translate-y-1/2 left-3.5 w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition ${
            error
              ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              : "border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20"
          }`}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

function SelectField({
  icon: Icon, label, value, error, onChange, options,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-[#0D3B66] mb-2">{label}</label>
      <div className="relative">
        <Icon className="absolute top-1/2 -translate-y-1/2 left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition appearance-none bg-white ${
            error
              ? "border-rose-300 focus:border-rose-500"
              : "border-slate-200 focus:border-[#00AEEF] focus:ring-2 focus:ring-[#00AEEF]/20"
          } ${value ? "text-slate-900" : "text-slate-400"}`}
        >
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o} value={o} className="text-slate-900">{o}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
