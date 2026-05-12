// Scoring system with weighted penalties

export function calculateScores(parsedCode, complexityData, smells, customThresholds = {}) {
    const thresholds = {
        maxFunctionLength: 40,
        maxNesting: 3,
        maxParams: 4,
        maxComplexity: 10,
        ...customThresholds,
    };

    const complexityScore = calculateComplexityScore(complexityData, thresholds);
    const readabilityScore = calculateReadabilityScore(parsedCode, complexityData, thresholds);
    const maintainabilityScore = calculateMaintainabilityScore(parsedCode, complexityData, smells, thresholds);

    const overall = Math.round(
        complexityScore * 0.35 +
        readabilityScore * 0.30 +
        maintainabilityScore * 0.35
    );

    return {
        overall: clamp(overall),
        complexity: clamp(complexityScore),
        readability: clamp(readabilityScore),
        maintainability: clamp(maintainabilityScore),
        grade: getGrade(overall),
        breakdown: {
            complexityWeight: 0.35,
            readabilityWeight: 0.30,
            maintainabilityWeight: 0.35,
        },
    };
}

function calculateComplexityScore(complexityData, thresholds) {
    let score = 100;
    const functions = complexityData.functionDetails;

    if (functions.length === 0) return 100;

    for (const fn of functions) {
        // Penalize based on how much complexity exceeds threshold
        if (fn.complexity > thresholds.maxComplexity) {
            const excess = fn.complexity - thresholds.maxComplexity;
            score -= excess * 3;
        } else if (fn.complexity > thresholds.maxComplexity * 0.7) {
            score -= 2;
        }
    }

    // Penalize high average complexity
    if (complexityData.average > 8) {
        score -= (complexityData.average - 8) * 5;
    }

    return Math.round(score);
}

function calculateReadabilityScore(parsedCode, complexityData, thresholds) {
    let score = 100;
    const functions = complexityData.functionDetails;

    for (const fn of functions) {
        // Long functions hurt readability
        if (fn.loc > thresholds.maxFunctionLength) {
            const excess = fn.loc - thresholds.maxFunctionLength;
            score -= Math.min(excess * 1.5, 20);
        }

        // Deep nesting hurts readability
        if (fn.nestingDepth > thresholds.maxNesting) {
            const excess = fn.nestingDepth - thresholds.maxNesting;
            score -= excess * 5;
        }

        // Too many params hurt readability
        if (fn.paramCount > thresholds.maxParams) {
            score -= (fn.paramCount - thresholds.maxParams) * 3;
        }
    }

    // Comment ratio bonus
    const commentRatio = parsedCode.totalLines > 0
        ? parsedCode.commentLines / parsedCode.totalLines
        : 0;
    if (commentRatio > 0.1 && commentRatio < 0.4) {
        score += 5;
    }

    return Math.round(score);
}

function calculateMaintainabilityScore(parsedCode, complexityData, smells, thresholds) {
    let score = 100;

    // Penalize based on smell severity
    for (const smell of smells) {
        switch (smell.severity) {
            case 'HIGH':
                score -= 8;
                break;
            case 'MEDIUM':
                score -= 4;
                break;
            case 'LOW':
                score -= 2;
                break;
        }
    }

    // Bonus for small, focused functions
    const functions = complexityData.functionDetails;
    const avgLoc = functions.length > 0
        ? functions.reduce((s, f) => s + f.loc, 0) / functions.length
        : 0;

    if (avgLoc <= 20 && functions.length > 0) {
        score += 5;
    }

    // Penalize very few functions in long code (monolithic)
    if (parsedCode.totalLines > 50 && functions.length <= 1) {
        score -= 15;
    }

    return Math.round(score);
}

function clamp(val) {
    return Math.max(0, Math.min(100, val));
}

export function getGrade(score) {
    if (score >= 85) return { label: 'Excellent', color: '#22c55e', emoji: '🌟' };
    if (score >= 70) return { label: 'Good', color: '#3b82f6', emoji: '👍' };
    if (score >= 50) return { label: 'Moderate', color: '#eab308', emoji: '⚠️' };
    return { label: 'Poor', color: '#ef4444', emoji: '🔴' };
}

export function generateReport(parsedCode, complexityData, smells, suggestions, scores) {
    return {
        summary: {
            totalLines: parsedCode.totalLines,
            codeLines: parsedCode.codeLines,
            commentLines: parsedCode.commentLines,
            blankLines: parsedCode.blankLines,
            functionCount: parsedCode.functions.length,
            totalComplexity: complexityData.total,
            averageComplexity: complexityData.average,
            issueCount: smells.length,
            overallScore: scores.overall,
            grade: scores.grade.label,
        },
        scores,
        functions: complexityData.functionDetails.map(fn => ({
            name: fn.name,
            startLine: fn.startLine,
            endLine: fn.endLine,
            loc: fn.loc,
            complexity: fn.complexity,
            nestingDepth: fn.nestingDepth,
            paramCount: fn.paramCount,
            loopCount: fn.loopCount,
            conditionalCount: fn.conditionalCount,
        })),
        issues: smells,
        suggestions,
        timestamp: new Date().toISOString(),
    };
}

export function exportReportAsJSON(report) {
    return JSON.stringify(report, null, 2);
}

export function exportReportAsTXT(report) {
    let txt = '';
    txt += '='.repeat(60) + '\n';
    txt += '  CODE COMPLEXITY ANALYSIS REPORT\n';
    txt += '='.repeat(60) + '\n\n';
    txt += `Generated: ${report.timestamp}\n\n`;

    txt += '--- SUMMARY ---\n';
    txt += `Total Lines: ${report.summary.totalLines}\n`;
    txt += `Code Lines: ${report.summary.codeLines}\n`;
    txt += `Comment Lines: ${report.summary.commentLines}\n`;
    txt += `Functions: ${report.summary.functionCount}\n`;
    txt += `Total Complexity: ${report.summary.totalComplexity}\n`;
    txt += `Average Complexity: ${report.summary.averageComplexity}\n`;
    txt += `Issues Found: ${report.summary.issueCount}\n`;
    txt += `Overall Score: ${report.summary.overallScore}/100 (${report.summary.grade})\n\n`;

    txt += '--- SCORES ---\n';
    txt += `Complexity: ${report.scores.complexity}/100\n`;
    txt += `Readability: ${report.scores.readability}/100\n`;
    txt += `Maintainability: ${report.scores.maintainability}/100\n`;
    txt += `Overall: ${report.scores.overall}/100\n\n`;

    txt += '--- FUNCTIONS ---\n';
    for (const fn of report.functions) {
        txt += `\n  ${fn.name} (lines ${fn.startLine}-${fn.endLine})\n`;
        txt += `    LOC: ${fn.loc} | Complexity: ${fn.complexity} | Nesting: ${fn.nestingDepth}\n`;
        txt += `    Params: ${fn.paramCount} | Loops: ${fn.loopCount} | Conditions: ${fn.conditionalCount}\n`;
    }

    txt += '\n--- ISSUES ---\n';
    for (const issue of report.issues) {
        txt += `\n  [${issue.severity}] ${issue.type}\n`;
        txt += `    ${issue.message}\n`;
        txt += `    Suggestion: ${issue.suggestion}\n`;
    }

    txt += '\n--- SUGGESTIONS ---\n';
    for (const sug of report.suggestions) {
        txt += `\n  [${sug.priority}] ${sug.title}\n`;
        txt += `    ${sug.description}\n`;
        if (sug.functionName) txt += `    Function: ${sug.functionName}\n`;
    }

    txt += '\n' + '='.repeat(60) + '\n';
    return txt;
}
