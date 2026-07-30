"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Fingerprint, RotateCcw } from "lucide-react";

import {
  CEREMONY_ERRORS,
  FLAG_BITS,
  SAMPLE_ASSERTION,
  SAMPLE_REGISTRATION,
  debugWebauthn,
  formatReport,
} from "../lib";

const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA =
  "mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const SEVERITY_STYLE = {
  error: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)]",
  info: "bg-[var(--info-soft)] text-[var(--info)]",
};

const SAMPLE_ERROR = `{
  "name": "InvalidStateError",
  "message": "The authenticator was previously registered"
}`;

function Row({ term, children }) {
  return (
    <div className="border-b border-[var(--border)] py-2 last:border-b-0">
      <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{term}</dt>
      <dd className="mt-1 break-all text-sm">{children}</dd>
    </div>
  );
}

export default function ToolHome() {
  const [raw, setRaw] = useState(SAMPLE_REGISTRATION);
  const [expectedRpId, setExpectedRpId] = useState("");
  const [expectedOrigin, setExpectedOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => debugWebauthn(raw, { expectedRpId, expectedOrigin }),
    [raw, expectedRpId, expectedOrigin],
  );
  const report = useMemo(() => formatReport(result), [result]);

  const copyReport = async () => {
    if (!report) return;
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setRaw(SAMPLE_REGISTRATION);
    setExpectedRpId("");
    setExpectedOrigin("");
    setCopied(false);
  };

  const authData = result.authData && !result.authData.error ? result.authData : null;
  const acd = authData && authData.attestedCredentialData ? authData.attestedCredentialData : null;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Fingerprint className="h-4 w-4" aria-hidden="true" />
          Passkey ceremony decoder
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">WebAuthn Ceremony Debugger</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the JSON from a <code className="font-mono">navigator.credentials.create()</code> or{" "}
          <code className="font-mono">get()</code> call. It base64url-decodes clientDataJSON, walks the
          CBOR of the attestation object, reads the authenticator data byte by byte — rpIdHash, all
          eight flag bits, the signature counter, the AAGUID, the credential ID and the COSE public key
          — and unpacks the DER signature. Paste a DOMException name instead and it explains what makes
          the browser throw it.
        </p>
      </header>

      <section className={CARD}>
        <label className={LABEL} htmlFor="webauthn-json">
          Credential JSON, or a DOMException name
        </label>
        <textarea
          id="webauthn-json"
          className={TEXTAREA}
          rows={12}
          spellCheck="false"
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder='{"id":"…","type":"public-key","response":{"clientDataJSON":"…"}}'
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="expected-rpid">
              Expected RP ID
            </label>
            <input
              id="expected-rpid"
              className={INPUT}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={expectedRpId}
              onChange={(event) => setExpectedRpId(event.target.value)}
              placeholder="example.com (defaults to the origin's host)"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              SHA-256 of this string is computed here and compared with the rpIdHash the authenticator
              signed.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="expected-origin">
              Expected origin (optional)
            </label>
            <input
              id="expected-origin"
              className={INPUT}
              type="text"
              autoComplete="off"
              spellCheck="false"
              value={expectedOrigin}
              onChange={(event) => setExpectedOrigin(event.target.value)}
              placeholder="https://example.com"
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Compared byte for byte with clientData.origin, the way your server should.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className={PRIMARY_BTN} onClick={copyReport} disabled={!report}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Report copied" : "Copy report"}
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw(SAMPLE_REGISTRATION)}>
            Registration example
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw(SAMPLE_ASSERTION)}>
            Assertion example
          </button>
          <button type="button" className={GHOST_BTN} onClick={() => setRaw(SAMPLE_ERROR)}>
            Error example
          </button>
          <button type="button" className={GHOST_BTN} onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-4 py-3 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      {!result.error && result.kind === "error" && (
        <section className={`mt-6 ${CARD}`}>
          <h2 className="text-lg font-semibold">{result.errorName}</h2>
          {result.message && <p className="mt-1 font-mono text-xs text-[var(--muted-foreground)]">{result.message}</p>}
          <p className="mt-3 text-sm leading-6">{result.explanation}</p>
        </section>
      )}

      {!result.error && result.kind !== "error" && (
        <>
          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-lg font-semibold">
              {result.kind === "registration" ? "Registration (webauthn.create)" : "Assertion (webauthn.get)"}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {result.counts.error} error · {result.counts.warning} warning · {result.counts.info} note
            </p>
            {result.findings.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Nothing structurally wrong found in this response.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {result.findings.map((finding) => (
                  <li key={finding.id} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${SEVERITY_STYLE[finding.severity]}`}>
                        {finding.severity}
                      </span>
                      <span className="font-semibold">{finding.title}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{finding.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {result.clientData && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">clientDataJSON, decoded</h2>
              <dl className="mt-3">
                <Row term="type">{result.clientData.type}</Row>
                <Row term="origin">{result.clientData.origin}</Row>
                <Row term="challenge">
                  {result.clientData.challenge}
                  <span className="ml-2 text-[var(--muted-foreground)]">
                    {result.clientData.challengeByteLength !== null
                      ? `(${result.clientData.challengeByteLength} bytes decoded)`
                      : `(${result.clientData.challengeError})`}
                  </span>
                </Row>
                <Row term="crossOrigin">{String(result.clientData.crossOrigin)}</Row>
                {result.clientData.topOrigin && <Row term="topOrigin">{result.clientData.topOrigin}</Row>}
                {result.clientData.extraKeys.length > 0 && (
                  <Row term="other keys">{result.clientData.extraKeys.join(", ")}</Row>
                )}
              </dl>
              <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                This is the exact {result.clientData.byteLength}-byte string the authenticator hashed;
                your server must compare the challenge against the one it issued and never trust these
                fields from anywhere else.
              </p>
            </section>
          )}

          {authData && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Authenticator data ({authData.totalLength} bytes)</h2>
              <dl className="mt-3">
                <Row term="rpIdHash (32 bytes)">{authData.rpIdHash}</Row>
                <Row term="flags (1 byte)">{authData.flagsHex}</Row>
                <Row term="signature counter (4 bytes)">{authData.signCount}</Row>
              </dl>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th className="py-2 pr-3 font-semibold">Bit</th>
                      <th className="py-2 pr-3 font-semibold">Flag</th>
                      <th className="py-2 pr-3 font-semibold">Set</th>
                      <th className="py-2 font-semibold">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FLAG_BITS.map(([name, mask, meaning], index) => (
                      <tr key={name} className="border-b border-[var(--border)] align-top">
                        <td className="py-2 pr-3 font-mono text-xs">{index}</td>
                        <td className="py-2 pr-3 font-semibold">{name}</td>
                        <td className={`py-2 pr-3 font-semibold ${authData.flags[name] ? "text-[var(--success)]" : "text-[var(--muted-foreground)]"}`}>
                          {authData.flags[name] ? "1" : "0"}
                        </td>
                        <td className="py-2 leading-6 text-[var(--muted-foreground)]">{meaning}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {result.rpIdCheck && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">RP ID check</h2>
              <p className="mt-2 text-sm leading-6">
                SHA-256(<code className="font-mono">{result.rpIdCheck.candidate}</code>) computed in this
                tab is{" "}
                <span className="font-mono text-xs break-all">{result.rpIdCheck.computed}</span>.
              </p>
              <p
                className={`mt-3 rounded-md px-3 py-2 text-sm font-semibold ${
                  result.rpIdCheck.matches
                    ? "bg-[var(--success-soft)] text-[var(--success)]"
                    : "bg-[var(--danger-soft)] text-[var(--danger)]"
                }`}
                role={result.rpIdCheck.matches ? undefined : "alert"}
              >
                {result.rpIdCheck.matches
                  ? "Matches the rpIdHash inside authenticatorData."
                  : "Does not match the rpIdHash inside authenticatorData."}
              </p>
            </section>
          )}

          {acd && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Attested credential data</h2>
              <dl className="mt-3">
                <Row term="AAGUID">
                  {acd.aaguid}
                  {acd.aaguidLabel && <span className="ml-2 text-[var(--muted-foreground)]">{acd.aaguidLabel}</span>}
                </Row>
                <Row term={`credential ID (${acd.credentialIdLength} bytes)`}>{acd.credentialId}</Row>
                <Row term="credential ID in hex">{acd.credentialIdHex}</Row>
              </dl>
              {!acd.aaguidLabel && (
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  This AAGUID is not in the short built-in list. Look it up in the FIDO Metadata Service
                  to name the authenticator model.
                </p>
              )}
              {acd.publicKey && !acd.publicKey.error && (
                <div className="mt-4">
                  <h3 className="font-semibold">COSE public key</h3>
                  <dl className="mt-2">
                    <Row term="key type (kty)">{acd.publicKey.keyType}</Row>
                    <Row term="algorithm (alg)">
                      {acd.publicKey.algorithm} ({acd.publicKey.algValue})
                    </Row>
                    {acd.publicKey.fields.map(([term, value]) => (
                      <Row key={term} term={term}>
                        {value}
                      </Row>
                    ))}
                  </dl>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                    {acd.publicKey.algorithmDetail}
                  </p>
                </div>
              )}
              {acd.publicKey && acd.publicKey.error && (
                <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                  {acd.publicKey.error}
                </p>
              )}
            </section>
          )}

          {result.attestation && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Attestation statement</h2>
              <dl className="mt-3">
                <Row term="fmt">{String(result.attestation.fmt)}</Row>
                <Row term="attStmt keys">
                  {result.attestation.attStmtKeys.length ? result.attestation.attStmtKeys.join(", ") : "(empty map)"}
                </Row>
                {result.attestation.details.map(([term, value]) => (
                  <Row key={term} term={term}>
                    {value}
                  </Row>
                ))}
              </dl>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.attestation.fmtDescription}
              </p>
            </section>
          )}

          {result.signature && result.signature.format && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Signature</h2>
              <dl className="mt-3">
                <Row term="encoding">{result.signature.format.toUpperCase()}</Row>
                {result.signature.length ? <Row term="length">{result.signature.length} bytes</Row> : null}
                {result.signature.r && <Row term="r">{result.signature.r}</Row>}
                {result.signature.s && <Row term="s">{result.signature.s}</Row>}
              </dl>
              {result.signature.error && (
                <p role="alert" className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                  {result.signature.error}
                </p>
              )}
              {result.signature.note && (
                <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{result.signature.note}</p>
              )}
            </section>
          )}

          {authData && authData.extensions && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Authenticator extension outputs</h2>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs">
                {JSON.stringify(authData.extensions, null, 2)}
              </pre>
            </section>
          )}

          {result.credential.clientExtensionResults && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-lg font-semibold">Client extension results</h2>
              <pre className="mt-3 overflow-x-auto rounded-md bg-[var(--muted)] p-3 font-mono text-xs">
                {JSON.stringify(result.credential.clientExtensionResults, null, 2)}
              </pre>
              <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                credProps.rk tells you whether a discoverable credential (a passkey usable without a
                username) was actually created. It is advisory and some browsers omit it entirely.
              </p>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-lg font-semibold">Credential envelope</h2>
            <dl className="mt-3">
              <Row term="id">{result.credential.id || "(none)"}</Row>
              <Row term="type">{String(result.credential.type)}</Row>
              {result.credential.authenticatorAttachment && (
                <Row term="authenticatorAttachment">{result.credential.authenticatorAttachment}</Row>
              )}
              {result.credential.transports && <Row term="transports">{result.credential.transports.join(", ")}</Row>}
              {result.credential.publicKeyAlgorithm !== null && (
                <Row term="publicKeyAlgorithm">{result.credential.publicKeyAlgorithm}</Row>
              )}
              {result.credential.userHandle && <Row term="userHandle">{result.credential.userHandle}</Row>}
            </dl>
          </section>
        </>
      )}

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-lg font-semibold">What the browser throws, and why</h2>
        <div className="mt-3 space-y-3">
          {Object.entries(CEREMONY_ERRORS).map(([name, explanation]) => (
            <div key={name}>
              <p className="font-mono text-sm font-semibold">{name}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`mt-6 ${CARD}`}>
        <h2 className="text-lg font-semibold">What this does not do</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          It decodes and structurally checks. It does not verify the assertion signature — that needs
          the public key your server stored at registration, and it belongs in your server code, not in
          a page. It does not validate the attestation certificate chain against FIDO Metadata Service
          roots, and it does not name authenticators outside the short built-in AAGUID list. Everything
          happens in this tab: no credential, challenge or user handle you paste is sent anywhere.
        </p>
      </section>
    </main>
  );
}
