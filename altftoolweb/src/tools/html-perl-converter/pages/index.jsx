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
  Terminal,
  UploadCloud,
  Wand2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{pageTitle}}</title>
  </head>
  <body>
    <main class="invoice-card">
      <h1>Hello {{customer.name}}</h1>
      <p>Order status: {{order.status}}</p>
      <a href="/billing">Open billing</a>
    </main>
  </body>
</html>`;

const SAMPLE_PERL = [
  "#!/usr/bin/env perl",
  "use strict;",
  "use warnings;",
  "use CGI qw(:standard);",
  "",
  "print header(-type => 'text/html', -charset => 'UTF-8');",
  "",
  "my $pageTitle = 'Team Portal';",
  "my $customer_name = 'Saurabh';",
  "my $order_status = 'Ready';",
  "",
  'print <<"HTML";',
  "<!doctype html>",
  '<html lang="en">',
  "  <head>",
  "    <title>$pageTitle</title>",
  "  </head>",
  "  <body>",
  '    <main class="invoice-card">',
  "      <h1>Hello $customer_name</h1>",
  "      <p>Order status: $order_status</p>",
  "    </main>",
  "  </body>",
  "</html>",
  "HTML",
].join("\n");

const MODE_COPY = {
  htmlToPerl: {
    label: "HTML to Perl",
    short: "HTML -> Perl",
    helper: "Wrap HTML in a clean CGI-ready Perl script.",
  },
  perlToHtml: {
    label: "Perl to HTML",
    short: "Perl -> HTML",
    helper: "Extract heredocs, VPerl tags, and Perl variables into readable HTML.",
  },
};

const DEFAULT_OPTIONS = {
  addShebang: true,
  addStrictWarnings: true,
  addCgiHeader: true,
  mustacheToScalars: true,
  stripBoilerplate: true,
  scalarsToPlaceholders: true,
  vperlTagsToHtml: true,
  logicAsComments: true,
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

function escapeSingleQuoted(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function toScalarName(key) {
  const cleaned = String(key)
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  const safe = cleaned || "value";
  return /^[a-zA-Z_]/.test(safe) ? safe : `v_${safe}`;
}

function toPlaceholderName(key) {
  return String(key).replace(/_/g, ".").replace(/^v\./, "");
}

function humanValueFromKey(key) {
  const last = String(key).split(/[._-]/).filter(Boolean).pop() || key;
  return last
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function collectHandlebarVariables(input) {
  const variables = new Map();
  input.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    if (!variables.has(key)) variables.set(key, toScalarName(key));
    return "";
  });
  return variables;
}

function chooseTerminator(code) {
  let terminator = "HTML";
  while (new RegExp(`^${terminator}$`, "m").test(code)) {
    terminator = `${terminator}_BLOCK`;
  }
  return terminator;
}

function convertHandlebarsToPerl(code, variables) {
  let converted = 0;
  const output = code.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    converted += 1;
    return `$${variables.get(key) || toScalarName(key)}`;
  });
  return { output, converted };
}

function htmlToPerl(input, options) {
  const messages = [];
  const warnings = [];
  let html = input.trim();

  if (!html) {
    return {
      output: "",
      messages: ["Paste HTML code to generate Perl output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const variables = collectHandlebarVariables(html);
  if (options.mustacheToScalars) {
    const converted = convertHandlebarsToPerl(html, variables);
    html = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} template placeholder${converted.converted > 1 ? "s" : ""} converted to Perl scalar${converted.converted > 1 ? "s" : ""}.`);
    }
  }

  const terminator = chooseTerminator(html);
  const lines = [];
  if (options.addShebang) lines.push("#!/usr/bin/env perl");
  if (options.addStrictWarnings) {
    lines.push("use strict;");
    lines.push("use warnings;");
  }
  if (options.addCgiHeader) lines.push("use CGI qw(:standard);");

  if (lines.length) lines.push("");
  if (options.addCgiHeader) {
    lines.push("print header(-type => 'text/html', -charset => 'UTF-8');");
  } else {
    lines.push('print "Content-Type: text/html; charset=UTF-8\\n\\n";');
  }

  if (variables.size) {
    lines.push("");
    variables.forEach((scalar, key) => {
      lines.push(`my $${scalar} = '${escapeSingleQuoted(humanValueFromKey(key))}';`);
    });
  }

  lines.push("");
  lines.push(`print <<"${terminator}";`);
  lines.push(html);
  lines.push(terminator);

  if (/<script\b/i.test(html)) {
    warnings.push("Inline script tags are preserved. Review JavaScript before embedding in Perl output.");
  }
  if (html.includes("$") && !variables.size) {
    warnings.push("Dollar signs inside HTML may interpolate in Perl heredoc output. Escape them if they are literal values.");
  }

  return {
    output: lines.join("\n"),
    messages: messages.length ? messages : ["HTML wrapped into Perl CGI output."],
    warnings,
    variableCount: variables.size,
  };
}

function extractHeredoc(code) {
  const match = code.match(/print\s+<<["']?([a-zA-Z_][\w]*)["']?\s*;\s*\n([\s\S]*?)\n\1\s*;?/);
  if (!match) return null;
  return {
    terminator: match[1],
    body: match[2],
  };
}

function perlToHtml(input, options) {
  const messages = [];
  const warnings = [];
  let output = input.trim();

  if (!output) {
    return {
      output: "",
      messages: ["Paste Perl or VPerl-style template code to generate HTML output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const variableDeclarations = new Map();
  output.replace(/\bmy\s+\$([a-zA-Z_]\w*)\s*=\s*(['"])([\s\S]*?)\2\s*;/g, (_, name, _quote, value) => {
    variableDeclarations.set(name, value);
    return "";
  });

  const heredoc = extractHeredoc(output);
  if (heredoc) {
    output = heredoc.body;
    messages.push(`Heredoc block ${heredoc.terminator} extracted as HTML.`);
  }

  if (options.stripBoilerplate && !heredoc) {
    const before = output;
    output = output
      .replace(/^#![^\n]*\n?/m, "")
      .replace(/^\s*use\s+(strict|warnings)\s*;\s*$/gm, "")
      .replace(/^\s*use\s+CGI\s+qw\([^)]*\)\s*;\s*$/gm, "")
      .replace(/^\s*print\s+header\([^;]*\);\s*$/gm, "")
      .replace(/^\s*print\s+"Content-Type:[\s\S]*?\\n\\n";\s*$/gm, "");
    if (before !== output) messages.push("Perl CGI boilerplate removed.");
  }

  if (options.vperlTagsToHtml) {
    const expressions = countMatches(output, /<%=[\s\S]*?%>/g);
    output = output.replace(/<%=\s*\$?([a-zA-Z_]\w*)\s*%>/g, (_, name) => `{{ ${toPlaceholderName(name)} }}`);
    if (expressions) messages.push(`${expressions} VPerl expression${expressions > 1 ? "s" : ""} converted.`);
  }

  const logicBlocks = countMatches(output, /<%(?!\=)[\s\S]*?%>/g);
  output = output.replace(/<%(?!\=)\s*([\s\S]*?)\s*%>/g, (_, logic) => {
    const compact = logic.trim().replace(/\s+/g, " ");
    return options.logicAsComments ? `<!-- Perl logic removed: ${compact} -->` : "";
  });
  if (logicBlocks) warnings.push(`${logicBlocks} VPerl logic block${logicBlocks > 1 ? "s were" : " was"} converted to HTML comment${logicBlocks > 1 ? "s" : ""}.`);

  let scalarCount = 0;
  if (options.scalarsToPlaceholders) {
    output = output.replace(/\$\{?([a-zA-Z_]\w*)\}?/g, (_, name) => {
      scalarCount += 1;
      return `{{ ${toPlaceholderName(name)} }}`;
    });
    if (scalarCount) messages.push(`${scalarCount} Perl scalar reference${scalarCount > 1 ? "s" : ""} converted to placeholders.`);
  }

  if (!heredoc && options.stripBoilerplate) {
    output = output.replace(/\bmy\s+\$[a-zA-Z_]\w*\s*=\s*(['"])[\s\S]*?\1\s*;\s*/g, "");
  }

  return {
    output: output.trim(),
    messages: messages.length ? messages : ["Perl cleaned into readable HTML output."],
    warnings,
    variableCount: variableDeclarations.size || scalarCount,
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

export default function HTMLPerlConverter() {
  const [mode, setMode] = useState("htmlToPerl");
  const [input, setInput] = useState(SAMPLE_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    return mode === "htmlToPerl" ? htmlToPerl(input, options) : perlToHtml(input, options);
  }, [input, mode, options]);

  const output = result.output;
  const activeMode = MODE_COPY[mode];
  const outputExtension = mode === "htmlToPerl" ? "cgi" : "html";
  const perlSignals = useMemo(() => {
    const source = mode === "htmlToPerl" ? output : input;
    return {
      scalars: countMatches(source, /\$[a-zA-Z_]\w*/g),
      prints: countMatches(source, /\bprint\b/g),
      vperl: countMatches(source, /<%[\s\S]*?%>/g),
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
    setMode((current) => (current === "htmlToPerl" ? "perlToHtml" : "htmlToPerl"));
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
          HTML Perl Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Convert HTML code to Perl CGI templates, or clean Perl and VPerl-style template code back into readable HTML.
          Handle heredoc output, scalar placeholders, CGI headers, and export-ready code in one responsive workspace.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowLeftRight} label="Mode" value={activeMode.short} helper={activeMode.helper} />
        <MetricCard icon={FileInput} label="Input" value={`${formatNumber(countLines(input))} lines`} helper={`${formatNumber(input.length)} characters`} />
        <MetricCard
          icon={Terminal}
          label="Perl signals"
          value={`${perlSignals.scalars + perlSignals.prints + perlSignals.vperl}`}
          helper={`${perlSignals.scalars} scalars, ${perlSignals.prints} print, ${perlSignals.vperl} VPerl`}
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
                  setInput(key === "htmlToPerl" ? SAMPLE_HTML : SAMPLE_PERL);
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
              onClick={() => setInput(mode === "htmlToPerl" ? SAMPLE_HTML : SAMPLE_PERL)}
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
            <input ref={fileRef} type="file" accept=".html,.htm,.pl,.cgi,.pm,.txt" className="hidden" onChange={handleFile} />
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="html-perl-input">
            Source code
          </label>
          <textarea
            id="html-perl-input"
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
              {mode === "htmlToPerl" ? (
                <>
                  <ToggleOption active={options.addShebang} label="Add shebang" helper="Starts output with env perl." onClick={() => setOption("addShebang")} />
                  <ToggleOption active={options.addStrictWarnings} label="Strict + warnings" helper="Adds safer Perl defaults." onClick={() => setOption("addStrictWarnings")} />
                  <ToggleOption active={options.addCgiHeader} label="CGI header" helper="Prints a UTF-8 text/html response." onClick={() => setOption("addCgiHeader")} />
                  <ToggleOption active={options.mustacheToScalars} label="Placeholders to scalars" helper="Turns {{user.name}} into Perl variables." onClick={() => setOption("mustacheToScalars")} />
                </>
              ) : (
                <>
                  <ToggleOption active={options.stripBoilerplate} label="Strip boilerplate" helper="Removes shebang, use lines, and headers." onClick={() => setOption("stripBoilerplate")} />
                  <ToggleOption active={options.scalarsToPlaceholders} label="Scalars to placeholders" helper="Turns $user_name into {{ user.name }}." onClick={() => setOption("scalarsToPlaceholders")} />
                  <ToggleOption active={options.vperlTagsToHtml} label="VPerl expressions" helper="Converts <%= $value %> output tags." onClick={() => setOption("vperlTagsToHtml")} />
                  <ToggleOption active={options.logicAsComments} label="Logic as comments" helper="Keeps template logic visible safely." onClick={() => setOption("logicAsComments")} />
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
                  <h2 className="text-2xl font-bold">{mode === "htmlToPerl" ? "Generated Perl" : "Generated HTML"}</h2>
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
                {(result.warnings.length ? result.warnings : ["No risky Perl interpolation issue detected in this pass."]).map((warning) => (
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
