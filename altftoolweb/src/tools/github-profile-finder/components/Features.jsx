import React from "react";
import { Search, Github, ShieldCheck, Zap, Sliders, Info } from "lucide-react";

const faqItems = [
  {
    question: "What is the GitHub Profile Finder?",
    answer:
      "It is a developer utility that fetches public profile data, follower stats, and repositories directly from the GitHub API and renders them in a premium visual interface.",
  },
  {
    question: "Do I need a GitHub account to search?",
    answer:
      "No. You can search for any public GitHub username, organization, or developer account instantly without logging in.",
  },
  {
    question: "Why does the tool show a rate limit warning?",
    answer:
      "The GitHub public API limits unauthenticated requests to 60 requests per hour per IP address. If you hit this limit, wait a few minutes before trying again.",
  },
  {
    question: "Are my searches private?",
    answer:
      "Yes. All queries are executed client-side directly from your web browser to the official GitHub API. We do not track or save your search queries on any database.",
  },
  {
    question: "Can I search for private repositories?",
    answer:
      "No. The GitHub Public REST API only allows retrieval of open-source and public repositories that are visible to the public.",
  },
  {
    question: "How is the language breakdown calculated?",
    answer:
      "We scan the top public repositories of the user, parse their primary language tags, and aggregate the percentages to show a clean visual language distribution chart.",
  },
];

export default function Features() {
  return (
    <section className="py-16 sm:py-20 px-4 bg-(--background) border-t border-(--border)">
      <div className="mx-auto max-w-6xl">
        
        {/* Core Features Grid */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-(--foreground) sm:text-4xl tracking-tight">
            Comprehensive GitHub Profiler
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Analyze repositories, evaluate primary languages, and inspect open-source contributions instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Instant Fetching</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Query GitHub's REST endpoints in real-time to load the latest bio, stats, and star metrics.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <Github className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">Language Chart</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Visualize code distributions across top repositories to understand user focus areas.
            </p>
          </div>

          <div className="bg-(--surface) p-6 rounded-xl border border-(--border) shadow-sm hover:shadow-md transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-(--foreground) mb-2">No Tracking</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              100% serverless. All network requests go straight from your device to GitHub API.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-(--foreground) mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our browser-based GitHub Profile Finder
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-(--surface) rounded-2xl border border-(--border) p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-bold text-(--foreground) mb-3 flex items-start gap-2.5">
                  <span className="text-teal-500 font-extrabold text-lg shrink-0">Q.</span>
                  <span>{item.question}</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
