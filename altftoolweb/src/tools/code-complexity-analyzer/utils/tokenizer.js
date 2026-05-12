// Lightweight tokenizer for source code analysis
import { getLanguageConfig } from './languageSupport';

const TOKEN_TYPES = {
    KEYWORD: 'keyword',
    IDENTIFIER: 'identifier',
    OPERATOR: 'operator',
    LITERAL_STRING: 'string',
    LITERAL_NUMBER: 'number',
    BRACKET: 'bracket',
    COMMENT: 'comment',
    WHITESPACE: 'whitespace',
    PUNCTUATION: 'punctuation',
    UNKNOWN: 'unknown',
};

export { TOKEN_TYPES };

export function tokenize(code, langId = 'javascript') {
    const config = getLanguageConfig(langId);
    const tokens = [];
    const lines = code.split('\n');
    let inMultiLineComment = false;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const lineNum = lineIdx + 1;
        let i = 0;

        while (i < line.length) {
            // Skip whitespace
            if (/\s/.test(line[i])) {
                i++;
                continue;
            }

            // Multi-line comment end
            if (inMultiLineComment) {
                const endIdx = line.indexOf(config.commentMultiEnd, i);
                if (endIdx !== -1) {
                    tokens.push({
                        type: TOKEN_TYPES.COMMENT,
                        value: line.substring(i, endIdx + config.commentMultiEnd.length),
                        line: lineNum,
                    });
                    i = endIdx + config.commentMultiEnd.length;
                    inMultiLineComment = false;
                } else {
                    tokens.push({
                        type: TOKEN_TYPES.COMMENT,
                        value: line.substring(i),
                        line: lineNum,
                    });
                    break;
                }
                continue;
            }

            // Single-line comment
            if (line.substring(i, i + config.commentSingle.length) === config.commentSingle) {
                tokens.push({
                    type: TOKEN_TYPES.COMMENT,
                    value: line.substring(i),
                    line: lineNum,
                });
                break;
            }

            // Multi-line comment start
            if (line.substring(i, i + config.commentMultiStart.length) === config.commentMultiStart) {
                const endIdx = line.indexOf(config.commentMultiEnd, i + config.commentMultiStart.length);
                if (endIdx !== -1) {
                    tokens.push({
                        type: TOKEN_TYPES.COMMENT,
                        value: line.substring(i, endIdx + config.commentMultiEnd.length),
                        line: lineNum,
                    });
                    i = endIdx + config.commentMultiEnd.length;
                } else {
                    tokens.push({
                        type: TOKEN_TYPES.COMMENT,
                        value: line.substring(i),
                        line: lineNum,
                    });
                    inMultiLineComment = true;
                    break;
                }
                continue;
            }

            // String literals
            if (config.stringDelimiters.includes(line[i])) {
                const quote = line[i];
                let j = i + 1;
                let escaped = false;
                while (j < line.length) {
                    if (escaped) {
                        escaped = false;
                        j++;
                        continue;
                    }
                    if (line[j] === '\\') {
                        escaped = true;
                        j++;
                        continue;
                    }
                    if (line[j] === quote) {
                        j++;
                        break;
                    }
                    j++;
                }
                tokens.push({
                    type: TOKEN_TYPES.LITERAL_STRING,
                    value: line.substring(i, j),
                    line: lineNum,
                });
                i = j;
                continue;
            }

            // Numbers
            if (/[0-9]/.test(line[i]) || (line[i] === '.' && /[0-9]/.test(line[i + 1]))) {
                let j = i;
                if (line[j] === '0' && (line[j + 1] === 'x' || line[j + 1] === 'X')) {
                    j += 2;
                    while (j < line.length && /[0-9a-fA-F]/.test(line[j])) j++;
                } else {
                    while (j < line.length && /[0-9.]/.test(line[j])) j++;
                    if (j < line.length && (line[j] === 'e' || line[j] === 'E')) {
                        j++;
                        if (j < line.length && (line[j] === '+' || line[j] === '-')) j++;
                        while (j < line.length && /[0-9]/.test(line[j])) j++;
                    }
                }
                tokens.push({
                    type: TOKEN_TYPES.LITERAL_NUMBER,
                    value: line.substring(i, j),
                    line: lineNum,
                });
                i = j;
                continue;
            }

            // Identifiers and keywords
            if (/[a-zA-Z_$]/.test(line[i])) {
                let j = i;
                while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
                const word = line.substring(i, j);
                const type = config.keywords.includes(word) ? TOKEN_TYPES.KEYWORD : TOKEN_TYPES.IDENTIFIER;
                tokens.push({ type, value: word, line: lineNum });
                i = j;
                continue;
            }

            // Multi-char operators
            const twoChar = line.substring(i, i + 3);
            const threeCharOps = ['===', '!==', '>>>', '<<=', '>>=', '**=', '&&=', '||=', '??=', '...'];
            if (threeCharOps.includes(twoChar)) {
                tokens.push({ type: TOKEN_TYPES.OPERATOR, value: twoChar, line: lineNum });
                i += 3;
                continue;
            }

            const twoCharStr = line.substring(i, i + 2);
            const twoCharOps = ['==', '!=', '<=', '>=', '&&', '||', '??', '++', '--', '+=', '-=', '*=', '/=', '%=', '=>', '**', '<<', '>>'];
            if (twoCharOps.includes(twoCharStr)) {
                tokens.push({ type: TOKEN_TYPES.OPERATOR, value: twoCharStr, line: lineNum });
                i += 2;
                continue;
            }

            // Brackets
            if ('(){}[]'.includes(line[i])) {
                tokens.push({ type: TOKEN_TYPES.BRACKET, value: line[i], line: lineNum });
                i++;
                continue;
            }

            // Single char operators
            if ('+-*/%=<>!&|^~?'.includes(line[i])) {
                tokens.push({ type: TOKEN_TYPES.OPERATOR, value: line[i], line: lineNum });
                i++;
                continue;
            }

            // Punctuation
            if (',;:.'.includes(line[i])) {
                tokens.push({ type: TOKEN_TYPES.PUNCTUATION, value: line[i], line: lineNum });
                i++;
                continue;
            }

            // Unknown
            tokens.push({ type: TOKEN_TYPES.UNKNOWN, value: line[i], line: lineNum });
            i++;
        }
    }

    return tokens;
}

export function getTokensByLine(tokens) {
    const lineMap = {};
    for (const token of tokens) {
        if (!lineMap[token.line]) {
            lineMap[token.line] = [];
        }
        lineMap[token.line].push(token);
    }
    return lineMap;
}
