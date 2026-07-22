"use client";

import { useMemo, useRef, useState } from "react";
import {
  ArrowLeftRight,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  FileCode,
  FileInput,
  RefreshCw,
  Settings2,
  Sparkles,
  TerminalSquare,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{pageTitle}}</title>
    <link rel="stylesheet" href="/assets/css/app.css" />
  </head>
  <body>
    <main class="profile-card">
      <img src="/assets/img/avatar.png" alt="User avatar" />
      <h1>Hello {{user.name}}</h1>
      <p>Account status: {{user.status}}</p>
      <a href="/dashboard">Open dashboard</a>
    </main>
  </body>
</html>`;

const SAMPLE_JS = `const basePath = "";
const pageTitle = "Team Portal";
const userName = "Saurabh";
const userStatus = "Active";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const html = \`
<!doctype html>
<html lang="en">
  <head>
    <title>\${escapeHtml(pageTitle)}</title>
    <link rel="stylesheet" href="\${basePath}/assets/css/app.css" />
  </head>
  <body>
    <main class="profile-card">
      <h1>Hello \${escapeHtml(userName)}</h1>
      <p>Status: \${escapeHtml(userStatus)}</p>
    </main>
  </body>
</html>\`;

document.querySelector("#app").innerHTML = html;`;

const MODE_COPY = {
  htmlToJs: {
    label: "HTML to JS",
    short: "HTML -> JS",
    helper: "Create JavaScript template code from HTML.",
  },
  jsToHtml: {
    label: "JS to HTML",
    short: "JS -> HTML",
    helper: "Extract JavaScript templates back into HTML placeholders.",
  },
};

const DEFAULT_OPTIONS = {
  addEscapeHelper: true,
  addMountCode: true,
  addBasePath: true,
  mustacheToTemplateVars: true,
  decodeTemplateLiteral: true,
  templateVarsToPlaceholders: true,
  stripScriptTags: true,
  commentsAsHtmlNotes: true,
};

function countLines(value) {
  if (!value.trim()) return 0;
  return value.split(/\r\n|\r|\n/).length;
}

function countMatches(value, regex) {
  return (value.match(regex) || []).length;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function toJsName(key) {
  const parts = String(key)
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean);
  const fallback = ["value"];
  const cleaned = (parts.length ? parts : fallback)
    .map((part, index) => {
      const safe = part.replace(/^\d+/, "");
      if (!safe) return index === 0 ? "value" : "";
      return index === 0
        ? safe.charAt(0).toLowerCase() + safe.slice(1)
        : safe.charAt(0).toUpperCase() + safe.slice(1);
    })
    .join("");
  return /^[a-zA-Z_$]/.test(cleaned) ? cleaned : `value${cleaned}`;
}

function toPlaceholderName(name) {
  return String(name)
    .replace(/^escapeHtml\((.*)\)$/i, "$1")
    .replace(/^\s*String\((.*)\)\s*$/i, "$1")
    .replace(/[{}$`]/g, "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1.$2")
    .replace(/_/g, ".")
    .toLowerCase();
}

function humanValueFromKey(key) {
  const last = String(key).split(/[._-]/).filter(Boolean).pop() || key;
  return last
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeTemplateText(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function detectPlaceholders(input) {
  return Array.from(input.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)).map((match) => match[1]);
}

function unique(values) {
  return Array.from(new Set(values.filter(Boolean)));
}

function convertMustacheToTemplate(input) {
  let converted = 0;
  const output = input.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    converted += 1;
    return `\${escapeHtml(${toJsName(key)})}`;
  });
  return { output, converted };
}

function convertRootAssets(input) {
  let converted = 0;
  const output = input.replace(/\b(src|href)=["']\/(?!\/)([^"']+)["']/g, (_, attr, path) => {
    converted += 1;
    return `${attr}="\${basePath}/${path}"`;
  });
  return { output, converted };
}

function buildDeclarations(placeholders, includeBasePath) {
  const lines = [];
  if (includeBasePath) lines.push('const basePath = "";');
  unique(placeholders).forEach((key) => {
    lines.push(`const ${toJsName(key)} = "${humanValueFromKey(key)}";`);
  });
  return lines.join("\n");
}

function escapeHelper() {
  return `function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}`;
}

function htmlToJs(input, options) {
  const messages = [];
  const warnings = [];
  let html = input.trim();

  if (!html) {
    return {
      output: "",
      messages: ["Paste HTML code to generate JavaScript output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const placeholders = detectPlaceholders(html);

  if (options.stripScriptTags) {
    const scripts = countMatches(html, /<script[\s\S]*?<\/script>/gi);
    html = html.replace(/<script[\s\S]*?<\/script>\s*/gi, "");
    if (scripts) {
      warnings.push(`${scripts} script tag${scripts > 1 ? "s were" : " was"} removed from HTML before templating.`);
    }
  }

  html = escapeTemplateText(html);

  if (options.mustacheToTemplateVars) {
    const converted = convertMustacheToTemplate(html);
    html = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} HTML placeholder${converted.converted > 1 ? "s" : ""} converted to JS template variable${converted.converted > 1 ? "s" : ""}.`);
    }
  }

  if (options.addBasePath) {
    const converted = convertRootAssets(html);
    html = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} root asset path${converted.converted > 1 ? "s" : ""} moved behind basePath.`);
    }
  }

  const sections = [];
  const declarations = buildDeclarations(placeholders, options.addBasePath);
  if (declarations) sections.push(declarations);
  if (options.addEscapeHelper) sections.push(escapeHelper());
  sections.push(`const html = \`\n${html}\`;`);
  if (options.addMountCode) {
    sections.push(`const target = document.querySelector("#app");
if (target) {
  target.innerHTML = html;
}`);
  }

  return {
    output: sections.join("\n\n"),
    messages: messages.length ? messages : ["HTML converted to a JavaScript template string."],
    warnings,
    variableCount: unique(placeholders).length,
  };
}

function extractTemplateLiteral(input) {
  const assignments = [
    /(?:const|let|var)\s+(?:html|markup|template)\s*=\s*`([\s\S]*?)`/i,
    /\.innerHTML\s*=\s*`([\s\S]*?)`/i,
    /return\s+`([\s\S]*?)`/i,
  ];

  for (const regex of assignments) {
    const match = input.match(regex);
    if (match?.[1]) {
      return { html: match[1], found: true };
    }
  }

  return { html: input, found: false };
}

function decodeEscapedTemplate(value) {
  return String(value)
    .replace(/\\`/g, "`")
    .replace(/\\\\/g, "\\")
    .replace(/\\\$\{/g, "${");
}

function convertTemplateVarsToPlaceholders(input) {
  let converted = 0;
  const output = input.replace(/\$\{\s*([^}]+?)\s*\}/g, (_, expression) => {
    converted += 1;
    return `{{ ${toPlaceholderName(expression)} }}`;
  });
  return { output, converted };
}

function jsToHtml(input, options) {
  const messages = [];
  const warnings = [];
  let source = input.trim();

  if (!source) {
    return {
      output: "",
      messages: ["Paste JavaScript code to generate HTML output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const template = extractTemplateLiteral(source);
  source = template.html;
  if (template.found) {
    messages.push("JavaScript template literal extracted from source.");
  } else {
    warnings.push("No obvious template literal found, so the full input was treated as markup.");
  }

  if (options.decodeTemplateLiteral) {
    source = decodeEscapedTemplate(source);
  }

  if (options.templateVarsToPlaceholders) {
    const converted = convertTemplateVarsToPlaceholders(source);
    source = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} template expression${converted.converted > 1 ? "s" : ""} converted to HTML placeholder${converted.converted > 1 ? "s" : ""}.`);
    }
  }

  if (options.addBasePath) {
    source = source.replace(/\{\{\s*base\.path\s*\}\}\//gi, "/").replace(/\{\{\s*basepath\s*\}\}\//gi, "/");
  }

  if (options.commentsAsHtmlNotes) {
    const jsComments = countMatches(source, /\/\/.*|\/\*[\s\S]*?\*\//g);
    source = source.replace(/\/\*([\s\S]*?)\*\//g, (_, comment) => `<!-- JS comment: ${comment.trim()} -->`);
    source = source.replace(/^\s*\/\/\s?(.*)$/gm, (_, comment) => `<!-- JS comment: ${comment.trim()} -->`);
    if (jsComments) warnings.push(`${jsComments} JavaScript comment${jsComments > 1 ? "s were" : " was"} converted to HTML note${jsComments > 1 ? "s" : ""}.`);
  }

  return {
    output: source.trim(),
    messages: messages.length ? messages : ["JavaScript converted into readable HTML output."],
    warnings,
    variableCount: countMatches(source, /\{\{\s*[\w.-]+\s*\}\}/g),
  };
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="tool-card min-w-0 overflow-hidden !p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{label}</p>
          <p className="break-words text-2xl font-bold leading-tight text-[var(--foreground)]">{value}</p>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--muted-foreground)]">{helper}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ active, label, helper, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border p-3 text-left transition ${
        active
          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-200"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-blue-300"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        {active ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-4 w-4 rounded-full border border-current opacity-50" />}
        {label}
      </span>
      <span className="mt-1 block text-xs text-[var(--muted-foreground)]">{helper}</span>
    </button>
  );
}

export default function HTMLJSConverter() {
  const [mode, setMode] = useState("htmlToJs");
  const [input, setInput] = useState(SAMPLE_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    return mode === "htmlToJs" ? htmlToJs(input, options) : jsToHtml(input, options);
  }, [input, mode, options]);

  const output = result.output;
  const activeMode = MODE_COPY[mode];
  const outputExtension = mode === "htmlToJs" ? "js" : "html";
  const jsSignals = useMemo(() => {
    const source = mode === "htmlToJs" ? output : input;
    return {
      templates: countMatches(source, /`[\s\S]*?`/g),
      expressions: countMatches(source, /\$\{/g),
      mounts: countMatches(source, /\.innerHTML|insertAdjacentHTML|appendChild/gi),
    };
  }, [input, mode, output]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setInput(text);
    event.target.value = "";
  };

  const handleCopy = async () => {
    await safeCopyText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const handleSwap = () => {
    setInput(output || input);
    setMode((current) => (current === "htmlToJs" ? "jsToHtml" : "htmlToJs"));
  };

  const setOption = (key) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <main className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-8 text-[var(--foreground)] sm:px-6 sm:pt-10 lg:px-8">
      <section className="text-center">
        <div className="flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            Developer converter
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Browser-side only
          </span>
        </div>
        <h1 className="tool-heading-accent mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          HTML JS Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Convert HTML code to JavaScript template code, or turn JavaScript template literals back into readable HTML.
          It handles template variables, safe escaping, base-path assets, mount code, and one-click exports.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowLeftRight} label="Mode" value={activeMode.short} helper={activeMode.helper} />
        <MetricCard icon={FileInput} label="Input" value={`${formatNumber(countLines(input))} lines`} helper={`${formatNumber(input.length)} characters`} />
        <MetricCard
          icon={TerminalSquare}
          label="JS signals"
          value={`${jsSignals.templates + jsSignals.expressions + jsSignals.mounts}`}
          helper={`${jsSignals.templates} templates, ${jsSignals.expressions} vars, ${jsSignals.mounts} mounts`}
        />
        <MetricCard icon={Code2} label="Output" value={`${formatNumber(output.length)}`} helper={`Ready as .${outputExtension}`} />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="tool-card min-w-0 overflow-hidden !p-5 sm:!p-6">
          <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                <Wand2 className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h2 className="text-2xl font-bold">Conversion Setup</h2>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  Choose direction, paste code, upload a file, or load a quick sample.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary min-w-[118px] shrink-0 justify-center whitespace-nowrap"
              onClick={handleSwap}
              disabled={!output}
            >
              <RefreshCw className="h-4 w-4" />
              Swap
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Object.entries(MODE_COPY).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setInput(key === "htmlToJs" ? SAMPLE_HTML : SAMPLE_JS);
                }}
                className={`rounded-lg border px-4 py-3 text-left transition ${
                  mode === key
                    ? "border-blue-500 bg-blue-600 text-white shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-blue-300"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={`mt-1 block text-xs ${mode === key ? "text-blue-50" : "text-[var(--muted-foreground)]"}`}>
                  {item.helper}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-secondary min-w-[138px] justify-center whitespace-nowrap"
              onClick={() => setInput(mode === "htmlToJs" ? SAMPLE_HTML : SAMPLE_JS)}
            >
              <Sparkles className="h-4 w-4" />
              Load sample
            </button>
            <button
              type="button"
              className="btn-secondary min-w-[138px] justify-center whitespace-nowrap"
              onClick={() => fileRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" />
              Upload code
            </button>
            <input ref={fileRef} type="file" accept=".html,.htm,.js,.jsx,.txt" className="hidden" onChange={handleFile} />
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="html-js-input">
            Source code
          </label>
          <textarea
            id="html-js-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="mt-2 min-h-[380px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
              <Settings2 className="h-4 w-4 text-blue-600" />
              Conversion options
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {mode === "htmlToJs" ? (
                <>
                  <ToggleOption active={options.addEscapeHelper} label="Escape helper" helper="Adds escapeHtml for safer output." onClick={() => setOption("addEscapeHelper")} />
                  <ToggleOption active={options.addMountCode} label="Mount code" helper="Adds #app innerHTML injection." onClick={() => setOption("addMountCode")} />
                  <ToggleOption active={options.addBasePath} label="Base-path assets" helper="Makes root paths configurable." onClick={() => setOption("addBasePath")} />
                  <ToggleOption active={options.mustacheToTemplateVars} label="Template variables" helper="Turns {{user.name}} into JS expressions." onClick={() => setOption("mustacheToTemplateVars")} />
                  <ToggleOption active={options.stripScriptTags} label="Strip script tags" helper="Removes inline script blocks before conversion." onClick={() => setOption("stripScriptTags")} />
                </>
              ) : (
                <>
                  <ToggleOption active={options.decodeTemplateLiteral} label="Decode template" helper="Unescapes template literal characters." onClick={() => setOption("decodeTemplateLiteral")} />
                  <ToggleOption active={options.templateVarsToPlaceholders} label="HTML placeholders" helper="Turns ${value} into {{ value }}." onClick={() => setOption("templateVarsToPlaceholders")} />
                  <ToggleOption active={options.addBasePath} label="Restore root paths" helper="Removes basePath placeholder prefixes." onClick={() => setOption("addBasePath")} />
                  <ToggleOption active={options.commentsAsHtmlNotes} label="Comments as notes" helper="Converts JS comments to HTML notes." onClick={() => setOption("commentsAsHtmlNotes")} />
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="tool-card min-w-0 overflow-hidden !p-5 sm:!p-6">
            <div className="flex flex-col gap-4 min-[900px]:flex-row min-[900px]:items-start min-[900px]:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10">
                  <FileCode className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Converted output</p>
                  <h2 className="text-2xl font-bold">{mode === "htmlToJs" ? "Generated JS" : "Generated HTML"}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">Copy, download, or swap the output into the editor.</p>
                </div>
              </div>
              <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:flex-wrap sm:justify-end">
                <button
                  type="button"
                  className="btn-secondary min-w-[112px] shrink-0 justify-center whitespace-nowrap"
                  onClick={handleCopy}
                  disabled={!output}
                >
                  <Clipboard className="h-4 w-4" />
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  type="button"
                  className="btn-primary min-w-[132px] shrink-0 justify-center whitespace-nowrap"
                  disabled={!output}
                  onClick={() => downloadText(`converted.${outputExtension}`, output)}
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </div>

            <pre className="mt-5 max-h-[560px] min-h-[420px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)]">
              <code>{output || "Converted output will appear here."}</code>
            </pre>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="tool-card min-w-0 overflow-hidden !p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">Conversion Report</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Quick checklist from this conversion.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {result.messages.map((message) => (
                  <li key={message} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                    {message}
                  </li>
                ))}
              </ul>
            </div>

            <div className="tool-card min-w-0 overflow-hidden !p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10">
                  <Code2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">Review Notes</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Items to check before shipping code.</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3">
                {(result.warnings.length ? result.warnings : ["No risky JavaScript template issue detected in this pass."]).map((warning) => (
                  <li key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
