// Cyclomatic and Cognitive complexity calculator
import { getLanguageConfig } from '../utils/languageSupport';
import { tokenize } from '../utils/tokenizer';

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
        
        perFunction[fn.name] = complexity;
        functionDetails.push({
            ...fn,
            complexity,
            cognitiveComplexity,
            ...details,
            halstead: fnHalstead,
        });
    }

    const values = Object.values(perFunction);
    const total = values.reduce((sum, v) => sum + v, 0);
    const average = values.length > 0 ? total / values.length : 0;

    let highestName = '';
    let highestVal = 0;
    for (const [name, val] of Object.entries(perFunction)) {
        if (val > highestVal) {
            highestVal = val;
            highestName = name;
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
        categories: categorizeComplexity(perFunction),
        halstead: overallHalstead,
        maintainabilityIndex: calculateMI(overallHalstead, total, parsedCode.totalLines),
    };
}

function calculateCognitiveComplexity(body, config, langId) {
    let score = 0;
    let nesting = 0;
    const lines = body.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

        // Increment nesting for structural elements
        const increaseNesting = /\b(if|for|while|do|switch|catch|def|elif|except)\b/.test(trimmed);
        
        if (increaseNesting) {
            score += 1 + nesting;
            nesting++;
        }

        // Logical operators add 1 regardless of nesting
        const logicalOps = (trimmed.match(/&&|\|\||\?\?/g) || []).length;
        score += logicalOps;

        // Decrement nesting (Simplified: assume one closing brace per line for C-like)
        if (langId !== 'python') {
            const closingBraces = (trimmed.match(/\}/g) || []).length;
            const openingBraces = (trimmed.match(/\{/g) || []).length;
            nesting = Math.max(0, nesting - (closingBraces - openingBraces));
        } else {
            // Python nesting is harder with just regex, we'll use indentation changes if possible
            // but for now we'll stick to a simplified model
        }
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
    const lines = body.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('*')) continue;

        // Count branching keywords
        if (/\bif\s*\(/.test(trimmed) || /\bif\s+/.test(trimmed) && langId === 'python') complexity++;
        if (/\belse\s+if\s*\(/.test(trimmed) || /\belif\b/.test(trimmed)) complexity++;
        if (/\bfor\s*[\(]/.test(trimmed) || /\bfor\s+\w+\s+in\b/.test(trimmed)) complexity++;
        if (/\bwhile\s*[\(]/.test(trimmed) || /\bwhile\s+/.test(trimmed) && langId === 'python') complexity++;
        if (/\bdo\s*\{/.test(trimmed)) complexity++;
        if (/\bcase\s+/.test(trimmed)) complexity++;
        if (/\bcatch\s*[\(]/.test(trimmed) || /\bexcept\b/.test(trimmed)) complexity++;

        // Count ternary operators
        const ternaryCount = (trimmed.match(/\?[^?]/g) || []).length;
        complexity += ternaryCount;

        // Count logical operators (each adds a path)
        const andCount = (trimmed.match(/&&/g) || []).length;
        const orCount = (trimmed.match(/\|\|/g) || []).length;
        const nullishCount = (trimmed.match(/\?\?/g) || []).length;
        complexity += andCount + orCount + nullishCount;

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
    const body = fn.body;
    const lines = body.split('\n');

    let loopCount = 0;
    let conditionalCount = 0;
    let returnCount = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

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

function categorizeComplexity(perFunction) {
    const categories = { low: [], medium: [], high: [] };

    for (const [name, complexity] of Object.entries(perFunction)) {
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
