"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Router, ShieldCheck, Wifi } from "lucide-react";

const CHECKS = [
  {
    id: "admin-password",
    group: "Admin",
    title: "Change the router admin password",
    detail:
      "Do not keep a password printed on the router sticker, technician slip, or set during installation.",
    path: "Router login > Administration / Management > Password",
    weight: 8,
    critical: true,
  },
  {
    id: "app-account",
    group: "Admin",
    title: "Protect the ACT account and registered mobile",
    detail:
      "Keep the app/account login, OTP flow, and phone screen lock secure because support actions may depend on it.",
    path: "ACT app / account settings + phone lock",
    weight: 4,
    critical: false,
  },
  {
    id: "wpa2",
    group: "Wi-Fi",
    title: "Use WPA2-AES or WPA2/WPA3",
    detail:
      "Avoid WEP, open Wi-Fi, and old WPA/TKIP compatibility modes unless you are isolating a legacy device.",
    path: "Wireless > Security mode",
    weight: 8,
    critical: true,
  },
  {
    id: "strong-key",
    group: "Wi-Fi",
    title: "Replace phone-number or flat-number Wi-Fi keys",
    detail:
      "Mobile numbers, birthdays, building names, and flat numbers are the first patterns tested after a Wi-Fi handshake is captured.",
    path: "Wireless > Password / Pre-shared key",
    weight: 7,
    critical: true,
  },
  {
    id: "wps-off",
    group: "Wi-Fi",
    title: "Turn WPS off",
    detail:
      "WPS PIN mode can make a long Wi-Fi password irrelevant on routers that still expose it.",
    path: "Wireless > WPS > Disable",
    weight: 6,
    critical: true,
  },
  {
    id: "guest-network",
    group: "Wi-Fi",
    title: "Use a guest SSID for visitors and tenants",
    detail:
      "Guest Wi-Fi lets you rotate visitor access without exposing laptops, NAS drives, cameras, and work devices.",
    path: "Wireless > Guest network",
    weight: 3,
    critical: false,
  },
  {
    id: "remote-admin",
    group: "Exposure",
    title: "Disable remote router administration",
    detail:
      "The router login should not be reachable from the internet unless you deliberately maintain a locked-down admin path.",
    path: "Administration > Remote access / WAN management",
    weight: 7,
    critical: true,
  },
  {
    id: "port-forward",
    group: "Exposure",
    title: "Review port forwards and DMZ",
    detail:
      "Old CCTV, game, or NAS forwards can keep exposing a device long after you stopped using the feature.",
    path: "NAT > Port forwarding / Virtual server / DMZ",
    weight: 5,
    critical: false,
  },
  {
    id: "upnp",
    group: "Exposure",
    title: "Turn UPnP off unless a console needs it",
    detail:
      "UPnP lets local apps open inbound ports automatically, which is convenient but easy to forget.",
    path: "NAT > UPnP",
    weight: 3,
    critical: false,
  },
  {
    id: "dns",
    group: "Devices",
    title: "Note DNS and DHCP settings",
    detail:
      "A changed DNS server can silently redirect every device on the network. Keep a known-good baseline.",
    path: "LAN / DHCP settings",
    weight: 3,
    critical: false,
  },
  {
    id: "device-list",
    group: "Devices",
    title: "Name every connected device",
    detail:
      "A readable device list makes unknown phones, repeaters, cameras, and neighbours visible quickly.",
    path: "Status > Connected devices",
    weight: 3,
    critical: false,
  },
  {
    id: "firmware",
    group: "Maintenance",
    title: "Check firmware after router replacement or reset",
    detail:
      "Some ACT installations use different customer-premise routers, so record the model and update path after any hardware swap.",
    path: "System > Firmware / About",
    weight: 3,
    critical: false,
  },
];

const GROUPS = ["Admin", "Wi-Fi", "Exposure", "Devices", "Maintenance"];
const DEFAULT_DONE = ["wpa2"];
const TOTAL_WEIGHT = CHECKS.reduce((sum, item) => sum + item.weight, 0);
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const PRIMARY_BUTTON =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function buildScore(done) {
  const doneSet = new Set(done);
  const earned = CHECKS.filter((item) => doneSet.has(item.id)).reduce(
    (sum, item) => sum + item.weight,
    0,
  );
  const missingCritical = CHECKS.filter((item) => item.critical && !doneSet.has(item.id));
  const raw = Math.round((earned / TOTAL_WEIGHT) * 100);
  const percent = missingCritical.length ? Math.min(raw, 72) : raw;
  const band =
    percent >= 85 ? "Strong" : percent >= 65 ? "Needs a few fixes" : "High attention";
  return {
    percent,
    band,
    done: doneSet.size,
    missingCritical,
    next: CHECKS.filter((item) => !doneSet.has(item.id))
      .sort((a, b) => Number(b.critical) - Number(a.critical) || b.weight - a.weight)
      .slice(0, 4),
  };
}

export default function ToolHome() {
  const [done, setDone] = useState(DEFAULT_DONE);
  const [copied, setCopied] = useState(false);
  const score = useMemo(() => buildScore(done), [done]);

  const toggle = (id) => {
    setDone((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(
    () =>
      [
        "ACT Fibernet Router Hardening",
        `Score: ${score.percent}% (${score.band})`,
        `Checked: ${score.done}/${CHECKS.length}`,
        `Critical open: ${score.missingCritical.length}`,
        "",
        "Next actions:",
        ...score.next.map((item) => `- ${item.title}: ${item.path}`),
      ].join("\n"),
    [score],
  );

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Router className="h-4 w-4" aria-hidden="true" />
          ACT router security
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ACT Fibernet Router Hardening Checklist
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Score the practical router checks for an ACT Fibernet home connection: admin
          password, WPA mode, WPS, guest Wi-Fi, remote access, port forwards, UPnP, DNS
          and connected-device review.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className={CARD}>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={BUTTON} onClick={() => setDone(CHECKS.map((item) => item.id))}>
              Mark all done
            </button>
            <button type="button" className={BUTTON} onClick={() => setDone([])}>
              Clear all
            </button>
            <button type="button" className={BUTTON} onClick={() => setDone(DEFAULT_DONE)}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {GROUPS.map((group) => (
              <fieldset key={group} className="rounded-lg border border-[var(--border)] p-4">
                <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                  {group}
                </legend>
                <div className="mt-3 grid gap-3">
                  {CHECKS.filter((item) => item.group === group).map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        checked={done.includes(item.id)}
                        onChange={() => toggle(item.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--foreground)]">
                          {item.title}
                          {item.critical ? (
                            <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs text-[var(--danger)]">
                              critical
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.path}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={LABEL_CLASS}>Hardening score</p>
              <p className="mt-2 text-5xl font-bold text-[var(--primary)]">
                {score.percent}
                <span className="text-lg text-[var(--muted-foreground)]">%</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--foreground)]">{score.band}</p>
            </div>
            <ShieldCheck className="h-10 w-10 text-[var(--primary)]" aria-hidden="true" />
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-[var(--muted)]">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${score.percent}%` }} />
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[var(--muted-foreground)]">
            <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
              <Wifi className="mb-2 h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
              <strong className="text-[var(--foreground)]">{score.done}/{CHECKS.length}</strong> checks marked done.
            </div>
            {score.next.length ? (
              <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                <p className="font-semibold text-[var(--foreground)]">Next fixes</p>
                <ul className="mt-2 space-y-2">
                  {score.next.map((item) => (
                    <li key={item.id}>• {item.title}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg bg-[var(--success-soft)] p-3 text-[var(--success)]">
                All checklist items are marked complete.
              </div>
            )}
          </div>

          <button type="button" className={`${PRIMARY_BUTTON} mt-5 w-full`} onClick={copySummary}>
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy summary"}
          </button>
        </aside>
      </section>
    </main>
  );
}
