"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeAlert,
  Building2,
  Check,
  ClipboardList,
  Copy,
  Landmark,
  Link as LinkIcon,
  RotateCcw,
  ScrollText,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import {
  FORM31_PURPOSES,
  FORM_FILTERS,
  FORM_GUIDE,
  GRIEVANCE_PORTAL,
  OWNER_META,
  OWNER_ORDER,
  PARA_32A_DAMAGE_SLABS,
  REJECTION_REASONS,
  RULES_READ_ON,
  assessForm10cEligibility,
  assessForm19Timing,
  assessForm31Advance,
  buildReasonSummary,
  decodeRemark,
  getReasonById,
  searchReasons,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const SELECT_CLASS = `${INPUT_CLASS} appearance-none pr-8`;
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 disabled:opacity-50";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

/** Owner key -> the badge styling and icon that stands for that party. */
const OWNER_STYLE = {
  member: { chip: "bg-[var(--primary)]/12 text-[var(--primary)]", Icon: UserRound },
  joint: { chip: "bg-[var(--info-soft)] text-[var(--info)]", Icon: Users },
  employer: { chip: "bg-[var(--warning-soft)] text-[var(--warning)]", Icon: Building2 },
  epfo: { chip: "bg-[var(--success-soft)] text-[var(--success)]", Icon: Landmark },
};

const CONFIDENCE_STYLE = {
  high: "bg-[var(--success-soft)] text-[var(--success)]",
  medium: "bg-[var(--warning-soft)] text-[var(--warning)]",
  low: "bg-[var(--danger-soft)] text-[var(--danger)]",
  none: "bg-[var(--danger-soft)] text-[var(--danger)]",
};

const CONFIDENCE_LABEL = {
  high: "Close match",
  medium: "Probable match",
  low: "Weak match",
  none: "No match",
};

const DEFAULT_REMARK = "Claim rejected: Name against UAN is not matching with Aadhaar.";

/** Ready-made remarks so the picker works for someone who cannot copy the string. */
const QUICK_PICKS = REJECTION_REASONS.map((reason) => ({
  id: reason.id,
  label: reason.portal[0],
}));

const intFmt = new Intl.NumberFormat("en-IN");

/** Safe lookup so a missing catalogue id renders an em dash instead of throwing. */
function reasonTitle(id) {
  const reason = getReasonById(id);
  return reason ? reason.title : DASH;
}

function copyText(value, onDone) {
  navigator.clipboard
    .writeText(value)
    .then(() => onDone(true))
    .catch(() => onDone(false));
}

export default function ToolHome() {
  const [remark, setRemark] = useState(DEFAULT_REMARK);
  const [query, setQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [formFilter, setFormFilter] = useState("all");
  const [openIds, setOpenIds] = useState([]);
  const [copiedKey, setCopiedKey] = useState("");

  // Form 19 timing
  const [exitDate, setExitDate] = useState("2026-05-31");
  const [claimDate, setClaimDate] = useState("2026-07-28");
  const [reEmployed, setReEmployed] = useState(false);

  // Form 10C
  const [contributoryMonths, setContributoryMonths] = useState("42");
  const [epsAge, setEpsAge] = useState("34");
  const [firstJoinDate, setFirstJoinDate] = useState("2012-04-02");
  const [wageAtJoining, setWageAtJoining] = useState("12000");

  // Form 31
  const [purposeCode, setPurposeCode] = useState("68B");
  const [membershipMonths, setMembershipMonths] = useState("48");
  const [priorOccasions, setPriorOccasions] = useState("0");
  const [advanceAge, setAdvanceAge] = useState("38");

  const decoded = useMemo(() => decodeRemark(remark), [remark]);
  const results = useMemo(
    () => searchReasons(query, { owner: ownerFilter, form: formFilter }),
    [query, ownerFilter, formFilter],
  );

  const form19 = useMemo(
    () => assessForm19Timing({ exitDate, claimDate, reEmployed }),
    [exitDate, claimDate, reEmployed],
  );
  const form10c = useMemo(
    () =>
      assessForm10cEligibility({
        contributoryMonths: Number(contributoryMonths),
        ageYears: Number(epsAge),
        firstEpfJoinDate: firstJoinDate || null,
        wageAtJoining: wageAtJoining === "" ? null : Number(wageAtJoining),
      }),
    [contributoryMonths, epsAge, firstJoinDate, wageAtJoining],
  );
  const form31 = useMemo(
    () =>
      assessForm31Advance({
        purposeCode,
        membershipMonths: Number(membershipMonths),
        priorOccasions: Number(priorOccasions),
        ageYears: advanceAge === "" ? null : Number(advanceAge),
      }),
    [purposeCode, membershipMonths, priorOccasions, advanceAge],
  );

  const openReason = useCallback((id) => {
    setQuery("");
    setOwnerFilter("all");
    setFormFilter("all");
    setOpenIds((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const toggleReason = useCallback((id) => {
    setOpenIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }, []);

  // Deep links: /tools/all/epf-rejection-reason-decoder#service-period-overlap
  useEffect(() => {
    let frame = 0;
    function applyHash() {
      const id = window.location.hash.replace("#", "").trim();
      if (!id || !getReasonById(id)) return;
      openReason(id);
      const node = document.getElementById(id);
      if (node) node.scrollIntoView({ block: "start", behavior: "auto" });
    }
    frame = window.requestAnimationFrame(applyHash);
    window.addEventListener("hashchange", applyHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", applyHash);
    };
  }, [openReason]);

  function markCopied(key, ok) {
    setCopiedKey(ok ? key : "");
    if (!ok) return;
    window.setTimeout(() => setCopiedKey(""), 1800);
  }

  function copyReason(reason) {
    copyText(buildReasonSummary(reason), (ok) => markCopied(`copy-${reason.id}`, ok));
  }

  function copyLink(id) {
    const base = `${window.location.origin}${window.location.pathname}`;
    copyText(`${base}#${id}`, (ok) => markCopied(`link-${id}`, ok));
  }

  function resetAll() {
    setRemark(DEFAULT_REMARK);
    setQuery("");
    setOwnerFilter("all");
    setFormFilter("all");
    setOpenIds([]);
    setCopiedKey("");
  }

  const topMatch = decoded.matches && decoded.matches.length > 0 ? decoded.matches[0] : null;
  const topOwner = topMatch ? OWNER_META[topMatch.reason.owner] : null;
  const TopOwnerIcon = topMatch ? OWNER_STYLE[topMatch.reason.owner].Icon : BadgeAlert;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <ScrollText className="h-6 w-6 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          EPF Claim Rejection Reason Decoder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the rejection remark EPFO showed against your claim. This page tells you what the
          string means, <strong className="font-semibold text-[var(--foreground)]">who has to
          fix it</strong> — you, the ex-employer, or the EPFO field office — the correction route
          EPFO defines for it, and what to have in hand first. {intFmt.format(REJECTION_REASONS.length)}{" "}
          rejection families, each with its own link.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
          Rule text read on {RULES_READ_ON}. This page decodes and explains. It does not file
          anything with EPFO, does not see your UAN, and is not legal or financial advice.
        </p>
      </header>

      {/* ---------------- Decoder ---------------- */}
      <section aria-labelledby="decoder-heading" className="grid gap-4">
        <h2 id="decoder-heading" className="text-lg font-semibold">
          Decode a rejection remark
        </h2>

        <div>
          <label className={LABEL_CLASS} htmlFor="remark">
            Rejection remark as the portal or SMS shows it
          </label>
          <textarea
            id="remark"
            className={`${TEXTAREA_CLASS} mt-1 h-24`}
            value={remark}
            spellCheck={false}
            onChange={(event) => setRemark(event.target.value)}
          />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="quick-pick">
            Or pick the closest wording
          </label>
          <select
            id="quick-pick"
            className={`${SELECT_CLASS} mt-1`}
            value=""
            onChange={(event) => {
              const picked = QUICK_PICKS.find((item) => item.id === event.target.value);
              if (picked) setRemark(picked.label);
            }}
          >
            <option value="">Choose a common remark…</option>
            {QUICK_PICKS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className={PRIMARY_BTN}
            onClick={() => topMatch && copyReason(topMatch.reason)}
            disabled={!topMatch}
            aria-label="Copy the decoded rejection and its correction route"
          >
            {copiedKey === `copy-${topMatch?.reason.id}` ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            {copiedKey === `copy-${topMatch?.reason.id}` ? "Copied!" : "Copy the decode"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={resetAll} aria-label="Reset the decoder and filters">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {decoded.error ? (
        <div role="alert" className={`mt-5 ${ERROR_CLASS}`}>
          {decoded.error}
        </div>
      ) : null}

      <section className={`mt-5 ${CARD_CLASS}`} aria-live="polite">
        <p className="text-sm font-medium text-[var(--muted-foreground)]">Who has to fix this</p>
        <p className="mt-1 flex items-start gap-3 text-3xl font-bold leading-tight sm:text-4xl">
          <TopOwnerIcon className="mt-1 h-7 w-7 shrink-0 text-[var(--primary)]" aria-hidden="true" />
          <span>{decoded.error || !topOwner ? DASH : topOwner.label}</span>
        </p>

        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <Row label="Decoded as" value={decoded.error || !topMatch ? DASH : topMatch.reason.title} />
          <Row
            label="Forms it hits"
            value={decoded.error || !topMatch ? DASH : `Form ${topMatch.reason.forms.join(", Form ")}`}
          />
          <Row
            label="Match confidence"
            value={
              decoded.error || !decoded.confidence ? (
                DASH
              ) : (
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${CONFIDENCE_STYLE[decoded.confidence]}`}
                >
                  {CONFIDENCE_LABEL[decoded.confidence]}
                </span>
              )
            }
          />
          <Row label="Rule behind it" value={decoded.error || !topMatch ? DASH : topMatch.reason.rule} />
        </dl>

        {!decoded.error && topMatch ? (
          <>
            <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
              {topOwner.line} {topMatch.reason.ownerWhy}
            </p>
            <p className="mt-3 text-sm leading-6">{topMatch.reason.meaning}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={GHOST_BTN}
                onClick={() => {
                  openReason(topMatch.reason.id);
                  const node = document.getElementById(topMatch.reason.id);
                  if (node) node.scrollIntoView({ block: "start", behavior: "smooth" });
                }}
              >
                Open the full entry
              </button>
            </div>
            {decoded.matches.length > 1 ? (
              <div className="mt-4">
                <p className="text-sm font-semibold">Other wordings that also fit</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {decoded.matches.slice(1).map((match) => (
                    <li key={match.reason.id}>
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center rounded-md border border-[var(--border)] px-3 text-xs font-medium transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                        onClick={() => openReason(match.reason.id)}
                      >
                        {match.reason.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {decoded.error
              ? "Nothing is decoded while the remark is empty."
              : decoded.note}
          </p>
        )}
      </section>

      {/* ---------------- Catalogue ---------------- */}
      <section aria-labelledby="catalogue-heading" className="mt-10">
        <h2 id="catalogue-heading" className="text-lg font-semibold">
          Every rejection reason, and whose problem it is
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Each entry has its own link. Copy it from the entry and you can send someone straight to
          the one that matters.
        </p>

        <div className="mt-4 grid gap-4">
          <div>
            <label className={LABEL_CLASS} htmlFor="reason-search">
              Search the reasons
            </label>
            <div className="relative mt-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
                aria-hidden="true"
              />
              <input
                id="reason-search"
                type="search"
                className={`${INPUT_CLASS} pl-9`}
                placeholder="aadhaar, exit date, IFSC, 10C, overlap…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="owner-filter">
                Who has to fix it
              </label>
              <select
                id="owner-filter"
                className={`${SELECT_CLASS} mt-1`}
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
              >
                <option value="all">Anyone</option>
                {OWNER_ORDER.map((key) => (
                  <option key={key} value={key}>
                    {OWNER_META[key].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="form-filter">
                Form affected
              </label>
              <select
                id="form-filter"
                className={`${SELECT_CLASS} mt-1`}
                value={formFilter}
                onChange={(event) => setFormFilter(event.target.value)}
              >
                <option value="all">Any form</option>
                {FORM_FILTERS.map((code) => (
                  <option key={code} value={code}>
                    Form {code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Showing {intFmt.format(results.total)} of {intFmt.format(REJECTION_REASONS.length)} rejection
          reasons.
        </p>

        {results.total === 0 ? (
          <div role="alert" className={`mt-4 ${ERROR_CLASS}`}>
            No rejection reason matches those words. Try a single distinctive word from the remark,
            such as the field name or the form number.
          </div>
        ) : (
          <ul className="mt-4 grid gap-3">
            {results.reasons.map((reason) => (
              <ReasonCard
                key={reason.id}
                reason={reason}
                open={openIds.includes(reason.id)}
                onToggle={() => toggleReason(reason.id)}
                onCopy={() => copyReason(reason)}
                onCopyLink={() => copyLink(reason.id)}
                copiedSummary={copiedKey === `copy-${reason.id}`}
                copiedLink={copiedKey === `link-${reason.id}`}
              />
            ))}
          </ul>
        )}
      </section>

      {/* ---------------- Eligibility checks ---------------- */}
      <section aria-labelledby="checks-heading" className="mt-10">
        <h2 id="checks-heading" className="text-lg font-semibold">
          Three checks the portal runs before it rejects
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          These reproduce the arithmetic behind the three commonest eligibility rejections, so you
          can see whether the record or the rule is the problem.
        </p>

        {/* Form 19 timing */}
        <div className={`mt-4 ${CARD_CLASS}`}>
          <h3 className="text-base font-semibold">Form 19 — the two-month waiting period</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="exit-date">
                Date of exit as EPFO shows it
              </label>
              <input
                id="exit-date"
                type="date"
                className={`${INPUT_CLASS} mt-1`}
                value={exitDate}
                onChange={(event) => setExitDate(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="claim-date">
                Date the claim was or will be filed
              </label>
              <input
                id="claim-date"
                type="date"
                className={`${INPUT_CLASS} mt-1`}
                value={claimDate}
                onChange={(event) => setClaimDate(event.target.value)}
              />
            </div>
          </div>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm" htmlFor="re-employed">
            <input
              id="re-employed"
              type="checkbox"
              className="h-4 w-4 accent-[var(--primary)]"
              checked={reEmployed}
              onChange={(event) => setReEmployed(event.target.checked)}
            />
            Already joined another EPF-covered employer
          </label>

          {form19.error ? (
            <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
              {form19.error}
            </p>
          ) : null}

          <p className="mt-3 text-3xl font-bold tabular-nums">
            {form19.error ? DASH : form19.headline}
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row
              label="Earliest admissible date"
              value={form19.error ? DASH : form19.earliestDate}
            />
            <Row
              label="Days still to run"
              value={form19.error ? DASH : intFmt.format(form19.daysRemaining)}
            />
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {form19.error ? DASH : form19.detail}
          </p>
        </div>

        {/* Form 10C */}
        <div className={`mt-4 ${CARD_CLASS}`}>
          <h3 className="text-base font-semibold">Form 10C — is a withdrawal benefit payable at all</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="contributory-months">
                Contributory service (whole months)
              </label>
              <input
                id="contributory-months"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className={`${INPUT_CLASS} mt-1`}
                value={contributoryMonths}
                onChange={(event) => setContributoryMonths(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="eps-age">
                Age today (years)
              </label>
              <input
                id="eps-age"
                type="number"
                inputMode="numeric"
                min="14"
                step="1"
                className={`${INPUT_CLASS} mt-1`}
                value={epsAge}
                onChange={(event) => setEpsAge(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="first-join">
                First ever EPF joining date
              </label>
              <input
                id="first-join"
                type="date"
                className={`${INPUT_CLASS} mt-1`}
                value={firstJoinDate}
                onChange={(event) => setFirstJoinDate(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="wage-at-joining">
                Monthly EPF wage at that joining
              </label>
              <input
                id="wage-at-joining"
                type="number"
                inputMode="numeric"
                min="0"
                step="500"
                className={`${INPUT_CLASS} mt-1`}
                value={wageAtJoining}
                onChange={(event) => setWageAtJoining(event.target.value)}
              />
            </div>
          </div>

          {form10c.error ? (
            <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
              {form10c.error}
            </p>
          ) : null}

          <p className="mt-3 text-3xl font-bold">{form10c.error ? DASH : form10c.headline}</p>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row label="Service as entered" value={form10c.error ? DASH : form10c.serviceLabel} />
            <Row
              label="Counted as (Para 10(2))"
              value={form10c.error ? DASH : `${intFmt.format(form10c.roundedYears)} years`}
            />
            <Row label="Form that applies" value={form10c.error ? DASH : `Form ${form10c.form}`} />
            <Row
              label="Matching rejection"
              value={
                form10c.error || !form10c.reasonId ? DASH : reasonTitle(form10c.reasonId)
              }
            />
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            {form10c.error ? DASH : form10c.detail}
          </p>
        </div>

        {/* Form 31 */}
        <div className={`mt-4 ${CARD_CLASS}`}>
          <h3 className="text-base font-semibold">Form 31 — does the Para 68 gate open</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="purpose-code">
                Purpose claimed under
              </label>
              <select
                id="purpose-code"
                className={`${SELECT_CLASS} mt-1`}
                value={purposeCode}
                onChange={(event) => setPurposeCode(event.target.value)}
              >
                {FORM31_PURPOSES.map((purpose) => (
                  <option key={purpose.code} value={purpose.code}>
                    Para {purpose.code} — {purpose.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="membership-months">
                Membership of the Fund (whole months)
              </label>
              <input
                id="membership-months"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className={`${INPUT_CLASS} mt-1`}
                value={membershipMonths}
                onChange={(event) => setMembershipMonths(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="prior-occasions">
                Advances already taken for this purpose
              </label>
              <input
                id="prior-occasions"
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                className={`${INPUT_CLASS} mt-1`}
                value={priorOccasions}
                onChange={(event) => setPriorOccasions(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="advance-age">
                Age today (years)
              </label>
              <input
                id="advance-age"
                type="number"
                inputMode="numeric"
                min="14"
                step="1"
                className={`${INPUT_CLASS} mt-1`}
                value={advanceAge}
                onChange={(event) => setAdvanceAge(event.target.value)}
              />
            </div>
          </div>

          {form31.error ? (
            <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
              {form31.error}
            </p>
          ) : null}

          <p className="mt-3 text-3xl font-bold">{form31.error ? DASH : form31.headline}</p>
          <dl className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <Row label="Membership entered" value={form31.error ? DASH : form31.membershipLabel} />
            <Row
              label="Months short of the gate"
              value={form31.error ? DASH : intFmt.format(form31.shortfallMonths)}
            />
            <Row
              label="Matching rejection"
              value={form31.error || !form31.reasonId ? DASH : reasonTitle(form31.reasonId)}
            />
            <Row label="Rule" value={form31.error ? DASH : form31.rule} />
          </dl>
          {!form31.error && form31.blockers.length > 0 ? (
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {form31.blockers.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* ---------------- Form comparison ---------------- */}
      <section aria-labelledby="forms-heading" className="mt-10">
        <h2 id="forms-heading" className="text-lg font-semibold">
          Form 19 vs Form 10C vs Form 31 vs Form 13 vs Form 10D
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A large share of rejections is simply the wrong form. Form 19 pays the provident fund,
          Form 10C pays the pension fund, and Form 31 pays neither in full — it releases part of
          your own provident fund while you are still a member.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead className="bg-[var(--card)]">
              <tr>
                <th scope="col" className="p-3 font-semibold">Form</th>
                <th scope="col" className="p-3 font-semibold">What it pays</th>
                <th scope="col" className="p-3 font-semibold">When it is used</th>
                <th scope="col" className="p-3 font-semibold">The gate</th>
              </tr>
            </thead>
            <tbody>
              {FORM_GUIDE.map((form) => (
                <tr key={form.code} className="border-t border-[var(--border)] align-top">
                  <th scope="row" className="p-3 font-semibold">
                    {form.name}
                    <span className="mt-1 block text-xs font-normal text-[var(--muted-foreground)]">
                      {form.scheme}
                    </span>
                  </th>
                  <td className="p-3 text-[var(--muted-foreground)]">{form.pays}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{form.whenUsed}</td>
                  <td className="p-3 text-[var(--muted-foreground)]">{form.gate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- Employer default reference ---------------- */}
      <section aria-labelledby="damages-heading" className="mt-10">
        <h2 id="damages-heading" className="text-lg font-semibold">
          When the employer never remitted: what the Act charges
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A &ldquo;contribution not received&rdquo; rejection is a recovery matter, not a
          correction. EPFO determines the dues under Section 7A of the EPF and Miscellaneous
          Provisions Act 1952, charges simple interest under Section 7Q, and levies damages under
          Section 14B at the rates in Para 32A of the EPF Scheme 1952.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl ring-1 ring-[var(--border)]">
          <table className="w-full min-w-[24rem] border-collapse text-left text-sm">
            <thead className="bg-[var(--card)]">
              <tr>
                <th scope="col" className="p-3 font-semibold">Period of default</th>
                <th scope="col" className="p-3 font-semibold">Damages, per annum</th>
              </tr>
            </thead>
            <tbody>
              {PARA_32A_DAMAGE_SLABS.map(([band, rate]) => (
                <tr key={band} className="border-t border-[var(--border)]">
                  <th scope="row" className="p-3 font-normal text-[var(--muted-foreground)]">
                    {band}
                  </th>
                  <td className="p-3 font-semibold tabular-nums">{intFmt.format(rate)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Source: Para 32A, Employees&apos; Provident Funds Scheme 1952, read on {RULES_READ_ON}. The
          member-side route into that machinery is a grievance on {GRIEVANCE_PORTAL}.
        </p>
      </section>

      <p className="mt-8 rounded-md bg-[var(--card)] p-4 text-xs leading-5 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]">
        This page explains published EPFO rejection wording and the scheme provisions behind it,
        read on {RULES_READ_ON}. It files nothing, stores nothing and asks for no UAN, Aadhaar or
        bank detail. Thresholds in the EPF and EPS schemes are changed by notification and circular,
        so confirm the current text on epfindia.gov.in before relying on a figure. Nothing here is
        legal, tax or financial advice.
      </p>
    </main>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
      <dt className="text-sm text-[var(--muted-foreground)]">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}

function ReasonCard({ reason, open, onToggle, onCopy, onCopyLink, copiedSummary, copiedLink }) {
  const owner = OWNER_META[reason.owner];
  const { chip, Icon } = OWNER_STYLE[reason.owner];

  return (
    <li id={reason.id} className="scroll-mt-20">
      <details className={CARD_CLASS} open={open}>
        <summary
          className="flex cursor-pointer list-none flex-col gap-2 rounded-md focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
          onClick={(event) => {
            event.preventDefault();
            onToggle();
          }}
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold ${chip}`}>
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {owner.short} fixes it
            </span>
            {reason.forms.map((code) => (
              <span
                key={code}
                className="rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--muted-foreground)]"
              >
                Form {code}
              </span>
            ))}
          </span>
          <h3 className="text-base font-semibold">{reason.title}</h3>
          <span className="text-xs text-[var(--muted-foreground)]">
            {open ? "Hide the detail" : "Show what it means and the correction route"}
          </span>
        </summary>

        <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4">
          <div>
            <h4 className="text-sm font-semibold">How the portal words it</h4>
            <ul className="mt-2 grid gap-1.5">
              {reason.portal.map((line) => (
                <li
                  key={line}
                  className="rounded-md border border-[var(--border)] px-3 py-2 font-mono text-xs leading-5 text-[var(--muted-foreground)]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">What it actually means</h4>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{reason.meaning}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Who has to fix it</h4>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              <strong className="font-semibold text-[var(--foreground)]">{owner.label}.</strong>{" "}
              {owner.line} {reason.ownerWhy}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">The correction route EPFO defines</h4>
            <ol className="mt-2 grid list-decimal gap-1.5 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {reason.fix.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              Have ready before you start
            </h4>
            <ul className="mt-2 grid list-disc gap-1.5 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
              {reason.prepare.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs leading-5 text-[var(--muted-foreground)]">
            Rule: {reason.rule}. Read on {RULES_READ_ON}.
          </p>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={GHOST_BTN}
              onClick={onCopy}
              aria-label={`Copy the full explanation for ${reason.title}`}
            >
              {copiedSummary ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedSummary ? "Copied!" : "Copy this entry"}
            </button>
            <button
              type="button"
              className={GHOST_BTN}
              onClick={onCopyLink}
              aria-label={`Copy a direct link to ${reason.title}`}
            >
              {copiedLink ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedLink ? "Copied!" : "Copy link to this reason"}
            </button>
          </div>
        </div>
      </details>
    </li>
  );
}
