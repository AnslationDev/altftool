const seo = {
  intro:
    "The MCP Permission Diff Auditor compares two Model Context Protocol tool manifests side by side and reports which tools were added, removed or changed, then flags each addition and change against seven keyword risk rules covering destructive actions, code execution, external writes, filesystem writes, network access, sensitive-data access and broad reads. It is for anyone about to upgrade an MCP server and wanting to know what new capabilities the new version quietly grants. Both manifests are parsed and diffed in your browser — nothing is uploaded and no MCP server is contacted or executed.",
  useCases: [
    "An MCP server you already trust ships a new version, and before bumping it you want to see whether any tool gained a shell, delete or send-message capability that was not in the old manifest.",
    "You are reviewing a pull request that updates a vendored MCP manifest and need a plain summary of which tool input schemas gained fields or new required parameters, rather than reading a raw JSON diff.",
    "You are writing an internal approval note for a new MCP server and want a copyable report listing added tools, their risk signals and the reminder that this is static analysis, not a security guarantee.",
  ],
  benefits: [
    ["Diffs by tool, not by JSON line", "It normalises names, descriptions, input schemas and annotations, so reordered or reformatted JSON does not show up as a change."],
    ["Explains what actually changed", "Changed tools are described as description changes, inputs added or removed, new required inputs, or annotation/permission changes."],
    ["Finds tools wherever they are nested", "It walks the manifest up to 7 levels deep and picks up any `tools` array or object, so it works on wrapper formats as well as plain listings."],
  ],
  faqs: [
    [
      "How does it decide a tool is risky?",
      "It matches keywords against seven rules: destructive action, code or shell execution, and external write or message are scored high (5 points each); filesystem write, network access and sensitive-data access are medium (3); broad read access is low (1). A tool's overall level is the highest severity it matched, so any single high signal makes it high risk.",
    ],
    [
      "Does it connect to the MCP server or run any tool?",
      "No. It only reads the two JSON manifests you paste, and every step — parsing, tool extraction, diffing and scoring — runs in your browser. The generated report states explicitly that no tool was connected or executed.",
    ],
    [
      "What changes does it detect within a tool that keeps the same name?",
      "Description changes, input schema properties added or removed, fields newly listed as required, and any change to the tool's annotations, permissions or capabilities block. Comparison uses a key-sorted serialisation, so pure formatting or key-order differences are ignored.",
    ],
    [
      "Is a clean report enough to approve an MCP server?",
      "No — this is keyword-based static analysis of declared metadata, and a manifest can describe a capability in wording none of the seven rules match, or a server can behave differently from what it declares. Treat the output as a review checklist and inspect the server's actual code and network behaviour before granting it access.",
    ],
  ],
};

export default seo;
