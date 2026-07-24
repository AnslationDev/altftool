"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CircleDollarSign,
  ClipboardCopy,
  FileSearch,
  Info,
  KeyRound,
  Landmark,
  LockKeyhole,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  WalletCards,
  XCircle,
} from "lucide-react";

import {
  buildUpiDecodeReport,
  decodeUpiPayload,
} from "../utils/decodeUpiPayload";

const SAMPLE_PAYLOAD =
  "upi://collect?pa=merchant%40bank&pn=Example%20Store&am=499.00&cu=INR&tn=Order%201284&tr=ALTFT1284";

const TONE_STYLES = {
  danger: "border-danger/30 bg-danger-soft text-foreground",
  warning: "border-warning/30 bg-warning-soft text-foreground",
  info: "border-info/30 bg-info-soft text-foreground",
  success: "border-success/30 bg-success-soft text-foreground",
};

const TONE_ICON_STYLES = {
  danger: "text-danger",
  warning: "text-warning",
  info: "text-info",
  success: "text-success",
};

const FIELD_ROWS = [
  ["Payee name", "payeeName"],
  ["Payee UPI ID", "payeeVpa"],
  ["Transaction reference", "transactionReference"],
  ["Transaction ID", "transactionId"],
  ["Transaction note", "note"],
  ["Merchant category", "merchantCategory"],
  ["Merchant ID", "merchantId"],
  ["Initiation mode", "mode"],
  ["Purpose code", "purpose"],
  ["Originating organization", "originatingOrganization"],
];

function formatAmount(fields) {
  if (!fields.amountRaw) return "Not fixed";
  if (fields.amountState !== "valid") return fields.amountRaw;
  if (!fields.currency) return `${fields.amountRaw} (currency not supplied)`;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: fields.currency,
      maximumFractionDigits: 2,
    }).format(fields.amount);
  } catch {
    return `${fields.currency} ${fields.amountRaw}`;
  }
}

function WarningIcon({ tone }) {
  const className = `h-5 w-5 shrink-0 ${TONE_ICON_STYLES[tone] || TONE_ICON_STYLES.info}`;
  if (tone === "danger") return <ShieldAlert aria-hidden="true" className={className} />;
  if (tone === "warning") return <AlertTriangle aria-hidden="true" className={className} />;
  if (tone === "success") return <ShieldCheck aria-hidden="true" className={className} />;
  return <Info aria-hidden="true" className={className} />;
}

function DetailCard({ icon: Icon, label, value, mono = false }) {
  return (
    <article className="min-w-0 rounded-lg border border-border bg-background p-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p
            className={`mt-2 break-all text-base font-bold text-foreground ${
              mono ? "font-mono" : ""
            }`}
          >
            {value || "Not supplied"}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function UpiCollectRequestDecoder() {
  const [payload, setPayload] = useState("");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => decodeUpiPayload(payload), [payload]);

  async function copyReport() {
    if (!result.ok || !navigator?.clipboard?.writeText) return;
    await navigator.clipboard.writeText(buildUpiDecodeReport(result));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-8 text-foreground sm:px-6 sm:pt-10 lg:px-8">
      <header className="rounded-xl border border-border bg-surface p-5 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <WalletCards aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-3xl font-bold text-foreground sm:text-4xl">
          UPI Collect Request Decoder
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
          Inspect a pasted UPI URI or QR payload locally. See who may receive money,
          the stated amount, references and whether the action is pay, collect or
          mandate.
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-lg border border-danger/30 bg-danger-soft p-4 text-left text-foreground">
          <KeyRound aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
          <div>
            <p className="font-bold">Never enter a UPI PIN to receive money.</p>
            <p className="mt-1 text-sm leading-6">
              A UPI PIN authorizes a debit. This tool never opens a payment app,
              executes a transaction or asks for a PIN.
            </p>
          </div>
        </div>
      </header>

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="tool-card min-w-0 overflow-hidden" aria-labelledby="payload-title">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <FileSearch aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="payload-title" className="text-2xl font-bold text-foreground">
                Paste payload
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Paste the text stored inside a UPI QR code. Do not paste a UPI PIN,
                OTP or banking password.
              </p>
            </div>
          </div>

          <label className="mt-5 block" htmlFor="upi-payload">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              UPI URI or QR text
            </span>
            <textarea
              id="upi-payload"
              value={payload}
              onChange={(event) => {
                setPayload(event.target.value);
                setCopied(false);
              }}
              rows={9}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              placeholder="upi://pay?pa=name@bank&pn=Payee&am=100&cu=INR"
              className="min-h-40 w-full resize-y rounded-md border border-border bg-background px-4 py-3 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-[var(--anslation-ds-focus-ring)]"
            />
          </label>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setPayload(SAMPLE_PAYLOAD);
                setCopied(false);
              }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:ring-2 focus-visible:ring-primary"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              Example
            </button>
            <button
              type="button"
              onClick={() => {
                setPayload("");
                setCopied(false);
              }}
              disabled={!payload}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-surface-soft focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Clear
            </button>
            <button
              type="button"
              onClick={copyReport}
              disabled={!result.ok}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {copied ? (
                <Check aria-hidden="true" className="h-4 w-4" />
              ) : (
                <ClipboardCopy aria-hidden="true" className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy report"}
            </button>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-success/30 bg-success-soft p-4 text-foreground">
            <LockKeyhole aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <div>
              <p className="font-semibold">Local-only inspection</p>
              <p className="mt-1 text-sm leading-6">
                Decoding happens in this browser tab. No network lookup or payee
                verification is performed.
              </p>
            </div>
          </div>
        </section>

        <section
          className="tool-card min-w-0 overflow-hidden"
          aria-labelledby="result-title"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
              <ShieldCheck aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h2 id="result-title" className="text-2xl font-bold text-foreground">
                Decoded request
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                A readable explanation only—nothing below is clickable or executable.
              </p>
            </div>
          </div>

          {!result.ok ? (
            <div
              className={`mt-5 flex min-h-40 items-center justify-center rounded-lg border p-6 text-center ${
                result.empty
                  ? "border-border bg-background text-muted-foreground"
                  : "border-danger/30 bg-danger-soft text-foreground"
              }`}
              role={result.empty ? undefined : "alert"}
            >
              <div>
                {result.empty ? (
                  <FileSearch aria-hidden="true" className="mx-auto h-8 w-8" />
                ) : (
                  <XCircle aria-hidden="true" className="mx-auto h-8 w-8 text-danger" />
                )}
                <p className="mt-3 text-sm font-semibold leading-6">{result.error}</p>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`mt-5 flex items-start gap-3 rounded-lg border p-4 ${
                  TONE_STYLES[result.actionInfo.tone]
                }`}
                role="alert"
              >
                <WarningIcon tone={result.actionInfo.tone} />
                <div>
                  <p className="font-bold">{result.actionInfo.label}</p>
                  <p className="mt-1 text-sm leading-6">{result.actionInfo.explanation}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <DetailCard
                  icon={UserRoundCheck}
                  label="Payee"
                  value={result.fields.payeeName}
                />
                <DetailCard
                  icon={Landmark}
                  label="Payee UPI ID"
                  value={result.fields.payeeVpa}
                  mono
                />
                <DetailCard
                  icon={CircleDollarSign}
                  label="Stated amount"
                  value={formatAmount(result.fields)}
                />
                <DetailCard
                  icon={ShieldCheck}
                  label="Action"
                  value={result.actionInfo.label}
                />
              </div>

              {result.fields.referenceUrl ? (
                <div className="mt-4 rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Reference URL — displayed as text only
                  </p>
                  <p className="mt-2 break-all font-mono text-sm font-semibold text-foreground">
                    {result.fields.referenceUrl}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>

      {result.ok ? (
        <>
          <section className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
            <article className="tool-card min-w-0 overflow-hidden">
              <h2 className="text-2xl font-bold text-foreground">Request details</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Values are decoded from the payload, not confirmed with a bank.
              </p>
              <dl className="mt-5 divide-y divide-border rounded-lg border border-border bg-background">
                {FIELD_ROWS.map(([label, key]) => (
                  <div
                    key={key}
                    className="grid min-w-0 gap-1 p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4"
                  >
                    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                    <dd className="break-all text-sm font-semibold text-foreground sm:text-right">
                      {result.fields[key] || "Not supplied"}
                    </dd>
                  </div>
                ))}
                <div className="grid min-w-0 gap-1 p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Minimum amount</dt>
                  <dd className="break-all text-sm font-semibold text-foreground sm:text-right">
                    {result.fields.minimumAmountRaw
                      ? `${result.fields.currency || "Currency not supplied"} ${
                          result.fields.minimumAmountRaw
                        }`
                      : "Not supplied"}
                  </dd>
                </div>
                <div className="grid min-w-0 gap-1 p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-4">
                  <dt className="text-sm font-medium text-muted-foreground">Signature field</dt>
                  <dd className="text-sm font-semibold text-foreground sm:text-right">
                    {result.fields.hasSignature
                      ? "Present, not cryptographically verified"
                      : "Not supplied"}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="tool-card min-w-0 overflow-hidden">
              <h2 className="text-2xl font-bold text-foreground">Safety review</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Review every warning before opening any separate payment app.
              </p>
              <div className="mt-5 space-y-3">
                {result.warnings.map((warning) => (
                  <div
                    key={warning.code}
                    className={`flex items-start gap-3 rounded-lg border p-4 ${
                      TONE_STYLES[warning.tone]
                    }`}
                  >
                    <WarningIcon tone={warning.tone} />
                    <div className="min-w-0">
                      <p className="break-words font-semibold">{warning.title}</p>
                      <p className="mt-1 break-words text-sm leading-6">{warning.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="tool-card mt-6 min-w-0 overflow-hidden">
            <h2 className="text-2xl font-bold text-foreground">All payload fields</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Field names and raw decoded values are included so hidden extras are not
              silently ignored.
            </p>
            {result.parameters.length ? (
              <div className="mt-5 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-xl border-collapse text-left">
                  <thead className="bg-surface-soft text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Key
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Meaning
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Decoded value
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {result.parameters.map((parameter, index) => (
                      <tr key={`${parameter.key}-${index}`}>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-foreground">
                          {parameter.key}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {parameter.label}
                        </td>
                        <td className="max-w-md break-all px-4 py-3 font-mono text-sm text-foreground">
                          {parameter.value || "(empty)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
                This UPI URI contains no query fields.
              </div>
            )}
          </section>
        </>
      ) : null}

      <aside className="mt-6 rounded-lg border border-info/30 bg-info-soft p-4 text-foreground">
        <div className="flex items-start gap-3">
          <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-info" />
          <p className="text-sm leading-6">
            A syntactically valid UPI URI is not proof that a merchant, name, amount or
            request is genuine. Verify the final payee and debit amount inside your
            trusted bank or UPI app.
          </p>
        </div>
      </aside>
    </main>
  );
}
