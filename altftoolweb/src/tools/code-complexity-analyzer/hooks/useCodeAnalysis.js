// Real-time analysis engine hook
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { tokenize, getTokensByLine } from '../utils/tokenizer';
import { parseCode, buildStructureTree } from '../services/parser';
import { calculateComplexity, getLineComplexityMap } from '../services/complexity';
import { detectSmells } from '../services/smellDetector';
import { generateSuggestions, getSuggestionsByFunction } from '../services/suggestionEngine';
import { calculateScores, generateReport, exportReportAsJSON, exportReportAsTXT } from '../services/scoring';

export function useCodeAnalysis(initialCode = '', langId = 'javascript', customThresholds = {}) {
    const [code, setCode] = useState(initialCode);
    const [language, setLanguage] = useState(langId);
    const [thresholds, setThresholds] = useState({
        maxFunctionLength: 40,
        maxNesting: 3,
        maxParams: 4,
        maxComplexity: 10,
        ...customThresholds,
    });
    const [analysis, setAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const debounceRef = useRef(null);
    const lastCodeRef = useRef('');

    const runAnalysis = useCallback((sourceCode = code, lang = language, thresh = thresholds) => {
        if (!sourceCode.trim()) {
            setAnalysis(null);
            setIsAnalyzing(false);
            return;
        }

        try {
            setIsAnalyzing(true);

            // Step 1: Tokenize
            const tokens = tokenize(sourceCode, lang);
            const tokensByLine = getTokensByLine(tokens);

            // Step 2: Parse
            const parsed = parseCode(sourceCode, lang);

            // Step 3: Calculate complexity
            const complexity = calculateComplexity(parsed, sourceCode, lang);

            // Step 4: Line complexity map
            const lineComplexityMap = getLineComplexityMap(parsed, complexity);

            // Step 5: Detect smells
            const smells = detectSmells(parsed, complexity, thresh);

            // Step 6: Generate suggestions
            const suggestions = generateSuggestions(smells);
            const suggestionsByFunction = getSuggestionsByFunction(suggestions);

            // Step 7: Calculate scores
            const scores = calculateScores(parsed, complexity, smells, thresh);

            // Step 8: Build structure tree
            const structureTree = buildStructureTree(parsed.functions);

            // Step 9: Generate report data
            const report = generateReport(parsed, complexity, smells, suggestions, scores);

            setAnalysis({
                tokens,
                tokensByLine, // Used in LineAnalysisPanel
                lineTokens: tokensByLine, // Alias for compatibility
                parsed,
                complexity,
                lineComplexityMap, // Used in Editor/Dashboard
                lineMap: lineComplexityMap, // Alias for compatibility
                smells,
                suggestions,
                suggestionsByFunction,
                scores,
                structureTree,
                report,
            });
        } catch (err) {
            console.error('Analysis error:', err);
            setAnalysis(null);
        } finally {
            setIsAnalyzing(false);
        }
    }, [code, language, thresholds]);

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (code === lastCodeRef.current && language === langId) return;
        lastCodeRef.current = code;

        debounceRef.current = setTimeout(() => {
            runAnalysis(code, language, thresholds);
        }, 350);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [code, language, thresholds, runAnalysis, langId]);

    const exportAnalysis = useCallback((format = 'json') => {
        if (!analysis) return '';
        return format === 'json' ? exportReportAsJSON(analysis.report) : exportReportAsTXT(analysis.report);
    }, [analysis]);

    const downloadReport = useCallback((format = 'json') => {
        const content = exportAnalysis(format);
        if (!content) return;

        const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complexity-report.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, [exportAnalysis]);

    return {
        code,
        updateCode: setCode,
        language,
        setLanguage,
        thresholds,
        setThresholds,
        analysis,
        isAnalyzing,
        runAnalysis,
        exportAnalysis,
        downloadReport,
    };
}
