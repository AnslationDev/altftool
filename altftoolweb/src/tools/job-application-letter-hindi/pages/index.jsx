"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  EX_SERVICEMAN_EXTRA_YEARS,
  GENDERS,
  MAX_AGE_CEILING,
  MAX_SERVICE_YEARS,
  MIN_AGE_FLOOR,
  POST_TYPES,
  assessEligibility,
  buildHindiJobApplication,
  categoryById,
  computeExperience,
  formatHindiDate,
  formatHindiDuration,
  postTypeById,
  toDevanagariDigits,
} from "../lib";

const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const AREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  applicantName: "राहुल कुमार शर्मा",
  fatherName: "श्री रामनिवास शर्मा",
  applicantAddress: "ग्राम-रामपुर, पोस्ट-बिजनौर, जिला-बिजनौर, उत्तर प्रदेश 246701",
  phone: "9876543210",
  email: "rahul.sharma@example.com",
  genderId: "male",
  postTypeId: "government",
  addressee: "",
  organisationName: "जिला कार्यालय, बिजनौर",
  organisationAddress: "कलेक्ट्रेट परिसर, बिजनौर, उत्तर प्रदेश 246701",
  postName: "कनिष्ठ सहायक (Junior Assistant)",
  advertisementNumber: "12/2026",
  advertisementSource: "दैनिक जागरण",
  vacancyCount: "24",
  letterDate: "2026-07-28",
  cutoffDate: "2026-08-31",
  lastDate: "2026-09-15",
  dob: "1996-04-15",
  minAge: "21",
  maxAge: "30",
  categoryId: "obc",
  serviceYears: "0",
  experienceStart: "2021-03-01",
  experienceEnd: "2026-07-28",
  qualifications:
    "स्नातक (बी.ए.), चौधरी चरण सिंह विश्वविद्यालय, प्रथम श्रेणी\nCCC प्रमाण-पत्र, NIELIT\nहिंदी एवं अंग्रेज़ी टंकण गति 30/25 शब्द प्रति मिनट",
  experienceText: "वर्तमान में मैं एक निजी संस्था में कार्यालय सहायक के पद पर कार्यरत हूँ।",
  enclosures:
    "शैक्षणिक प्रमाण-पत्रों की स्वप्रमाणित प्रतियाँ\nअनुभव प्रमाण-पत्र\nजाति एवं निवास प्रमाण-पत्र\nनवीनतम पासपोर्ट आकार का फोटो",
  extraNote: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [useDevanagariDigits, setUseDevanagariDigits] = useState(true);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const category = categoryById(form.categoryId);
  const post = postTypeById(form.postTypeId);

  const eligibility = useMemo(
    () =>
      assessEligibility({
        dobISO: form.dob,
        cutoffDateISO: form.cutoffDate,
        minAge: Number(form.minAge),
        maxAge: Number(form.maxAge),
        categoryId: form.categoryId,
        serviceYears: Number(form.serviceYears),
        lastDateISO: form.lastDate,
        letterDateISO: form.letterDate,
      }),
    [
      form.dob,
      form.cutoffDate,
      form.minAge,
      form.maxAge,
      form.categoryId,
      form.serviceYears,
      form.lastDate,
      form.letterDate,
    ],
  );

  const experience = useMemo(
    () => computeExperience({ startISO: form.experienceStart, endISO: form.experienceEnd }),
    [form.experienceStart, form.experienceEnd],
  );

  const letter = useMemo(
    () =>
      buildHindiJobApplication({
        applicantName: form.applicantName,
        fatherName: form.fatherName,
        applicantAddress: form.applicantAddress,
        phone: form.phone,
        email: form.email,
        genderId: form.genderId,
        postTypeId: form.postTypeId,
        addressee: form.addressee,
        organisationName: form.organisationName,
        organisationAddress: form.organisationAddress,
        postName: form.postName,
        advertisementNumber: form.advertisementNumber,
        advertisementSource: form.advertisementSource,
        vacancyCount: Number(form.vacancyCount),
        cutoffDateISO: form.cutoffDate,
        letterDateISO: form.letterDate,
        qualifications: form.qualifications,
        experienceText: form.experienceText,
        experience,
        enclosures: form.enclosures,
        extraNote: form.extraNote,
        useDevanagariDigits,
        eligibility,
      }),
    [form, experience, useDevanagariDigits, eligibility],
  );

  const error = eligibility.error || experience?.error || letter.error || "";

  const copy = async (text, key) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setUseDevanagariDigits(true);
    setCopied("");
  };

  const num = (value) => (useDevanagariDigits ? toDevanagariDigits(value) : String(value));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          हिंदी पत्र प्रारूप
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          नौकरी हेतु आवेदन पत्र — Hindi Job Application Letter
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          पूरा औपचारिक पत्र — सेवा में, दिनांक, विषय, सविनय निवेदन, अतः, सधन्यवाद, भवदीय और संलग्न —
          साथ ही कट-ऑफ तिथि पर आपकी आयु, श्रेणी के अनुसार आयु-सीमा में छूट, और आवेदन की अंतिम तिथि
          तक बचे दिन।
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">पद और विज्ञापन</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="hj-post-type">
              संस्था का प्रकार
            </label>
            <select id="hj-post-type" className={INPUT} value={form.postTypeId} onChange={set("postTypeId")}>
              {POST_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-post-name">
              पद का नाम
            </label>
            <input id="hj-post-name" className={INPUT} value={form.postName} onChange={set("postName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-org">
              संस्था का नाम
            </label>
            <input id="hj-org" className={INPUT} value={form.organisationName} onChange={set("organisationName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-addressee">
              सेवा में (डिफ़ॉल्ट: {post.addressee})
            </label>
            <input id="hj-addressee" className={INPUT} value={form.addressee} onChange={set("addressee")} placeholder={post.addressee} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-ad-source">
              विज्ञापन कहाँ देखा
            </label>
            <input id="hj-ad-source" className={INPUT} value={form.advertisementSource} onChange={set("advertisementSource")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-ad-number">
              विज्ञापन संख्या
            </label>
            <input id="hj-ad-number" className={INPUT} value={form.advertisementNumber} onChange={set("advertisementNumber")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-vacancies">
              रिक्त पदों की संख्या
            </label>
            <input id="hj-vacancies" className={INPUT} type="number" inputMode="numeric" min="0" step="1" value={form.vacancyCount} onChange={set("vacancyCount")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-letter-date">
              पत्र की दिनांक
            </label>
            <input id="hj-letter-date" className={INPUT} type="date" value={form.letterDate} onChange={set("letterDate")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-org-address">
              संस्था का पता
            </label>
            <textarea id="hj-org-address" rows={2} className={AREA} value={form.organisationAddress} onChange={set("organisationAddress")} />
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">आयु और पात्रता</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="hj-dob">
              जन्म तिथि
            </label>
            <input id="hj-dob" className={INPUT} type="date" value={form.dob} onChange={set("dob")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-cutoff">
              आयु गणना की तिथि (cut-off)
            </label>
            <input id="hj-cutoff" className={INPUT} type="date" value={form.cutoffDate} onChange={set("cutoffDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-last-date">
              आवेदन की अंतिम तिथि
            </label>
            <input id="hj-last-date" className={INPUT} type="date" value={form.lastDate} onChange={set("lastDate")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-category">
              श्रेणी
            </label>
            <select id="hj-category" className={INPUT} value={form.categoryId} onChange={set("categoryId")}>
              {CATEGORIES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-min-age">
              न्यूनतम आयु ({MIN_AGE_FLOOR}–{MAX_AGE_CEILING})
            </label>
            <input id="hj-min-age" className={INPUT} type="number" inputMode="numeric" min={MIN_AGE_FLOOR} max={MAX_AGE_CEILING} step="1" value={form.minAge} onChange={set("minAge")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-max-age">
              अधिकतम आयु ({MIN_AGE_FLOOR}–{MAX_AGE_CEILING})
            </label>
            <input id="hj-max-age" className={INPUT} type="number" inputMode="numeric" min={MIN_AGE_FLOOR} max={MAX_AGE_CEILING} step="1" value={form.maxAge} onChange={set("maxAge")} />
          </div>
          {category.usesServiceYears ? (
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="hj-service">
                सैन्य सेवा के वर्ष (0–{MAX_SERVICE_YEARS}) — इसमें {EX_SERVICEMAN_EXTRA_YEARS} वर्ष और जुड़ते हैं
              </label>
              <input id="hj-service" className={INPUT} type="number" inputMode="numeric" min="0" max={MAX_SERVICE_YEARS} step="1" value={form.serviceYears} onChange={set("serviceYears")} />
            </div>
          ) : null}
          <div>
            <label className={LABEL} htmlFor="hj-exp-start">
              अनुभव — प्रारंभ तिथि
            </label>
            <input id="hj-exp-start" className={INPUT} type="date" value={form.experienceStart} onChange={set("experienceStart")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-exp-end">
              अनुभव — अंतिम तिथि
            </label>
            <input id="hj-exp-end" className={INPUT} type="date" value={form.experienceEnd} onChange={set("experienceEnd")} />
          </div>
        </div>
      </section>

      {error ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              कट-ऑफ तिथि पर आयु
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {error ? DASH : formatHindiDuration(eligibility.age.years, eligibility.age.months, useDevanagariDigits)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {error
                ? "ऊपर की तिथियाँ ठीक करें।"
                : eligibility.eligible
                  ? `छूट सहित अधिकतम आयु-सीमा ${num(eligibility.effectiveMaxAge)} वर्ष — आप पात्र हैं।`
                  : eligibility.withinUpperLimit
                    ? `न्यूनतम आयु ${num(eligibility.minAge)} वर्ष अभी पूरी नहीं हुई है।`
                    : `छूट सहित अधिकतम आयु-सीमा ${num(eligibility.effectiveMaxAge)} वर्ष — आप इससे अधिक आयु के हैं।`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={GHOST_BTN}
              aria-label="Copy the eligibility summary"
              onClick={() =>
                copy(
                  error
                    ? ""
                    : [
                        "पात्रता सारांश",
                        `कट-ऑफ तिथि: ${formatHindiDate(form.cutoffDate, useDevanagariDigits)}`,
                        `आयु: ${formatHindiDuration(eligibility.age.years, eligibility.age.months, useDevanagariDigits)}`,
                        `श्रेणी: ${eligibility.category.label}`,
                        `छूट: ${num(eligibility.relaxationYears)} वर्ष`,
                        `छूट सहित अधिकतम आयु: ${num(eligibility.effectiveMaxAge)} वर्ष`,
                        `पात्रता: ${eligibility.eligible ? "पात्र" : "अपात्र"}`,
                      ].join("\n"),
                  "summary",
                )
              }
            >
              {copied === "summary" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied === "summary" ? "कॉपी हो गया!" : "सारांश कॉपी करें"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              रीसेट
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["श्रेणी के अनुसार आयु छूट", error ? DASH : `${num(eligibility.relaxationYears)} वर्ष`],
            ["छूट सहित अधिकतम आयु-सीमा", error ? DASH : `${num(eligibility.effectiveMaxAge)} वर्ष`],
            ["इस तिथि को आप आयु-सीमा पार करेंगे", error ? DASH : formatHindiDate(eligibility.overageOnISO, useDevanagariDigits)],
            ["न्यूनतम आयु पूरी हुई", error ? DASH : eligibility.meetsMinimum ? "हाँ" : "नहीं"],
            [
              "आवेदन की अंतिम तिथि तक शेष दिन",
              error || eligibility.daysLeftToApply === null
                ? DASH
                : eligibility.applicationClosed
                  ? "अंतिम तिथि निकल चुकी है"
                  : `${num(eligibility.daysLeftToApply)} दिन`,
            ],
            [
              "कुल कार्यानुभव",
              error || !experience || experience.error
                ? DASH
                : formatHindiDuration(experience.years, experience.months, useDevanagariDigits),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">आवेदक का विवरण</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="hj-name">
              पूरा नाम
            </label>
            <input id="hj-name" className={INPUT} value={form.applicantName} onChange={set("applicantName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-father">
              पिता / पति का नाम
            </label>
            <input id="hj-father" className={INPUT} value={form.fatherName} onChange={set("fatherName")} />
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-gender">
              लिंग (पत्र की क्रिया इसी के अनुसार बनेगी)
            </label>
            <select id="hj-gender" className={INPUT} value={form.genderId} onChange={set("genderId")}>
              {Object.values(GENDERS).map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL} htmlFor="hj-phone">
              मोबाइल
            </label>
            <input id="hj-phone" className={INPUT} inputMode="tel" value={form.phone} onChange={set("phone")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-email">
              ई-मेल
            </label>
            <input id="hj-email" className={INPUT} type="email" value={form.email} onChange={set("email")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-address">
              पता
            </label>
            <textarea id="hj-address" rows={2} className={AREA} value={form.applicantAddress} onChange={set("applicantAddress")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-qualifications">
              शैक्षणिक योग्यता — हर पंक्ति में एक
            </label>
            <textarea id="hj-qualifications" rows={4} className={AREA} value={form.qualifications} onChange={set("qualifications")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-experience-text">
              अनुभव के बारे में एक वाक्य
            </label>
            <textarea id="hj-experience-text" rows={2} className={AREA} value={form.experienceText} onChange={set("experienceText")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-enclosures">
              संलग्न दस्तावेज़ — हर पंक्ति में एक
            </label>
            <textarea id="hj-enclosures" rows={4} className={AREA} value={form.enclosures} onChange={set("enclosures")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="hj-extra">
              कोई अतिरिक्त बात (वैकल्पिक)
            </label>
            <textarea id="hj-extra" rows={2} className={AREA} value={form.extraNote} onChange={set("extraNote")} />
          </div>
        </div>

        <label
          htmlFor="hj-devanagari"
          className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
        >
          <input
            id="hj-devanagari"
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={useDevanagariDigits}
            onChange={(event) => setUseDevanagariDigits(event.target.checked)}
          />
          <span>
            <span className="block text-sm font-semibold">देवनागरी अंक (०१२३) प्रयोग करें</span>
            <span className="block text-xs text-[var(--muted-foreground)]">
              हटाने पर तिथि और संख्याएँ अंग्रेज़ी अंकों (0123) में आएँगी। मोबाइल नंबर हमेशा अंग्रेज़ी
              अंकों में ही रहता है।
            </span>
          </span>
        </label>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">आपका आवेदन पत्र</h2>
          <button
            type="button"
            className={PRIMARY_BTN}
            aria-label="Copy the Hindi job application letter"
            onClick={() => copy(letter.error ? "" : letter.body, "letter")}
          >
            {copied === "letter" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "letter" ? "कॉपी हो गया!" : "पत्र कॉपी करें"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {error}
          </p>
        ) : (
          <>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {num(letter.wordCount)} शब्द · {num(letter.characterCount)} अक्षर
            </p>
            <pre className="mt-3 max-h-[28rem] overflow-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-4 text-sm leading-7 whitespace-pre-wrap text-[var(--foreground)]">
              {letter.body}
            </pre>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        केवल जानकारी के लिए। आयु-सीमा में छूट के अंक केंद्र सरकार की सीधी भर्ती के सामान्य नियमों पर
        आधारित हैं और तभी लागू होते हैं जब भर्ती नियम एवं विज्ञापन उनकी अनुमति दें; राज्य सरकार और
        निजी भर्तियों में अंक भिन्न हो सकते हैं। आवेदन भेजने से पहले विज्ञापन में दी गई शर्तें अवश्य
        मिला लें।
      </p>
    </main>
  );
}
