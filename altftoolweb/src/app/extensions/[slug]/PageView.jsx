// Server component. The extension document is read on the server by page.jsx and
// handed down as a prop, so the H1, the answer-first paragraph and every fact in
// the markup exist in the initial HTML instead of appearing after a client-side
// Firestore round trip.

import Link from "next/link";
import {
  ArrowLeft, Check, Camera, FileJson, Chrome, Star, Shield, Zap,
  Globe, BookOpen, Calculator, Calendar, Thermometer,
  TrendingUp, DollarSign, Fuel, ArrowRightLeft, Droplets, PieChart,
  FileUp, RefreshCcw, FileSpreadsheet, FileImage, Eye, FileText, Code,
  Palette, Pipette, Hash, Layers, Type, Timer, Maximize, CheckSquare,
  Clock, Search, SpellCheck, Mic, Sparkles, Bookmark, FileCode,
  Briefcase, Smile, Key, Mail, ShieldCheck, Cpu, Accessibility,
  Minimize, Crop, Move, Video, PenTool, FastForward, UserPlus,
  MessageCircle, CreditCard, Box, MousePointer, Circle, Highlighter,
  CalendarDays, Code2, BarChart, ListChecks, HelpCircle, Recycle,
  History, Car, Volume2, Book, Lock, AtSign, FileSearch, Pen, Tag,
  Plane, Server, Link as LinkIcon, Link2, StickyNote, EyeOff,
  CalendarClock, Image, Cookie, ShoppingCart, Layout, Save, Puzzle,
  Gamepad2, QrCode, Keyboard, MessageSquare, ClipboardList, FileX,
  Settings2, KeyRound, ListTodo, Headphones, Library
} from "lucide-react";

/* ---------------- ICON MAP ---------------- */
const getIcon = (iconName) => {
  const icons = {
    Camera, FileJson, Calculator, Calendar, Thermometer, TrendingUp,
    DollarSign, Fuel, ArrowRightLeft, Droplets, PieChart, FileUp,
    RefreshCcw, FileSpreadsheet, BookOpen, FileImage, Eye, FileText,
    Code, Palette, Pipette, Hash, Layers, Type, Timer, Maximize,
    CheckSquare, Clock, Search, SpellCheck, Mic, Sparkles, Bookmark,
    FileCode, Briefcase, Smile, Key, Mail, Zap, ShieldCheck, Cpu,
    Accessibility, Minimize, Crop, Move, Video, PenTool, FastForward,
    UserPlus, MessageCircle, CreditCard, Box, MousePointer, Circle,
    Highlighter, CalendarDays, Code2, BarChart, ListChecks, HelpCircle,
    Shield, Recycle, History, Car, Volume2, Globe, Book, Lock, AtSign,
    FileSearch, Pen, Tag, Plane, Server, Link: LinkIcon, Link2,
    StickyNote, EyeOff, CalendarClock, Image, Cookie, ShoppingCart,
    Layout, Save, Puzzle, Gamepad2, QrCode, Keyboard, MessageSquare,
    ClipboardList, FileX, Settings2, KeyRound, ListTodo, Headphones,
    Library
  };
  return icons[iconName] || Camera;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function formatCatalogDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return { label: dateFormatter.format(date), iso: date.toISOString().slice(0, 10) };
}

// Answer-first sentence: what this thing is, in one self-contained line, ahead of
// the catalog description. Answer engines lift this verbatim.
export function buildLeadSentence(extension) {
  return `${extension.name} is a Chrome browser extension listed on AltFTool in the ${extension.category} category.`;
}

// Rendered verbatim under the "Is X hosted on AltFTool?" heading and reused as
// the matching FAQ answer, so schema and markup can never drift apart.
export function buildHostingAnswer(extension) {
  return (
    `No. AltFTool catalogues ${extension.name} and links to its official Chrome Web Store listing. ` +
    "The extension package, its permissions, its updates and any pricing are handled by the Chrome " +
    "Web Store, not by this page. AltFTool does not distribute the extension file and does not take " +
    "payment for it."
  );
}

// The three install steps rendered as a visible <ol>; also the HowTo steps.
export function buildInstallSteps(extension) {
  if (!extension.chromeUrl) return [];
  return [
    `Open the ${extension.name} listing on the Chrome Web Store.`,
    `Select "Add to Chrome", then confirm "Add extension" in the browser dialog.`,
    `Open Chrome's Extensions menu (the puzzle-piece icon) and pin ${extension.name} to keep it one click away.`,
  ];
}

const cellClass = "py-2.5 align-top text-sm";
const rowClass = "border-b border-dashed border-[var(--border)] last:border-0";

export default function ExtensionDetailsPage({ extension }) {
  const Icon = getIcon(extension.icon);
  const features = Array.isArray(extension.features) ? extension.features : [];
  const installSteps = buildInstallSteps(extension);
  const updated = formatCatalogDate(extension.updatedAt);
  const leadSentence = buildLeadSentence(extension);
  const hasRating = Number(extension.rating) > 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-white">

      {/* Background Decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[var(--primary)] opacity-[0.03] blur-[100px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[var(--primary)] opacity-[0.03] blur-[120px]" />
      </div>

      {/* Navbar / Back Link */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center">
          <Link
            href="/extensions"
            className="group inline-flex min-h-11 items-center rounded-md text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transition-none"
          >
            <div className="p-1.5 rounded-full group-hover:bg-[var(--muted)] transition-colors duration-150 mr-2 motion-reduce:transition-none">
              <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none" />
            </div>
            Back to Extensions
          </Link>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-12">

        <header className="flex flex-col lg:flex-row gap-12 items-center mb-16">

          <div className="relative group shrink-0">
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center rounded-[2rem] bg-gradient-to-br from-[var(--card)] to-[var(--muted)] ring-1 ring-[var(--border)] shadow-lg transition-shadow duration-300 group-hover:shadow-xl group-hover:ring-[var(--primary)]/30 motion-reduce:transition-none">
              <Icon strokeWidth={1.5} aria-hidden="true" className="w-16 h-16 md:w-20 md:h-20 text-[var(--foreground)] transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none" />
            </div>
          </div>

          <div className="flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 text-xs font-bold tracking-wide uppercase rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                  {extension.category}
                </span>
                {hasRating ? (
                  <div className="flex items-center gap-1 bg-[var(--muted)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                    <Star className="w-3.5 h-3.5 text-[var(--primary)] fill-current" aria-hidden="true" />
                    <span className="text-xs font-semibold text-[var(--foreground)]">
                      {extension.rating}
                    </span>
                    <span className="sr-only">AltFTool catalog rating out of 5</span>
                  </div>
                ) : null}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-[var(--foreground)] mb-6">
                {extension.name}
              </h1>

              {/* Answer-first: one self-contained sentence, then the catalog copy. */}
              <p className="text-lg md:text-xl text-[var(--foreground)] leading-relaxed max-w-3xl">
                {leadSentence}
              </p>
              <p className="mt-4 text-base md:text-lg text-[var(--muted-foreground)] leading-relaxed max-w-3xl">
                {extension.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {extension.chromeUrl && (
                <a
                  href={extension.chromeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[var(--primary-foreground)] transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:brightness-110 shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/40 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Chrome className="w-5 h-5 mr-2.5" aria-hidden="true" />
                  Add to Chrome
                </a>
              )}

              <Link
                href="/extensions"
                className="inline-flex items-center justify-center px-6 py-4 text-base font-semibold text-[var(--foreground)] bg-[var(--card)] border border-[var(--border)] rounded-2xl transition-colors duration-150 hover:bg-[var(--muted)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none motion-reduce:transition-none"
              >
                <BookOpen className="w-5 h-5 mr-2.5 text-[var(--muted-foreground)]" aria-hidden="true" />
                Browse all extensions
              </Link>
            </div>
          </div>
        </header>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-12">

            {features.length > 0 ? (
              <section aria-labelledby="extension-features-heading">
                <h2
                  id="extension-features-heading"
                  className="text-2xl font-bold text-[var(--foreground)] mb-8 flex items-center gap-3"
                >
                  <span className="p-2 rounded-lg bg-[var(--primary)]/10">
                    <Zap className="w-5 h-5 text-[var(--primary)]" aria-hidden="true" />
                  </span>
                  What can you do with {extension.name}?
                </h2>

                <ul className="grid sm:grid-cols-2 gap-4 list-none p-0">
                  {features.map((feature, index) => (
                    <li
                      key={`${index}-${feature}`}
                      className="group flex flex-col p-5 rounded-2xl bg-[var(--card)] ring-1 ring-[var(--border)] hover:ring-[var(--primary)]/30 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      <span className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-3">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="text-[var(--foreground)] font-medium leading-snug">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {installSteps.length > 0 ? (
              <section aria-labelledby="extension-install-heading">
                <h2
                  id="extension-install-heading"
                  className="text-2xl font-bold text-[var(--foreground)] mb-6"
                >
                  How do I install {extension.name}?
                </h2>
                <ol className="space-y-4 list-none p-0">
                  {installSteps.map((step, index) => (
                    <li key={step} className="flex gap-4">
                      <span
                        aria-hidden="true"
                        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-bold text-[var(--primary)]"
                      >
                        {index + 1}
                      </span>
                      <span className="text-[var(--muted-foreground)] leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
                {extension.chromeUrl ? (
                  <p className="mt-5 text-sm text-[var(--muted-foreground)]">
                    Official listing:{" "}
                    <a
                      href={extension.chromeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--primary)] underline underline-offset-4 hover:brightness-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    >
                      {extension.name} on the Chrome Web Store
                    </a>
                  </p>
                ) : null}
              </section>
            ) : null}

            <section aria-labelledby="extension-hosting-heading">
              <h2
                id="extension-hosting-heading"
                className="text-2xl font-bold text-[var(--foreground)] mb-4"
              >
                Is {extension.name} hosted on AltFTool?
              </h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {buildHostingAnswer(extension)}
              </p>
            </section>

          </div>

          {/* Right Column: verifiable catalog facts only */}
          <div className="lg:col-span-4">
            <section
              aria-labelledby="extension-facts-heading"
              className="p-6 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-sm sticky top-24"
            >
              <h2
                id="extension-facts-heading"
                className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-4"
              >
                {extension.name} at a glance
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <caption className="sr-only">
                    Key catalog facts about the {extension.name} Chrome extension
                  </caption>
                  <tbody>
                    <tr className={rowClass}>
                      <th scope="row" className={`${cellClass} pr-4 font-medium text-[var(--muted-foreground)]`}>
                        Category
                      </th>
                      <td className={`${cellClass} font-medium text-[var(--foreground)]`}>
                        {extension.category}
                      </td>
                    </tr>
                    <tr className={rowClass}>
                      <th scope="row" className={`${cellClass} pr-4 font-medium text-[var(--muted-foreground)]`}>
                        Browser
                      </th>
                      <td className={`${cellClass} font-medium text-[var(--foreground)]`}>
                        Google Chrome
                      </td>
                    </tr>
                    {extension.chromeUrl ? (
                      <tr className={rowClass}>
                        <th scope="row" className={`${cellClass} pr-4 font-medium text-[var(--muted-foreground)]`}>
                          Install source
                        </th>
                        <td className={`${cellClass} font-medium`}>
                          <a
                            href={extension.chromeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--primary)] underline underline-offset-4 hover:brightness-110 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                          >
                            Chrome Web Store
                          </a>
                        </td>
                      </tr>
                    ) : null}
                    {features.length > 0 ? (
                      <tr className={rowClass}>
                        <th scope="row" className={`${cellClass} pr-4 font-medium text-[var(--muted-foreground)]`}>
                          Listed features
                        </th>
                        <td className={`${cellClass} font-medium text-[var(--foreground)]`}>
                          {features.length}
                        </td>
                      </tr>
                    ) : null}
                    {updated ? (
                      <tr className={rowClass}>
                        <th scope="row" className={`${cellClass} pr-4 font-medium text-[var(--muted-foreground)]`}>
                          Catalog entry updated
                        </th>
                        <td className={`${cellClass} font-medium text-[var(--foreground)]`}>
                          <time dateTime={updated.iso}>{updated.label}</time>
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

      </main>
    </div>
  );
}
