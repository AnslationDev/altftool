// Code smell detector
const DEFAULT_THRESHOLDS = {
    maxFunctionLength: 40,
    maxNesting: 3,
    maxParams: 4,
    maxComplexity: 10,
    maxConditions: 5,
    maxLoops: 4,
    maxSwitchCases: 8,
};

export function detectSmells(parsedCode, complexityData, customThresholds = {}) {
    const thresholds = { ...DEFAULT_THRESHOLDS, ...customThresholds };
    const smells = [];

    for (const fn of complexityData.functionDetails) {
        // Long function
        if (fn.loc > thresholds.maxFunctionLength) {
            smells.push({
                type: 'LONG_FUNCTION',
                severity: fn.loc > thresholds.maxFunctionLength * 2 ? 'HIGH' : 'MEDIUM',
                message: `Function "${fn.name}" has ${fn.loc} lines (max: ${thresholds.maxFunctionLength})`,
                suggestion: 'Split into smaller, focused functions with single responsibility',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.loc,
                threshold: thresholds.maxFunctionLength,
            });
        }

        // Deep nesting
        if (fn.nestingDepth > thresholds.maxNesting) {
            smells.push({
                type: 'DEEP_NESTING',
                severity: fn.nestingDepth > thresholds.maxNesting + 2 ? 'HIGH' : 'MEDIUM',
                message: `Function "${fn.name}" has nesting depth of ${fn.nestingDepth} (max: ${thresholds.maxNesting})`,
                suggestion: 'Use early returns, extract helper functions, or flatten conditions',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.nestingDepth,
                threshold: thresholds.maxNesting,
            });
        }

        // Too many parameters
        if (fn.paramCount > thresholds.maxParams) {
            smells.push({
                type: 'TOO_MANY_PARAMS',
                severity: fn.paramCount > thresholds.maxParams + 2 ? 'HIGH' : 'MEDIUM',
                message: `Function "${fn.name}" has ${fn.paramCount} parameters (max: ${thresholds.maxParams})`,
                suggestion: 'Use an options/config object pattern to group parameters',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.paramCount,
                threshold: thresholds.maxParams,
            });
        }

        // High complexity
        if (fn.complexity > thresholds.maxComplexity) {
            smells.push({
                type: 'HIGH_COMPLEXITY',
                severity: fn.complexity > thresholds.maxComplexity * 2 ? 'HIGH' : 'MEDIUM',
                message: `Function "${fn.name}" has cyclomatic complexity of ${fn.complexity} (max: ${thresholds.maxComplexity})`,
                suggestion: 'Break down complex logic, use strategy pattern, or extract conditions',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.complexity,
                threshold: thresholds.maxComplexity,
            });
        }

        // Excessive conditions
        if (fn.conditionalCount > thresholds.maxConditions) {
            smells.push({
                type: 'EXCESSIVE_CONDITIONS',
                severity: 'MEDIUM',
                message: `Function "${fn.name}" has ${fn.conditionalCount} conditional statements`,
                suggestion: 'Consider using lookup tables, polymorphism, or strategy pattern',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.conditionalCount,
                threshold: thresholds.maxConditions,
            });
        }

        // Excessive loops
        if (fn.loopCount > thresholds.maxLoops) {
            smells.push({
                type: 'EXCESSIVE_LOOPS',
                severity: 'MEDIUM',
                message: `Function "${fn.name}" has ${fn.loopCount} loops`,
                suggestion: 'Extract loop logic into separate functions or use array methods',
                functionName: fn.name,
                startLine: fn.startLine,
                endLine: fn.endLine,
                value: fn.loopCount,
                threshold: thresholds.maxLoops,
            });
        }
    }

    // Detect callback hell patterns
    const callbackSmells = detectCallbackHell(parsedCode);
    smells.push(...callbackSmells);

    // Detect repeated conditions
    const repeatedConditions = detectRepeatedConditions(parsedCode);
    smells.push(...repeatedConditions);

    // Detect large switch blocks
    const switchSmells = detectLargeSwitchBlocks(parsedCode, thresholds);
    smells.push(...switchSmells);

    return smells;
}

function detectCallbackHell(parsedCode) {
    const smells = [];

    for (const fn of parsedCode.functions) {
        const lines = fn.body.split('\n');
        let consecutiveCallbacks = 0;

        for (const line of lines) {
            if (/\bfunction\s*\(/.test(line) || /=>\s*\{/.test(line)) {
                consecutiveCallbacks++;
                if (consecutiveCallbacks >= 3) {
                    smells.push({
                        type: 'CALLBACK_HELL',
                        severity: 'HIGH',
                        message: `Potential callback hell detected in "${fn.name}"`,
                        suggestion: 'Use async/await, Promises, or extract callback handlers',
                        functionName: fn.name,
                        startLine: fn.startLine,
                        endLine: fn.endLine,
                    });
                    break;
                }
            }
        }
    }

    return smells;
}

function detectRepeatedConditions(parsedCode) {
    const smells = [];

    for (const fn of parsedCode.functions) {
        const lines = fn.body.split('\n');
        const conditions = [];

        for (const line of lines) {
            const match = line.match(/if\s*\((.+)\)/);
            if (match) {
                conditions.push(match[1].trim());
            }
        }

        const condCounts = {};
        for (const cond of conditions) {
            const normalized = cond.replace(/\s+/g, ' ');
            condCounts[normalized] = (condCounts[normalized] || 0) + 1;
        }

        for (const [cond, count] of Object.entries(condCounts)) {
            if (count >= 2) {
                smells.push({
                    type: 'REPEATED_CONDITIONS',
                    severity: 'LOW',
                    message: `Repeated condition "${cond.substring(0, 40)}${cond.length > 40 ? '...' : ''}" found ${count} times in "${fn.name}"`,
                    suggestion: 'Extract repeated conditions into a variable or helper function',
                    functionName: fn.name,
                    startLine: fn.startLine,
                    endLine: fn.endLine,
                });
            }
        }
    }

    return smells;
}

function detectLargeSwitchBlocks(parsedCode, thresholds) {
    const smells = [];

    for (const fn of parsedCode.functions) {
        const lines = fn.body.split('\n');
        let inSwitch = false;
        let caseCount = 0;
        let switchStartLine = 0;

        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (/\bswitch\s*\(/.test(trimmed)) {
                inSwitch = true;
                caseCount = 0;
                switchStartLine = fn.startLine + i;
            }
            if (inSwitch && /\bcase\s+/.test(trimmed)) {
                caseCount++;
            }
            if (inSwitch && trimmed === '}' && caseCount > 0) {
                if (caseCount > thresholds.maxSwitchCases) {
                    smells.push({
                        type: 'LARGE_SWITCH',
                        severity: 'MEDIUM',
                        message: `Large switch block with ${caseCount} cases in "${fn.name}"`,
                        suggestion: 'Consider using a lookup object/map or strategy pattern',
                        functionName: fn.name,
                        startLine: switchStartLine,
                        endLine: fn.startLine + i,
                    });
                }
                inSwitch = false;
                caseCount = 0;
            }
        }
    }

    return smells;
}

export function getSmellSeverityWeight(severity) {
    switch (severity) {
        case 'HIGH': return 3;
        case 'MEDIUM': return 2;
        case 'LOW': return 1;
        default: return 1;
    }
}
