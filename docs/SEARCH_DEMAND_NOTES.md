# Search-demand mining notes (2026-08-22)

Method: Google autocomplete (`suggestqueries`, geo=IN) mined for 900 tool
head terms from the live catalogue; 766 returned usable suggestions. Every
suggestion is a real query users type. Per-tool keyword picks went through a
capability-verified selection (see `src/app/tools/toolKeywordOverrides.js`);
this file records the demand patterns bigger than any one tool.

## Modifiers demanded across many of our head terms

| times | modifier | note |
|---|---|---|
| 76 | `+ ai` | searchers want AI versions of ordinary tools; the AI assist box is the answer surface — worth naming "AI" on tools that genuinely use it, nowhere else |
| 71 | `+ online free` | now a derived keyword variant for every tool (toolKeywords.js) |
| 34 | `+ python` | dev-tool queries wanting a code recipe, not a web tool; a "how to do this in Python" FAQ on dev tools would capture it honestly |
| 32 | `+ formula` | calculator queries wanting the formula shown; tools whose seo.js already states the formula match this demand — keep stating formulas |
| 31 | `+ india` | geo-scoped intent; only tools that are actually India-scoped should carry it |
| 25 | `+ extension` | browser-extension intent — we ship no extensions; do NOT keyword this |
| 24 | `+ for kids` | only where content is genuinely child-appropriate |
| 21 | `+ uk` | as with india — scope must be real |
| 17 | `+ apk` | app-install intent we cannot satisfy; never keyword |

## Rules that fell out of the mining

- A keyword is a promise: "image compressor to 20kb" may only be carried by a
  tool that can target an output size. Every override pick was checked against
  the tool's source before being added.
- Off-sense queries are common ("hangman fracture", "sudoku book") — head-term
  overlap is not topical relevance.
- When a query names a capability that is a *different* altftool tool
  ("sudoku solver" under the sudoku game), the keyword belongs to that tool.
