"use client";

import React, { useState, useCallback } from "react";
import { FileText, Copy, Download, RefreshCw, Briefcase, GraduationCap, Heart, Plane } from "lucide-react";

const TYPES = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "school", label: "School", icon: "🎓" },
  { id: "medical", label: "Medical", icon: "🏥" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
];

const TEMPLATES = {
  work: (data) => `Dear ${data.recipient || "Manager"},

I am writing to formally inform you that I was unable to attend work on ${data.date || "[DATE]"} due to ${data.reason || "unforeseen personal circumstances"}. I sincerely apologize for any inconvenience this may have caused to the team and ongoing projects.

I have completed any urgent tasks remotely and will ensure a smooth handover of pending work. Please let me know if any documentation is required to process this absence.

Thank you for your understanding.

Sincerely,
${data.sender || "[Your Name]"}`,

  school: (data) => `To Whom It May Concern,

This letter is to certify that ${data.sender || "[Student Name]"} was absent from school on ${data.date || "[DATE]"} due to ${data.reason || "a personal family matter"}. We request that the absence be excused and any missed assignments be allowed for makeup.

Thank you for your cooperation.

Sincerely,
${data.parent || "[Parent/Guardian Name]"}`,

  medical: (data) => `MEDICAL EXCUSE LETTER

Patient Name: ${data.sender || "[Patient Name]"}
Date of Visit: ${data.date || "[DATE]"}

This letter confirms that the above-named patient was examined and treated in our facility on the stated date. Due to medical reasons, the patient is advised to rest and refrain from ${data.reason || "regular activities"} for the recommended period.

Physician: Dr. ${data.doctor || "[Doctor Name]"}
License No: ${data.license || "MED-00000"}`,

  family: (data) => `Dear ${data.recipient || "Family Member"},

I regret to inform you that I will be unable to attend ${data.event || "the family gathering"} on ${data.date || "[DATE]"} due to ${data.reason || "an unexpected conflict"}. I was really looking forward to it and hope to make it up to you soon.

With love,
${data.sender || "[Your Name]"}`,
};

export default function ToolHome() {
  const [type, setType] = useState("work");
  const [fields, setFields] = useState({ recipient: "", sender: "", date: "", reason: "", parent: "", doctor: "", license: "", event: "" });
  const [letter, setLetter] = useState("");

  const updateField = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const generate = useCallback(() => {
    const template = TEMPLATES[type] || TEMPLATES.work;
    setLetter(template(fields));
  }, [type, fields]);

  const copyLetter = async () => {
    try {
      await navigator.clipboard.writeText(letter);
    } catch {}
  };

  const downloadLetter = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `excuse-letter-${type}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-(--background) p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--primary)">
            <FileText className="h-4 w-4" /> Formal Letters
          </div>
          <h1 className="text-4xl font-bold text-(--foreground)">Fake Excuse Letter Generator</h1>
          <p className="mt-2 text-(--muted-foreground)">Generate a professional-looking excuse letter with your details</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg">
          <div className="mb-6 flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t.id} onClick={() => setType(t.id)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${type === t.id ? "bg-(--primary) text-white shadow-md" : "border border-(--border) bg-(--background) text-(--muted-foreground) hover:border-(--primary)"}`}>
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {type === "work" && (
              <>
                <input type="text" value={fields.recipient} onChange={(e) => updateField("recipient", e.target.value)} placeholder="Manager's name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.sender} onChange={(e) => updateField("sender", e.target.value)} placeholder="Your name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
              </>
            )}
            {type === "school" && (
              <>
                <input type="text" value={fields.sender} onChange={(e) => updateField("sender", e.target.value)} placeholder="Student name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.parent} onChange={(e) => updateField("parent", e.target.value)} placeholder="Parent/Guardian name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
              </>
            )}
            {type === "medical" && (
              <>
                <input type="text" value={fields.sender} onChange={(e) => updateField("sender", e.target.value)} placeholder="Patient name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.doctor} onChange={(e) => updateField("doctor", e.target.value)} placeholder="Doctor name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.license} onChange={(e) => updateField("license", e.target.value)} placeholder="License number" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
              </>
            )}
            {type === "family" && (
              <>
                <input type="text" value={fields.recipient} onChange={(e) => updateField("recipient", e.target.value)} placeholder="Family member" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.sender} onChange={(e) => updateField("sender", e.target.value)} placeholder="Your name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
                <input type="text" value={fields.event} onChange={(e) => updateField("event", e.target.value)} placeholder="Event name" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
              </>
            )}
            <input type="text" value={fields.date} onChange={(e) => updateField("date", e.target.value)} placeholder="Date (e.g., Jan 15, 2024)" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
            <input type="text" value={fields.reason} onChange={(e) => updateField("reason", e.target.value)} placeholder="Reason (optional)" className="rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-(--foreground) outline-none transition focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/30" />
          </div>

          <button onClick={generate} className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-(--primary) px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98]">
            <FileText className="h-5 w-5" /> Generate Letter
          </button>
        </div>

        {letter && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-2xl border-2 border-(--border) bg-(--card) p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-(--muted) px-3 py-1 text-xs font-semibold uppercase text-(--muted-foreground)">{TYPES.find((t) => t.id === type)?.label} Excuse</span>
              <div className="flex gap-2">
                <button onClick={generate} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><RefreshCw className="h-4 w-4" /></button>
                <button onClick={copyLetter} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Copy className="h-4 w-4" /></button>
                <button onClick={downloadLetter} className="rounded-lg p-2 text-(--muted-foreground) hover:bg-(--muted)"><Download className="h-4 w-4" /></button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-(--foreground)">{letter}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
