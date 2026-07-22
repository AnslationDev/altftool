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

const SAMPLE_JSP = `<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<!doctype html>
<html lang="en">
  <head>
    <title>${"${pageTitle}"}</title>
    <link rel="stylesheet" href="${"${pageContext.request.contextPath}"}/assets/css/app.css" />
  </head>
  <body>
    <jsp:include page="/WEB-INF/views/partials/header.jsp" />
    <c:if test="${"${not empty user}"}">
      <h1>Hello ${"${user.name}"}</h1>
      <p>Status: ${"${user.status}"}</p>
    </c:if>
  </body>
</html>`;

const MODE_COPY = {
  htmlToJsp: {
    label: "HTML to JSP",
    short: "HTML -> JSP",
    helper: "Add JSP directives, EL placeholders, and context-aware paths.",
  },
  jspToHtml: {
    label: "JSP to HTML",
    short: "JSP -> HTML",
    helper: "Strip directives and convert JSP expressions into readable HTML placeholders.",
  },
};

const DEFAULT_OPTIONS = {
  addPageDirective: true,
  addJstlDirective: true,
  rewriteContextPath: true,
  mustacheToEl: true,
  stripDirectives: true,
  scriptletsAsComments: true,
  jspCommentsToHtml: true,
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

function rewriteAssetPaths(code) {
  let rewrites = 0;
  const output = code.replace(/\b(src|href|action)=("([^"]*)"|'([^']*)')/gi, (full, attr, quoted, doubleValue, singleValue) => {
    const value = doubleValue ?? singleValue ?? "";
    const quote = quoted?.[0] || '"';

    if (
      !value ||
      !value.startsWith("/") ||
      /^(\/\/|https?:|mailto:|tel:|data:|javascript:|#|\$\{pageContext\.request\.contextPath\})/i.test(value)
    ) {
      return full;
    }

    rewrites += 1;
    return `${attr}=${quote}${"${pageContext.request.contextPath}"}${value}${quote}`;
  });

  return { output, rewrites };
}

function convertMustacheToEl(code) {
  let placeholders = 0;
  const output = code.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    placeholders += 1;
    return `\${${key}}`;
  });
  return { output, placeholders };
}

function convertElToHandlebars(code) {
  let placeholders = 0;
  const output = code.replace(/\$\{\s*([^}]+?)\s*\}/g, (_, key) => {
    placeholders += 1;
    return `{{ ${key.trim()} }}`;
  });
  return { output, placeholders };
}

function htmlToJsp(input, options) {
  const messages = [];
  const warnings = [];
  let output = input.trim();

  if (!output) {
    return {
      output: "",
      messages: ["Paste HTML code to generate JSP output."],
      warnings: [],
    };
  }

  if (options.mustacheToEl) {
    const converted = convertMustacheToEl(output);
    output = converted.output;
    if (converted.placeholders) {
      messages.push(`${converted.placeholders} template placeholder${converted.placeholders > 1 ? "s" : ""} converted to JSP EL.`);
    }
  }

  if (options.rewriteContextPath) {
    const rewritten = rewriteAssetPaths(output);
    output = rewritten.output;
    if (rewritten.rewrites) {
      messages.push(`${rewritten.rewrites} root asset path${rewritten.rewrites > 1 ? "s" : ""} made context-path safe.`);
    }
  }

  const directives = [];
  if (options.addPageDirective && !/<%@\s*page\b/i.test(output)) {
    directives.push('<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>');
    messages.push("Page directive added.");
  }

  if (options.addJstlDirective && !/<%@\s*taglib\b[^%]*prefix=["']c["']/i.test(output)) {
    directives.push('<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>');
    messages.push("JSTL core taglib directive added.");
  }

  if (/<script\b/i.test(output)) {
    warnings.push("Script tags are preserved. Review inline JavaScript before deploying JSP.");
  }

  return {
    output: `${directives.join("\n")}${directives.length ? "\n\n" : ""}${output}`,
    messages: messages.length ? messages : ["HTML converted to JSP without structural changes."],
    warnings,
  };
}

function jspToHtml(input, options) {
  const messages = [];
  const warnings = [];
  let output = input.trim();

  if (!output) {
    return {
      output: "",
      messages: ["Paste JSP code to generate HTML output."],
      warnings: [],
    };
  }

  const directives = countMatches(output, /<%@[\s\S]*?%>/g);
  if (options.stripDirectives) {
    output = output.replace(/<%@[\s\S]*?%>\s*/g, "");
    if (directives) messages.push(`${directives} JSP directive${directives > 1 ? "s" : ""} removed.`);
  }

  const comments = countMatches(output, /<%--[\s\S]*?--%>/g);
  output = output.replace(/<%--([\s\S]*?)--%>/g, (_, body) =>
    options.jspCommentsToHtml ? `<!-- ${body.trim()} -->` : ""
  );
  if (comments) messages.push(`${comments} JSP comment${comments > 1 ? "s" : ""} converted.`);

  output = output.replace(/\$\{pageContext\.request\.contextPath\}/g, "");

  const expressions = countMatches(output, /<%=[\s\S]*?%>/g);
  output = output.replace(/<%=\s*([\s\S]*?)\s*%>/g, (_, expression) => `{{ ${expression.trim()} }}`);
  if (expressions) messages.push(`${expressions} JSP expression${expressions > 1 ? "s" : ""} converted to placeholders.`);

  const scriptlets = countMatches(output, /<%(?!@|=|--)[\s\S]*?%>/g);
  output = output.replace(/<%(?!@|=|--)\s*([\s\S]*?)\s*%>/g, (_, scriptlet) => {
    const compact = scriptlet.trim().replace(/\s+/g, " ");
    return options.scriptletsAsComments ? `<!-- JSP scriptlet removed: ${compact} -->` : "";
  });
  if (scriptlets) {
    warnings.push(`${scriptlets} JSP scriptlet${scriptlets > 1 ? "s were" : " was"} converted to HTML comment${scriptlets > 1 ? "s" : ""}.`);
  }

  const elConverted = convertElToHandlebars(output);
  output = elConverted.output;
  if (elConverted.placeholders) {
    messages.push(`${elConverted.placeholders} EL placeholder${elConverted.placeholders > 1 ? "s" : ""} converted to HTML-style tokens.`);
  }

  const jspIncludes = countMatches(output, /<jsp:include\b[\s\S]*?\/?>/gi);
  output = output.replace(/<jsp:include\b([^>]*)\/?>/gi, (_, attrs) => `<!-- jsp:include${attrs} -->`);
  if (jspIncludes) messages.push(`${jspIncludes} jsp:include tag${jspIncludes > 1 ? "s" : ""} converted to comments.`);

  const jstlTags = countMatches(output, /<\/?c:[^>]+>/gi);
  output = output
    .replace(/<c:out\b[^>]*value=["']\{\{\s*([^}"']+?)\s*\}\}["'][^>]*\/?>/gi, "{{ $1 }}")
    .replace(/<c:if\b([^>]*)>/gi, (_, attrs) => `<!-- c:if${attrs} -->`)
    .replace(/<\/c:if>/gi, "<!-- /c:if -->")
    .replace(/<c:forEach\b([^>]*)>/gi, (_, attrs) => `<!-- c:forEach${attrs} -->`)
    .replace(/<\/c:forEach>/gi, "<!-- /c:forEach -->")
    .replace(/<c:(choose|when|otherwise)\b([^>]*)>/gi, (_, tag, attrs) => `<!-- c:${tag}${attrs} -->`)
    .replace(/<\/c:(choose|when|otherwise)>/gi, (_, tag) => `<!-- /c:${tag} -->`);
  if (jstlTags) messages.push(`${jstlTags} JSTL tag${jstlTags > 1 ? "s" : ""} normalized for HTML preview.`);

  return {
    output,
    messages: messages.length ? messages : ["JSP converted to HTML without structural changes."],
    warnings,
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

export default function HTMLJSPConverter() {
  const [mode, setMode] = useState("htmlToJsp");
  const [input, setInput] = useState(SAMPLE_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    return mode === "htmlToJsp" ? htmlToJsp(input, options) : jspToHtml(input, options);
  }, [input, mode, options]);

  const output = result.output;
  const jspSignals = useMemo(() => {
    const source = mode === "htmlToJsp" ? output : input;
    return {
      directives: countMatches(source, /<%@[\s\S]*?%>/g),
      el: countMatches(source, /\$\{[^}]+}/g),
      jstl: countMatches(source, /<\/?c:[^>]+>/gi),
    };
  }, [input, mode, output]);

  const outputExtension = mode === "htmlToJsp" ? "jsp" : "html";
  const activeMode = MODE_COPY[mode];

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
    setMode((current) => (current === "htmlToJsp" ? "jspToHtml" : "htmlToJsp"));
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
          HTML JSP Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Convert HTML code to JSP templates, or clean JSP back into readable HTML. Handle page directives,
          JSTL-ready markup, EL placeholders, and context-path asset URLs in one responsive workspace.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowLeftRight} label="Mode" value={activeMode.short} helper={activeMode.helper} />
        <MetricCard icon={FileInput} label="Input" value={`${formatNumber(countLines(input))} lines`} helper={`${formatNumber(input.length)} characters`} />
        <MetricCard
          icon={FileCode}
          label="JSP signals"
          value={`${jspSignals.directives + jspSignals.el + jspSignals.jstl}`}
          helper={`${jspSignals.directives} directives, ${jspSignals.el} EL, ${jspSignals.jstl} JSTL`}
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
                  setInput(key === "htmlToJsp" ? SAMPLE_HTML : SAMPLE_JSP);
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
              onClick={() => setInput(mode === "htmlToJsp" ? SAMPLE_HTML : SAMPLE_JSP)}
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
            <input ref={fileRef} type="file" accept=".html,.htm,.jsp,.txt" className="hidden" onChange={handleFile} />
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="html-jsp-input">
            Source code
          </label>
          <textarea
            id="html-jsp-input"
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
              {mode === "htmlToJsp" ? (
                <>
                  <ToggleOption active={options.addPageDirective} label="Add page directive" helper="Adds UTF-8 JSP page directive." onClick={() => setOption("addPageDirective")} />
                  <ToggleOption active={options.addJstlDirective} label="Add JSTL taglib" helper="Adds c prefix core taglib directive." onClick={() => setOption("addJstlDirective")} />
                  <ToggleOption active={options.rewriteContextPath} label="Context path assets" helper="Rewrites root /assets paths safely." onClick={() => setOption("rewriteContextPath")} />
                  <ToggleOption active={options.mustacheToEl} label="Mustache to EL" helper="Converts {{user.name}} into ${'{user.name}'}." onClick={() => setOption("mustacheToEl")} />
                </>
              ) : (
                <>
                  <ToggleOption active={options.stripDirectives} label="Strip directives" helper="Removes JSP page/taglib directives." onClick={() => setOption("stripDirectives")} />
                  <ToggleOption active={options.scriptletsAsComments} label="Scriptlets as comments" helper="Keeps scriptlet notes visible in HTML." onClick={() => setOption("scriptletsAsComments")} />
                  <ToggleOption active={options.jspCommentsToHtml} label="JSP comments to HTML" helper="Turns JSP comments into HTML comments." onClick={() => setOption("jspCommentsToHtml")} />
                  <ToggleOption active label="EL to placeholders" helper="Converts ${'{value}'} into {{ value }}." onClick={() => {}} />
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
                  <h2 className="text-2xl font-bold">{mode === "htmlToJsp" ? "Generated JSP" : "Generated HTML"}</h2>
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
                {(result.warnings.length ? result.warnings : ["No risky JSP scriptlets detected in this pass."]).map((warning) => (
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
