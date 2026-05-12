// Intelligent suggestion engine - maps to detected smells

const SUGGESTION_MAP = {
    LONG_FUNCTION: [
        {
            title: 'Extract Helper Functions',
            description: 'Break down the function into smaller, focused helper functions. Each function should do one thing well.',
            priority: 'HIGH',
            example: 'Extract validation logic, data transformation, and output formatting into separate functions.',
        },
        {
            title: 'Apply Single Responsibility Principle',
            description: 'Ensure each function has a single, well-defined responsibility.',
            priority: 'MEDIUM',
        },
    ],
    DEEP_NESTING: [
        {
            title: 'Use Early Returns',
            description: 'Invert conditions and return early to reduce nesting depth.',
            priority: 'HIGH',
            example: 'Instead of: if (valid) { ...deep logic... }\nUse: if (!valid) return; ...flat logic...',
        },
        {
            title: 'Extract Nested Logic',
            description: 'Move deeply nested blocks into separate functions.',
            priority: 'MEDIUM',
        },
        {
            title: 'Use Guard Clauses',
            description: 'Place validation checks at the top of the function and return early for invalid cases.',
            priority: 'HIGH',
        },
    ],
    TOO_MANY_PARAMS: [
        {
            title: 'Use Options Object',
            description: 'Replace multiple parameters with a single configuration/options object.',
            priority: 'HIGH',
            example: 'Instead of: fn(a, b, c, d, e)\nUse: fn({ a, b, c, d, e })',
        },
        {
            title: 'Apply Builder Pattern',
            description: 'For complex construction, use a builder pattern to set parameters step by step.',
            priority: 'LOW',
        },
    ],
    HIGH_COMPLEXITY: [
        {
            title: 'Simplify Conditions',
            description: 'Combine or simplify complex conditional logic using helper functions or lookup tables.',
            priority: 'HIGH',
        },
        {
            title: 'Use Strategy Pattern',
            description: 'Replace complex conditional logic with a strategy pattern using objects or maps.',
            priority: 'MEDIUM',
            example: 'const strategies = { add: (a,b) => a+b, sub: (a,b) => a-b };\nstrategies[operation](a, b);',
        },
        {
            title: 'Split Function',
            description: 'Divide the function into smaller functions, each handling a specific case or branch.',
            priority: 'HIGH',
        },
    ],
    EXCESSIVE_CONDITIONS: [
        {
            title: 'Use Lookup Tables',
            description: 'Replace multiple if/else chains with object lookups.',
            priority: 'HIGH',
        },
        {
            title: 'Apply Polymorphism',
            description: 'Use polymorphic dispatch instead of type-checking conditions.',
            priority: 'MEDIUM',
        },
    ],
    EXCESSIVE_LOOPS: [
        {
            title: 'Use Array Methods',
            description: 'Replace manual loops with map, filter, reduce, and other array methods.',
            priority: 'MEDIUM',
        },
        {
            title: 'Extract Loop Body',
            description: 'Move loop body logic into a separate function.',
            priority: 'LOW',
        },
    ],
    CALLBACK_HELL: [
        {
            title: 'Use async/await',
            description: 'Convert nested callbacks to async/await syntax for cleaner, flatter code.',
            priority: 'HIGH',
            example: 'const result = await fetchData();\nconst processed = await process(result);',
        },
        {
            title: 'Use Promises',
            description: 'Chain promises using .then() instead of nesting callbacks.',
            priority: 'MEDIUM',
        },
    ],
    REPEATED_CONDITIONS: [
        {
            title: 'Extract to Variable',
            description: 'Store repeated conditions in a descriptive variable.',
            priority: 'MEDIUM',
            example: 'const isEligible = user.age >= 18 && user.active;\nif (isEligible) { ... }',
        },
        {
            title: 'Create Helper Function',
            description: 'Create a named function that encapsulates the condition logic.',
            priority: 'LOW',
        },
    ],
    LARGE_SWITCH: [
        {
            title: 'Use Lookup Map',
            description: 'Replace switch/case with an object mapping.',
            priority: 'HIGH',
            example: 'const handlers = { case1: () => ..., case2: () => ... };\nhandlers[key]();',
        },
        {
            title: 'Apply Command Pattern',
            description: 'Encapsulate each case as a command object.',
            priority: 'LOW',
        },
    ],
};

export function generateSuggestions(smells) {
    const suggestions = [];
    const seenTypes = new Set();

    for (const smell of smells) {
        const mappedSuggestions = SUGGESTION_MAP[smell.type] || [];

        for (const sug of mappedSuggestions) {
            const key = `${smell.type}_${sug.title}_${smell.functionName}`;
            if (seenTypes.has(key)) continue;
            seenTypes.add(key);

            suggestions.push({
                ...sug,
                relatedSmell: smell.type,
                functionName: smell.functionName,
                startLine: smell.startLine,
                endLine: smell.endLine,
                severity: smell.severity,
            });
        }
    }

    // Sort by priority
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    suggestions.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

    return suggestions;
}

export function getSuggestionsByFunction(suggestions) {
    const byFunction = {};
    for (const sug of suggestions) {
        if (!byFunction[sug.functionName]) {
            byFunction[sug.functionName] = [];
        }
        byFunction[sug.functionName].push(sug);
    }
    return byFunction;
}
