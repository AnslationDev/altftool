"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";
import {
  DEFAULT_KDF_ROUNDS,
  KEY_TYPES,
  SECURITY_FLOORS,
  TARGETS,
  buildKeygenCommand,
  rankKeyTypes,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  target: "modern",
  securityFloor: "128",
  hardwareToken: false,
  fipsRequired: false,
  keyPath: "~/.ssh/id_ed25519",
  comment: "you@workstation",
  kdfRounds: String(DEFAULT_KDF_ROUNDS),
  remoteHost: "",
  residentKey: false,
  verifyRequired: false,
  overrideType: "",
};

export default function ToolHome() {
  const [target, setTarget] = useState(DEFAULTS.target);
  const [securityFloor, setSecurityFloor] = useState(DEFAULTS.securityFloor);
  const [hardwareToken, setHardwareToken] = useState(DEFAULTS.hardwareToken);
  const [fipsRequired, setFipsRequired] = useState(DEFAULTS.fipsRequired);
  const [keyPath, setKeyPath] = useState(DEFAULTS.keyPath);
  const [comment, setComment] = useState(DEFAULTS.comment);
  const [kdfRounds, setKdfRounds] = useState(DEFAULTS.kdfRounds);
  const [remoteHost, setRemoteHost] = useState(DEFAULTS.remoteHost);
  const [residentKey, setResidentKey] = useState(DEFAULTS.residentKey);
  const [verifyRequired, setVerifyRequired] = useState(DEFAULTS.verifyRequired);
  const [overrideType, setOverrideType] = useState(DEFAULTS.overrideType);
  const [copied, setCopied] = useState(false);

  const ranking = useMemo(
    () => rankKeyTypes({ target, hardwareToken, fipsRequired, securityFloor: Number(securityFloor) }),
    [target, hardwareToken, fipsRequired, securityFloor],
  );

  const chosenId = overrideType || (ranking.recommended ? ranking.recommended.id : "");

  const keygen = useMemo(
    () =>
      chosenId
        ? buildKeygenCommand({
            typeId: chosenId,
            keyPath,
            comment,
            kdfRounds: Number(kdfRounds),
            residentKey,
            verifyRequired,
            remoteHost,
          })
        : { error: "Adjust the constraints until at least one key type qualifies." },
    [chosenId, keyPath, comment, kdfRounds, residentKey, verifyRequired, remoteHost],
  );

  const error = ranking.error || keygen.error || "";

  const copyResult = async () => {
    if (!keygen.command) return;
    try {
      await navigator.clipboard.writeText(keygen.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setTarget(DEFAULTS.target);
    setSecurityFloor(DEFAULTS.securityFloor);
    setHardwareToken(DEFAULTS.hardwareToken);
    setFipsRequired(DEFAULTS.fipsRequired);
    setKeyPath(DEFAULTS.keyPath);
    setComment(DEFAULTS.comment);
    setKdfRounds(DEFAULTS.kdfRounds);
    setRemoteHost(DEFAULTS.remoteHost);
    setResidentKey(DEFAULTS.residentKey);
    setVerifyRequired(DEFAULTS.verifyRequired);
    setOverrideType(DEFAULTS.overrideType);
    setCopied(false);
  };

  const recommended = ranking.recommended ?? null;
  const chosen = KEY_TYPES.find((item) => item.id === chosenId) ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          SSH keys
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">SSH Key Type Chooser</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Set the compatibility and policy constraints you actually have, and see which of Ed25519,
          ECDSA and RSA survives — with strengths taken from NIST SP 800-57 and the exact ssh-keygen
          command to run.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="ssh-target">
              Which servers must accept this key?
            </label>
            <select id="ssh-target" className={`mt-2 ${INPUT_CLASS}`} value={target} onChange={(e) => setTarget(e.target.value)}>
              {TARGETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-floor">
              Required security strength
            </label>
            <select
              id="ssh-floor"
              className={`mt-2 ${INPUT_CLASS}`}
              value={securityFloor}
              onChange={(e) => setSecurityFloor(e.target.value)}
            >
              {SECURITY_FLOORS.map((bits) => (
                <option key={bits} value={String(bits)}>
                  {bits}-bit
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>128-bit is the normal answer for anything not under a written policy.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-rounds">
              KDF rounds for the private key (-a)
            </label>
            <input
              id="ssh-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="1000"
              step="1"
              value={kdfRounds}
              onChange={(e) => setKdfRounds(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label htmlFor="ssh-hw" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
            <input
              id="ssh-hw"
              type="checkbox"
              className="accent-[var(--primary)]"
              checked={hardwareToken}
              onChange={(e) => {
                setHardwareToken(e.target.checked);
                setOverrideType("");
              }}
            />
            Key must live on a FIDO2 security key
          </label>
          <label htmlFor="ssh-fips" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
            <input
              id="ssh-fips"
              type="checkbox"
              className="accent-[var(--primary)]"
              checked={fipsRequired}
              onChange={(e) => {
                setFipsRequired(e.target.checked);
                setOverrideType("");
              }}
            />
            A FIPS-validated module is mandated
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended key type
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {error && !recommended ? "—" : recommended?.label}
            </p>
            {recommended && !ranking.error ? (
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{recommended.summary}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the ssh-keygen command"
              className={GHOST_BTN}
              disabled={Boolean(keygen.error)}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy command"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {error}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Security strength</dt>
            <dd className="text-right font-semibold">{chosen && !error ? `${chosen.securityBits}-bit` : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Public key size</dt>
            <dd className="text-right font-semibold">{chosen && !error ? `${chosen.publicKeyBytes} bytes` : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Signature size</dt>
            <dd className="text-right font-semibold">{chosen && !error ? `${chosen.signatureBytes} bytes` : "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Available since</dt>
            <dd className="text-right font-semibold">
              {chosen && !error ? `OpenSSH ${chosen.minOpenSsh || "3.x"}` : "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-5 overflow-x-auto rounded-md bg-[var(--muted)] p-4">
          <code className="block whitespace-pre font-mono text-sm font-semibold text-[var(--primary)]">
            {keygen.error ? "—" : keygen.command}
          </code>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-override">
              Key type to generate
            </label>
            <select
              id="ssh-override"
              className={`mt-2 ${INPUT_CLASS}`}
              value={overrideType}
              onChange={(e) => setOverrideType(e.target.value)}
            >
              <option value="">Use the recommendation</option>
              {KEY_TYPES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-path">
              Key file path
            </label>
            <input
              id="ssh-path"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={keyPath}
              onChange={(e) => setKeyPath(e.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-comment">
              Comment (-C)
            </label>
            <input
              id="ssh-comment"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className={HINT_CLASS}>Name the machine, not the person — it is how you audit authorized_keys later.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="ssh-host">
              Copy to host (optional)
            </label>
            <input
              id="ssh-host"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="deploy@app.example.com"
              value={remoteHost}
              onChange={(e) => setRemoteHost(e.target.value)}
            />
          </div>
        </div>

        {chosen && chosen.hardware ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label htmlFor="ssh-resident" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
              <input
                id="ssh-resident"
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={residentKey}
                onChange={(e) => setResidentKey(e.target.checked)}
              />
              Resident key (-O resident)
            </label>
            <label htmlFor="ssh-verify" className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-[var(--border)] px-3 py-2 text-sm">
              <input
                id="ssh-verify"
                type="checkbox"
                className="accent-[var(--primary)]"
                checked={verifyRequired}
                onChange={(e) => setVerifyRequired(e.target.checked)}
              />
              Require PIN (-O verify-required)
            </label>
          </div>
        ) : null}
      </section>

      {!ranking.error && ranking.ranked ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Key types that fit your constraints</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Type</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Strength</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Pub key</th>
                  <th scope="col" className="py-2 text-right font-semibold">Signature</th>
                </tr>
              </thead>
              <tbody>
                {ranking.ranked.map((item) => (
                  <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{item.label}</td>
                    <td className="py-2 pr-3 text-right">{item.securityBits}-bit</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">{item.publicKeyBytes} B</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{item.signatureBytes} B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recommended ? (
            <ul className="mt-4 space-y-2 text-sm text-[var(--muted-foreground)]">
              {recommended.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--primary)]">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {!keygen.error && keygen.followUps ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">After you generate it</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {keygen.followUps.map(([cmd, why]) => (
              <li key={cmd}>
                <div className="overflow-x-auto rounded-md bg-[var(--muted)] px-3 py-2">
                  <code className="whitespace-pre font-mono text-[var(--foreground)]">{cmd}</code>
                </div>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{why}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!keygen.error && keygen.warnings ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Watch out for</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
            {keygen.warnings.map((warning) => (
              <li key={warning} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--danger)]">•</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison only. Where a compliance regime applies, confirm the algorithm
        against your validated module's certificate before you standardise on it.
      </p>
    </main>
  );
}
