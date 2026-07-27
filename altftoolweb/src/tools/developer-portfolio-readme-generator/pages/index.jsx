"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Github, RotateCcw } from "lucide-react";

import { MAX_PROJECTS, MAX_SKILLS, generateProfileReadme, parseList } from "../lib";

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const DEFAULTS = {
  name: "Asha Verma",
  headline: "Full-stack developer · React, Node.js and a soft spot for DX",
  about:
    "I build web platforms and developer tools. Currently at a fintech startup, previously freelancing.",
  githubUsername: "asha-verma",
  skills: "JavaScript, TypeScript, React, Node.js, PostgreSQL, Docker, AWS",
  projects:
    "DevBoard | Kanban for solo developers with GitHub sync | https://github.com/asha-verma/devboard\nsnip-cli | Terminal snippet manager in Rust | https://github.com/asha-verma/snip-cli",
  currentWork: "a self-hosted analytics dashboard",
  learning: "Rust and systems programming",
  showStats: true,
  showTopLangs: true,
  linkedin: "asha-verma",
  website: "ashaverma.dev",
  email: "asha@example.com",
};

/** Parse "Name | description | url" lines into project objects. */
const parseProjects = (raw) =>
  raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const [name = "", description = "", url = ""] = line.split("|").map((part) => part.trim());
      return { name, description, url };
    });

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [headline, setHeadline] = useState(DEFAULTS.headline);
  const [about, setAbout] = useState(DEFAULTS.about);
  const [githubUsername, setGithubUsername] = useState(DEFAULTS.githubUsername);
  const [skills, setSkills] = useState(DEFAULTS.skills);
  const [projects, setProjects] = useState(DEFAULTS.projects);
  const [currentWork, setCurrentWork] = useState(DEFAULTS.currentWork);
  const [learning, setLearning] = useState(DEFAULTS.learning);
  const [showStats, setShowStats] = useState(DEFAULTS.showStats);
  const [showTopLangs, setShowTopLangs] = useState(DEFAULTS.showTopLangs);
  const [linkedin, setLinkedin] = useState(DEFAULTS.linkedin);
  const [website, setWebsite] = useState(DEFAULTS.website);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      generateProfileReadme({
        name,
        headline,
        about,
        githubUsername,
        skills: parseList(skills),
        projects: parseProjects(projects),
        currentWork,
        learning,
        showStats,
        showTopLangs,
        linkedin,
        website,
        email,
      }),
    [
      name,
      headline,
      about,
      githubUsername,
      skills,
      projects,
      currentWork,
      learning,
      showStats,
      showTopLangs,
      linkedin,
      website,
      email,
    ],
  );

  const hasError = Boolean(result.error);

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setName(DEFAULTS.name);
    setHeadline(DEFAULTS.headline);
    setAbout(DEFAULTS.about);
    setGithubUsername(DEFAULTS.githubUsername);
    setSkills(DEFAULTS.skills);
    setProjects(DEFAULTS.projects);
    setCurrentWork(DEFAULTS.currentWork);
    setLearning(DEFAULTS.learning);
    setShowStats(DEFAULTS.showStats);
    setShowTopLangs(DEFAULTS.showTopLangs);
    setLinkedin(DEFAULTS.linkedin);
    setWebsite(DEFAULTS.website);
    setEmail(DEFAULTS.email);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Skill badges", DASH],
        ["Projects listed", DASH],
        ["Stats widgets", DASH],
      ]
    : [
        ["Skill badges", `${NUM.format(result.skillCount)} of ${MAX_SKILLS} max`],
        ["Projects listed", `${NUM.format(result.projectCount)} of ${MAX_PROJECTS} max`],
        [
          "Stats widgets",
          [showStats ? "stats card" : null, showTopLangs ? "top languages" : null]
            .filter(Boolean)
            .join(" + ") || "none",
        ],
        ["Target repository", result.username ? `github.com/${result.username}/${result.username}` : "—"],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Github className="h-4 w-4" aria-hidden="true" />
          Interview prep
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Developer Portfolio Readme Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Create a repository named exactly after your username and its README becomes your
          GitHub profile page. Fill in the blocks to generate one with shields.io skill
          badges, project links and github-readme-stats widgets.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-name">
              Your name
            </label>
            <input
              id="pr-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-username">
              GitHub username
            </label>
            <input
              id="pr-username"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={githubUsername}
              onChange={(event) => setGithubUsername(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-headline">
              Headline (one line)
            </label>
            <input
              id="pr-headline"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-about">
              About you
            </label>
            <textarea
              id="pr-about"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-skills">
              Skills (comma separated, max {MAX_SKILLS})
            </label>
            <textarea
              id="pr-skills"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={2}
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="pr-projects">
              Projects — one per line as: Name | description | URL
            </label>
            <textarea
              id="pr-projects"
              className={`mt-2 ${TEXTAREA_CLASS}`}
              rows={3}
              value={projects}
              onChange={(event) => setProjects(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-work">
              Currently working on
            </label>
            <input
              id="pr-work"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={currentWork}
              onChange={(event) => setCurrentWork(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-learning">
              Currently learning
            </label>
            <input
              id="pr-learning"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={learning}
              onChange={(event) => setLearning(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-linkedin">
              LinkedIn handle or URL
            </label>
            <input
              id="pr-linkedin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={linkedin}
              onChange={(event) => setLinkedin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-website">
              Website
            </label>
            <input
              id="pr-website"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pr-email">
              Contact email
            </label>
            <input
              id="pr-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 grid gap-1 sm:grid-cols-2">
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="pr-stats"
          >
            <input
              id="pr-stats"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={showStats}
              onChange={(event) => setShowStats(event.target.checked)}
            />
            Include GitHub stats card
          </label>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-[var(--foreground)]"
            htmlFor="pr-langs"
          >
            <input
              id="pr-langs"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={showTopLangs}
              onChange={(event) => setShowTopLangs(event.target.checked)}
            />
            Include top-languages card
          </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              README sections generated
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : NUM.format(result.markdown.split("\n## ").length)}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : "Paste README.md into the repository named after your username to publish it."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the generated README markdown"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy README"}
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

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">README.md</h2>
        <div className="mt-3 overflow-x-auto rounded-md border border-[var(--border)] bg-[var(--background)]">
          <pre className="min-w-[280px] whitespace-pre p-4 text-xs leading-5">
            {hasError ? DASH : result.markdown}
          </pre>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Stats widgets are served by the open-source github-readme-stats project and shields.io
        — both free, no tokens needed for public data. Everything is generated locally in
        your browser; nothing you type leaves this page.
      </p>
    </main>
  );
}
