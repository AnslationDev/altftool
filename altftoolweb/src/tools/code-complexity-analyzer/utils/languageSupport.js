// Language configurations for multi-language support

export const LANGUAGES = {
    javascript: {
        id: 'javascript',
        name: 'JavaScript',
        keywords: [
            'function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do',
            'switch', 'case', 'break', 'continue', 'return', 'throw', 'try', 'catch',
            'finally', 'new', 'delete', 'typeof', 'instanceof', 'in', 'of', 'class',
            'extends', 'super', 'this', 'import', 'export', 'default', 'from', 'as',
            'async', 'await', 'yield', 'static', 'get', 'set', 'true', 'false',
            'null', 'undefined', 'void', 'with', 'debugger', 'enum',
        ],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/',
        stringDelimiters: ['"', "'", '`'],
        branchKeywords: ['if', 'else if', 'for', 'while', 'do', 'switch', 'case', 'catch'],
        loopKeywords: ['for', 'while', 'do'],
        conditionalKeywords: ['if', 'else if', 'else', 'switch', 'case'],
        functionPatterns: [
            /function\s+(\w+)\s*\(([^)]*)\)/g,
            /(\w+)\s*[=:]\s*(?:async\s+)?function\s*\(([^)]*)\)/g,
            /(\w+)\s*[=:]\s*(?:async\s+)?\(([^)]*)\)\s*=>/g,
            /(\w+)\s*[=:]\s*(?:async\s+)?(\w+)\s*=>/g,
            /(\w+)\s*\(([^)]*)\)\s*\{/g,
        ],
    },
    python: {
        id: 'python',
        name: 'Python',
        keywords: [
            'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except',
            'finally', 'with', 'as', 'import', 'from', 'return', 'yield', 'raise',
            'pass', 'break', 'continue', 'lambda', 'and', 'or', 'not', 'is', 'in',
            'True', 'False', 'None', 'global', 'nonlocal', 'assert', 'del', 'async',
            'await',
        ],
        commentSingle: '#',
        commentMultiStart: '"""',
        commentMultiEnd: '"""',
        stringDelimiters: ['"', "'"],
        branchKeywords: ['if', 'elif', 'for', 'while', 'except'],
        loopKeywords: ['for', 'while'],
        conditionalKeywords: ['if', 'elif', 'else'],
        functionPatterns: [
            /def\s+(\w+)\s*\(([^)]*)\)/g,
        ],
    },
    java: {
        id: 'java',
        name: 'Java',
        keywords: [
            'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
            'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
            'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
            'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
            'package', 'private', 'protected', 'public', 'return', 'short', 'static',
            'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
            'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null',
        ],
        commentSingle: '//',
        commentMultiStart: '/*',
        commentMultiEnd: '*/',
        stringDelimiters: ['"', "'"],
        branchKeywords: ['if', 'else if', 'for', 'while', 'do', 'switch', 'case', 'catch'],
        loopKeywords: ['for', 'while', 'do'],
        conditionalKeywords: ['if', 'else if', 'else', 'switch', 'case'],
        functionPatterns: [
            /(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\(([^)]*)\)\s*(?:throws\s+\w+\s*)?\{/g,
        ],
    },
};

export function getLanguageConfig(langId) {
    return LANGUAGES[langId] || LANGUAGES.javascript;
}

export function detectLanguage(code) {
    if (/\bdef\s+\w+\s*\(/.test(code) && /:\s*$/.test(code.split('\n')[0] || '')) {
        return 'python';
    }
    if (/\b(public|private|protected)\s+(static\s+)?(void|int|String|boolean)/.test(code)) {
        return 'java';
    }
    return 'javascript';
}

export function getSupportedLanguages() {
    return Object.values(LANGUAGES).map(l => ({ id: l.id, name: l.name }));
}
