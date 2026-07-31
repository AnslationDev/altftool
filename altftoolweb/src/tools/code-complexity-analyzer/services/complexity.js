// Cyclomatic and Cognitive complexity calculator
import { getLanguageConfig } from '../utils/languageSupport';
import { tokenize } from '../utils/tokenizer';

/**
 * Blank out the contents of string/template literals and comments before
 * the regex-based line scanners below run, so keywords/operators that only
 * appear inside a string (e.g. a template literal mentioning `"if" && "while"`)
 * or inside a multi-line block comment (including continuation lines with no
 * leading `*`) are never mistaken for real branches. Line breaks are
 * preserved so line numbers and per-line scanning stay intact; masked
 * characters become spaces.
 */
function maskStringsAndComments(body, langId) {
    const supportsBlockComments = langId !== 'python';
    let result = '';
    let inString = false;
    let stringChar = '';
    let inBlockComment = false;
    let inLineComment = false;

    for (let i = 0; i < body.length; i++) {
        const ch = body[i];
        const next = body[i + 1];

        if (ch === '\n') {
            inLineComment = false;
            result += '\n';
            continue;
        }

        if (inLineComment) {
            result += ' ';
            continue;
        }

        if (inBlockComment) {
            result += ' ';
            if (ch === '*' && next === '/') inBlockComment = false;
            continue;
        }

        if (inString) {
            if (ch === '\\') {
                result += '  ';
                i++;
                continue;
            }
            if (ch === stringChar) inString = false;
            result += ' ';
            continue;
        }

        if (supportsBlockComments && ch === '/' && next === '/') {
            inLineComment = true;
            result += '  ';
            continue;
        }
        if (supportsBlockComments && ch === '/' && next === '*') {
            inBlockComment = true;
            result += '  ';
            continue;
        }
        if (langId === 'python' && ch === '#') {
            inLineComment = true;
            result += ' ';
            continue;
        }
        if (ch === '"' || ch === "'" || ch === '`') {
            inString = true;
            stringChar = ch;
            result += ' ';
            continue;
        }

        result += ch;
    }

    return result;
}

export function calculateComplexity(parsedCode, code, langId = 'javascript') {
    const config = getLanguageConfig(langId);
    const perFunction = {};
    const functionDetails = [];

    for (const fn of parsedCode.functions) {
        const complexity = calculateFunctionComplexity(fn.body, config, langId);
        const cognitiveComplexity = calculateCognitiveComplexity(fn.body, config, langId);
        const details = analyzeFunctionDetails(fn, config, langId);

        // Basic Halstead per function (Simplified for this tool)
        const fnTokens = tokenize(fn.body, langId);
        const fnHalstead = calculateHalstead(fnTokens);

        // Note: this is keyed by name, so two functions sharing a name (e.g.
        // two `render` methods on different classes) collapse to one entry.
        // It's kept as a convenience lookup only — Total/Average/Highest and
        // the Low/Medium/High distribution below are derived from
        // `functionDetails`, which has one entry per parsed function
        // regardless of name collisions.
        perFunction[fn.name] = complexity;
        functionDetails.push({
            ...fn,
            complexity,
            cognitiveComplexity,
            ...details,
            halstead: fnHalstead,
        });
    }

    const values = functionDetails.map(fn => fn.complexity);
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = values.length > 0 ? total / values.length : 0;

    let highestName = '';
    let highestVal = 0;
    for (const fn of functionDetails) {
        if (fn.complexity > highestVal) {
            highestVal = fn.complexity;
            highestName = fn.name;
        }
    }

    // Overall Halstead
    const allTokens = tokenize(code, langId);
    const overallHalstead = calculateHalstead(allTokens);

    return {
        perFunction,
        total,
        average: Math.round(average * 100) / 100,
        highest: { name: highestName, complexity: highestVal },
        functionDetails,
        categories: categorizeComplexity(functionDetails),
        halstead: overallHalstead,
        maintainabilityIndex: calculateMI(overallHalstead, total, parsedCode.totalLines),
    };
}

function calculateCognitiveComplexity(body, config, langId) {
    const maskedBody = maskStringsAndComments(body, langId);

    if (langId === 'python') {
        return calculatePythonCognitiveComplexity(maskedBody);
    }

    let score = 0;
    let nesting = 0;
    const lines = maskedBody.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Increment nesting for structural elements
        const increaseNesting = /\b(if|for|while|do|switch|catch)\b/.test(trimmed);

        if (increaseNesting) {
            score += 1 + nesting;
            nesting++;
        }

        // Logical operators add 1 regardless of nesting
        const logicalOps = (trimmed.match(/&&|\|\||\?\?/g) || []).length;
        score += logicalOps;

        // Decrement nesting (Simplified: assume one closing brace per line for C-like)
        const closingBraces = (trimmed.match(/\}/g) || []).length;
        const openingBraces = (trimmed.match(/\{/g) || []).length;
        nesting = Math.max(0, nesting - (closingBraces - openingBraces));
    }

    return score;
}

/**
 * Python has no braces, so nesting can't be tracked by brace-counting the
 * way the C-like branch above does. Instead this tracks a stack of the
 * indent levels that opened a nesting-increasing block (if/for/while/elif/
 * except): a line dedenting to (or past) the top of the stack closes that
 * block, mirroring how Python itself scopes by indentation. The `def` line
 * itself is skipped — declaring the function is not a branch and shouldn't
 * seed the nesting count.
 */
function calculatePythonCognitiveComplexity(body) {
    const lines = body.split('\n');
    if (lines.length === 0) return 0;

    let score = 0;
    const indentStack = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (i === 0) continue; // the `def ...:` signature line itself

        const indent = line.length - line.trimStart().length;
        while (indentStack.length > 0 && indent <= indentStack[indentStack.length - 1]) {
            indentStack.pop();
        }

        const nesting = indentStack.length;
        const increaseNesting = /\b(if|for|while|elif|except)\b/.test(trimmed);
        if (increaseNesting) {
            score += 1 + nesting;
            indentStack.push(indent);
        }

        const logicalOps = (trimmed.match(/\band\b|\bor\b/g) || []).length;
        score += logicalOps;
    }

    return score;
}

function calculateHalstead(tokens) {
    const operators = new Set();
    const operands = new Set();
    let n1 = 0; // total operators
    let n2 = 0; // total operands

    const opTypes = ['keyword', 'operator', 'bracket', 'punctuation'];
    const operandTypes = ['identifier', 'string', 'number'];

    for (const t of tokens) {
        if (opTypes.includes(t.type)) {
            operators.add(t.value);
            n1++;
        } else if (operandTypes.includes(t.type)) {
            operands.add(t.value);
            n2++;
        }
    }

    const u1 = operators.size; // distinct operators
    const u2 = operands.size; // distinct operands

    const N = n1 + n2; // program length
    const U = u1 + u2; // program vocabulary
    const V = N * Math.log2(U || 1); // volume
    const D = (u1 / 2) * (n2 / (u2 || 1)); // difficulty
    const E = D * V; // effort

    return {
        vocabulary: U,
        length: N,
        volume: Math.round(V * 100) / 100,
        difficulty: Math.round(D * 100) / 100,
        effort: Math.round(E),
        time: Math.round(E / 18), // estimated time to program in seconds
        bugs: Math.round((V / 3000) * 100) / 100, // estimated delivered bugs
    };
}

function calculateMI(halstead, cyclomatic, loc) {
    if (loc === 0) return 100;
    const V = Math.max(1, halstead.volume);
    const G = cyclomatic;
    const L = Math.max(1, loc);

    const mi = 171 - 5.2 * Math.log(V) - 0.23 * G - 16.2 * Math.log(L);
    const normalized = Math.max(0, Math.min(100, (mi * 100) / 171));
    return Math.round(normalized);
}

function calculateFunctionComplexity(body, config, langId) {
    let complexity = 1; // Base complexity
    const lines = maskStringsAndComments(body, langId).split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Count branching keywords.
        // `else if` / `elif` is ONE decision point. Testing for a bare `if`
        // first would match the same line twice and inflate every else-if
        // chain, so the else-if case is detected up front and excluded below.
        const isElseIf = /\belse\s+if\s*\(/.test(trimmed) || /\belif\b/.test(trimmed);
        const isPlainIf =
            /\bif\s*\(/.test(trimmed) || (/\bif\s+/.test(trimmed) && langId === 'python');
        if (isElseIf || isPlainIf) complexity++;
        if (/\bfor\s*[\(]/.test(trimmed) || /\bfor\s+\w+\s+in\b/.test(trimmed)) complexity++;
        if (/\bwhile\s*[\(]/.test(trimmed) || /\bwhile\s+/.test(trimmed) && langId === 'python') complexity++;
        if (/\bdo\s*\{/.test(trimmed)) complexity++;
        if (/\bcase\s+/.test(trimmed)) complexity++;
        if (/\bcatch\s*[\(]/.test(trimmed) || /\bexcept\b/.test(trimmed)) complexity++;

        // Count logical operators (each adds a path)
        const andCount = (trimmed.match(/&&/g) || []).length;
        const orCount = (trimmed.match(/\|\|/g) || []).length;
        const nullishCount = (trimmed.match(/\?\?/g) || []).length;
        complexity += andCount + orCount + nullishCount;

        // Count ternary operators. `??` and `?.` are stripped first: both
        // contain a `?` that would otherwise be counted a second time here
        // after already being counted as a nullish operator above.
        const withoutNullish = trimmed.replace(/\?\?/g, '').replace(/\?\./g, '');
        const ternaryCount = (withoutNullish.match(/\?/g) || []).length;
        complexity += ternaryCount;

        // Python logical operators
        if (langId === 'python') {
            const pyAnd = (trimmed.match(/\band\b/g) || []).length;
            const pyOr = (trimmed.match(/\bor\b/g) || []).length;
            complexity += pyAnd + pyOr;
        }
    }

    return complexity;
}

function analyzeFunctionDetails(fn, config, langId) {
    const lines = maskStringsAndComments(fn.body, langId).split('\n');

    let loopCount = 0;
    let conditionalCount = 0;
    let returnCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Loops
        if (/\bfor\s*[\(]/.test(trimmed) || /\bwhile\s*[\(]/.test(trimmed) || /\bdo\s*\{/.test(trimmed)) {
            loopCount++;
        }
        if (langId === 'python' && (/\bfor\s+\w+\s+in\b/.test(trimmed) || /\bwhile\s+/.test(trimmed))) {
            loopCount++;
        }

        // Conditionals
        if (/\bif\s*[\(]/.test(trimmed) || /\belse\s+if\s*\(/.test(trimmed) || /\bswitch\s*\(/.test(trimmed)) {
            conditionalCount++;
        }
        if (langId === 'python' && (/\bif\s+/.test(trimmed) || /\belif\b/.test(trimmed))) {
            conditionalCount++;
        }

        // Returns
        if (/\breturn\b/.test(trimmed)) returnCount++;
    }

    return {
        loopCount,
        conditionalCount,
        returnCount,
        paramCount: fn.params.length,
    };
}

function categorizeComplexity(functionDetails) {
    const categories = { low: [], medium: [], high: [] };

    for (const { name, complexity } of functionDetails) {
        if (complexity <= 5) {
            categories.low.push({ name, complexity });
        } else if (complexity <= 10) {
            categories.medium.push({ name, complexity });
        } else {
            categories.high.push({ name, complexity });
        }
    }

    return categories;
}

export function getComplexityLevel(complexity) {
    if (complexity <= 5) return 'low';
    if (complexity <= 10) return 'medium';
    return 'high';
}

export function getComplexityColor(level) {
    switch (level) {
        case 'low': return '#22c55e';
        case 'medium': return '#eab308';
        case 'high': return '#ef4444';
        default: return '#6b7280';
    }
}

export function getLineComplexityMap(parsedCode, complexityData) {
    const lineMap = {};

    for (const fn of complexityData.functionDetails) {
        const level = getComplexityLevel(fn.complexity);
        for (let line = fn.startLine; line <= fn.endLine; line++) {
            lineMap[line] = {
                level,
                complexity: fn.complexity,
                functionName: fn.name,
            };
        }
    }

    return lineMap;
}
