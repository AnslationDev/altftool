import { useState } from "react";
import clsx from "clsx";
import Icon from "../components/Icons.jsx";
import PageHero from "../components/PageHero.jsx";
import {
  Container,
  Reveal,
  SectionHeading,
  Eyebrow,
} from "../components/ui.jsx";
import { company, services, faqs } from "../data/site.js";

const contactCards = [
  {
    icon: "mapPin",
    label: "Visit our studio",
    value: company.address,
    href: "https://maps.google.com/?q=Mumbai",
  },
  {
    icon: "phone",
    label: "Call us",
    value: company.phone,
    href: `tel:${company.phoneHref}`,
  },
  {
    icon: "mail",
    label: "Email us",
    value: company.email,
    href: `mailto:${company.email}`,
  },
  {
    icon: "clock",
    label: "Working hours",
    value: company.hours,
    href: null,
  },
];

function FaqItem({ faq, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left"
      >
        <span className="font-display text-lg font-semibold text-ink">{faq.q}</span>
        <span
          className={clsx(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bronze-100 text-bronze-700 transition-transform duration-300",
            open && "rotate-45 bg-bronze-600 text-white"
          )}
        >
          <Icon name="plus" className="h-4 w-4" strokeWidth={2} />
        </span>
      </button>
      <div
        className={clsx(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 leading-relaxed text-stone-600">{faq.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [showCallPopup, setShowCallPopup] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: services[0].title,
    message: "",
  });

  const update = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setShowCallPopup(true);
  };

  const inputCls =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-ink placeholder:text-stone-400 transition-colors focus:border-bronze-500 focus:outline-none focus:ring-2 focus:ring-bronze-500/30";

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Let's talk about your project"
        description="Tell us about your space and goals — we'll get back within one business day with next steps."
        image={8082306}
        current="Contact"
      />

      {/* CONTACT CARDS */}
      <Container className="relative z-20 -mt-10">
        <Reveal className="grid gap-5 rounded-3xl border border-stone-200 bg-white p-6 shadow-lg shadow-ink/5 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((c) => {
            const inner = (
              <>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-bronze-100 text-bronze-700 transition-colors group-hover:bg-bronze-600 group-hover:text-white">
                  <Icon name={c.icon} className="h-6 w-6" />
                </span>
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-bronze-600">
                    {c.label}
                  </div>
                  <div className="mt-1 text-sm font-medium text-stone-700">
                    {c.value}
                  </div>
                </div>
              </>
            );
            return c.href ? (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="group block rounded-2xl border border-stone-100 p-5 transition-all hover:border-bronze-200 hover:bg-cream-50"
              >
                {inner}
              </a>
            ) : (
              <div
                key={c.label}
                className="group rounded-2xl border border-stone-100 p-5"
              >
                {inner}
              </div>
            );
          })}
        </Reveal>
      </Container>

      {/* FORM */}
      <section
        className="py-24 sm:py-28 bg-cover bg-center relative"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?auto=format&fit=crop&w=1800&q=82')",
        }}
      >
        <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" />
        <Container className="relative max-w-[600px]">
          {/* Form */}
          <Reveal>
            <div className="rounded-[2rem] border border-stone-200 bg-white p-7 shadow-lg shadow-ink/5 sm:p-10">
              {submitted ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze-100 text-bronze-700">
                    <Icon name="check" className="h-8 w-8" strokeWidth={2.4} />
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-semibold text-ink">
                    Thank you, {form.name || "friend"}!
                  </h3>
                  <p className="mt-3 max-w-sm text-stone-600">
                    Your enquiry has been received. One of our designers will
                    reach out within one business day.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({
                        name: "",
                        email: "",
                        phone: "",
                        service: services[0].title,
                        message: "",
                      });
                    }}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-bronze-500 hover:text-bronze-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <Eyebrow>Send a message</Eyebrow>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
                    Request your free quote
                  </h2>
                  <p className="mt-3 text-stone-600">
                    Fill in the details below and we'll be in touch shortly.
                  </p>
                  <form onSubmit={handleSubmit} className="mt-7 grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">
                        Full name
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={update}
                        required
                        placeholder="Aarav Patel"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">
                        Phone
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={update}
                        required
                        placeholder="+91 90000 00000"
                        className={inputCls}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={update}
                        required
                        placeholder="you@email.com"
                        className={inputCls}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">
                        Service required
                      </label>
                      <select
                        name="service"
                        value={form.service}
                        onChange={update}
                        className={inputCls}
                      >
                        {services.map((s) => (
                          <option key={s.title} value={s.title}>
                            {s.title}
                          </option>
                        ))}
                        <option value="Other">Other / Not sure</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-stone-700">
                        Project details
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={update}
                        rows={4}
                        placeholder="Tell us about your windows, space and timeline…"
                        className={inputCls + " resize-none"}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <button
                        type="submit"
                        className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-bronze-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-bronze-700/20 transition-all hover:-translate-y-0.5 hover:bg-bronze-700 hover:shadow-xl sm:w-auto"
                      >
                        Send Enquiry
                        <Icon name="send" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </Reveal>


        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-cream-100 py-24 sm:py-32">
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="Questions, answered"
              description="Everything you need to know before getting started. Still curious? Just drop us a line."
            />
            <a
              href="mailto:hello@luminawindows.in"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-bronze-700 hover:text-bronze-800"
            >
              <Icon name="mail" className="h-4 w-4" />
              Ask a question
            </a>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={(i % 3) * 60}>
                <FaqItem
                  faq={faq}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* CALLING POPUP */}
      {showCallPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]"
          onClick={() => setShowCallPopup(false)}
          style={{ animation: "fadeIn 0.3s ease-out" }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes popupIn {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes ringPulse {
              0%, 100% { box-shadow: 0 0 0 0 rgba(189,132,60,0.6), 0 0 0 0 rgba(189,132,60,0.4); }
              50% { box-shadow: 0 0 0 18px rgba(189,132,60,0), 0 0 0 32px rgba(189,132,60,0); }
            }
            @keyframes callRing {
              0%, 100% { transform: rotate(-10deg); }
              50% { transform: rotate(10deg); }
            }
          `}</style>
          <div
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl"
            style={{ animation: "popupIn 0.4s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCallPopup(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200 hover:text-stone-800"
              aria-label="Close"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>

            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bronze-100"
                 style={{ animation: "ringPulse 2s ease-in-out infinite" }}>
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full bg-bronze-600 text-white"
                style={{ animation: "callRing 0.8s ease-in-out infinite" }}
              >
                <Icon name="phone" className="h-8 w-8" />
              </span>
            </div>

            <h3 className="mt-6 font-display text-2xl font-semibold text-ink">
              Speak with us now?
            </h3>
            <p className="mt-3 text-stone-600">
              Thanks, {form.name || "friend"}! Your enquiry has been received.
              Our designer is ready to help you right away — give us a call for
              instant guidance.
            </p>

            <div className="mt-6 rounded-2xl bg-cream-100 p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Call us directly
              </div>
              <div className="mt-2 font-display text-2xl font-semibold text-bronze-700">
                {company.phone}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                href={`tel:${company.phoneHref}`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-bronze-600 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-bronze-700/20 transition-all hover:-translate-y-0.5 hover:bg-bronze-700"
              >
                <Icon name="phone" className="h-4 w-4" />
                Call Now
              </a>
              <button
                onClick={() => setShowCallPopup(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-bronze-500 hover:text-bronze-700"
              >
                I'll wait for your call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
