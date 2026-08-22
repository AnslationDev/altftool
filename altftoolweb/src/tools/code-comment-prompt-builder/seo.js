const seo = {
  title: "Docstring Prompt Builder: JSDoc, TSDoc, rustdoc",
  metaDescription:
    "Build an AI prompt carrying one convention's exact skeleton, tag spelling and column limit — 72 columns for PEP 8 docstrings, 100 for rustfmt.",
  steps: [
    "Choose a Documentation convention — JSDoc, TSDoc, Google style, numpydoc, Sphinx, Javadoc, Doxygen, C# XML, rustdoc or Go doc — and a Detail level.",
    "Paste 10 to 12,000 characters into Code to document, then tick Document parameters, Document the return value, Document errors / exceptions and Include a usage example.",
    "Check the Line limit row — 72 columns under PEP 8, 100 under rustfmt — and Language detected in snippet, then press Copy prompt.",
  ],
  intro:
    "The Code Comment Prompt Builder turns a documentation convention into a ready-to-paste AI prompt that carries that convention's exact skeleton, tag spelling and column limit. It covers ten published standards — JSDoc 3 block tags, TSDoc, Google-style and numpydoc Python docstrings, Sphinx reST field lists, Javadoc, Doxygen, C# XML documentation comments, rustdoc and Go doc comments — and pins each to its own line width, such as PEP 8's 72-column docstring limit or rustfmt's 100. It is for developers who want ChatGPT, Claude or Copilot to emit comments their linter and doc generator accept on the first pass.",
  useCases: [
    "A TypeScript developer generates TSDoc for a public SDK and gets tags without types, because the TypeScript signature already carries them and API Extractor expects it that way.",
    "A Python team standardises on Google-style docstrings and produces Args:/Returns:/Raises: blocks wrapped at 72 columns so flake8 stops flagging long docstring lines.",
    "A Rust crate author documents a fallible function and gets # Arguments, # Errors and # Panics headings with an example that must compile, since rustdoc runs it as a doctest.",
  ],
  benefits: [
    [
      "Real convention skeletons",
      "The prompt embeds the literal comment block — delimiters, indentation and tag order — so the model fills it in instead of inventing a house style.",
    ],
    [
      "Correct tag spelling per language",
      "Javadoc gets @return, JSDoc gets @returns, Sphinx gets :raises ValueError:, and Go gets no tags at all because Go doc comments are prose.",
    ],
    [
      "Language mismatch warning",
      "If the pasted snippet looks like Python but a Javadoc convention is selected, the tool says so before you send a prompt that produces comments the compiler rejects.",
    ],
  ],
  faqs: [
    [
      "What is the difference between JSDoc and TSDoc?",
      "JSDoc puts the type in braces — @param {string} name - description — while TSDoc omits types entirely, writing @param name - description, because the TypeScript signature already declares them. TSDoc is the standard consumed by Microsoft's API Extractor; JSDoc 3 is the older JavaScript convention that doubles as a type source for plain JS.",
    ],
    [
      "How long can a docstring line be in Python?",
      "72 characters. PEP 8 limits flowing text in docstrings and comments to 72 columns even though code may run to 79, because docstrings are re-indented when rendered. This tool writes that 72-column instruction into every Python prompt, whether you pick Google style, numpydoc or Sphinx field lists.",
    ],
    [
      "How should a Go doc comment start?",
      "With the name of the declaration it documents — \"DoThing reports whether the request succeeded.\" Go doc comments have no @param or @return tags at all; arguments, results and errors are described in ordinary sentences. The generated prompt enforces both rules, so gofmt and pkg.go.dev render the comment correctly.",
    ],
    [
      "Will an AI-written docstring pass my linter?",
      "It will if the prompt names the convention and its column limit, which is what this tool does. The common failures are the wrong tag (@return instead of @returns under JSDoc), missing section underlines in numpydoc, and lines past the limit — all three are specified explicitly in the generated prompt. Always re-run your doc linter, since the model can still miss a parameter.",
    ],
  ],
};

export default seo;
