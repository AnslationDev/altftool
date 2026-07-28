"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  BLOOD_GROUPS,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  REVIEW_INTERVAL_MONTHS,
  buildEmergencyCard,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CONTACTS = [
  { id: "c1", name: "Vikram Rao", relation: "Spouse", phone: "+91 98111 22334" },
  { id: "c2", name: "Meera Rao", relation: "Daughter", phone: "+91 90000 11223" },
];

const DEFAULTS = {
  fullName: "Ananya Rao",
  dob: "1988-03-15",
  bloodGroup: "A+",
  allergies: "Penicillin\nSulfa drugs",
  conditions: "Type 2 diabetes\nHypertension",
  medications: "Metformin 500 mg twice daily\nTelmisartan 40 mg once daily",
  implants: "Coronary stent (2021)",
  organDonor: "Yes — registered",
  preferredHospital: "Apollo, Jubilee Hills",
  language: "Telugu, English",
  address: "12 MG Road, Hyderabad 500001",
  doctorName: "Dr S Iyer",
  doctorPhone: "+91 98450 12345",
  insurer: "Star Health",
  policyNumber: "SH-99120",
  notes: "Carries glucose tablets in bag",
};

const todayIso = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [contacts, setContacts] = useState(DEFAULT_CONTACTS);
  const [reviewedOn, setReviewedOn] = useState(todayIso);
  const [copied, setCopied] = useState(false);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const setContactField = (id, key) => (event) => {
    const { value } = event.target;
    setContacts((previous) =>
      previous.map((contact) => (contact.id === id ? { ...contact, [key]: value } : contact)),
    );
  };

  const addContact = () => {
    setContacts((previous) => {
      if (previous.length >= 4) return previous;
      const nextIndex =
        previous.reduce((max, contact) => Math.max(max, Number(contact.id.slice(1)) || 0), 0) + 1;
      return [...previous, { id: `c${nextIndex}`, name: "", relation: "", phone: "" }];
    });
  };

  const removeContact = (id) => {
    setContacts((previous) => (previous.length <= 1 ? previous : previous.filter((c) => c.id !== id)));
  };

  const card = useMemo(
    () => buildEmergencyCard({ ...form, reviewedOn, contacts }),
    [form, reviewedOn, contacts],
  );

  const copyCard = async () => {
    if (card.error) return;
    try {
      await navigator.clipboard.writeText(card.cardText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setContacts(DEFAULT_CONTACTS);
    setReviewedOn(todayIso());
    setCopied(false);
  };

  const hasResult = !card.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          First aid
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Emergency Medical Card Builder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Put your conditions, medicines, allergies, blood group and ICE contacts on one
          wallet-size card ({CARD_WIDTH_MM} × {CARD_HEIGHT_MM} mm, the standard ID-1 size). Nothing
          you type leaves your browser.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Who the card is for</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-name">
              Full name
            </label>
            <input id="emc-name" className={`mt-2 ${INPUT_CLASS}`} value={form.fullName} onChange={setField("fullName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-dob">
              Date of birth
            </label>
            <input id="emc-dob" type="date" className={`mt-2 ${INPUT_CLASS}`} value={form.dob} onChange={setField("dob")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-blood">
              Blood group
            </label>
            <select id="emc-blood" className={`mt-2 ${INPUT_CLASS}`} value={form.bloodGroup} onChange={setField("bloodGroup")}>
              <option value="">Unknown</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-reviewed">
              Reviewed on
            </label>
            <input
              id="emc-reviewed"
              type="date"
              className={`mt-2 ${INPUT_CLASS}`}
              value={reviewedOn}
              onChange={(event) => setReviewedOn(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Medical details</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">One item per line.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-allergies">
              Allergies
            </label>
            <textarea id="emc-allergies" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.allergies} onChange={setField("allergies")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-conditions">
              Conditions
            </label>
            <textarea id="emc-conditions" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.conditions} onChange={setField("conditions")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-meds">
              Current medicines and doses
            </label>
            <textarea id="emc-meds" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.medications} onChange={setField("medications")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-implants">
              Implants and devices
            </label>
            <textarea id="emc-implants" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.implants} onChange={setField("implants")} />
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">ICE contacts</h2>
          <button type="button" onClick={addContact} className={GHOST_BTN} aria-label="Add another emergency contact">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add contact
          </button>
        </div>
        <div className="mt-4 grid gap-4">
          {contacts.map((contact, index) => (
            <div key={contact.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-3">
              <div>
                <label className={LABEL_CLASS} htmlFor={`emc-cname-${contact.id}`}>
                  Contact {index + 1} name
                </label>
                <input
                  id={`emc-cname-${contact.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={contact.name}
                  onChange={setContactField(contact.id, "name")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`emc-crel-${contact.id}`}>
                  Relationship
                </label>
                <input
                  id={`emc-crel-${contact.id}`}
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={contact.relation}
                  onChange={setContactField(contact.id, "relation")}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor={`emc-cphone-${contact.id}`}>
                  Phone
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    id={`emc-cphone-${contact.id}`}
                    type="tel"
                    className={INPUT_CLASS}
                    value={contact.phone}
                    onChange={setContactField(contact.id, "phone")}
                  />
                  <button
                    type="button"
                    onClick={() => removeContact(contact.id)}
                    aria-label={`Remove contact ${index + 1}`}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Care team and extras</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-doctor">
              Doctor or clinic
            </label>
            <input id="emc-doctor" className={`mt-2 ${INPUT_CLASS}`} value={form.doctorName} onChange={setField("doctorName")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-doctor-phone">
              Doctor phone
            </label>
            <input id="emc-doctor-phone" type="tel" className={`mt-2 ${INPUT_CLASS}`} value={form.doctorPhone} onChange={setField("doctorPhone")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-insurer">
              Insurer
            </label>
            <input id="emc-insurer" className={`mt-2 ${INPUT_CLASS}`} value={form.insurer} onChange={setField("insurer")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-policy">
              Policy number
            </label>
            <input id="emc-policy" className={`mt-2 ${INPUT_CLASS}`} value={form.policyNumber} onChange={setField("policyNumber")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-hospital">
              Preferred hospital
            </label>
            <input id="emc-hospital" className={`mt-2 ${INPUT_CLASS}`} value={form.preferredHospital} onChange={setField("preferredHospital")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-language">
              Languages spoken
            </label>
            <input id="emc-language" className={`mt-2 ${INPUT_CLASS}`} value={form.language} onChange={setField("language")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-donor">
              Organ donor status
            </label>
            <input id="emc-donor" className={`mt-2 ${INPUT_CLASS}`} value={form.organDonor} onChange={setField("organDonor")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="emc-address">
              Home address
            </label>
            <input id="emc-address" className={`mt-2 ${INPUT_CLASS}`} value={form.address} onChange={setField("address")} />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="emc-notes">
              Notes for a responder
            </label>
            <textarea id="emc-notes" className={`mt-2 ${TEXTAREA_CLASS}`} value={form.notes} onChange={setField("notes")} />
          </div>
        </div>
      </section>

      {card.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {card.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Card completeness
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${card.completeness}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult ? `${card.band} — ${card.bandNote}` : "Fix the error above to see a score."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyCard}
              disabled={!hasResult}
              aria-label="Copy the emergency medical card text"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy card"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the card to the sample data" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Age at review date", hasResult && card.ageYears !== null ? `${card.ageYears} years` : DASH],
            ["Blood group", hasResult && card.bloodGroup ? card.bloodGroup : DASH],
            [
              "Red cells you can receive",
              hasResult && card.compatibleDonors.length ? card.compatibleDonors.join(", ") : DASH,
            ],
            ["Reachable ICE contacts", hasResult ? `${card.reachableContacts} of ${card.contactCount}` : DASH],
            ["Card length", hasResult ? `${card.characters} characters` : DASH],
            ["Wallet-card sides needed", hasResult ? card.sidesNeeded : DASH],
            ["Next review due", hasResult ? `${card.nextReviewDate} (${REVIEW_INTERVAL_MONTHS} months)` : DASH],
            ["Missing critical fields", hasResult ? card.missingCritical.length : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {hasResult && (
          <div className="mt-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Card is ${card.completeness} percent complete`}
            >
              <span
                className="block h-full bg-[var(--primary)]"
                style={{ width: `${Math.max(0, Math.min(100, card.completeness))}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {hasResult && (card.missingCritical.length > 0 || card.missingRecommended.length > 0) && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Still to fill in</h2>
          {card.missingCritical.length > 0 && (
            <>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">Critical</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--foreground)]">
                {card.missingCritical.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
          {card.missingRecommended.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Nice to have
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
                {card.missingRecommended.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {hasResult && card.warnings.length > 0 && (
        <ul className="mt-4 space-y-2">
          {card.warnings.map((warning) => (
            <li
              key={warning}
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {warning}
            </li>
          ))}
        </ul>
      )}

      {hasResult && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Card preview</h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            Print at 100% scale and trim to {CARD_WIDTH_MM} × {CARD_HEIGHT_MM} mm.
          </p>
          <div className="mt-3 overflow-x-auto">
            <div className="min-w-[300px] rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--danger)]">
                Emergency medical card
              </p>
              <dl className="mt-2 space-y-1 text-xs leading-5">
                {card.sections.map((section) => (
                  <div key={section.label} className="flex gap-2">
                    <dt className="w-32 shrink-0 font-semibold text-[var(--muted-foreground)]">{section.label}</dt>
                    <dd className="break-words">{section.value}</dd>
                  </div>
                ))}
                <div className="flex gap-2">
                  <dt className="w-32 shrink-0 font-semibold text-[var(--muted-foreground)]">REVIEWED</dt>
                  <dd>{card.reviewedOn}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. A card does not replace clinical records — confirm your medicine names,
        doses and allergy history with your doctor or pharmacist before you print it, and update the
        card whenever a prescription changes.
      </p>
    </main>
  );
}
