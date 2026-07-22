"use client";

import { useEffect, useState } from "react";
import { Gauge, LayoutGrid, Highlighter, Lightbulb, Wand2, Inbox, SplitSquareHorizontal, Clock3 } from "lucide-react";
import Tabs, { TabPanel } from "./ui/Tabs";
import Card from "./ui/Card";
import SubjectInputPanel from "./SubjectInputPanel";
import ScoreOverview from "./ScoreOverview";
import MetricCardsGrid from "./MetricCardsGrid";
import HighlightedSubject from "./HighlightedSubject";
import SuggestionsPanel from "./SuggestionsPanel";
import VariationsPanel from "./VariationsPanel";
import InboxPreviews from "./InboxPreviews";
import InsightsDashboard from "./InsightsDashboard";
import ComparisonMode from "./ComparisonMode";
import ExportMenu from "./ExportMenu";
import HistoryFavorites from "./HistoryFavorites";
import SeoSection from "./SeoSection";
import { useSubjectAnalysis } from "../lib/useSubjectAnalysis";
import { getHistory, getFavorites, pushHistory, toggleFavorite, clearHistory } from "../lib/storage";

const ID_PREFIX = "estl";
const HISTORY_DEBOUNCE_MS = 1000;
const MIN_CHARS_TO_SAVE = 3;

export default function MainSection() {
  const [subject, setSubject] = useState("");
  const [activeTab, setActiveTab] = useState("metrics");
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const { analysis, suggestions, variations, previews, highlightSpans } = useSubjectAnalysis(subject);

  useEffect(() => {
    setMounted(true);
    setHistory(getHistory());
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    if (!analysis.subject || analysis.subject.length < MIN_CHARS_TO_SAVE) return undefined;
    const handle = window.setTimeout(() => {
      setHistory(
        pushHistory({ subject: analysis.subject, overall: analysis.scores.overall, grade: analysis.scores.grade }),
      );
    }, HISTORY_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [analysis.subject, analysis.scores.overall, analysis.scores.grade]);

  function handleToggleFavorite(entry) {
    setFavorites(toggleFavorite(entry));
  }

  function handleClearHistory() {
    setHistory(clearHistory());
  }

  const tabs = [
    { id: "metrics", label: "Metrics", icon: <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "highlights", label: "Highlights", icon: <Highlighter className="h-3.5 w-3.5" aria-hidden="true" /> },
    {
      id: "suggestions",
      label: "Suggestions",
      icon: <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />,
      badge: subject ? suggestions.length : 0,
    },
    {
      id: "variations",
      label: "Variations",
      icon: <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />,
      badge: subject ? variations.length : 0,
    },
    { id: "preview", label: "Inbox Preview", icon: <Inbox className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "insights", label: "Insights", icon: <Gauge className="h-3.5 w-3.5" aria-hidden="true" /> },
    { id: "compare", label: "Compare (A/B)", icon: <SplitSquareHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> },
    {
      id: "history",
      label: "History",
      icon: <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />,
      badge: history.length,
    },
  ];

  return (
    <div className="bg-(--background) text-(--foreground)">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
        <div
          aria-live="polite"
          className="sr-only"
        >
          {analysis.subject ? `Overall score ${analysis.scores.overall} out of 100, grade ${analysis.scores.grade}.` : ""}
        </div>

        <div className="mb-6 text-center sm:mb-8 sm:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-(--primary)/10 px-3 py-1 text-xs font-semibold text-(--primary)">
            <Gauge className="h-3.5 w-3.5" aria-hidden="true" /> Email Marketing
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
            Email Subject Line{" "}
            <span className="bg-gradient-to-r from-(--primary) to-(--secondary) bg-clip-text text-transparent">Tester</span>
          </h1>
          <p className="mt-2 max-w-2xl text-(--muted-foreground) sm:text-lg">
            Score your subject line for spam risk, readability and clickability, preview how it truncates across
            Gmail, Outlook and Apple Mail, then A/B test it — every number is calculated with fixed rules, live as you
            type.
          </p>
        </div>

        <SubjectInputPanel subject={subject} onChange={setSubject} />

        <div className="mt-6">
          <ScoreOverview analysis={analysis} />
        </div>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} idPrefix={ID_PREFIX} />
          <ExportMenu analysis={analysis} suggestions={suggestions} variations={variations} />
        </div>

        <div className="mt-5">
          <TabPanel tabId="metrics" activeId={activeTab} idPrefix={ID_PREFIX}>
            <MetricCardsGrid analysis={analysis} />
          </TabPanel>
          <TabPanel tabId="highlights" activeId={activeTab} idPrefix={ID_PREFIX}>
            <HighlightedSubject subject={analysis.subject} spans={highlightSpans} />
          </TabPanel>
          <TabPanel tabId="suggestions" activeId={activeTab} idPrefix={ID_PREFIX}>
            <SuggestionsPanel subject={analysis.subject} suggestions={suggestions} />
          </TabPanel>
          <TabPanel tabId="variations" activeId={activeTab} idPrefix={ID_PREFIX}>
            <VariationsPanel subject={analysis.subject} variations={variations} onApply={setSubject} />
          </TabPanel>
          <TabPanel tabId="preview" activeId={activeTab} idPrefix={ID_PREFIX}>
            <InboxPreviews subject={analysis.subject} previews={previews} />
          </TabPanel>
          <TabPanel tabId="insights" activeId={activeTab} idPrefix={ID_PREFIX}>
            <InsightsDashboard subject={analysis.subject} insights={analysis.insights} />
          </TabPanel>
          <TabPanel tabId="compare" activeId={activeTab} idPrefix={ID_PREFIX}>
            <ComparisonMode />
          </TabPanel>
          <TabPanel tabId="history" activeId={activeTab} idPrefix={ID_PREFIX}>
            {mounted ? (
              <HistoryFavorites
                history={history}
                favorites={favorites}
                onSelect={setSubject}
                onToggleFavorite={handleToggleFavorite}
                onClearHistory={handleClearHistory}
              />
            ) : (
              <Card className="h-40 animate-pulse p-6" />
            )}
          </TabPanel>
        </div>

        <div className="mt-10">
          <SeoSection />
        </div>
      </div>
    </div>
  );
}
