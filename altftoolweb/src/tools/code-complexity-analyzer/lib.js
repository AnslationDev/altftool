/**
 * Code Complexity Analyzer — pure analysis pipeline.
 *
 * `analyzeSource()` runs the same eight steps the UI hook runs, with no React
 * and no DOM, so the metrics can be checked in isolation.
 *
 * Metrics implemented (see ./services/*):
 *
 *  - Cyclomatic complexity (McCabe, 1976): one plus one per decision point —
 *    if, else-if, for, while, case, catch, &&, ||, ?:. A straight-line
 *    function scores 1. McCabe's original paper proposed 10 as the limit
 *    above which a module should be split, which is the default threshold.
 *  - Cognitive complexity, in the spirit of SonarSource's 2016 metric: each
 *    control-flow increment is weighted by how deeply it is nested, so a
 *    condition three levels in costs more than one at the top, and boolean
 *    operators add a flat point. It tracks "hard to read" rather than "hard
 *    to test". This is a line-based approximation, not a full AST walk, so
 *    treat it as a relative signal between functions rather than a figure to
 *    compare against a SonarQube report.
 *  - Halstead volume V = N × log2(U), where N is the total count of operators
 *    and operands and U is the count of distinct ones (Halstead, 1977).
 *  - Maintainability Index, the standard three-term form
 *      MI = 171 − 5.2 ln(V) − 0.23 G − 16.2 ln(LOC)
 *    where G is total cyclomatic complexity, then rescaled to 0-100.
 *
 * The composite score weights complexity 35%, readability 30% and
 * maintainability 35%, and grades it Excellent >= 85, Good >= 70,
 * Moderate >= 50, Poor below that.
 */

import { tokenize, getTokensByLine } from "./utils/tokenizer";
import { parseCode, buildStructureTree } from "./services/parser";
import { calculateComplexity, getLineComplexityMap } from "./services/complexity";
import { detectSmells } from "./services/smellDetector";
import { generateSuggestions, getSuggestionsByFunction } from "./services/suggestionEngine";
import { calculateScores, generateReport } from "./services/scoring";

export { tokenize, getTokensByLine } from "./utils/tokenizer";
export { parseCode, buildStructureTree } from "./services/parser";
export {
  calculateComplexity,
  getComplexityLevel,
  getLineComplexityMap,
} from "./services/complexity";
export { detectSmells, getSmellSeverityWeight } from "./services/smellDetector";
export { generateSuggestions, getSuggestionsByFunction } from "./services/suggestionEngine";
export {
  calculateScores,
  getGrade,
  generateReport,
  exportReportAsJSON,
  exportReportAsTXT,
} from "./services/scoring";
export { LANGUAGES, getLanguageConfig, detectLanguage, getSupportedLanguages } from "./utils/languageSupport";

/**
 * Default limits. `maxComplexity: 10` is McCabe's own recommended ceiling;
 * the other three are the conventional lint defaults for function length,
 * nesting depth and parameter count.
 */
export const DEFAULT_THRESHOLDS = {
  maxFunctionLength: 40,
  maxNesting: 3,
  maxParams: 4,
  maxComplexity: 10,
};

/** Score bands used by `getGrade`. */
export const GRADE_BANDS = { excellent: 85, good: 70, moderate: 50 };

/**
 * Analyse a source string end to end.
 *
 * @param {string} code
 * @param {string} langId — one of the ids in LANGUAGES.
 * @param {object} thresholds — overrides for DEFAULT_THRESHOLDS.
 * @returns {{ error: string } | object} full analysis, or a reason it failed.
 */
export function analyzeSource(code, langId = "javascript", thresholds = {}) {
  if (typeof code !== "string" || !code.trim()) {
    return { error: "Paste some code to analyse." };
  }

  const limits = { ...DEFAULT_THRESHOLDS, ...thresholds };

  try {
    const tokens = tokenize(code, langId);
    const tokensByLine = getTokensByLine(tokens);
    const parsed = parseCode(code, langId);
    const complexity = calculateComplexity(parsed, code, langId);
    const lineComplexityMap = getLineComplexityMap(parsed, complexity);
    const smells = detectSmells(parsed, complexity, limits);
    const suggestions = generateSuggestions(smells);
    const suggestionsByFunction = getSuggestionsByFunction(suggestions);
    const scores = calculateScores(parsed, complexity, smells, limits);
    const structureTree = buildStructureTree(parsed.functions);
    const report = generateReport(parsed, complexity, smells, suggestions, scores);

    return {
      tokens,
      tokensByLine,
      parsed,
      complexity,
      lineComplexityMap,
      smells,
      suggestions,
      suggestionsByFunction,
      scores,
      structureTree,
      report,
      thresholds: limits,
    };
  } catch (cause) {
    return { error: `That source could not be parsed: ${cause.message}` };
  }
}
