"use client";

import { useMemo, useRef, useState } from "react";
import { CheckCircle2, Clipboard, Copy, Download, HelpCircle, ListChecks, MailCheck, MessageSquareText, ShieldCheck, Sparkles, Trash2, Users, Clock3 } from "lucide-react";
import { SAMPLE_THREAD, summarizeThread, toMarkdown } from "../utils";

const MAX_CHARACTERS = 100_000;
const tabs = [
  { key: "actions", label: "Actions", icon: ListChecks },
  { key: "questions", label: "Questions", icon: HelpCircle },
  { key: "timeline", label: "Timeline", icon: Clock3 },
];

function Button({ children, className = "", ...props }) {
  return <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:cursor-not-allowed disabled:opacity-60 ${className}`} {...props}>{children}</button>;
}

function download(value, name, type) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url);
}

function List({ items, empty }) {
  return items.length ? <ul className="space-y-3">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3 text-sm leading-6 text-muted-foreground"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" /><span>{item}</span></li>)}</ul> : <p className="text-sm text-muted-foreground">{empty}</p>;
}

function Card({ title, icon: Icon, children, count }) {
  return <section className="rounded-lg border border-border bg-card p-5 shadow-sm"><h2 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Icon className="h-5 w-5 text-primary" aria-hidden="true" />{title}{typeof count === "number" && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>}</h2>{children}</section>;
}

export default function EmailThreadSummarizerPage() {
  const [thread, setThread] = useState("");
  const [mode, setMode] = useState("standard");
  const [tab, setTab] = useState("actions");
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef(null);
  const result = useMemo(() => summarizeThread(thread, mode), [thread, mode]);
  const markdown = useMemo(() => toMarkdown(result), [result]);
  const isTooLong = thread.length > MAX_CHARACTERS;
  const announce = (message) => { setNotice(message); window.clearTimeout(noticeTimer.current); noticeTimer.current = window.setTimeout(() => setNotice(""), 2400); };
  const copy = async () => { try { await navigator.clipboard.writeText(markdown); announce("Analysis copied as Markdown."); } catch { announce("Clipboard access was blocked."); } };

  return <main className="min-h-screen bg-background text-foreground"><div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
    <header className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary"><MailCheck className="h-4 w-4" aria-hidden="true" /> Inbox clarity</span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Email Thread Summarizer</h1>
      <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">Extract key points, decisions, owners, deadlines, question status, tone, and a conversation timeline. Analysis is deterministic and runs only in this browser.</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" /> Private by design</span><span>Heuristic results</span><span>No upload</span></div>
    </header>

    <section className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4 sm:px-5"><div><label htmlFor="email-thread" className="font-semibold">Paste email thread</label><p id="thread-help" className="mt-1 text-xs text-muted-foreground">From, Date, and Subject headers improve results.</p></div><div className="flex gap-2"><Button type="button" onClick={() => setThread(SAMPLE_THREAD)} className="border border-border hover:border-primary hover:text-primary"><Clipboard className="h-4 w-4" /> Sample</Button><Button type="button" disabled={!thread} onClick={() => setThread("")} aria-label="Clear email thread" className="border border-border"><Trash2 className="h-4 w-4" /></Button></div></div>
        <textarea id="email-thread" value={thread} onChange={(event) => setThread(event.target.value.slice(0, MAX_CHARACTERS + 1))} spellCheck="false" aria-describedby="thread-help thread-count" aria-invalid={isTooLong} placeholder="Paste your email conversation here…" className="min-h-[32rem] w-full resize-y bg-transparent p-5 font-mono text-sm leading-7 outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary" />
        <div id="thread-count" className={`border-t border-border px-5 py-3 text-right text-xs ${isTooLong ? "text-destructive" : "text-muted-foreground"}`}>{thread.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters</div>
      </div>

      <aside className="flex min-h-[38rem] flex-col gap-4" aria-label="Thread overview">
        <div className="grid grid-cols-3 gap-3">
          {[[result.messages.length,"Messages",MessageSquareText],[result.participants.length,"People",Users],[result.wordCount,"Words",MailCheck]].map(([value,label,Icon]) => <div key={label} className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-border bg-card p-4 text-center shadow-sm"><Icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true"/><div className="truncate text-2xl font-bold">{value}</div><div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div></div>)}
        </div>
        <div className="flex flex-1 flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Thread subject</p>
            <h2 className="mt-3 text-2xl font-bold leading-tight">{thread && !isTooLong ? result.subject : "Subject will appear here"}</h2>
          </div>
          <div className="border-t border-border pt-5">
            <p className="text-sm leading-6 text-muted-foreground">{thread && !isTooLong ? "Subject detected from the email headers." : "Paste an email thread with a Subject header for the best result."}</p>
          </div>
        </div>
      </aside>
    </section>

    {thread && !isTooLong ? <section className="space-y-6" aria-label="Thread analysis">
      <Card title="Summary" icon={Sparkles}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="max-w-4xl text-sm leading-7 text-muted-foreground">{result.highlights.length ? result.highlights.join(" ") : "No summary details detected."}</p>
          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">Summary length<select value={mode} onChange={(event)=>setMode(event.target.value)} className="min-h-10 rounded-md border border-border bg-card px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><option value="brief">Brief</option><option value="standard">Standard</option><option value="detailed">Detailed</option></select></label>
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-muted px-3 py-1.5">Urgency: {result.urgency}</span><span className="rounded-full bg-muted px-3 py-1.5">Tone: {result.sentiment}</span><span className="rounded-full bg-muted px-3 py-1.5">Duration: {result.duration}</span></div>
          <div className="flex flex-wrap gap-2"><Button onClick={copy} className="border border-border bg-card"><Copy className="h-4 w-4" /> Copy</Button><Button onClick={() => download(markdown,"email-analysis.md","text/markdown")} className="bg-primary text-primary-foreground"><Download className="h-4 w-4" /> Markdown</Button><Button onClick={() => download(JSON.stringify(result,null,2),"email-analysis.json","application/json")} className="border border-border bg-card">JSON</Button></div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Key points" icon={Sparkles} count={result.highlights.length}><List items={result.highlights} empty="No key points detected." /></Card>
        <Card title="Decisions" icon={CheckCircle2} count={result.decisions.length}><List items={result.decisions} empty="No decisions detected." /></Card>
      </div>

      <div className="flex overflow-x-auto border-b border-border" role="tablist" aria-label="Detailed analysis sections">{tabs.map(({key,label,icon:Icon}) => <button key={key} role="tab" aria-selected={tab===key} aria-controls={`panel-${key}`} onClick={() => setTab(key)} className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tab===key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}><Icon className="h-4 w-4" aria-hidden="true" />{label}</button>)}</div>
      <div id={`panel-${tab}`} role="tabpanel">
        {tab === "actions" && <Card title="Action items" icon={ListChecks} count={result.actions.length}>{result.actions.length ? <div className="space-y-3">{result.actions.map((item,index)=><article key={`${item.text}-${index}`} className="rounded-md border border-border bg-muted/40 p-4"><p className="text-sm leading-6">{item.text}</p><dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3"><div><dt className="font-semibold text-foreground">Likely owner</dt><dd>{item.owner}</dd></div><div><dt className="font-semibold text-foreground">Deadline</dt><dd>{item.deadline}</dd></div><div><dt className="font-semibold text-foreground">Source</dt><dd>{item.source}</dd></div></dl></article>)}</div>:<p className="text-sm text-muted-foreground">No action items detected.</p>}</Card>}
        {tab === "questions" && <Card title="Questions" icon={HelpCircle} count={result.questions.length}>{result.questions.length?<div className="space-y-3">{result.questions.map((item,index)=><article key={`${item.text}-${index}`} className="rounded-md border border-border p-4"><p className="text-sm leading-6">{item.text}</p><p className="mt-2 text-xs text-muted-foreground">Asked by {item.askedBy} · {item.status}</p></article>)}</div>:<p className="text-sm text-muted-foreground">No questions detected.</p>}</Card>}
        {tab === "timeline" && <Card title="Conversation timeline" icon={Clock3} count={result.timeline.length}><ol className="space-y-4">{result.timeline.map((item)=><li key={item.number} className="border-l-2 border-primary pl-4"><p className="text-sm font-semibold">{item.sender}</p><p className="text-xs text-muted-foreground">{item.date}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.preview}</p></li>)}</ol></Card>}
      </div>
      <p className="text-xs leading-5 text-muted-foreground">Owner, deadline, tone, urgency, and answer status are keyword-based estimates. Verify them against the original thread.</p>
    </section> : <section className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-8 text-center"><MailCheck className="h-12 w-12 text-primary"/><h2 className="mt-4 text-xl font-semibold">{isTooLong?"Thread is too long":"Your analysis will appear here"}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{isTooLong?`Shorten the thread to ${MAX_CHARACTERS.toLocaleString()} characters or fewer.`:"Paste a thread or load the sample to analyze it locally."}</p></section>}
    <p className="sr-only" role="status" aria-live="polite">{notice}</p>
  </div></main>;
}
