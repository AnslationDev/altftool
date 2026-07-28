"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShoppingCart } from "lucide-react";

import {
  CLAIM_HEADS,
  NATIONAL_CONSUMER_HELPLINE,
  ORDER_PROBLEMS,
  buildEcommerceComplaint,
  computeClaim,
  computeLimitation,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DASH = "—";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const money = (value) => (Number.isFinite(value) ? INR.format(value) : DASH);

const DEFAULTS = {
  consumerName: "Meera Iyer",
  consumerAddress: "8 Lake View Apartments, Adyar, Chennai 600020",
  consumerPhone: "+91 98400 00000",
  consumerEmail: "meera.iyer@example.com",
  platformName: "ShopKart India Pvt Ltd",
  sellerName: "Bluewave Retail LLP",
  orderNumber: "SK-2026-778812",
  itemDescription: "a 14-inch laptop, model X230",
  orderDate: "2026-06-10",
  incidentDate: "2026-06-20",
  problemId: "damaged",
  claimHeadIds: ["mental-agony", "litigation-cost"],
  noticeDays: 15,
  noticeDate: "2026-08-03",
  filingDate: "2026-09-01",
  complaintsMadeText: "Ticket 88214 raised on 20 June 2026 and a reminder on 5 July 2026.",
  considerationPaid: 45000,
  shippingPaid: 99,
  incidentalCost: 2000,
  compensationClaim: 10000,
  interestClaim: 0,
  litigationCost: 5000,
};

export default function ToolHome() {
  const [consumerName, setConsumerName] = useState(DEFAULTS.consumerName);
  const [consumerAddress, setConsumerAddress] = useState(DEFAULTS.consumerAddress);
  const [consumerPhone, setConsumerPhone] = useState(DEFAULTS.consumerPhone);
  const [consumerEmail, setConsumerEmail] = useState(DEFAULTS.consumerEmail);
  const [platformName, setPlatformName] = useState(DEFAULTS.platformName);
  const [sellerName, setSellerName] = useState(DEFAULTS.sellerName);
  const [orderNumber, setOrderNumber] = useState(DEFAULTS.orderNumber);
  const [itemDescription, setItemDescription] = useState(DEFAULTS.itemDescription);
  const [orderDate, setOrderDate] = useState(DEFAULTS.orderDate);
  const [incidentDate, setIncidentDate] = useState(DEFAULTS.incidentDate);
  const [problemId, setProblemId] = useState(DEFAULTS.problemId);
  const [claimHeadIds, setClaimHeadIds] = useState(DEFAULTS.claimHeadIds);
  const [noticeDays, setNoticeDays] = useState(String(DEFAULTS.noticeDays));
  const [noticeDate, setNoticeDate] = useState(DEFAULTS.noticeDate);
  const [filingDate, setFilingDate] = useState(DEFAULTS.filingDate);
  const [complaintsMadeText, setComplaintsMadeText] = useState(DEFAULTS.complaintsMadeText);

  const [considerationPaid, setConsiderationPaid] = useState(String(DEFAULTS.considerationPaid));
  const [shippingPaid, setShippingPaid] = useState(String(DEFAULTS.shippingPaid));
  const [incidentalCost, setIncidentalCost] = useState(String(DEFAULTS.incidentalCost));
  const [compensationClaim, setCompensationClaim] = useState(String(DEFAULTS.compensationClaim));
  const [interestClaim, setInterestClaim] = useState(String(DEFAULTS.interestClaim));
  const [litigationCost, setLitigationCost] = useState(String(DEFAULTS.litigationCost));

  const [copiedNotice, setCopiedNotice] = useState(false);
  const [copiedOutline, setCopiedOutline] = useState(false);

  const claim = useMemo(
    () =>
      computeClaim({
        considerationPaid: Number(considerationPaid),
        shippingPaid: Number(shippingPaid),
        incidentalCost: Number(incidentalCost),
        compensationClaim: Number(compensationClaim),
        interestClaim: Number(interestClaim),
        litigationCost: Number(litigationCost),
      }),
    [considerationPaid, shippingPaid, incidentalCost, compensationClaim, interestClaim, litigationCost],
  );

  const limitation = useMemo(
    () => computeLimitation({ causeOfActionDate: incidentDate, filingDate }),
    [incidentDate, filingDate],
  );

  const draft = useMemo(
    () =>
      buildEcommerceComplaint({
        consumerName,
        consumerAddress,
        consumerPhone,
        consumerEmail,
        platformName,
        sellerName,
        orderNumber,
        itemDescription,
        orderDate,
        incidentDate,
        problemId,
        claimHeadIds,
        noticeDays: Number(noticeDays),
        noticeDate,
        complaintsMadeText,
        claim,
        limitation,
      }),
    [
      consumerName,
      consumerAddress,
      consumerPhone,
      consumerEmail,
      platformName,
      sellerName,
      orderNumber,
      itemDescription,
      orderDate,
      incidentDate,
      problemId,
      claimHeadIds,
      noticeDays,
      noticeDate,
      complaintsMadeText,
      claim,
      limitation,
    ],
  );

  const claimError = Boolean(claim.error);
  const limitationError = Boolean(limitation.error);
  const draftError = Boolean(draft.error);

  const toggleHead = (id) => {
    setClaimHeadIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyNotice = async () => {
    if (draftError) return;
    try {
      await navigator.clipboard.writeText(draft.notice);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 1500);
    } catch {
      setCopiedNotice(false);
    }
  };

  const copyOutline = async () => {
    if (draftError) return;
    try {
      await navigator.clipboard.writeText(draft.complaintOutline);
      setCopiedOutline(true);
      setTimeout(() => setCopiedOutline(false), 1500);
    } catch {
      setCopiedOutline(false);
    }
  };

  const reset = () => {
    setConsumerName(DEFAULTS.consumerName);
    setConsumerAddress(DEFAULTS.consumerAddress);
    setConsumerPhone(DEFAULTS.consumerPhone);
    setConsumerEmail(DEFAULTS.consumerEmail);
    setPlatformName(DEFAULTS.platformName);
    setSellerName(DEFAULTS.sellerName);
    setOrderNumber(DEFAULTS.orderNumber);
    setItemDescription(DEFAULTS.itemDescription);
    setOrderDate(DEFAULTS.orderDate);
    setIncidentDate(DEFAULTS.incidentDate);
    setProblemId(DEFAULTS.problemId);
    setClaimHeadIds(DEFAULTS.claimHeadIds);
    setNoticeDays(String(DEFAULTS.noticeDays));
    setNoticeDate(DEFAULTS.noticeDate);
    setFilingDate(DEFAULTS.filingDate);
    setComplaintsMadeText(DEFAULTS.complaintsMadeText);
    setConsiderationPaid(String(DEFAULTS.considerationPaid));
    setShippingPaid(String(DEFAULTS.shippingPaid));
    setIncidentalCost(String(DEFAULTS.incidentalCost));
    setCompensationClaim(String(DEFAULTS.compensationClaim));
    setInterestClaim(String(DEFAULTS.interestClaim));
    setLitigationCost(String(DEFAULTS.litigationCost));
    setCopiedNotice(false);
    setCopiedOutline(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          Consumer law
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Consumer Complaint Letter for Ecommerce Order
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Writes the notice that has to go first, then the outline of the complaint — with the right
          commission worked out from the consideration paid, as Section 34(1) of the Consumer
          Protection Act 2019 requires, and the two-year limitation date checked.
        </p>
      </header>

      <section className={CARD} aria-labelledby="order-heading">
        <h2 id="order-heading" className="text-base font-semibold">
          The order and what went wrong
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-platform">
              Platform or store
            </label>
            <input
              id="ec-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={platformName}
              onChange={(event) => setPlatformName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-seller">
              Seller of record (if different)
            </label>
            <input
              id="ec-seller"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={sellerName}
              onChange={(event) => setSellerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-order-no">
              Order number
            </label>
            <input
              id="ec-order-no"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-item">
              What was ordered
            </label>
            <input
              id="ec-item"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={itemDescription}
              onChange={(event) => setItemDescription(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-order-date">
              Order placed on
            </label>
            <input
              id="ec-order-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={orderDate}
              onChange={(event) => setOrderDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-incident">
              Problem arose on (cause of action)
            </label>
            <input
              id="ec-incident"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={incidentDate}
              onChange={(event) => setIncidentDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-notice-date">
              Notice dated
            </label>
            <input
              id="ec-notice-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-notice-days">
              Days to comply
            </label>
            <input
              id="ec-notice-days"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="90"
              step="1"
              value={noticeDays}
              onChange={(event) => setNoticeDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-filing">
              Complaint to be filed on
            </label>
            <input
              id="ec-filing"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={filingDate}
              onChange={(event) => setFilingDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ec-problem">
              What went wrong
            </label>
            <select
              id="ec-problem"
              className={`mt-2 ${INPUT_CLASS}`}
              value={problemId}
              onChange={(event) => setProblemId(event.target.value)}
            >
              {ORDER_PROBLEMS.map((problem) => (
                <option key={problem.id} value={problem.id}>
                  {problem.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ec-earlier">
              Complaints already made (ticket numbers and dates)
            </label>
            <textarea
              id="ec-earlier"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={complaintsMadeText}
              onChange={(event) => setComplaintsMadeText(event.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="claim-heading">
        <h2 id="claim-heading" className="text-base font-semibold">
          What the claim is worth
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-consideration">
              Amount paid for the goods (INR)
            </label>
            <input
              id="ec-consideration"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={considerationPaid}
              onChange={(event) => setConsiderationPaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-shipping">
              Shipping and handling paid (INR)
            </label>
            <input
              id="ec-shipping"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={shippingPaid}
              onChange={(event) => setShippingPaid(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-incidental">
              Out-of-pocket costs caused (INR)
            </label>
            <input
              id="ec-incidental"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={incidentalCost}
              onChange={(event) => setIncidentalCost(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-compensation">
              Compensation claimed (INR)
            </label>
            <input
              id="ec-compensation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={compensationClaim}
              onChange={(event) => setCompensationClaim(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-interest">
              Interest claimed (INR)
            </label>
            <input
              id="ec-interest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={interestClaim}
              onChange={(event) => setInterestClaim(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-litigation">
              Cost of the proceeding (INR)
            </label>
            <input
              id="ec-litigation"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={litigationCost}
              onChange={(event) => setLitigationCost(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Heads of claim to plead</legend>
          <div className="mt-2 grid gap-1 sm:grid-cols-2">
            {CLAIM_HEADS.map((head) => (
              <label
                key={head.id}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm"
                htmlFor={`ec-head-${head.id}`}
              >
                <input
                  id={`ec-head-${head.id}`}
                  type="checkbox"
                  className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                  checked={claimHeadIds.includes(head.id)}
                  onChange={() => toggleHead(head.id)}
                />
                {head.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="you-heading">
        <h2 id="you-heading" className="text-base font-semibold">
          Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-name">
              Your name
            </label>
            <input
              id="ec-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={consumerName}
              onChange={(event) => setConsumerName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-phone">
              Phone
            </label>
            <input
              id="ec-phone"
              className={`mt-2 ${INPUT_CLASS}`}
              type="tel"
              value={consumerPhone}
              onChange={(event) => setConsumerPhone(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ec-email">
              Email
            </label>
            <input
              id="ec-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={consumerEmail}
              onChange={(event) => setConsumerEmail(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ec-address">
              Your address
            </label>
            <textarea
              id="ec-address"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={consumerAddress}
              onChange={(event) => setConsumerAddress(event.target.value)}
            />
          </div>
        </div>
      </section>

      {claimError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {claim.error}
        </p>
      ) : null}
      {limitationError ? (
        <p role="alert" className={`mt-4 ${ERROR_CLASS}`}>
          {limitation.error}
        </p>
      ) : null}
      {draftError && !claimError && !limitationError ? (
        <p role="alert" className={`mt-6 ${ERROR_CLASS}`}>
          {draft.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Total claim
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {claimError ? DASH : money(claim.totalClaim)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {claimError ? DASH : claim.forum}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyNotice}
              disabled={draftError}
              aria-label="Copy the notice"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedNotice ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedNotice ? "Copied!" : "Copy notice"}
            </button>
            <button
              type="button"
              onClick={copyOutline}
              disabled={draftError}
              aria-label="Copy the complaint outline"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copiedOutline ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copiedOutline ? "Copied!" : "Copy outline"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset every field to its default"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Consideration paid (fixes the forum)", claimError ? DASH : money(claim.considerationPaid)],
            ["Refund to demand now", claimError ? DASH : money(claim.refundableNow)],
            ["Total claim including compensation", claimError ? DASH : money(claim.totalClaim)],
            ["Commission to approach", claimError ? DASH : claim.forum],
            [
              "Fee on filing",
              claimError ? DASH : claim.nilFee ? "Nil under the 2020 Rules" : "Payable — check the current slab",
            ],
            ["Last date to file (Section 69(1))", limitationError ? DASH : limitation.lastDate.long],
            [
              "Days left on the limitation",
              limitationError ? DASH : NUM.format(limitation.daysLeft),
            ],
            [
              "Within limitation",
              limitationError ? DASH : limitation.withinTime ? "Yes" : "No — Section 69(2) condonation needed",
            ],
            ["Comply-by date in the notice", draftError ? DASH : draft.complyBy.long],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!claimError ? (
          <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
            Forum: {claim.forumBasis}. Territorially you may file where you reside or work, under
            Section 34(2)(d).
          </p>
        ) : null}
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="notice-out">
        <h2 id="notice-out" className="text-base font-semibold">
          Step 1 — notice to the platform and seller
        </h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {draftError ? DASH : draft.notice}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="outline-out">
        <h2 id="outline-out" className="text-base font-semibold">
          Step 2 — complaint outline if the notice is ignored
        </h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 whitespace-pre-wrap">
          {draftError ? DASH : draft.complaintOutline}
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Under Section 34(1) of the Consumer Protection Act
        2019 the commission is chosen by the consideration paid — up to Rs 50 lakh the District
        Commission, above that and up to Rs 2 crore the State Commission, and above Rs 2 crore the
        National Commission. A complaint must be filed within two years of the cause of action under
        Section 69(1). You can also call the National Consumer Helpline on{" "}
        {NATIONAL_CONSUMER_HELPLINE} or file online on the e-Daakhil portal. Have a lawyer settle
        the pleadings before filing anything of value.
      </p>
    </main>
  );
}
