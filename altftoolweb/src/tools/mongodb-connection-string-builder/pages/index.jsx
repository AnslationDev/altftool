"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Leaf, RotateCcw } from "lucide-react";

import { READ_PREFERENCES, WRITE_CONCERNS, buildMongoConnection } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CODE_BOX =
  "mt-2 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs leading-5 text-[var(--foreground)]";

const DEFAULTS = {
  srv: false,
  hosts: "localhost:27017",
  database: "appdb",
  user: "app_user",
  password: "",
  replicaSet: "",
  authSource: "admin",
  readPreference: "",
  writeConcern: "majority",
  tls: "",
  retryWrites: true,
  maxPoolSize: "",
  appName: "",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => buildMongoConnection(form), [form]);
  const hasError = Boolean(result.error);

  const setField = (key) => (event) => {
    const { value } = event.target;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const setChecked = (key) => (event) => {
    const { checked } = event.target;
    setForm((previous) => ({ ...previous, [key]: checked }));
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Leaf className="h-4 w-4" aria-hidden="true" />
          Database connectivity
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          MongoDB Connection String Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Build a mongodb:// or mongodb+srv:// URI with replica set, authSource, read
          preference, write concern, TLS and pool options — credentials percent-encoded per the
          connection string spec.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label
          className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--foreground)]"
          htmlFor="mg-srv"
        >
          <input
            id="mg-srv"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.srv}
            onChange={setChecked("srv")}
          />
          Use mongodb+srv:// (DNS seed list — Atlas style, one host, no port, TLS on by default)
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mg-hosts">
              {form.srv ? "SRV host name" : "Hosts (comma separated host:port)"}
            </label>
            <input
              id="mg-hosts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              placeholder={form.srv ? "cluster0.abcde.mongodb.net" : "db1:27017,db2:27017,db3:27017"}
              value={form.hosts}
              onChange={setField("hosts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-db">
              Default auth database (optional)
            </label>
            <input id="mg-db" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.database} onChange={setField("database")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-authsource">
              authSource (optional)
            </label>
            <input id="mg-authsource" className={`mt-2 ${INPUT_CLASS}`} type="text" placeholder="admin" value={form.authSource} onChange={setField("authSource")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-user">
              User (optional)
            </label>
            <input id="mg-user" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" value={form.user} onChange={setField("user")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-pass">
              Password (optional, encoded for you)
            </label>
            <input id="mg-pass" className={`mt-2 ${INPUT_CLASS}`} type="text" autoComplete="off" spellCheck={false} value={form.password} onChange={setField("password")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-rs">
              replicaSet (optional)
            </label>
            <input id="mg-rs" className={`mt-2 ${INPUT_CLASS}`} type="text" placeholder="rs0" value={form.replicaSet} onChange={setField("replicaSet")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-readpref">
              Read preference
            </label>
            <select id="mg-readpref" className={`mt-2 ${INPUT_CLASS}`} value={form.readPreference} onChange={setField("readPreference")}>
              {READ_PREFERENCES.map((pref) => (
                <option key={pref.value || "default"} value={pref.value}>
                  {pref.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-w">
              Write concern (w)
            </label>
            <select id="mg-w" className={`mt-2 ${INPUT_CLASS}`} value={form.writeConcern} onChange={setField("writeConcern")}>
              {WRITE_CONCERNS.map((concern) => (
                <option key={concern.value || "default"} value={concern.value}>
                  {concern.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-tls">
              TLS
            </label>
            <select id="mg-tls" className={`mt-2 ${INPUT_CLASS}`} value={form.tls} onChange={setField("tls")}>
              <option value="">(omit — srv defaults to true, mongodb to false)</option>
              <option value="true">tls=true</option>
              <option value="false">tls=false</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-pool">
              maxPoolSize (optional, driver default 100)
            </label>
            <input id="mg-pool" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="numeric" min="1" value={form.maxPoolSize} onChange={setField("maxPoolSize")} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mg-app">
              appName (optional)
            </label>
            <input id="mg-app" className={`mt-2 ${INPUT_CLASS}`} type="text" value={form.appName} onChange={setField("appName")} />
          </div>
        </div>

        <label
          className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
          htmlFor="mg-retry"
        >
          <input
            id="mg-retry"
            type="checkbox"
            className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={form.retryWrites}
            onChange={setChecked("retryWrites")}
          />
          Emit retryWrites=true explicitly (modern drivers already default to true)
        </label>
      </section>

      {hasError ? (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Connection URI
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
              {hasError ? DASH : form.srv ? "mongodb+srv://" : "mongodb://"}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see the URI."
                : `${result.hostCount} host${result.hostCount === 1 ? "" : "s"}, ${result.params.length} option${result.params.length === 1 ? "" : "s"}.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the MongoDB connection URI"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy URI"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all fields to defaults" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <pre className={CODE_BOX}>{hasError ? DASH : result.uri}</pre>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {!hasError &&
            result.params.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="font-mono text-xs text-[var(--muted-foreground)]">{key}</dt>
                <dd className="break-all text-right font-mono text-xs font-semibold">{value}</dd>
              </div>
            ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Everything runs locally in your browser. With mongodb+srv:// the SRV DNS record supplies
        the member hosts and TLS defaults to on; keep production credentials in a secrets
        manager, not in source control.
      </p>
    </main>
  );
}
