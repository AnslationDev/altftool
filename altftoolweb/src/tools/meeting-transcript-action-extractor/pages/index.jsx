"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  ClipboardList,
  FileText,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Users,
  ArrowRight,
  ListChecks,
  MessageSquare,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_TRANSCRIPT = `Meeting: Sprint Planning — Week 42
Date: 2025-10-14
Attendees: @alice, @bob, @carol

@alice: Let's go over the remaining tickets for this sprint.

@bob: Decision: We agreed to push the payment module to next sprint since the API isn't ready yet.

@carol: Action item: @bob will draft the new endpoint spec by Friday.

@alice: Moving forward, we're going with Stripe as the primary provider.

@bob: Key point — the test coverage on auth is at 92%, which is above our threshold.

@carol: Todo: Need to update the integration tests for the login flow.

@alice: Decision: Concluded that we should split the dashboard into two separate components.

@bob: Action item: @carol is responsible for the user profile redesign. Deadline: Oct 20.

@carol: The analytics page shows a 15% improvement in load time this sprint.

@alice: Follow up: Need to check with the design team about the new mockups.

@bob: [x] Reviewed the PR for the notification service.

@carol: We should also consider adding error tracking to the new endpoints.

@alice: Agreed. Let's add Sentry to the project config.

@bob: Action item: @alice will set up the Sentry integration by next Wednesday.

@carol: Decision: Going with PostgreSQL for the new reporting database.

@alice: Key point — total active users grew 8% month over month.

Meeting adjourned at 10:45 AM.`;

// Tried in priority order per line; `group` is the capture group holding the
// action-item message text (patterns that also capture a leading @mention or
// assignee name use group 2, everything else uses group 1).
const ACTION_PATTERNS = [
  { regex: /action\s*item[:\s]+(.+)/gi, group: 1 },
  { regex: /todo[:\s]+(.+)/gi, group: 1 },
  { regex: /(?:will|need to|must|should)\s+(.+)/gi, group: 1 },
  { regex: /assign(?:ed)?\s+(?:to\s+)?(\w+)\s+(.+)/gi, group: 2 },
  { regex: /follow\s*up[:\s]+(.+)/gi, group: 1 },
  { regex: /responsible\s*:?\s*(.+)/gi, group: 1 },
  { regex: /\[x\]\s*(.+)/gi, group: 1 },
  { regex: /@(\w+)\s+(.+)/gi, group: 2 },
];

const DECISION_PATTERNS = [
  /decision[:\s]+(.+)/gi,
  /agreed[\s,.:;]*(?:that\s+)?(.+)/gi,
  /decided[\s,.:;]*(?:to\s+|that\s+)?(.+)/gi,
  /concluded[\s,.:;]*(?:that\s+)?(.+)/gi,
  /moving\s+forward[,\s]+(.+)/gi,
  /going\s+with\s+(.+)/gi,
];

const KEY_POINT_INDICATORS = [
  /key\s*point[:\s]+(.+)/gi,
  /important[:\s]+(.+)/gi,
  /note[:\s]+(.+)/gi,
  /highlight[:\s]+(.+)/gi,
];

const OWNER_PATTERN = /@(\w+)/g;
const DEADLINE_PATTERNS = [
  /deadline[:\s]+(.+)/gi,
  /due\s+(?:by|on|date)[:\s]+(.+)/gi,
  /by\s+(\w+(?:\s+\d+)?(?:st|nd|rd|th)?(?:\s+\w+)?)/gi,
  /(?:by\s+)?(next\s+\w+|this\s+\w+|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)/gi,
];

// `patterns` may be plain /regex/ literals (group 1 holds the text) or
// `{ regex, group }` configs for patterns whose message text lives in a
// different capture group. When `firstMatchOnly` is set, only the first
// match from the first pattern (in priority order) that matches is kept —
// this is what keeps a single line from producing multiple action items.
export function extractMatches(text, patterns, { firstMatchOnly = false } = {}) {
  const results = [];
  for (const config of patterns) {
    const regex = config.regex || config;
    const group = config.group ?? 1;
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const content = (match[group] || match[0]).trim();
      if (content) {
        results.push({ text: content, source: match[0] });
        if (firstMatchOnly) return results;
      }
    }
  }
  return results;
}

// Strips a leading "@speaker:" prefix so owner-extraction only scans the
// task/message portion of the line, not the person announcing it.
export function stripSpeakerPrefix(text) {
  return text.replace(/^@\w+:\s*/, "");
}

export function extractOwners(text) {
  const owners = [];
  let match;
  while ((match = OWNER_PATTERN.exec(text)) !== null) {
    if (!owners.includes(match[1])) owners.push(match[1]);
  }
  return owners;
}

// Strips leading dash/divider characters (e.g. the em dash left behind by a
// "Key point — ..." cue) and trailing sentence punctuation that a greedy
// capture group pulls in along with the real text.
function cleanCapturedText(text) {
  return text.replace(/^[—\-–:\s]+/, "").replace(/[.,;]+$/, "").trim();
}

export function extractDeadlines(text) {
  const deadlines = [];
  for (const pattern of DEADLINE_PATTERNS) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const dateText = cleanCapturedText((match[1] || match[0]).trim());
      if (dateText && !deadlines.includes(dateText)) deadlines.push(dateText);
    }
  }
  return deadlines;
}

export function assignContext(allLines) {
  const actions = [];
  const decisions = [];
  const keyPoints = [];

  for (const line of allLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Decisions are checked before the generic action patterns so a line
    // explicitly cued with "Decision:"/"Agreed"/etc. isn't swallowed by the
    // modal-verb action pattern (will/need to/must/should) just because the
    // decision text itself happens to contain one of those words.
    const matchedDecisions = extractMatches(trimmed, DECISION_PATTERNS, { firstMatchOnly: true });
    if (matchedDecisions.length > 0) {
      for (const match of matchedDecisions) {
        decisions.push({ text: match.text, source: trimmed });
      }
      continue;
    }

    const matchedActions = extractMatches(trimmed, ACTION_PATTERNS, { firstMatchOnly: true });
    if (matchedActions.length > 0) {
      for (const match of matchedActions) {
        const owners = extractOwners(stripSpeakerPrefix(trimmed));
        const deadlines = extractDeadlines(trimmed);
        actions.push({ text: match.text, source: trimmed, owners, deadlines });
      }
      continue;
    }

    const matchedKeyPoints = extractMatches(trimmed, KEY_POINT_INDICATORS, { firstMatchOnly: true });
    if (matchedKeyPoints.length > 0) {
      for (const match of matchedKeyPoints) {
        keyPoints.push({ text: cleanCapturedText(match.text), source: trimmed });
      }
      continue;
    }

    if (
      trimmed.length > 20 &&
      !trimmed.startsWith("Meeting:") &&
      !trimmed.startsWith("Date:") &&
      !trimmed.startsWith("Attendees:") &&
      !trimmed.startsWith("Meeting adjourned") &&
      !trimmed.match(/^@?\w+:\s*(?:Let's|We should|I think|Maybe|What about|Sounds)/i)
    ) {
      keyPoints.push({ text: trimmed, source: trimmed });
    }
  }

  return { actions, decisions, keyPoints };
}

function formatSummary(data) {
  const lines = ["Meeting Transcript — Extracted Summary", "========================================", ""];
  if (data.actions.length) {
    lines.push("ACTION ITEMS");
    data.actions.forEach((a, i) => {
      const parts = [`${i + 1}. ${a.text}`];
      if (a.owners.length) parts.push(` (Owner: @${a.owners.join(", @")})`);
      if (a.deadlines.length) parts.push(` [Deadline: ${a.deadlines.join(", ")}]`);
      lines.push(parts.join(""));
    });
    lines.push("");
  }
  if (data.decisions.length) {
    lines.push("DECISIONS");
    data.decisions.forEach((d, i) => lines.push(`${i + 1}. ${d.text}`));
    lines.push("");
  }
  if (data.keyPoints.length) {
    lines.push("KEY POINTS");
    data.keyPoints.forEach((k, i) => lines.push(`${i + 1}. ${k.text}`));
    lines.push("");
  }
  lines.push(`--- Stats: ${data.actions.length} action items · ${data.decisions.length} decisions · ${data.keyPoints.length} key points`);
  return lines.join("\n");
}

function downloadTxt(content, filename = "meeting-summary.txt") {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, className = "" }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--anslation-ds-shadow-sm)] ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--section-highlight)] text-[var(--primary)]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
        <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}

function ItemCard({ title, items, badgeClass, badgeLabel, icon: Icon, emptyText }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${badgeClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
        </div>
        <Badge className={badgeClass}>{items.length} {badgeLabel}</Badge>
      </div>
      {items.length === 0 ? (
        <p className="text-sm italic text-[var(--muted-foreground)]">{emptyText}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={index}
              className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-relaxed text-[var(--foreground)]"
            >
              <p>{item.text}</p>
              {(item.owners?.length > 0 || item.deadlines?.length > 0) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.owners?.map((owner) => (
                    <Badge key={owner} className="bg-violet-500/10 text-violet-600">
                      <Users className="h-3 w-3" />
                      @{owner}
                    </Badge>
                  ))}
                  {item.deadlines?.map((deadline, di) => (
                    <Badge key={di} className="bg-amber-500/10 text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      {deadline}
                    </Badge>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function MeetingTranscriptActionExtractor() {
  const [transcript, setTranscript] = useState("");
  const [extracted, setExtracted] = useState(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const hasTranscript = transcript.trim().length > 0;
  const hasResults = extracted !== null;

  const stats = useMemo(() => {
    if (!extracted) return { actions: 0, decisions: 0, keyPoints: 0, owners: 0, total: 0 };
    const ownerSet = new Set();
    for (const a of extracted.actions) a.owners.forEach((o) => ownerSet.add(o));
    return {
      actions: extracted.actions.length,
      decisions: extracted.decisions.length,
      keyPoints: extracted.keyPoints.length,
      owners: ownerSet.size,
      total: extracted.actions.length + extracted.decisions.length + extracted.keyPoints.length,
    };
  }, [extracted]);

  const allOwners = useMemo(() => {
    if (!extracted) return [];
    const ownerSet = new Set();
    for (const a of extracted.actions) a.owners.forEach((o) => ownerSet.add(o));
    return Array.from(ownerSet);
  }, [extracted]);

  const handleExtract = useCallback(() => {
    const lines = transcript.split("\n").filter((l) => l.trim());
    const result = assignContext(lines);
    setExtracted(result);
  }, [transcript]);

  const handleLoadSample = useCallback(() => {
    setTranscript(SAMPLE_TRANSCRIPT);
    setExtracted(null);
  }, []);

  const handleClear = useCallback(() => {
    setTranscript("");
    setExtracted(null);
    setCopied(false);
  }, []);

  const handleCopySummary = useCallback(async () => {
    if (!extracted) return;
    const summary = formatSummary(extracted);
    const ok = await safeCopyText(summary);
    if (ok) {
      setCopied(true);
      if (copyTimeoutRef.current) window.clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = null;
      }, 1400);
    }
  }, [extracted]);

  const handleDownload = useCallback(() => {
    if (!extracted) return;
    const summary = formatSummary(extracted);
    downloadTxt(summary);
  }, [extracted]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-[1240px]">
        <header className="text-center">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-600">
                <ClipboardList className="h-3.5 w-3.5" />
                Action extraction
              </span>
            </div>
            <h1 className="heading mx-auto max-w-5xl text-center">Meeting Transcript Action Extractor</h1>
            <p className="description mx-auto mt-3 max-w-4xl text-center">
              Paste a meeting transcript to automatically extract action items, decisions, key points,
              assigned owners, and deadlines.
            </p>
          </div>

          {hasResults && (
            <div className="tool-card-grid mx-auto mt-8 w-full max-w-5xl">
              <StatCard icon={ListChecks} label="Action Items" value={stats.actions} />
              <StatCard icon={CheckCircle2} label="Decisions" value={stats.decisions} />
              <StatCard icon={Lightbulb} label="Key Points" value={stats.keyPoints} />
              <StatCard icon={Users} label="Owners" value={stats.owners} />
            </div>
          )}
        </header>

        <section className="mt-8">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label htmlFor="transcript-input" className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
              <MessageSquare className="mr-2 inline h-4 w-4 text-[var(--primary)]" />
              Paste Meeting Transcript
            </label>
            <textarea
              id="transcript-input"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                if (extracted) setExtracted(null);
              }}
              placeholder={`Paste your meeting transcript here...\n\nExample:\n@alice: Action item: @bob will draft the spec by Friday.\n@bob: Decision: Agreed to use Stripe.`}
              className="min-h-[200px] w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-relaxed text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:shadow-[0_0_0_3px_rgba(20,184,166,0.35)]"
              rows={10}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={handleExtract} disabled={!hasTranscript} className="btn-primary">
                <FileText className="h-4 w-4" />
                Extract Actions
              </button>
              <button type="button" onClick={handleLoadSample} className="btn-secondary">
                <RefreshCw className="h-4 w-4" />
                Load Sample
              </button>
              <button type="button" onClick={handleClear} className="btn-secondary">
                <RefreshCw className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </section>

        {hasResults && (
          <div aria-live="polite">
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={handleCopySummary} className="btn-primary">
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Summary"}
              </button>
              <button type="button" onClick={handleDownload} className="btn-secondary">
                <Download className="h-4 w-4" />
                Download Report
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ItemCard
                title="Action Items"
                items={extracted.actions}
                badgeClass="bg-violet-500/10 text-violet-600"
                badgeLabel="actions"
                icon={ListChecks}
                emptyText="No action items detected."
              />
              <ItemCard
                title="Decisions"
                items={extracted.decisions}
                badgeClass="bg-emerald-500/10 text-emerald-600"
                badgeLabel="decisions"
                icon={CheckCircle2}
                emptyText="No decisions detected."
              />
            </div>

            <div className="mt-6">
              <ItemCard
                title="Key Points"
                items={extracted.keyPoints}
                badgeClass="bg-blue-500/10 text-blue-600"
                badgeLabel="points"
                icon={Lightbulb}
                emptyText="No key points detected."
              />
            </div>

            {allOwners.length > 0 && (
              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--foreground)]">Assigned Owners</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allOwners.map((owner) => (
                    <Badge key={owner} className="bg-violet-500/10 text-violet-600">
                      <Users className="h-3 w-3" />
                      @{owner}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
              <p className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
                <ArrowRight className="h-4 w-4 text-[var(--primary)]" />
                Summary Statistics
              </p>
              <p className="mt-1">
                {stats.actions} action item{stats.actions !== 1 ? "s" : ""} · {stats.decisions} decision{stats.decisions !== 1 ? "s" : ""} · {stats.keyPoints} key point{stats.keyPoints !== 1 ? "s" : ""} · {stats.owners} unique owner{stats.owners !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {!hasTranscript && !hasResults && (
          <div className="mt-8 rounded-lg border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-[var(--muted-foreground)]" />
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Paste a transcript and click <strong>Extract Actions</strong> to get started.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
