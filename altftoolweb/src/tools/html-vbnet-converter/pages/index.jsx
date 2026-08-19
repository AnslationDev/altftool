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
    <link rel="stylesheet" href="/assets/css/site.css" />
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

const SAMPLE_VBNET = `<%@ Page Language="VB" AutoEventWireup="false" %>
<script runat="server">
  Protected basePath As String = ""
  Protected pageTitle As String = "Team Portal"
  Protected user_name As String = "Saurabh"
  Protected user_status As String = "Active"
</script>
<!doctype html>
<html lang="en">
  <head>
    <title><%= Server.HtmlEncode(pageTitle) %></title>
    <link rel="stylesheet" href="<%= basePath %>/assets/css/site.css" />
  </head>
  <body>
    <main class="profile-card">
      <h1>Hello <%= Server.HtmlEncode(user_name) %></h1>
      <% If user_status = "Active" Then %>
        <p>Status: <%= Server.HtmlEncode(user_status) %></p>
      <% End If %>
    </main>
  </body>
</html>`;

const MODE_COPY = {
  htmlToVbnet: {
    label: "HTML to VB.NET",
    short: "HTML -> VB.NET",
    helper: "Create an ASP.NET Web Forms template with VB variables.",
  },
  vbnetToHtml: {
    label: "VB.NET to HTML",
    short: "VB.NET -> HTML",
    helper: "Clean ASP.NET/VB.NET code into readable HTML placeholders.",
  },
};

const DEFAULT_OPTIONS = {
  addPageDirective: true,
  addServerBlock: true,
  addBasePath: true,
  mustacheToServerEncode: true,
  stripServerBlocks: true,
  expressionToPlaceholders: true,
  logicAsComments: true,
  decodeVbStrings: true,
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

function toVariableName(key) {
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

function escapeVbString(value) {
  return String(value).replace(/"/g, '""');
}

function collectHandlebarVariables(input) {
  const variables = new Map();
  input.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    if (!variables.has(key)) variables.set(key, toVariableName(key));
    return "";
  });
  return variables;
}

function serverEncode(variableName) {
  return `<%= Server.HtmlEncode(${variableName}) %>`;
}

function convertHandlebarsToVbnet(code, variables) {
  let converted = 0;
  const output = code.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    converted += 1;
    return serverEncode(variables.get(key) || toVariableName(key));
  });
  return { output, converted };
}

function rewriteAssetPaths(code) {
  let rewrites = 0;
  const output = code.replace(/(?<![\w:-])(src|href|action)=("([^"]*)"|'([^']*)')/gi, (full, attr, quoted, doubleValue, singleValue) => {
    const value = doubleValue ?? singleValue ?? "";
    const quote = quoted?.[0] || '"';

    if (
      !value ||
      !value.startsWith("/") ||
      /^(\/\/|https?:|mailto:|tel:|data:|javascript:|#|<%=)/i.test(value)
    ) {
      return full;
    }

    rewrites += 1;
    return `${attr}=${quote}<%= basePath %>${value}${quote}`;
  });

  return { output, rewrites };
}

function htmlToVbnet(input, options) {
  const messages = [];
  const warnings = [];
  let html = input.trim();

  if (!html) {
    return {
      output: "",
      messages: ["Paste HTML code to generate VB.NET output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const variables = collectHandlebarVariables(html);
  if (options.mustacheToServerEncode) {
    const converted = convertHandlebarsToVbnet(html, variables);
    html = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} template placeholder${converted.converted > 1 ? "s" : ""} converted to Server.HtmlEncode expression${converted.converted > 1 ? "s" : ""}.`);
    }
  }

  if (options.addBasePath) {
    const rewritten = rewriteAssetPaths(html);
    html = rewritten.output;
    if (rewritten.rewrites) {
      messages.push(`${rewritten.rewrites} root asset path${rewritten.rewrites > 1 ? "s" : ""} made base-path aware.`);
    }
  }

  const lines = [];
  if (options.addPageDirective) {
    lines.push('<%@ Page Language="VB" AutoEventWireup="false" %>');
    messages.push("ASP.NET page directive added.");
  }

  if (options.addServerBlock) {
    lines.push('<script runat="server">');
    if (options.addBasePath) {
      lines.push('  Protected basePath As String = ""');
    }
    variables.forEach((variableName, key) => {
      lines.push(`  Protected ${variableName} As String = "${escapeVbString(humanValueFromKey(key))}"`);
    });
    lines.push("</script>");
    messages.push("VB.NET server variable block added.");
  }

  if (!options.addServerBlock && options.mustacheToServerEncode && variables.size > 0) {
    warnings.push(
      "Server block is off but the output still references converted variables — add the block back or declare these variables yourself, or the page won't compile."
    );
  }

  if (/<script\b/i.test(html)) {
    warnings.push("Client-side script tags are preserved. Review JavaScript before embedding in ASP.NET templates.");
  }
  if (/<%@|<%|runat=/i.test(input)) {
    warnings.push("Source already contains ASP.NET tags. Review duplicated server blocks after conversion.");
  }

  return {
    output: `${lines.join("\n")}${lines.length ? "\n" : ""}${html}`,
    messages: messages.length ? messages : ["HTML converted to VB.NET without structural changes."],
    warnings,
    variableCount: variables.size + (options.addBasePath ? 1 : 0),
  };
}

function convertVbExpressionsToPlaceholders(code) {
  let converted = 0;
  const output = code
    .replace(/<%=\s*Server\.HtmlEncode\(\s*([a-zA-Z_]\w*)\s*\)\s*%>/gi, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    })
    .replace(/<%=\s*HttpUtility\.HtmlEncode\(\s*([a-zA-Z_]\w*)\s*\)\s*%>/gi, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    })
    .replace(/<%=\s*([a-zA-Z_]\w*)\s*%>/g, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    });

  return { output, converted };
}

function decodeResponseWrites(code) {
  let converted = 0;
  const output = code.replace(/Response\.Write\(\s*"([\s\S]*?)"\s*\)/gi, (_, html) => {
    converted += 1;
    return html.replace(/""/g, '"');
  });
  return { output, converted };
}

function vbnetToHtml(input, options) {
  const messages = [];
  const warnings = [];
  let output = input.trim();

  if (!output) {
    return {
      output: "",
      messages: ["Paste VB.NET code to generate HTML output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const declarations = countMatches(output, /\b(?:Dim|Protected|Private|Public)\s+[a-zA-Z_]\w*\s+As\s+\w+/gi);
  const serverBlocks = countMatches(output, /<script\s+runat=["']server["'][\s\S]*?<\/script>/gi);

  if (options.decodeVbStrings) {
    const decoded = decodeResponseWrites(output);
    output = decoded.output;
    if (decoded.converted) {
      messages.push(`${decoded.converted} Response.Write string${decoded.converted > 1 ? "s" : ""} decoded into HTML.`);
    }
  }

  if (options.stripServerBlocks) {
    output = output
      .replace(/<%@[\s\S]*?%>\s*/g, "")
      .replace(/<script\s+runat=["']server["'][\s\S]*?<\/script>\s*/gi, "");
    if (serverBlocks || declarations) {
      messages.push("ASP.NET directives and server variable blocks removed.");
    }
  }

  if (options.expressionToPlaceholders) {
    const converted = convertVbExpressionsToPlaceholders(output);
    output = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} VB.NET expression${converted.converted > 1 ? "s" : ""} converted to HTML placeholder${converted.converted > 1 ? "s" : ""}.`);
    }
  }

  const logicBlocks = countMatches(output, /<%[\s\S]*?%>/g);
  output = output.replace(/<%\s*([\s\S]*?)\s*%>/g, (_, logic) => {
    const compact = logic.trim().replace(/\s+/g, " ");
    return options.logicAsComments && compact ? `<!-- VB.NET logic removed: ${compact} -->` : "";
  });
  if (logicBlocks) warnings.push(`${logicBlocks} VB.NET logic block${logicBlocks > 1 ? "s were" : " was"} converted to HTML comment${logicBlocks > 1 ? "s" : ""}.`);

  output = output.replace(/\s{2,}\n/g, "\n");

  return {
    output: output.trim(),
    messages: messages.length ? messages : ["VB.NET cleaned into readable HTML output."],
    warnings,
    variableCount: declarations,
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

export default function HTMLVBNetConverter() {
  const [mode, setMode] = useState("htmlToVbnet");
  const [input, setInput] = useState(SAMPLE_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    return mode === "htmlToVbnet" ? htmlToVbnet(input, options) : vbnetToHtml(input, options);
  }, [input, mode, options]);

  const output = result.output;
  const activeMode = MODE_COPY[mode];
  const outputExtension = mode === "htmlToVbnet" ? "aspx" : "html";
  const vbSignals = useMemo(() => {
    const source = mode === "htmlToVbnet" ? output : input;
    return {
      directives: countMatches(source, /<%@/g),
      expressions: countMatches(source, /<%=/g),
      blocks: countMatches(source, /<script\s+runat=["']server["']|<%(?!@|=)/gi),
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
    setMode((current) => (current === "htmlToVbnet" ? "vbnetToHtml" : "htmlToVbnet"));
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
            One-click conversion
          </span>
        </div>
        <h1 className="tool-heading-accent mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          HTML VB.NET Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Convert HTML code to VB.NET ASP.NET templates, or clean VB.NET markup back into readable HTML. It handles
          server variables, encoded expressions, page directives, base-path URLs, and export-ready code.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowLeftRight} label="Mode" value={activeMode.short} helper={activeMode.helper} />
        <MetricCard icon={FileInput} label="Input" value={`${formatNumber(countLines(input))} lines`} helper={`${formatNumber(input.length)} characters`} />
        <MetricCard
          icon={TerminalSquare}
          label="VB.NET signals"
          value={`${vbSignals.directives + vbSignals.expressions + vbSignals.blocks}`}
          helper={`${vbSignals.directives} directives, ${vbSignals.expressions} expressions, ${vbSignals.blocks} blocks`}
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
                  if (key === mode) return;
                  const hasCustomContent = input !== SAMPLE_HTML && input !== SAMPLE_VBNET;
                  if (hasCustomContent) {
                    const confirmed = window.confirm(
                      "Switching modes replaces the source code box with a sample and discards your current input. Continue?"
                    );
                    if (!confirmed) return;
                  }
                  setMode(key);
                  setInput(key === "htmlToVbnet" ? SAMPLE_HTML : SAMPLE_VBNET);
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
              onClick={() => setInput(mode === "htmlToVbnet" ? SAMPLE_HTML : SAMPLE_VBNET)}
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
            <input ref={fileRef} type="file" accept=".html,.htm,.aspx,.ascx,.vb,.txt" className="hidden" onChange={handleFile} />
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="html-vbnet-input">
            Source code
          </label>
          <textarea
            id="html-vbnet-input"
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
              {mode === "htmlToVbnet" ? (
                <>
                  <ToggleOption active={options.addPageDirective} label="Page directive" helper="Adds ASP.NET Page Language=VB." onClick={() => setOption("addPageDirective")} />
                  <ToggleOption active={options.addServerBlock} label="Server block" helper="Adds runat=server variables." onClick={() => setOption("addServerBlock")} />
                  <ToggleOption active={options.addBasePath} label="Base-path assets" helper="Makes root paths configurable." onClick={() => setOption("addBasePath")} />
                  <ToggleOption active={options.mustacheToServerEncode} label="Safe expressions" helper="Turns {{user.name}} into Server.HtmlEncode output." onClick={() => setOption("mustacheToServerEncode")} />
                </>
              ) : (
                <>
                  <ToggleOption active={options.stripServerBlocks} label="Strip server code" helper="Removes directives and runat=server blocks." onClick={() => setOption("stripServerBlocks")} />
                  <ToggleOption active={options.expressionToPlaceholders} label="Expression placeholders" helper="Turns VB.NET expressions into {{ tokens }}." onClick={() => setOption("expressionToPlaceholders")} />
                  <ToggleOption active={options.logicAsComments} label="Logic as comments" helper="Keeps VB logic visible safely." onClick={() => setOption("logicAsComments")} />
                  <ToggleOption active={options.decodeVbStrings} label="Decode strings" helper="Extracts simple Response.Write HTML strings." onClick={() => setOption("decodeVbStrings")} />
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
                  <h2 className="text-2xl font-bold">{mode === "htmlToVbnet" ? "Generated VB.NET" : "Generated HTML"}</h2>
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

            <pre
              aria-live="polite"
              role="status"
              className="mt-5 max-h-[560px] min-h-[420px] overflow-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 text-[var(--foreground)]"
            >
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
              <ul aria-live="polite" role="status" className="mt-4 space-y-3">
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
              <ul aria-live="polite" role="status" className="mt-4 space-y-3">
                {(result.warnings.length ? result.warnings : ["No risky VB.NET template issue detected in this pass."]).map((warning) => (
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
