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

const SAMPLE_PHP = `<?php
declare(strict_types=1);

$basePath = '';
$pageTitle = 'Team Portal';
$user_name = 'Saurabh';
$user_status = 'Active';
?>
<!doctype html>
<html lang="en">
  <head>
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="<?= htmlspecialchars($basePath, ENT_QUOTES, 'UTF-8') ?>/assets/css/app.css" />
  </head>
  <body>
    <main class="profile-card">
      <h1>Hello <?= htmlspecialchars($user_name, ENT_QUOTES, 'UTF-8') ?></h1>
      <?php if ($user_status === 'Active'): ?>
        <p>Status: <?= htmlspecialchars($user_status, ENT_QUOTES, 'UTF-8') ?></p>
      <?php endif; ?>
    </main>
  </body>
</html>`;

const MODE_COPY = {
  htmlToPhp: {
    label: "HTML to PHP",
    short: "HTML -> PHP",
    helper: "Create a PHP template with safe echo placeholders.",
  },
  phpToHtml: {
    label: "PHP to HTML",
    short: "PHP -> HTML",
    helper: "Convert PHP blocks and echoes into readable HTML placeholders.",
  },
};

const DEFAULT_OPTIONS = {
  addPhpOpenTag: true,
  addStrictTypes: true,
  addBasePath: true,
  mustacheToSafeEcho: true,
  stripPhpConfig: true,
  echoToPlaceholders: true,
  logicAsComments: true,
  phpCommentsToHtml: true,
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

function escapeSingleQuoted(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function collectHandlebarVariables(input) {
  const variables = new Map();
  input.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    if (!variables.has(key)) variables.set(key, toVariableName(key));
    return "";
  });
  return variables;
}

function safeEcho(variableName) {
  return `<?= htmlspecialchars($${variableName}, ENT_QUOTES, 'UTF-8') ?>`;
}

function convertHandlebarsToPhp(code, variables) {
  let converted = 0;
  const output = code.replace(/\{\{\s*([a-zA-Z_$][\w$]*(?:[._-][a-zA-Z_$][\w$]*)*)\s*\}\}/g, (_, key) => {
    converted += 1;
    return safeEcho(variables.get(key) || toVariableName(key));
  });
  return { output, converted };
}

function rewriteAssetPaths(code) {
  let rewrites = 0;
  const output = code.replace(/\b(src|href|action)=("([^"]*)"|'([^']*)')/gi, (full, attr, quoted, doubleValue, singleValue) => {
    const value = doubleValue ?? singleValue ?? "";
    const quote = quoted?.[0] || '"';

    if (
      !value ||
      !value.startsWith("/") ||
      /^(\/\/|https?:|mailto:|tel:|data:|javascript:|#|<\?=)/i.test(value)
    ) {
      return full;
    }

    rewrites += 1;
    return `${attr}=${quote}${safeEcho("basePath")}${value}${quote}`;
  });

  return { output, rewrites };
}

function htmlToPhp(input, options) {
  const messages = [];
  const warnings = [];
  let html = input.trim();

  if (!html) {
    return {
      output: "",
      messages: ["Paste HTML code to generate PHP output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const variables = collectHandlebarVariables(html);
  if (options.mustacheToSafeEcho) {
    const converted = convertHandlebarsToPhp(html, variables);
    html = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} template placeholder${converted.converted > 1 ? "s" : ""} converted to safe PHP echo${converted.converted > 1 ? "es" : ""}.`);
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
  if (options.addPhpOpenTag) {
    lines.push("<?php");
    if (options.addStrictTypes) {
      lines.push("declare(strict_types=1);");
      lines.push("");
    }
    if (options.addBasePath) {
      lines.push("$basePath = '';");
    }
    variables.forEach((variableName, key) => {
      lines.push(`$${variableName} = '${escapeSingleQuoted(humanValueFromKey(key))}';`);
    });
    lines.push("?>");
    messages.push("PHP config block added.");
  }

  if (/<script\b/i.test(html)) {
    warnings.push("Inline script tags are preserved. Review JavaScript before embedding in PHP templates.");
  }
  if (/<\?php|<\?=/i.test(input)) {
    warnings.push("Source already contains PHP tags. Review duplicated PHP blocks after conversion.");
  }

  return {
    output: `${lines.join("\n")}${lines.length ? "\n" : ""}${html}`,
    messages: messages.length ? messages : ["HTML converted to PHP without structural changes."],
    warnings,
    variableCount: variables.size + (options.addBasePath ? 1 : 0),
  };
}

function convertPhpEchoesToPlaceholders(code) {
  let converted = 0;
  const output = code
    .replace(/<\?=\s*htmlspecialchars\(\s*\$([a-zA-Z_]\w*)\s*,\s*ENT_QUOTES\s*,\s*['"]UTF-8['"]\s*\)\s*\?>/g, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    })
    .replace(/<\?=\s*\$([a-zA-Z_]\w*)\s*\?>/g, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    })
    .replace(/<\?php\s+echo\s+htmlspecialchars\(\s*\$([a-zA-Z_]\w*)\s*,\s*ENT_QUOTES\s*,\s*['"]UTF-8['"]\s*\)\s*;\s*\?>/g, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    })
    .replace(/<\?php\s+echo\s+\$([a-zA-Z_]\w*)\s*;\s*\?>/g, (_, name) => {
      converted += 1;
      return name === "basePath" ? "" : `{{ ${toPlaceholderName(name)} }}`;
    });

  return { output, converted };
}

function phpToHtml(input, options) {
  const messages = [];
  const warnings = [];
  let output = input.trim();

  if (!output) {
    return {
      output: "",
      messages: ["Paste PHP code to generate HTML output."],
      warnings: [],
      variableCount: 0,
    };
  }

  const declarations = countMatches(output, /\$[a-zA-Z_]\w*\s*=/g);
  if (options.stripPhpConfig) {
    output = output
      .replace(/<\?php\s*declare\(strict_types=1\);\s*/g, "<?php\n")
      .replace(/^\s*declare\(strict_types=1\);\s*$/gm, "")
      .replace(/^\s*\$[a-zA-Z_]\w*\s*=\s*(['"])[\s\S]*?\1\s*;\s*$/gm, "")
      .replace(/<\?php\s*\?>\s*/g, "");
    if (declarations) messages.push(`${declarations} PHP variable declaration${declarations > 1 ? "s" : ""} removed from HTML output.`);
  }

  if (options.echoToPlaceholders) {
    const converted = convertPhpEchoesToPlaceholders(output);
    output = converted.output;
    if (converted.converted) {
      messages.push(`${converted.converted} PHP echo${converted.converted > 1 ? "es" : ""} converted to placeholders.`);
    }
  }

  const phpComments = countMatches(output, /\/\*[\s\S]*?\*\/|\/\/[^\n]*/g);
  if (options.phpCommentsToHtml) {
    output = output.replace(/<\?php\s*(\/\*[\s\S]*?\*\/|\/\/[^\n]*)\s*\?>/g, (_, comment) => {
      const clean = comment.replace(/^\/\*|\*\/$|^\/\//g, "").trim();
      return `<!-- ${clean} -->`;
    });
    if (phpComments) messages.push(`${phpComments} PHP comment${phpComments > 1 ? "s" : ""} normalized.`);
  }

  const includeCount = countMatches(output, /<\?php\s*(include|require)(?:_once)?\s+[\s\S]*?;\s*\?>/g);
  output = output.replace(/<\?php\s*((?:include|require)(?:_once)?\s+[\s\S]*?;)\s*\?>/g, (_, body) => `<!-- PHP ${body.trim()} -->`);
  if (includeCount) messages.push(`${includeCount} include/require statement${includeCount > 1 ? "s" : ""} converted to comments.`);

  const logicBlocks = countMatches(output, /<\?php[\s\S]*?\?>/g);
  output = output.replace(/<\?php\s*([\s\S]*?)\s*\?>/g, (_, logic) => {
    const compact = logic.trim().replace(/\s+/g, " ");
    return options.logicAsComments && compact ? `<!-- PHP logic removed: ${compact} -->` : "";
  });
  if (logicBlocks) warnings.push(`${logicBlocks} PHP logic block${logicBlocks > 1 ? "s were" : " was"} converted to HTML comment${logicBlocks > 1 ? "s" : ""}.`);

  output = output.replace(/\s{2,}\n/g, "\n");

  return {
    output: output.trim(),
    messages: messages.length ? messages : ["PHP cleaned into readable HTML output."],
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

export default function HTMLPHPConverter() {
  const [mode, setMode] = useState("htmlToPhp");
  const [input, setInput] = useState(SAMPLE_HTML);
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const result = useMemo(() => {
    return mode === "htmlToPhp" ? htmlToPhp(input, options) : phpToHtml(input, options);
  }, [input, mode, options]);

  const output = result.output;
  const activeMode = MODE_COPY[mode];
  const outputExtension = mode === "htmlToPhp" ? "php" : "html";
  const phpSignals = useMemo(() => {
    const source = mode === "htmlToPhp" ? output : input;
    return {
      variables: countMatches(source, /\$[a-zA-Z_]\w*/g),
      echoes: countMatches(source, /<\?=|echo\s+/g),
      blocks: countMatches(source, /<\?php[\s\S]*?\?>/g),
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
    setMode((current) => (current === "htmlToPhp" ? "phpToHtml" : "htmlToPhp"));
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
          HTML PHP Converter
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-[var(--muted-foreground)] sm:text-lg">
          Convert HTML code to PHP templates, or clean PHP template code back into readable HTML. Handle safe echo
          placeholders, variables, base-path asset URLs, and export-ready code inside one responsive workspace.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={ArrowLeftRight} label="Mode" value={activeMode.short} helper={activeMode.helper} />
        <MetricCard icon={FileInput} label="Input" value={`${formatNumber(countLines(input))} lines`} helper={`${formatNumber(input.length)} characters`} />
        <MetricCard
          icon={TerminalSquare}
          label="PHP signals"
          value={`${phpSignals.variables + phpSignals.echoes + phpSignals.blocks}`}
          helper={`${phpSignals.variables} vars, ${phpSignals.echoes} echo, ${phpSignals.blocks} blocks`}
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
                  setInput(key === "htmlToPhp" ? SAMPLE_HTML : SAMPLE_PHP);
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
              onClick={() => setInput(mode === "htmlToPhp" ? SAMPLE_HTML : SAMPLE_PHP)}
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
            <input ref={fileRef} type="file" accept=".html,.htm,.php,.phtml,.txt" className="hidden" onChange={handleFile} />
          </div>

          <label className="mt-5 block text-sm font-semibold" htmlFor="html-php-input">
            Source code
          </label>
          <textarea
            id="html-php-input"
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
              {mode === "htmlToPhp" ? (
                <>
                  <ToggleOption active={options.addPhpOpenTag} label="Add PHP block" helper="Adds variables before the markup." onClick={() => setOption("addPhpOpenTag")} />
                  <ToggleOption active={options.addStrictTypes} label="Strict types" helper="Adds declare(strict_types=1)." onClick={() => setOption("addStrictTypes")} />
                  <ToggleOption active={options.addBasePath} label="Base-path assets" helper="Makes root paths configurable." onClick={() => setOption("addBasePath")} />
                  <ToggleOption active={options.mustacheToSafeEcho} label="Safe echoes" helper="Turns {{user.name}} into escaped PHP output." onClick={() => setOption("mustacheToSafeEcho")} />
                </>
              ) : (
                <>
                  <ToggleOption active={options.stripPhpConfig} label="Strip config" helper="Removes variable declarations and strict types." onClick={() => setOption("stripPhpConfig")} />
                  <ToggleOption active={options.echoToPlaceholders} label="Echo placeholders" helper="Turns PHP echoes into {{ tokens }}." onClick={() => setOption("echoToPlaceholders")} />
                  <ToggleOption active={options.logicAsComments} label="Logic as comments" helper="Keeps PHP logic visible safely." onClick={() => setOption("logicAsComments")} />
                  <ToggleOption active={options.phpCommentsToHtml} label="PHP comments" helper="Normalizes PHP comments into HTML comments." onClick={() => setOption("phpCommentsToHtml")} />
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
                  <h2 className="text-2xl font-bold">{mode === "htmlToPhp" ? "Generated PHP" : "Generated HTML"}</h2>
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
                {(result.warnings.length ? result.warnings : ["No risky PHP template issue detected in this pass."]).map((warning) => (
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
