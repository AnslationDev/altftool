const seo = {
  title: "Extension Permission Analyzer: Read",
  metaDescription:
    "Paste an extension manifest.json to see what each permission, host match pattern and content script allows, and which combinations add up to more.",
  steps: [
    "Paste the extension's manifest.json into the 'manifest.json' box — find it at chrome://extensions, then Details, then the extension folder or the unpacked source.",
    "API permissions are split from host match patterns, every pattern is validated, content_scripts are read down to run_at, all_frames and world, and the background type and Content Security Policy are parsed.",
    "Read 'Combinations that matter', then the 'Declared permissions' table's Permission, Class and 'What it allows' columns alongside 'Host access' and 'Content scripts', and press 'Copy report'.",
  ],
  intro:
    "Paste an extension's manifest.json and this tool parses it the way a reviewer would: it separates API permissions from host match patterns (which Manifest V2 mixes into the same array), validates every pattern against the <scheme>://<host>/<path> grammar, reads the content_scripts entries down to run_at, all_frames and world, identifies the background type, and parses the Content Security Policy directives. Each permission is matched against a fixed catalogue that says what the API actually allows. On top of that it applies combination rules — broad host access plus scripting, cookies plus all sites, nativeMessaging plus page access — because the permissions that matter most are usually the ones that only become dangerous together. Nothing is uploaded and no store is contacted.",
  useCases: [
    "An extension you rely on has changed hands or pushed a big update, and you want to read what its manifest now permits before you keep it installed",
    "You are reviewing an extension request for a work fleet and need a written summary of the capability ceiling to attach to the ticket",
    "You are shipping your own extension and want to confirm you are asking for the narrowest permission set that still works — activeTab instead of <all_urls>, declarativeNetRequest instead of webRequestBlocking",
  ],
  benefits: [
    [
      "Reads the manifest, not a keyword list",
      "Match patterns are parsed and validated, V2 and V3 layouts are handled separately, and malformed patterns are reported with the reason they are invalid.",
    ],
    [
      "Names the combinations, not just the permissions",
      "Broad hosts with the scripting API, cookies across all sites, nativeMessaging alongside page access, a persistent background page holding a blocking webRequest listener — each is called out with what it enables.",
    ],
    [
      "A classification, never a score",
      "Every permission carries a fixed tier from a published description of the API. There is no invented number, no confidence percentage and no randomness anywhere in the analysis.",
    ],
  ],
  faqs: [
    [
      "Does this tell me whether an extension is malicious?",
      "No. A manifest describes what an extension is allowed to do, not what it does. An extension with <all_urls> may never read a page, and one with only activeTab can still abuse the tab you grant it. Treat the output as the ceiling on damage, then decide whether the extension's stated purpose justifies that ceiling.",
    ],
    [
      "Why does the tool care about optional_permissions?",
      "Because they are not in the install prompt. An extension can ship with a modest permission set, get installed, and later call chrome.permissions.request() for something much broader at a moment when the user is likely to click through. If a critical or high-tier permission is declared as optional, the prompt you approved is not the ceiling.",
    ],
    [
      "My manifest has comments and it still parsed. Is that right?",
      "The tool retries with comments stripped and tells you it did, because manifests copied out of repositories often carry annotations. A browser will not do that — manifest.json must be strict JSON, so an annotated manifest is a packaging bug worth fixing.",
    ],
    [
      "What is the difference between webRequest and declarativeNetRequest here?",
      "webRequest hands the extension the details of every matching request, and webRequestBlocking additionally lets it rewrite or cancel each one before it is sent. declarativeNetRequest applies rules the browser evaluates, so the extension changes traffic without seeing it — unless declarativeNetRequestFeedback is also declared, which reports back which rule matched which request and largely undoes the privacy benefit. The tool tiers these from moderate up to critical depending on what each one can actually do.",
    ],
  ],
};

export default seo;
