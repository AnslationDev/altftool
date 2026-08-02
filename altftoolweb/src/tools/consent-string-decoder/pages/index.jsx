"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Info, RotateCcw, ShieldCheck, XCircle } from "lucide-react";

import { decodeTcString, formatRanges, summariseForCopy } from "../lib";

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none sm:text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5";
const TH_CLASS =
  "border-b border-[var(--border)] px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]";
const TD_CLASS = "border-b border-[var(--border)] px-3 py-2 align-top text-sm text-[var(--foreground)]";

/** A TC string produced by a CMP: consent for purposes 1-3, 102 vendors, one publisher restriction. */
const DEFAULT_STRING = "CP1TeJAP5UWFQAHADBENB7EoAOAAAAMAAAYgH0QAgAEQBkAMgABVAAQkAEAFQ";

const WARNING_STYLES = {
  error: {
    wrap: "border-[var(--danger)]/40 bg-[var(--danger-soft)]",
    text: "text-[var(--anslation-ds-danger-text)]",
    Icon: XCircle,
  },
  warn: {
    wrap: "border-[var(--warning)]/40 bg-[var(--warning-soft)]",
    text: "text-[var(--anslation-ds-warning-text)]",
    Icon: AlertTriangle,
  },
  info: {
    wrap: "border-[var(--border)] bg-[var(--info-soft)]",
    text: "text-[var(--foreground)]",
    Icon: Info,
  },
};

function Flag({ on, onLabel, offLabel }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
        on
          ? "bg-[var(--success-soft)] text-[var(--anslation-ds-success-text)]"
          : "bg-[var(--muted)] text-[var(--muted-foreground)]"
      }`}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}

function Stat({ label, value, hint }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</div>
      <div className="mt-1 break-words font-mono text-sm font-semibold text-[var(--foreground)]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</div> : null}
    </div>
  );
}

function VendorSection({ title, section }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
      <div className="text-sm font-semibold text-[var(--foreground)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--muted-foreground)]">
        <span className="font-mono font-semibold text-[var(--foreground)]">{section.count}</span> vendor
        {section.count === 1 ? "" : "s"} · MaxVendorId{" "}
        <span className="font-mono">{section.maxVendorId}</span> · {section.encoding} encoding
      </div>
      {section.ranges.length ? (
        <p className="mt-2 break-words font-mono text-xs text-[var(--foreground)]">{formatRanges(section.ranges)}</p>
      ) : (
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">No vendor ids set.</p>
      )}
    </div>
  );
}

export default function ToolHome() {
  const [raw, setRaw] = useState(DEFAULT_STRING);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => decodeTcString(raw), [raw]);
  const failed = Boolean(result.error);

  const copyJson = async () => {
    const text = summariseForCopy(result);
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRaw(DEFAULT_STRING);
    setCopied(false);
  };

  const core = failed ? null : result.core;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          IAB TCF v2.2
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Consent String Decoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Base64-decodes a TCF v2 / v2.2 TC String and reads its bit fields — every purpose, special
          feature, vendor range, publisher restriction and extra segment. Decoding happens in this
          page; nothing is uploaded.
        </p>
      </header>

      <section className={CARD_CLASS}>
        <label className={LABEL_CLASS} htmlFor="tc-string">
          TC String
        </label>
        <textarea
          id="tc-string"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          rows={4}
          spellCheck={false}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder="CP1TeJAP5UWFQAHADBENB7Eo…  (a cookie line or &gdpr_consent= URL macro also works)"
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          {raw.trim().length} characters. Paste the bare string, a{" "}
          <span className="font-mono">euconsent-v2=</span> cookie line, or a URL containing{" "}
          <span className="font-mono">gdpr_consent=</span>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={PRIMARY_BTN} onClick={copyJson} disabled={failed}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy decoded JSON"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {failed ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] p-4 text-sm font-medium text-[var(--anslation-ds-danger-text)]"
        >
          {result.error}
        </div>
      ) : (
        <>
          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Core string header</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="TCF version" value={`v${core.version}`} hint={`Policy version ${core.tcfPolicyVersion}`} />
              <Stat label="CMP" value={`ID ${core.cmpId}`} hint={`CMP version ${core.cmpVersion}, screen ${core.consentScreen}`} />
              <Stat label="Global Vendor List" value={core.vendorListVersion} hint="GVL version this string was built against" />
              <Stat label="Created" value={core.created.iso || core.created.error} hint={`${core.createdRaw} deciseconds`} />
              <Stat label="Last updated" value={core.lastUpdated.iso || core.lastUpdated.error} hint={`${core.lastUpdatedRaw} deciseconds`} />
              <Stat label="Consent language" value={core.consentLanguage} hint={`Publisher country ${core.publisherCountryCode}`} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Flag on={core.isServiceSpecific} onLabel="Service-specific scope" offLabel="Global scope" />
              <Flag on={core.useNonStandardTexts} onLabel="Non-standard texts" offLabel="Standard IAB texts" />
              <Flag on={core.purposeOneTreatment} onLabel="PurposeOneTreatment on" offLabel="PurposeOneTreatment off" />
            </div>
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              {result.segmentCount} segment{result.segmentCount === 1 ? "" : "s"} · core segment is{" "}
              {core.bitLength} bits, of which {core.bitLength - core.trailingBits} are meaningful and{" "}
              {core.trailingBits} are Base64 padding.
            </p>
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Purposes</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Bits 152-175 carry consent, bits 176-199 carry legitimate-interest transparency.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse">
                <thead>
                  <tr>
                    <th scope="col" className={TH_CLASS}>#</th>
                    <th scope="col" className={TH_CLASS}>Purpose</th>
                    <th scope="col" className={TH_CLASS}>Consent</th>
                    <th scope="col" className={TH_CLASS}>Legitimate interest</th>
                  </tr>
                </thead>
                <tbody>
                  {result.purposeRows.map((purpose) => (
                    <tr key={purpose.id}>
                      <td className={`${TD_CLASS} font-mono`}>{purpose.id}</td>
                      <td className={TD_CLASS}>
                        {purpose.name}
                        {!purpose.liAllowed ? (
                          <span className="ml-2 text-xs text-[var(--muted-foreground)]">consent-only in v2.2</span>
                        ) : null}
                      </td>
                      <td className={TD_CLASS}>
                        <Flag on={purpose.consent} onLabel="Granted" offLabel="Not set" />
                      </td>
                      <td className={TD_CLASS}>
                        <Flag on={purpose.legitimateInterest} onLabel="Established" offLabel="Not set" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Special features</h2>
            <ul className="mt-3 space-y-2">
              {result.specialFeatureRows.map((feature) => (
                <li
                  key={feature.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm"
                >
                  <span>
                    <span className="font-mono text-[var(--muted-foreground)]">{feature.id}.</span> {feature.name}
                  </span>
                  <Flag on={feature.optedIn} onLabel="Opted in" offLabel="Not opted in" />
                </li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Vendors</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Vendor ids only. Turning an id into a company name needs the Global Vendor List, which is
              a network resource this page deliberately does not fetch.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <VendorSection title="Consent" section={core.vendorConsent} />
              <VendorSection title="Legitimate interest" section={core.vendorLegitimateInterest} />
            </div>
          </section>

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Publisher restrictions</h2>
            {core.publisherRestrictions.length ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse">
                  <thead>
                    <tr>
                      <th scope="col" className={TH_CLASS}>Purpose</th>
                      <th scope="col" className={TH_CLASS}>Restriction</th>
                      <th scope="col" className={TH_CLASS}>Vendors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {core.publisherRestrictions.map((item, index) => (
                      <tr key={`${item.purposeId}-${item.restrictionType}-${index}`}>
                        <td className={`${TD_CLASS} font-mono`}>{item.purposeId}</td>
                        <td className={TD_CLASS}>
                          <div className="font-semibold">{item.restrictionName}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{item.restrictionDetail}</div>
                        </td>
                        <td className={`${TD_CLASS} font-mono text-xs`}>
                          {formatRanges(item.ranges)} <span className="text-[var(--muted-foreground)]">({item.count})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                None. The publisher has not overridden any vendor&rsquo;s declared legal basis.
              </p>
            )}
          </section>

          {result.extraSegments.length ? (
            <section className={`mt-6 ${CARD_CLASS}`}>
              <h2 className="text-lg font-semibold">Additional segments</h2>
              <ul className="mt-3 space-y-2">
                {result.extraSegments.map((segment) => (
                  <li key={segment.index} className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm">
                    <div className="font-semibold">
                      Segment {segment.index + 1}: {segment.name || `type ${segment.type}`}
                    </div>
                    {segment.error ? (
                      <p className="mt-1 text-[var(--anslation-ds-danger-text)]">{segment.error}</p>
                    ) : segment.vendors ? (
                      <p className="mt-1 break-words font-mono text-xs text-[var(--muted-foreground)]">
                        {segment.vendors.count} vendor{segment.vendors.count === 1 ? "" : "s"}:{" "}
                        {formatRanges(segment.vendors.ranges) || "none"}
                      </p>
                    ) : (
                      <div className="mt-1 space-y-1 text-xs text-[var(--muted-foreground)]">
                        <p>
                          Publisher purposes with consent:{" "}
                          <span className="font-mono">{segment.publisherPurposesConsent.join(", ") || "none"}</span>
                        </p>
                        <p>
                          Publisher purposes on legitimate interest:{" "}
                          <span className="font-mono">
                            {segment.publisherPurposesLegitimateInterest.join(", ") || "none"}
                          </span>
                        </p>
                        <p>
                          {segment.numCustomPurposes} custom purpose
                          {segment.numCustomPurposes === 1 ? "" : "s"} — consent{" "}
                          <span className="font-mono">{segment.customPurposesConsent.join(", ") || "none"}</span>,
                          legitimate interest{" "}
                          <span className="font-mono">
                            {segment.customPurposesLegitimateInterest.join(", ") || "none"}
                          </span>
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className={`mt-6 ${CARD_CLASS}`}>
            <h2 className="text-lg font-semibold">Consistency checks</h2>
            {result.warnings.length ? (
              <ul className="mt-3 space-y-2">
                {result.warnings.map((warning, index) => {
                  const style = WARNING_STYLES[warning.level] || WARNING_STYLES.info;
                  const Icon = style.Icon;
                  return (
                    <li
                      key={`${warning.title}-${index}`}
                      className={`flex gap-3 rounded-lg border p-3 ${style.wrap}`}
                    >
                      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.text}`} aria-hidden="true" />
                      <div>
                        <div className={`text-sm font-semibold ${style.text}`}>{warning.title}</div>
                        <p className="mt-1 text-sm text-[var(--foreground)]">{warning.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Nothing inconsistent. Every field parses inside its declared width and no purpose
                carries a legal basis the v2.2 policy forbids.
              </p>
            )}
          </section>
        </>
      )}
    </main>
  );
}
