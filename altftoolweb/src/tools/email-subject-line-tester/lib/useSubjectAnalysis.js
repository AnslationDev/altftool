"use client";

import { useMemo } from "react";
import { analyzeSubject } from "./scoringEngine";
import { generateSuggestions } from "./suggestions";
import { generateVariations } from "./variations";
import { buildInboxPreviews } from "./inboxPreview";
import { findHighlightSpans } from "./scoringEngine";

// Single entry point the UI calls to go from a raw subject-line string to
// every derived piece of data (score, suggestions, variations, inbox
// previews, highlight spans). Memoized on `subject` so retyping doesn't
// re-run the whole pipeline on every keystroke render more than once.
export function useSubjectAnalysis(subject) {
  return useMemo(() => {
    const trimmed = subject.trim();
    const analysis = analyzeSubject(subject);
    const suggestions = generateSuggestions(analysis);
    const variations = generateVariations(subject, analysis);
    const previews = buildInboxPreviews(trimmed);
    const highlightSpans = trimmed ? findHighlightSpans(subject) : [];

    return { analysis, suggestions, variations, previews, highlightSpans };
  }, [subject]);
}
