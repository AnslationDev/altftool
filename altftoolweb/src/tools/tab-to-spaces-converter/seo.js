const seo = {
  intro:
    "A tab to spaces converter replaces tab characters with the spaces that actually reach the next tab stop, rather than blindly swapping every tab for a fixed number of spaces. Tab stops sit at every multiple of the tab size, so with a size of 4 a tab at column 0 becomes four spaces but a tab at column 6 becomes two — the rule POSIX `expand` follows, and the reason naive converters wreck aligned comments. The tool also runs the conversion backwards like `unexpand`, detects what the file currently uses, and can normalise line endings and trailing whitespace at the same time.",
  useCases: [
    "Convert a tab-indented file to 4-space indentation before opening a pull request against a codebase whose style guide requires spaces.",
    "Turn 8-space indentation back into tabs for a Makefile or a Go file, where tabs are required rather than optional.",
    "Clean up a file that mixes tabs and spaces — the tool reports how many lines use each before you change anything.",
  ],
  benefits: [
    ["Correct tab-stop maths", "Column position is tracked character by character, so a mid-line tab expands to the right width instead of a fixed count."],
    ["Detects what you already have", "Before converting, it reports whether the file is tab-indented, space-indented or mixed, and guesses the indent width."],
    ["Safe by default in reverse", "Spaces-to-tabs touches only leading indentation unless you ask for more, so runs of spaces inside strings are left alone."],
  ],
  faqs: [
    [
      "How many spaces is a tab?",
      "It depends on where the tab sits. A tab moves to the next tab stop, and tab stops are at every multiple of the tab size — so with tab size 4, a tab at column 0 produces 4 spaces, at column 1 produces 3, and at column 6 produces 2. The formula is tabSize − (column mod tabSize). Only a tab that starts exactly on a tab stop produces a full tabSize of spaces.",
    ],
    [
      "Should code use tabs or spaces?",
      "It depends on the language and the project. Go requires tabs and gofmt enforces them; Makefiles require a literal tab to begin a recipe line; Python allows either but forbids mixing them in one file, and PEP 8 recommends 4 spaces. The one rule that always holds is consistency within a file, because mixed indentation is what actually causes broken diffs and syntax errors.",
    ],
    [
      "Will converting spaces to tabs break my strings?",
      "Not with the default setting, which converts leading indentation only — the same behaviour as POSIX `unexpand` with no flags. Turning that off converts every run of two or more spaces anywhere on the line, matching `unexpand -a`, and that can rewrite spaces inside string literals and aligned comments. Use it only on files you can re-check.",
    ],
    [
      "Why did my file get bigger after converting tabs to spaces?",
      "Because one tab byte becomes up to tabSize space bytes. A file with 1,000 tabs converted at tab size 4 gains up to 3,000 bytes. That is normal and is why some projects prefer tabs. The tool shows the before and after byte counts so you can see exactly what the change costs.",
    ],
  ],
};

export default seo;
