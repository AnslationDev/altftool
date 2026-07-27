/**
 * Code Comment Prompt Builder.
 *
 * Picks a documentation-comment convention, renders the exact skeleton that
 * convention requires (delimiters, tag spelling, section order, line limit)
 * and writes a prompt that makes a model document pasted code in that style
 * instead of inventing its own.
 *
 * Every convention below is the published one for its language:
 *  - JSDoc 3 block tags (@param/@returns/@throws/@example).
 *  - TSDoc, the Microsoft standard used by API Extractor: no types in tags,
 *    because TypeScript already carries them.
 *  - Google Python Style Guide docstrings (Args:/Returns:/Raises:), whose
 *    summary-line rules come from PEP 257.
 *  - numpydoc section headings underlined with dashes.
 *  - Sphinx/reStructuredText field lists (:param:/:type:/:returns:/:rtype:).
 *  - Javadoc, where the FIRST SENTENCE is extracted as the summary fragment.
 *  - Doxygen with @brief and direction-qualified @param[in].
 *  - C# XML documentation comments (<summary>/<param>/<returns>/<exception>).
 *  - rustdoc `///` markdown with the conventional # Arguments / # Errors /
 *    # Panics / # Examples headings, where examples run as doctests.
 *  - Go doc comments, which have NO tags and MUST begin with the name of the
 *    declaration they document.
 */

/** Roughly four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = { codeChars: { min: 10, max: 12000 } };

/**
 * How wide a doc-comment line may be, per convention, with the rule it comes
 * from. `null` means the language publishes no line limit and its formatter
 * does not reflow comments.
 */
const LINE_LIMITS = {
  // PEP 8: "For flowing long blocks of text with fewer structural
  // restrictions (docstrings or comments), the line length should be limited
  // to 72 characters."
  pep8Docstring: { columns: 72, source: "PEP 8 docstring/comment limit" },
  // Prettier's default printWidth, the de-facto width for JS/TS sources.
  prettier: { columns: 80, source: "Prettier default printWidth" },
  // Google Java Style Guide 4.4 "Column limit: 100".
  googleJava: { columns: 100, source: "Google Java Style 4.4 column limit" },
  // LLVM Coding Standards, "Source Code Width": 80 columns.
  llvm: { columns: 80, source: "LLVM Coding Standards source width" },
  // rustfmt default max_width = 100.
  rustfmt: { columns: 100, source: "rustfmt default max_width" },
  none: null,
};

/** Detail levels, expressed as extra instructions rather than vague adjectives. */
export const DETAIL_LEVELS = [
  {
    id: "minimal",
    label: "Minimal — summary line only",
    instruction:
      "Write the summary line and nothing else. No tags, no prose paragraphs, no examples.",
  },
  {
    id: "standard",
    label: "Standard — summary plus the selected tags",
    instruction:
      "Write the summary line, then the selected sections. Keep prose to at most two sentences per section.",
  },
  {
    id: "full",
    label: "Full — add remarks, complexity and caveats",
    instruction:
      "After the selected sections, add a short remarks paragraph covering time/space complexity where it is non-obvious, thread-safety or re-entrancy if relevant, and any side effect the signature does not reveal.",
  },
];

/**
 * @typedef {object} DocConvention
 * @property {string} id
 * @property {string} label
 * @property {string} language
 * @property {string} family        Key used for the language-mismatch check.
 * @property {string} spec          Where the convention is defined.
 * @property {string|null} wrapOpen Opening delimiter line, if any.
 * @property {string|null} wrapClose
 * @property {boolean} inlineOpen   True when the summary sits on the opening line.
 * @property {string} linePrefix    Prefix applied to each body line.
 */
export const DOC_CONVENTIONS = [
  {
    id: "jsdoc",
    label: "JSDoc — JavaScript",
    language: "JavaScript",
    family: "js",
    spec: "JSDoc 3 block tags",
    wrapOpen: "/**",
    wrapClose: " */",
    inlineOpen: false,
    linePrefix: " * ",
    blankAfterSummary: true,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.prettier,
    notes: [
      "JSDoc carries the type inside braces: @param {string} name - description.",
      "Use @returns (not @return) and hyphenate the parameter description.",
    ],
    sections: {
      summary: ["Short one-line summary of what the function does."],
      params: ["@param {string} name - What this argument is and any constraint on it."],
      returns: ["@returns {Promise<boolean>} What the caller gets back."],
      throws: ["@throws {TypeError} The condition under which this is thrown."],
      examples: ["@example", "const ok = await doThing('a');"],
    },
  },
  {
    id: "tsdoc",
    label: "TSDoc — TypeScript",
    language: "TypeScript",
    family: "js",
    spec: "TSDoc, as consumed by API Extractor",
    wrapOpen: "/**",
    wrapClose: " */",
    inlineOpen: false,
    linePrefix: " * ",
    blankAfterSummary: true,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.prettier,
    notes: [
      "TSDoc omits types from tags — the TypeScript signature already has them.",
      "The parameter name is followed by a space-hyphen-space, then the description.",
    ],
    sections: {
      summary: ["Short one-line summary of what the function does."],
      params: ["@param name - What this argument is and any constraint on it."],
      returns: ["@returns What the caller gets back."],
      throws: ["@throws {@link TypeError} The condition under which this is thrown."],
      examples: ["@example", "```ts", "const ok = await doThing('a');", "```"],
    },
  },
  {
    id: "python-google",
    label: "Google style docstring — Python",
    language: "Python",
    family: "python",
    spec: "Google Python Style Guide 3.8, summary rules from PEP 257",
    wrapOpen: '"""',
    wrapClose: '"""',
    inlineOpen: true,
    linePrefix: "",
    blankAfterSummary: true,
    blankBetweenSections: true,
    lineLimit: LINE_LIMITS.pep8Docstring,
    notes: [
      "PEP 257: the summary is one line, ends with a period, and is phrased as a command (\"Return the parsed row.\").",
      "Section bodies are indented four spaces under Args:, Returns: and Raises:.",
    ],
    sections: {
      summary: ["Return a one-line summary phrased as a command."],
      params: ["Args:", "    name (str): What this argument is and any constraint on it."],
      returns: ["Returns:", "    bool: What the caller gets back."],
      throws: ["Raises:", "    ValueError: The condition under which this is raised."],
      examples: ["Examples:", '    >>> do_thing("a")', "    True"],
    },
  },
  {
    id: "python-numpy",
    label: "NumPy / numpydoc docstring — Python",
    language: "Python",
    family: "python",
    spec: "numpydoc style guide",
    wrapOpen: '"""',
    wrapClose: '"""',
    inlineOpen: true,
    linePrefix: "",
    blankAfterSummary: true,
    blankBetweenSections: true,
    lineLimit: LINE_LIMITS.pep8Docstring,
    notes: [
      "Every section heading is underlined with hyphens exactly as long as the heading.",
      "A parameter is written `name : type` on its own line, description indented beneath.",
    ],
    sections: {
      summary: ["Return a one-line summary phrased as a command."],
      params: [
        "Parameters",
        "----------",
        "name : str",
        "    What this argument is and any constraint on it.",
      ],
      returns: ["Returns", "-------", "bool", "    What the caller gets back."],
      throws: ["Raises", "------", "ValueError", "    The condition under which this is raised."],
      examples: ["Examples", "--------", '>>> do_thing("a")', "True"],
    },
  },
  {
    id: "python-sphinx",
    label: "Sphinx / reST field list — Python",
    language: "Python",
    family: "python",
    spec: "Sphinx Python domain info field lists",
    wrapOpen: '"""',
    wrapClose: '"""',
    inlineOpen: true,
    linePrefix: "",
    blankAfterSummary: true,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.pep8Docstring,
    notes: [
      "Fields are colon-delimited and each sits on its own line; :type: and :rtype: are separate fields.",
      "The exception class goes inside the field name: :raises ValueError:.",
    ],
    sections: {
      summary: ["Return a one-line summary phrased as a command."],
      params: [":param name: What this argument is and any constraint on it.", ":type name: str"],
      returns: [":returns: What the caller gets back.", ":rtype: bool"],
      throws: [":raises ValueError: The condition under which this is raised."],
      examples: ["", "Example::", "", '    do_thing("a")'],
    },
  },
  {
    id: "javadoc",
    label: "Javadoc — Java",
    language: "Java",
    family: "java",
    spec: "Javadoc standard doclet tags",
    wrapOpen: "/**",
    wrapClose: " */",
    inlineOpen: false,
    linePrefix: " * ",
    blankAfterSummary: true,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.googleJava,
    notes: [
      "Javadoc extracts the FIRST SENTENCE as the summary shown in index pages, so it must stand alone.",
      "The tag is @return (singular), and @param takes no braces or hyphen.",
    ],
    sections: {
      summary: ["Returns a one-sentence summary that reads well on its own."],
      params: ["@param name what this argument is and any constraint on it"],
      returns: ["@return what the caller gets back"],
      throws: ["@throws IllegalArgumentException the condition under which this is thrown"],
      examples: ["<pre>{@code", "boolean ok = doThing(\"a\");", "}</pre>"],
    },
  },
  {
    id: "doxygen",
    label: "Doxygen — C / C++",
    language: "C / C++",
    family: "cpp",
    spec: "Doxygen special commands",
    wrapOpen: "/**",
    wrapClose: " */",
    inlineOpen: false,
    linePrefix: " * ",
    blankAfterSummary: false,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.llvm,
    notes: [
      "@brief holds the one-line summary; longer prose goes in a separate paragraph below it.",
      "Qualify each parameter's direction: @param[in], @param[out] or @param[in,out].",
    ],
    sections: {
      summary: ["@brief Short summary of what the function does.", ""],
      params: ["@param[in] name What this argument is and any constraint on it."],
      returns: ["@return What the caller gets back."],
      throws: ["@throws std::invalid_argument The condition under which this is thrown."],
      examples: ["@code", 'auto ok = do_thing("a");', "@endcode"],
    },
  },
  {
    id: "csharp-xml",
    label: "XML documentation comments — C#",
    language: "C#",
    family: "csharp",
    spec: "C# XML documentation comments (/// tags)",
    wrapOpen: null,
    wrapClose: null,
    inlineOpen: false,
    linePrefix: "/// ",
    blankAfterSummary: false,
    blankBetweenSections: false,
    lineLimit: LINE_LIMITS.none,
    notes: [
      "Every documentation line starts with three slashes and the content is well-formed XML.",
      "Exceptions use cref, which the compiler resolves and warns about if the type does not exist.",
    ],
    sections: {
      summary: ["<summary>", "Short summary of what the method does.", "</summary>"],
      params: ['<param name="name">What this argument is and any constraint on it.</param>'],
      returns: ["<returns>What the caller gets back.</returns>"],
      throws: [
        '<exception cref="ArgumentException">The condition under which this is thrown.</exception>',
      ],
      examples: ["<example>", "<code>", 'var ok = DoThing("a");', "</code>", "</example>"],
    },
  },
  {
    id: "rustdoc",
    label: "rustdoc — Rust",
    language: "Rust",
    family: "rust",
    spec: "rustdoc doc comments, Rust API guidelines",
    wrapOpen: null,
    wrapClose: null,
    inlineOpen: false,
    linePrefix: "/// ",
    blankAfterSummary: true,
    blankBetweenSections: true,
    lineLimit: LINE_LIMITS.rustfmt,
    notes: [
      "Doc comments are markdown; the conventional headings are # Arguments, # Errors, # Panics and # Examples.",
      "Code in # Examples is compiled and run as a doctest by `cargo test`, so it must actually work.",
    ],
    sections: {
      summary: ["Return a one-line summary phrased as a command."],
      params: ["# Arguments", "", "* `name` - What this argument is and any constraint on it."],
      returns: ["# Returns", "", "What the caller gets back."],
      throws: [
        "# Errors",
        "",
        "Returns `Err` when the condition described here holds.",
        "",
        "# Panics",
        "",
        "Panics when the condition described here holds.",
      ],
      examples: ["# Examples", "", "```", 'let ok = do_thing("a");', "assert!(ok);", "```"],
    },
  },
  {
    id: "godoc",
    label: "Go doc comment — Go",
    language: "Go",
    family: "go",
    spec: "Go Doc Comments (go.dev/doc/comment)",
    wrapOpen: null,
    wrapClose: null,
    inlineOpen: false,
    linePrefix: "// ",
    blankAfterSummary: true,
    blankBetweenSections: true,
    lineLimit: LINE_LIMITS.none,
    notes: [
      "A Go doc comment MUST begin with the name of the declaration it documents: \"DoThing reports whether ...\".",
      "Go has no @param or @return tags — arguments, results and errors are described in prose.",
    ],
    sections: {
      summary: ["DoThing reports whether the named thing succeeded."],
      params: ["It takes name, which is what this argument is and any constraint on it."],
      returns: ["It returns what the caller gets back."],
      throws: ["It returns a non-nil error when the condition described here holds."],
      examples: [
        "Runnable examples belong in an ExampleDoThing function in the _test.go file,",
        "not inside this comment.",
      ],
    },
  },
];

/** Conventions that have no tag syntax for a section, only prose. */
const TAGLESS_FAMILIES = new Set(["go"]);

/** Human labels for the family ids used by detectFamily. */
export const FAMILY_LABELS = {
  js: "JavaScript or TypeScript",
  python: "Python",
  java: "Java",
  cpp: "C or C++",
  csharp: "C#",
  rust: "Rust",
  go: "Go",
};

export function getConvention(conventionId) {
  return DOC_CONVENTIONS.find((convention) => convention.id === conventionId) || null;
}

/**
 * Strong, low-false-positive markers for each language family, used only to
 * warn when the pasted code plainly is not the language of the chosen
 * convention. Each hit scores one point; two points make a confident guess.
 */
const FAMILY_MARKERS = {
  python: [/^\s*(?:async\s+)?def\s+\w+\s*\(/m, /^\s*(?:from\s+[\w.]+\s+)?import\s+\w/m, /:\s*$/m],
  go: [/^\s*package\s+\w+/m, /^\s*func\s+(?:\([^)]*\)\s*)?\w+\s*\(/m, /:=/],
  rust: [/\bfn\s+\w+\s*\(/, /\blet\s+(?:mut\s+)?\w+/, /^\s*use\s+[\w:]+;/m],
  csharp: [/\busing\s+System\b/, /\bnamespace\s+[\w.]+/, /\b(?:public|private)\s+(?:static\s+)?(?:async\s+)?[\w<>[\]]+\s+\w+\s*\(/],
  java: [/\bpublic\s+(?:final\s+)?class\s+\w+/, /\bSystem\.out\.print/, /\bimport\s+java\./],
  cpp: [/^\s*#include\s*[<"]/m, /\bstd::/, /\btemplate\s*</],
  js: [/\b(?:const|let)\s+\w+\s*=/, /=>/, /\b(?:export|require\()/],
};

/**
 * Best-guess language family for a snippet.
 * @returns {{family: string|null, score: number}}
 */
export function detectFamily(code) {
  if (typeof code !== "string" || code.trim().length === 0) return { family: null, score: 0 };
  let best = { family: null, score: 0 };
  for (const [family, markers] of Object.entries(FAMILY_MARKERS)) {
    const score = markers.reduce((total, marker) => total + (marker.test(code) ? 1 : 0), 0);
    if (score > best.score) best = { family, score };
  }
  return best;
}

/** Declaration patterns used to count what the prompt will have to document. */
const DECLARATION_PATTERNS = {
  python: [/^[ \t]*(?:async[ \t]+)?(?:def|class)[ \t]+\w+/gm],
  go: [/^[ \t]*func[ \t]+(?:\([^)]*\)[ \t]*)?\w+/gm, /^[ \t]*type[ \t]+\w+/gm],
  rust: [
    /^[ \t]*(?:pub(?:\([^)]*\))?[ \t]+)?(?:async[ \t]+)?(?:unsafe[ \t]+)?fn[ \t]+\w+/gm,
    /^[ \t]*(?:pub[ \t]+)?(?:struct|enum|trait)[ \t]+\w+/gm,
  ],
  js: [
    /^[ \t]*(?:export[ \t]+)?(?:default[ \t]+)?(?:async[ \t]+)?function\b[ \t]*\*?[ \t]*\w*/gm,
    /^[ \t]*(?:export[ \t]+)?(?:const|let|var)[ \t]+\w+[ \t]*=[ \t]*(?:async[ \t]*)?(?:function\b|\([^)]*\)[ \t]*=>|\w+[ \t]*=>)/gm,
    /^[ \t]*(?:export[ \t]+)?(?:default[ \t]+)?class[ \t]+\w+/gm,
  ],
  java: [
    /^[ \t]*(?:public|protected|private)?[ \t]*(?:static[ \t]+)?(?:final[ \t]+)?(?:abstract[ \t]+)?(?:class|interface|enum|record)[ \t]+\w+/gm,
    /^[ \t]*(?:public|protected|private)[ \t]+(?:static[ \t]+)?(?:final[ \t]+)?[\w<>[\],. ]+[ \t]+\w+[ \t]*\([^;{]*\)[ \t]*(?:throws[ \w,.]+)?[ \t]*\{/gm,
  ],
  csharp: [
    /^[ \t]*(?:public|protected|private|internal)?[ \t]*(?:static[ \t]+)?(?:sealed[ \t]+)?(?:abstract[ \t]+)?(?:class|interface|struct|record|enum)[ \t]+\w+/gm,
    /^[ \t]*(?:public|protected|private|internal)[ \t]+(?:static[ \t]+)?(?:async[ \t]+)?[\w<>[\],.?]+[ \t]+\w+[ \t]*\([^;{]*\)/gm,
  ],
  cpp: [
    /^[ \t]*(?:class|struct)[ \t]+\w+/gm,
    /^[ \t]*(?:[\w:<>*&,\s]+[ \t*&]+)?\w+(?:::\w+)?[ \t]*\([^;{)]*\)[ \t]*(?:const[ \t]*)?\{/gm,
  ],
};

/**
 * Approximate count of the declarations in the snippet, so the UI can tell
 * the user how many doc blocks the prompt will ask for. Regex-based, so it is
 * an estimate, never a parser result.
 */
export function countDeclarations(code, family) {
  if (typeof code !== "string" || code.trim().length === 0) return 0;
  const patterns = DECLARATION_PATTERNS[family];
  if (!patterns) return 0;
  let total = 0;
  for (const pattern of patterns) {
    const matches = code.match(new RegExp(pattern.source, pattern.flags));
    total += matches ? matches.length : 0;
  }
  return total;
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  const characters = text.length;
  const words = text.trim().split(/\s+/).length;
  return {
    characters,
    words,
    approxTokens: Math.max(1, Math.ceil(characters / AVERAGE_CHARS_PER_TOKEN)),
  };
}

const SECTION_ORDER = ["summary", "params", "returns", "throws", "examples"];

/**
 * Render the doc-comment skeleton for a convention with the chosen sections.
 * @returns {{error:string}|{text:string, lines:string[]}}
 */
export function buildDocSkeleton(conventionId, options = {}) {
  const convention = getConvention(conventionId);
  if (!convention) return { error: "Choose a documentation comment convention." };

  const enabled = {
    summary: true,
    params: options.params !== false,
    returns: options.returns !== false,
    throws: Boolean(options.throws),
    examples: Boolean(options.examples),
  };

  const body = [];
  let previousKey = null;
  for (const key of SECTION_ORDER) {
    if (!enabled[key]) continue;
    const section = convention.sections[key];
    if (!section) continue;
    if (body.length > 0) {
      const needsBlank =
        previousKey === "summary" ? convention.blankAfterSummary : convention.blankBetweenSections;
      if (needsBlank) body.push("");
    }
    body.push(...section);
    previousKey = key;
  }
  while (body.length > 0 && body[body.length - 1] === "") body.pop();

  const lines = [];
  let rest = body;
  if (convention.wrapOpen) {
    // PEP 257: for a one-line docstring the closing quotes sit on the same
    // line as the opening quotes.
    if (convention.inlineOpen && body.length === 1) {
      return {
        text: `${convention.wrapOpen}${body[0]}${convention.wrapClose}`,
        lines: [`${convention.wrapOpen}${body[0]}${convention.wrapClose}`],
      };
    }
    if (convention.inlineOpen && body.length > 0) {
      lines.push(`${convention.wrapOpen}${body[0]}`);
      rest = body.slice(1);
    } else {
      lines.push(convention.wrapOpen);
    }
  }
  for (const line of rest) {
    lines.push(line === "" ? convention.linePrefix.trimEnd() : `${convention.linePrefix}${line}`);
  }
  if (convention.wrapClose) lines.push(convention.wrapClose);

  return { text: lines.join("\n"), lines };
}

/**
 * Build the full documentation prompt.
 *
 * @param {object} input
 * @param {string} input.conventionId  One of DOC_CONVENTIONS.
 * @param {string} input.code          The code to be documented.
 * @param {string} [input.detailId]    One of DETAIL_LEVELS, default "standard".
 * @param {boolean} [input.params]     Document parameters (default true).
 * @param {boolean} [input.returns]    Document the return value (default true).
 * @param {boolean} [input.throws]     Document thrown errors.
 * @param {boolean} [input.examples]   Include a usage example.
 * @param {boolean} [input.publicOnly] Document only exported/public members.
 * @param {string}  [input.context]    Extra domain context for the model.
 * @returns {{error:string}|object}
 */
export function buildCommentPrompt({
  conventionId,
  code,
  detailId = "standard",
  params = true,
  returns = true,
  throws = false,
  examples = false,
  publicOnly = false,
  context = "",
} = {}) {
  const convention = getConvention(conventionId);
  if (!convention) return { error: "Choose a documentation comment convention." };

  const detail =
    DETAIL_LEVELS.find((level) => level.id === detailId) || DETAIL_LEVELS[1];

  const source = typeof code === "string" ? code.trim() : "";
  if (source.length < LIMITS.codeChars.min) {
    return { error: "Paste the code you want documented — at least a full signature." };
  }
  if (source.length > LIMITS.codeChars.max) {
    return {
      error: `Keep the snippet under ${LIMITS.codeChars.max.toLocaleString("en-US")} characters — document one file or one class at a time.`,
    };
  }

  const wantParams = detail.id === "minimal" ? false : Boolean(params);
  const wantReturns = detail.id === "minimal" ? false : Boolean(returns);
  const wantThrows = detail.id === "minimal" ? false : Boolean(throws);
  const wantExamples = detail.id === "minimal" ? false : Boolean(examples);

  const skeleton = buildDocSkeleton(convention.id, {
    params: wantParams,
    returns: wantReturns,
    throws: wantThrows,
    examples: wantExamples,
  });
  if (skeleton.error) return { error: skeleton.error };

  const detected = detectFamily(source);
  const declarations = countDeclarations(source, convention.family);

  const warnings = [];
  if (detected.family && detected.score >= 2 && detected.family !== convention.family) {
    warnings.push(
      `The snippet looks like ${FAMILY_LABELS[detected.family]}, but you chose a ${convention.language} convention. Switch the convention or the snippet, or the model will emit comments the compiler rejects.`,
    );
  }
  if (TAGLESS_FAMILIES.has(convention.family) && (wantParams || wantReturns || wantThrows)) {
    warnings.push(
      "Go doc comments have no @param or @return tags — the prompt asks for the arguments and results to be described in prose, starting with the declaration's name.",
    );
  }
  if (wantExamples && convention.family === "rust") {
    warnings.push(
      "rustdoc examples run as doctests under `cargo test`, so the prompt requires code that actually compiles.",
    );
  }
  if (declarations > 12) {
    warnings.push(
      `About ${declarations} declarations detected — that is a long answer. Split the file if the model starts truncating.`,
    );
  }

  const lines = [
    `Write ${convention.spec} documentation comments for the ${convention.language} code at the end of this message.`,
    "",
    "CONVENTION:",
    ...convention.notes.map((note) => `- ${note}`),
  ];
  if (convention.lineLimit) {
    lines.push(
      `- Wrap comment text at ${convention.lineLimit.columns} columns (${convention.lineLimit.source}).`,
    );
  } else {
    lines.push(
      `- ${convention.language} publishes no column limit for comments; keep lines readable and do not reflow surrounding code.`,
    );
  }

  lines.push("", "SHAPE — follow this skeleton exactly, filling in real content:", skeleton.text);

  lines.push("", "CONTENT:", `- ${detail.instruction}`);
  lines.push(
    "- The summary says what the code does and why a caller would use it, not how it is implemented.",
  );
  if (wantParams) {
    lines.push(
      TAGLESS_FAMILIES.has(convention.family)
        ? "- Describe every argument in prose, including units, allowed ranges and what nil/empty means."
        : "- Document every parameter, including units, allowed ranges and what an empty or null value means.",
    );
  }
  if (wantReturns) {
    lines.push(
      "- Describe the return value, including what is returned in the empty or not-found case.",
    );
  }
  if (wantThrows) {
    lines.push(
      convention.family === "rust"
        ? "- List the error variants under # Errors and every panic condition under # Panics."
        : "- List each error type the code can raise and the exact condition that raises it.",
    );
  }
  if (wantExamples) {
    lines.push("- Add one short usage example that would actually run against this code.");
  }
  if (publicOnly) {
    lines.push(
      "- Document only the exported/public declarations. Leave private helpers untouched.",
    );
  } else {
    lines.push("- Document every declaration in the snippet, public and private.");
  }

  lines.push(
    "",
    "RULES:",
    "- Do not change a single character of the code — output the same code with comment blocks inserted above each declaration.",
    "- Never restate the signature in words (\"takes a string and returns a boolean\"); say what it means.",
    "- If a parameter's purpose is not derivable from the code, write TODO: clarify <name> rather than guessing.",
    "- No commentary before or after the code block.",
  );

  const extraContext = typeof context === "string" ? context.trim() : "";
  if (extraContext) {
    lines.push("", "DOMAIN CONTEXT (use it, do not repeat it verbatim):", extraContext);
  }

  lines.push("", "CODE:", source);

  const text = lines.join("\n");
  return {
    text,
    skeleton: skeleton.text,
    convention,
    detail,
    declarations,
    detectedFamily: detected.family,
    lineLimit: convention.lineLimit,
    warnings,
    ...measureText(text),
  };
}
