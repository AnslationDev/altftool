const seo = {
  title: "EditorConfig File Generator: Indent & EOL Rules",
  metaDescription:
    "Build a valid .editorconfig from indent, charset, line-ending and whitespace choices, with one-click sections for Makefiles, Markdown, YAML and more.",
  steps: [
    "Set the [*] Global rules: indent style and size, line endings, charset, max line length, the trailing-whitespace and final-newline checkboxes, and root = true.",
    "Tick per-file-type sections — Makefile (hard tabs) and Markdown (keep trailing spaces) are pre-selected; YAML, Python, Go, JSON and Windows batch are one click.",
    "Review the .editorconfig preview and its section count, click Copy file and save it in your repository root.",
  ],
  intro:
    "This generator builds a valid .editorconfig file — the cross-editor configuration format defined by the EditorConfig specification — from your indentation, charset, line-ending and whitespace choices. It is aimed at teams who want identical formatting behaviour across VS Code, JetBrains IDEs, Vim and every other editor, and it adds convention-correct per-file-type sections such as hard tabs for Makefiles and preserved trailing spaces for Markdown.",
  useCases: [
    "A team lead standardising 2-space indentation, LF line endings and UTF-8 across a polyglot repository before onboarding new developers",
    "A developer fixing a Makefile that breaks because their editor converts the required hard tabs into spaces",
    "An open-source maintainer adding per-type sections so Python files get PEP 8's 4 spaces while YAML stays at 2 spaces and Go keeps tabs",
  ],
  benefits: [
    ["Spec-valid output", "Property names and values follow the EditorConfig file-format specification, so every compliant editor parses the file."],
    ["Convention-aware sections", "One-click sections encode real rules: POSIX make requires tabs, Markdown line breaks need trailing spaces, YAML forbids tab indentation."],
    ["Validated before you copy", "Indent sizes, line lengths, globs and duplicate sections are checked, so a typo never ships to the whole team."],
  ],
  faqs: [
    [
      "What does root = true do in an .editorconfig file?",
      "It stops the upward search for more .editorconfig files. Editors read every .editorconfig from the open file's directory up to the filesystem root and merge them with closer files winning; root = true in the top-most file of your repository marks the boundary so settings from directories above your project are ignored.",
    ],
    [
      "Why should Markdown files not trim trailing whitespace?",
      "Because two trailing spaces at the end of a line are Markdown's hard line-break syntax, so trimming them silently changes the rendered output. The standard fix is a [*.md] section with trim_trailing_whitespace = false, which this generator adds with one click.",
    ],
    [
      "Does VS Code support EditorConfig out of the box?",
      "No — VS Code needs the official \"EditorConfig for VS Code\" extension to honour the file. JetBrains IDEs (IntelliJ, WebStorm, PyCharm), Vim 9.1+, Neovim and GitHub's web renderer support EditorConfig natively, which is why one file keeps a mixed-editor team consistent.",
    ],
    [
      "What is the difference between indent_size and tab_width?",
      "indent_size sets how many columns one indentation level occupies, while tab_width sets how wide a tab character displays and defaults to the value of indent_size. You normally set only indent_size; setting indent_size = tab makes indentation follow tab_width instead, which is useful in tab-indented codebases.",
    ],
  ],
};

export default seo;
