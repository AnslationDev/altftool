"use client";

import { useMemo, useState } from "react";
import { Box, Check, Copy, RotateCcw } from "lucide-react";

import {
  BOX_OPTIONS,
  NETWORK_OPTIONS,
  PROVISIONER_OPTIONS,
  generateVagrantfile,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  box: "ubuntu/jammy64",
  customBox: "",
  hostname: "dev-box",
  memoryMb: "2048",
  cpus: "2",
  network: "static",
  staticIp: "192.168.56.10",
  forwardedPorts: "8080:80",
  syncedHost: "./src",
  syncedGuest: "/vagrant/src",
  provisioner: "shell-inline",
  shellInline: "apt-get update -y\napt-get install -y build-essential",
  shellPath: "scripts/bootstrap.sh",
  playbookPath: "provisioning/playbook.yml",
};

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const result = useMemo(
    () =>
      generateVagrantfile({
        ...form,
        memoryMb: form.memoryMb.trim() === "" ? Number.NaN : Number(form.memoryMb),
        cpus: form.cpus.trim() === "" ? Number.NaN : Number(form.cpus),
      }),
    [form],
  );
  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.text);
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
          <Box className="h-4 w-4" aria-hidden="true" />
          Dev Environments
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Vagrantfile Generator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick a box, resources, networking, synced folders and a provisioner — get a valid
          Vagrant.configure(&quot;2&quot;) file with your ports and IPs range-checked first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-box">
              Base box
            </label>
            <select id="vg-box" className={`mt-2 ${INPUT_CLASS}`} value={form.box} onChange={set("box")}>
              {BOX_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.box === "custom" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="vg-custom-box">
                Custom box (user/box)
              </label>
              <input
                id="vg-custom-box"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                placeholder="myorg/mybox"
                value={form.customBox}
                onChange={set("customBox")}
              />
            </div>
          ) : (
            <div>
              <label className={LABEL_CLASS} htmlFor="vg-hostname">
                Hostname (optional)
              </label>
              <input
                id="vg-hostname"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                value={form.hostname}
                onChange={set("hostname")}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-memory">
              Memory (MB)
            </label>
            <input
              id="vg-memory"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="256"
              max="262144"
              step="256"
              value={form.memoryMb}
              onChange={set("memoryMb")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-cpus">
              CPUs
            </label>
            <input
              id="vg-cpus"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="64"
              step="1"
              value={form.cpus}
              onChange={set("cpus")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-network">
              Private network
            </label>
            <select
              id="vg-network"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.network}
              onChange={set("network")}
            >
              {NETWORK_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.network === "static" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="vg-ip">
                Static IP
              </label>
              <input
                id="vg-ip"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                inputMode="decimal"
                value={form.staticIp}
                onChange={set("staticIp")}
              />
            </div>
          ) : null}
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-ports">
              Forwarded ports (host:guest, comma separated)
            </label>
            <input
              id="vg-ports"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="8080:80, 8443:443"
              value={form.forwardedPorts}
              onChange={set("forwardedPorts")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-sync-host">
              Synced folder — host path
            </label>
            <input
              id="vg-sync-host"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="./src (empty = none)"
              value={form.syncedHost}
              onChange={set("syncedHost")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-sync-guest">
              Synced folder — guest path
            </label>
            <input
              id="vg-sync-guest"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoComplete="off"
              placeholder="/vagrant/src"
              value={form.syncedGuest}
              onChange={set("syncedGuest")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="vg-provisioner">
              Provisioner
            </label>
            <select
              id="vg-provisioner"
              className={`mt-2 ${INPUT_CLASS}`}
              value={form.provisioner}
              onChange={set("provisioner")}
            >
              {PROVISIONER_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {form.provisioner === "shell-path" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="vg-shell-path">
                Shell script path
              </label>
              <input
                id="vg-shell-path"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                value={form.shellPath}
                onChange={set("shellPath")}
              />
            </div>
          ) : null}
          {form.provisioner === "ansible" ? (
            <div>
              <label className={LABEL_CLASS} htmlFor="vg-playbook">
                Ansible playbook path
              </label>
              <input
                id="vg-playbook"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                value={form.playbookPath}
                onChange={set("playbookPath")}
              />
            </div>
          ) : null}
          {form.provisioner === "shell-inline" ? (
            <div className="sm:col-span-2">
              <label className={LABEL_CLASS} htmlFor="vg-shell-inline">
                Inline shell script
              </label>
              <textarea
                id="vg-shell-inline"
                rows={4}
                spellCheck={false}
                className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                value={form.shellInline}
                onChange={set("shellInline")}
              />
            </div>
          ) : null}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <ul className="mt-6 space-y-1 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
          {result.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Your Vagrantfile
            </p>
            <p className="mt-1 font-mono text-3xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.summary.box}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${result.summary.memory} MB · ${result.summary.cpus} CPU${result.summary.cpus === 1 ? "" : "s"} · ${result.summary.forwardedPorts} forwarded port${result.summary.forwardedPorts === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated Vagrantfile"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <pre className="min-w-[320px] rounded-md bg-[var(--muted)] p-4 font-mono text-xs leading-5 text-[var(--foreground)]">
            {hasError ? DASH : result.text}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Output uses Vagrant configuration version 2 with a VirtualBox provider block. Save it as
        Vagrantfile and run vagrant up; ports are validated to 1-65535 and static IPs are checked
        against VirtualBox&apos;s default 192.168.56.0/21 host-only range.
      </p>
    </main>
  );
}
