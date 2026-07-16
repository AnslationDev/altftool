const KEYWORDS = {
  javascript: [
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends", "finally",
    "for", "function", "if", "import", "in", "instanceof", "let", "new", "of",
    "return", "static", "super", "switch", "this", "throw", "try", "typeof",
    "var", "void", "while", "with", "yield",
  ],
  python: [
    "False", "None", "True", "and", "as", "assert", "async", "await", "break",
    "class", "continue", "def", "del", "elif", "else", "except", "finally", "for",
    "from", "global", "if", "import", "in", "is", "lambda", "nonlocal", "not",
    "or", "pass", "raise", "return", "try", "while", "with", "yield",
  ],
  typescript: [
    "interface", "type", "enum", "implements", "abstract", "readonly", "as",
    "async", "await", "break", "case", "catch", "class", "const", "continue",
    "debugger", "default", "delete", "do", "else", "export", "extends", "finally",
    "for", "function", "if", "import", "in", "instanceof", "keyof", "let", "new",
    "of", "return", "static", "super", "switch", "this", "throw", "try", "typeof",
    "var", "void", "while", "with", "yield",
  ],
  java: [
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
    "class", "const", "continue", "default", "do", "double", "else", "enum",
    "extends", "final", "finally", "float", "for", "goto", "if", "implements",
    "import", "instanceof", "int", "interface", "long", "native", "new",
    "package", "private", "protected", "public", "return", "short", "static",
    "strictfp", "super", "switch", "synchronized", "this", "throw", "throws",
    "transient", "try", "void", "volatile", "while",
  ],
  cpp: [
    "alignas", "alignof", "auto", "bool", "break", "case", "catch", "char",
    "class", "const", "constexpr", "continue", "decltype", "default", "delete",
    "do", "double", "else", "enum", "explicit", "export", "extern", "false",
    "float", "for", "friend", "goto", "if", "inline", "int", "long", "mutable",
    "namespace", "new", "noexcept", "nullptr", "operator", "override", "private",
    "protected", "public", "register", "return", "short", "signed", "sizeof",
    "static", "struct", "switch", "template", "this", "throw", "true", "try",
    "typedef", "typeid", "typename", "union", "unsigned", "using", "virtual",
    "void", "volatile", "while",
  ],
  go: [
    "break", "case", "chan", "const", "continue", "default", "defer", "else",
    "fallthrough", "for", "func", "go", "goto", "if", "import", "interface",
    "map", "package", "range", "return", "select", "struct", "switch", "type",
    "var",
  ],
  rust: [
    "as", "break", "const", "continue", "crate", "else", "enum", "extern",
    "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod",
    "move", "mut", "pub", "ref", "return", "self", "static", "struct",
    "super", "trait", "true", "type", "unsafe", "use", "where", "while",
  ],
  ruby: [
    "BEGIN", "END", "alias", "and", "begin", "break", "case", "class", "def",
    "defined?", "do", "else", "elsif", "end", "ensure", "false", "for", "if",
    "in", "module", "next", "nil", "not", "or", "redo", "rescue", "retry",
    "return", "self", "super", "then", "true", "undef", "unless", "until",
    "when", "while", "yield",
  ],
};

const TYPES = {
  javascript: [
    "Array", "BigInt", "Boolean", "Buffer", "Error", "Function", "Infinity",
    "JSON", "Map", "Math", "NaN", "Null", "Number", "Object", "Promise",
    "RegExp", "Set", "String", "Symbol", "Symbol", "Undefined", "WeakMap",
    "WeakSet",
  ],
  python: [
    "int", "float", "str", "list", "dict", "tuple", "set", "bool", "None",
    "True", "False", "Exception", "TypeError", "ValueError", "KeyError",
    "IndexError", "range", "enumerate", "zip", "map", "filter", "len",
    "print", "range", "super", "self",
  ],
  typescript: [
    "string", "number", "boolean", "any", "void", "never", "unknown",
    "null", "undefined", "object", "Array", "Promise", "Record", "Partial",
    "Required", "Readonly", "Pick", "Omit", "Exclude", "Extract",
    "NonNullable", "Parameters", "ReturnType",
  ],
  java: [
    "String", "Integer", "Double", "Float", "Boolean", "Long", "Short",
    "Byte", "Character", "Object", "Class", "System", "List", "ArrayList",
    "Map", "HashMap", "Set", "HashSet", "Collection", "Arrays",
    "Collections", "Optional", "Stream", "IntStream", "LongStream",
  ],
};

export function highlightCode(code, language) {
  const lang = language?.toLowerCase() || "text";
  const keywords = KEYWORDS[lang] || [];
  const types = TYPES[lang] || [];

  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.split("\n");
  return lines
    .map((line) => {
      let highlighted = line;
      highlighted = highlighted.replace(
        /\/\/.*$/gm,
        '<span class="hljs-comment">$&</span>'
      );
      highlighted = highlighted.replace(
        /\/\*[\s\S]*?\*\//g,
        '<span class="hljs-comment">$&</span>'
      );
      const stringRegex = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
      highlighted = highlighted.replace(
        stringRegex,
        '<span class="hljs-string">$1</span>'
      );
      if (keywords.length) {
        const kwRegex = new RegExp(
          `\\b(${keywords.join("|")})\\b`,
          "g"
        );
        highlighted = highlighted.replace(
          kwRegex,
          '<span class="hljs-keyword">$1</span>'
        );
      }
      if (types.length) {
        const typeRegex = new RegExp(`\\b(${types.join("|")})\\b`, "g");
        highlighted = highlighted.replace(
          typeRegex,
          '<span class="hljs-built_in">$1</span>'
        );
      }
      highlighted = highlighted.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span class="hljs-number">$1</span>'
      );
      return highlighted;
    })
    .join("\n");
}

export function getLanguageClass(language) {
  const langMap = {
    js: "javascript",
    py: "python",
    ts: "typescript",
    tsx: "typescript",
    jsx: "javascript",
    rb: "ruby",
    rs: "rust",
    go: "go",
    java: "java",
    cpp: "cpp",
    cs: "csharp",
    c: "cpp",
    h: "cpp",
    swift: "swift",
    kt: "kotlin",
    dart: "dart",
    php: "php",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
    bash: "bash",
    zsh: "bash",
    html: "html",
    css: "css",
    json: "json",
    xml: "xml",
  };
  return langMap[language?.toLowerCase()] || language || "text";
}
