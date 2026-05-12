// Stack-based parser - NO AST libraries, NO Babel, NO TypeScript compiler API
import { getLanguageConfig } from '../utils/languageSupport';

export function parseCode(code, langId = 'javascript') {
    const config = getLanguageConfig(langId);
    const lines = code.split('\n');
    const functions = [];

    if (langId === 'python') {
        return parsePython(code, lines);
    }

    // Stack-based brace matching for C-like languages
    const braceStack = [];
    const funcCandidates = [];

    // First pass: find function declarations/expressions
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNum = i + 1;
        const trimmed = line.trim();

        // Skip comments
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue;

        // Function declarations: function name(params)
        let match = trimmed.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'declaration',
            });
            continue;
        }

        // Anonymous function: function(params)
        match = trimmed.match(/^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\(([^)]*)\)/);
        if (match && !funcCandidates.some(f => f.startLine === lineNum)) {
            funcCandidates.push({
                name: `anonymous_L${lineNum}`,
                params: parseParams(match[1]),
                startLine: lineNum,
                type: 'anonymous',
            });
            continue;
        }

        // Variable/const assigned functions: const name = function(params) or const name = (params) =>
        match = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function\s*\w*\s*\(([^)]*)\)/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'expression',
            });
            continue;
        }

        // Arrow functions: const name = (params) => or const name = param =>
        match = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*=>/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'arrow',
            });
            continue;
        }

        // Single param arrow: const name = param =>
        match = trimmed.match(/^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(\w+)\s*=>/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: [match[2]],
                startLine: lineNum,
                type: 'arrow',
            });
            continue;
        }

        // Object/class methods: name(params) { or async name(params) {
        match = trimmed.match(/^(?:async\s+)?(\w+)\s*\(([^)]*)\)\s*\{/);
        if (match && !config.keywords.includes(match[1]) && match[1] !== 'if' && match[1] !== 'for' && match[1] !== 'while' && match[1] !== 'switch' && match[1] !== 'catch') {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'method',
            });
            continue;
        }

        // Property assignment: name: function(params) or name: (params) =>
        match = trimmed.match(/^(\w+)\s*:\s*(?:async\s+)?function\s*\(([^)]*)\)/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'property',
            });
            continue;
        }

        match = trimmed.match(/^(\w+)\s*:\s*(?:async\s+)?\(([^)]*)\)\s*=>/);
        if (match) {
            funcCandidates.push({
                name: match[1],
                params: parseParams(match[2]),
                startLine: lineNum,
                type: 'property-arrow',
            });
            continue;
        }
    }

    // Second pass: match braces to find function end lines
    for (const candidate of funcCandidates) {
        const endLine = findClosingBrace(lines, candidate.startLine - 1);
        if (endLine !== -1) {
            const bodyLines = lines.slice(candidate.startLine - 1, endLine);
            const body = bodyLines.join('\n');
            const nestingDepth = calculateNestingDepth(bodyLines);

            functions.push({
                name: candidate.name,
                startLine: candidate.startLine,
                endLine: endLine,
                params: candidate.params,
                body: body,
                nestingDepth: nestingDepth,
                loc: endLine - candidate.startLine + 1,
                type: candidate.type,
            });
        }
    }

    // Sort by start line
    functions.sort((a, b) => a.startLine - b.startLine);

    // Build parent-child relationships
    const withHierarchy = buildHierarchy(functions);

    return {
        functions: withHierarchy,
        totalLines: lines.length,
        codeLines: lines.filter(l => l.trim() && !l.trim().startsWith('//')).length,
        commentLines: lines.filter(l => l.trim().startsWith('//')).length,
        blankLines: lines.filter(l => !l.trim()).length,
    };
}

function parsePython(code, lines) {
    const functions = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const match = trimmed.match(/^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)\s*:/);
        if (match) {
            const indent = line.length - line.trimStart().length;
            let endLine = i + 1;
            for (let j = i + 1; j < lines.length; j++) {
                const nextLine = lines[j];
                if (nextLine.trim() === '') continue;
                const nextIndent = nextLine.length - nextLine.trimStart().length;
                if (nextIndent <= indent) {
                    endLine = j;
                    break;
                }
                endLine = j + 1;
            }

            const bodyLines = lines.slice(i, endLine);
            functions.push({
                name: match[1],
                startLine: i + 1,
                endLine: endLine,
                params: parseParams(match[2]),
                body: bodyLines.join('\n'),
                nestingDepth: calculateNestingDepthPython(bodyLines),
                loc: endLine - i,
                type: 'def',
            });
        }
    }

    return {
        functions,
        totalLines: lines.length,
        codeLines: lines.filter(l => l.trim() && !l.trim().startsWith('#')).length,
        commentLines: lines.filter(l => l.trim().startsWith('#')).length,
        blankLines: lines.filter(l => !l.trim()).length,
    };
}

function findClosingBrace(lines, startIdx) {
    let depth = 0;
    let foundOpening = false;
    let inString = false;
    let stringChar = '';
    let inSingleComment = false;
    let inMultiComment = false;

    for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i];
        inSingleComment = false;

        for (let j = 0; j < line.length; j++) {
            const ch = line[j];
            const next = line[j + 1] || '';

            if (inSingleComment) break;

            if (inMultiComment) {
                if (ch === '*' && next === '/') {
                    inMultiComment = false;
                    j++;
                }
                continue;
            }

            if (inString) {
                if (ch === '\\') { j++; continue; }
                if (ch === stringChar) inString = false;
                continue;
            }

            if (ch === '/' && next === '/') { inSingleComment = true; break; }
            if (ch === '/' && next === '*') { inMultiComment = true; j++; continue; }
            if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue; }

            if (ch === '{') {
                depth++;
                foundOpening = true;
            } else if (ch === '}') {
                depth--;
                if (foundOpening && depth === 0) {
                    return i + 1;
                }
            }
        }
    }
    return foundOpening ? lines.length : -1;
}

function calculateNestingDepth(bodyLines) {
    let maxDepth = 0;
    let currentDepth = 0;
    let inString = false;
    let stringChar = '';

    for (const line of bodyLines) {
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inString) {
                if (ch === '\\') { i++; continue; }
                if (ch === stringChar) inString = false;
                continue;
            }
            if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue; }
            if (ch === '{') { currentDepth++; maxDepth = Math.max(maxDepth, currentDepth); }
            if (ch === '}') { currentDepth = Math.max(0, currentDepth - 1); }
        }
    }
    return maxDepth;
}

function calculateNestingDepthPython(bodyLines) {
    if (bodyLines.length === 0) return 0;
    const baseIndent = bodyLines[0].length - bodyLines[0].trimStart().length;
    let maxDepth = 0;
    for (const line of bodyLines) {
        if (!line.trim()) continue;
        const indent = line.length - line.trimStart().length;
        const depth = Math.floor((indent - baseIndent) / 2) || Math.floor((indent - baseIndent) / 4);
        maxDepth = Math.max(maxDepth, depth);
    }
    return maxDepth;
}

function parseParams(paramStr) {
    if (!paramStr || !paramStr.trim()) return [];
    
    const params = [];
    let current = '';
    let depth = 0;
    
    for (let i = 0; i < paramStr.length; i++) {
        const char = paramStr[i];
        if (char === '(' || char === '[' || char === '{') depth++;
        if (char === ')' || char === ']' || char === '}') depth--;
        
        if (char === ',' && depth === 0) {
            params.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) params.push(current.trim());
    
    return params.map(p => p.split('=')[0].split(':')[0].trim()).filter(Boolean);
}

function buildHierarchy(functions) {
    return functions.map(fn => {
        const children = functions.filter(
            child => child.startLine > fn.startLine && child.endLine <= fn.endLine && child.name !== fn.name
        );
        return {
            ...fn,
            children: children.map(c => c.name),
        };
    });
}

export function buildStructureTree(functions) {
    const tree = [];
    const used = new Set();

    for (const fn of functions) {
        if (used.has(fn.name)) continue;

        const node = buildTreeNode(fn, functions, used);
        tree.push(node);
    }
    return tree;
}

function buildTreeNode(fn, allFunctions, used) {
    used.add(fn.name);

    const children = allFunctions.filter(
        child =>
            !used.has(child.name) &&
            child.startLine > fn.startLine &&
            child.endLine <= fn.endLine
    );

    const controlStructures = extractControlStructures(fn.body, fn.startLine);

    return {
        name: fn.name,
        type: 'function',
        startLine: fn.startLine,
        endLine: fn.endLine,
        children: [
            ...children.map(c => {
                used.add(c.name);
                return buildTreeNode(c, allFunctions, used);
            }),
            ...controlStructures,
        ],
    };
}

function extractControlStructures(body, baseLineNum) {
    const structures = [];
    const lines = body.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        const lineNum = baseLineNum + i;

        const patterns = [
            { regex: /^if\s*\(/, type: 'if' },
            { regex: /^else\s+if\s*\(/, type: 'else if' },
            { regex: /^else\s*\{/, type: 'else' },
            { regex: /^for\s*\(/, type: 'for' },
            { regex: /^while\s*\(/, type: 'while' },
            { regex: /^do\s*\{/, type: 'do-while' },
            { regex: /^switch\s*\(/, type: 'switch' },
            { regex: /^try\s*\{/, type: 'try' },
            { regex: /^catch\s*\(/, type: 'catch' },
        ];

        for (const pattern of patterns) {
            if (pattern.regex.test(trimmed)) {
                structures.push({
                    name: pattern.type,
                    type: 'control',
                    startLine: lineNum,
                    children: [],
                });
                break;
            }
        }
    }
    return structures;
}
