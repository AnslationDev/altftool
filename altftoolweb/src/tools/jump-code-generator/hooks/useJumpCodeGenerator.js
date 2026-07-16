import { useCallback, useEffect, useMemo, useState } from "react";

export const codeTypes = [
  { id: "html-anchor", label: "HTML Anchor Jump", language: "html" },
  { id: "smooth-scroll", label: "Smooth Scroll", language: "html" },
  { id: "button-jump", label: "Button Jump", language: "html" },
  { id: "react-router", label: "React Router Navigation", language: "jsx" },
  { id: "scroll-section", label: "Scroll-to-Section", language: "jsx" },
  { id: "snippet", label: "Snippet Generator", language: "js" },
  { id: "custom", label: "Custom Jump Logic", language: "js" },
];

const defaultForm = {
  codeType: "html-anchor",
  sectionId: "contact",
  linkText: "Contact",
  buttonLabel: "Go to Contact",
  routeName: "Dashboard",
  path: "/dashboard",
  functionName: "jumpToContact",
  offset: "80",
  duration: "600",
  behavior: "smooth",
  framework: "Vanilla JS",
  snippetName: "useJumpNavigation",
  selector: "[data-jump-target]",
  customTrigger: "openPanel",
  customTarget: "pricing",
};

const fieldMap = {
  "html-anchor": ["sectionId", "linkText"],
  "smooth-scroll": ["sectionId", "linkText", "offset", "behavior"],
  "button-jump": ["sectionId", "buttonLabel", "functionName", "offset"],
  "react-router": ["routeName", "path", "buttonLabel"],
  "scroll-section": ["sectionId", "buttonLabel", "functionName", "behavior"],
  snippet: ["snippetName", "selector", "offset", "behavior"],
  custom: ["customTrigger", "customTarget", "functionName", "duration"],
};

const fieldConfig = {
  sectionId: { label: "Section ID", placeholder: "contact" },
  linkText: { label: "Link Text", placeholder: "Contact" },
  buttonLabel: { label: "Button Label", placeholder: "Go to Contact" },
  routeName: { label: "Route Name", placeholder: "Dashboard" },
  path: { label: "Route Path", placeholder: "/dashboard" },
  functionName: { label: "Function Name", placeholder: "jumpToContact" },
  offset: { label: "Offset (px)", placeholder: "80", type: "number" },
  duration: { label: "Duration (ms)", placeholder: "600", type: "number" },
  behavior: { label: "Scroll Behavior", options: ["smooth", "auto"] },
  framework: { label: "Framework", options: ["Vanilla JS", "React", "Next.js"] },
  snippetName: { label: "Snippet Name", placeholder: "useJumpNavigation" },
  selector: { label: "Target Selector", placeholder: "[data-jump-target]" },
  customTrigger: { label: "Trigger Name", placeholder: "openPanel" },
  customTarget: { label: "Target ID", placeholder: "pricing" },
};

function escapeHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toId(value) {
  return String(value || "section").trim().replace(/^#/, "").replace(/\s+/g, "-").replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "section";
}

function toFunctionName(value) {
  const cleaned = String(value || "jumpToSection").replace(/[^a-zA-Z0-9_$]/g, "");
  return /^[a-zA-Z_$]/.test(cleaned) ? cleaned : `jump${cleaned}`;
}

function toNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function generateCode(form) {
  const id = toId(form.sectionId || form.customTarget);
  const target = toId(form.customTarget || form.sectionId);
  const linkText = escapeHtml(form.linkText || "Jump");
  const buttonLabel = escapeHtml(form.buttonLabel || "Jump");
  const fn = toFunctionName(form.functionName);
  const offset = toNumber(form.offset, 0);
  const duration = Math.max(0, toNumber(form.duration, 600));
  const behavior = form.behavior === "auto" ? "auto" : "smooth";
  const routeName = escapeHtml(form.routeName || "Route");
  const path = String(form.path || "/").startsWith("/") ? form.path : `/${form.path}`;
  const snippetName = toFunctionName(form.snippetName);
  const selector = form.selector?.trim() || "[data-jump-target]";
  const trigger = toFunctionName(form.customTrigger);

  switch (form.codeType) {
    case "html-anchor":
      return `<a href="#${id}">${linkText}</a>\n\n<section id="${id}">\n  <h2>${linkText}</h2>\n</section>`;
    case "smooth-scroll":
      return `<a href="#${id}" data-scroll-link>${linkText}</a>\n\n<section id="${id}">\n  <h2>${linkText}</h2>\n</section>\n\n<script>\n  document.querySelector('[data-scroll-link]').addEventListener('click', function (event) {\n    event.preventDefault();\n    const target = document.getElementById('${id}');\n    if (!target) return;\n\n    const top = target.getBoundingClientRect().top + window.scrollY - ${offset};\n    window.scrollTo({ top, behavior: '${behavior}' });\n  });\n</script>`;
    case "button-jump":
      return `<button type="button" onclick="${fn}()">${buttonLabel}</button>\n\n<section id="${id}">\n  <h2>${buttonLabel}</h2>\n</section>\n\n<script>\n  function ${fn}() {\n    const target = document.getElementById('${id}');\n    if (!target) return;\n\n    const top = target.getBoundingClientRect().top + window.scrollY - ${offset};\n    window.scrollTo({ top, behavior: 'smooth' });\n  }\n</script>`;
    case "react-router":
      return `import { Link, useNavigate } from "react-router-dom";\n\nexport function ${routeName.replace(/[^a-zA-Z0-9]/g, "") || "Route"}Jump() {\n  const navigate = useNavigate();\n\n  return (\n    <div>\n      <Link to="${path}">${routeName}</Link>\n      <button type="button" onClick={() => navigate("${path}")}>\n        ${buttonLabel}\n      </button>\n    </div>\n  );\n}`;
    case "scroll-section":
      return `import { useRef } from "react";\n\nexport default function JumpSection() {\n  const sectionRef = useRef(null);\n\n  function ${fn}() {\n    sectionRef.current?.scrollIntoView({ behavior: "${behavior}", block: "start" });\n  }\n\n  return (\n    <>\n      <button type="button" onClick={${fn}}>${buttonLabel}</button>\n      <section id="${id}" ref={sectionRef}>\n        <h2>${buttonLabel}</h2>\n      </section>\n    </>\n  );\n}`;
    case "snippet":
      return `export function ${snippetName}(root = document) {\n  const links = root.querySelectorAll('${selector}');\n\n  links.forEach((link) => {\n    link.addEventListener('click', (event) => {\n      const targetId = link.getAttribute('href')?.replace('#', '') || link.dataset.target;\n      const target = targetId ? document.getElementById(targetId) : null;\n      if (!target) return;\n\n      event.preventDefault();\n      const top = target.getBoundingClientRect().top + window.scrollY - ${offset};\n      window.scrollTo({ top, behavior: '${behavior}' });\n    });\n  });\n}`;
    default:
      return `const jumpRegistry = new Map();\n\nfunction ${fn}(targetId = '${target}', options = {}) {\n  const target = document.getElementById(targetId);\n  if (!target) return false;\n\n  const duration = options.duration ?? ${duration};\n  const start = window.scrollY;\n  const end = target.getBoundingClientRect().top + window.scrollY;\n  const startedAt = performance.now();\n\n  function tick(now) {\n    const progress = Math.min((now - startedAt) / duration, 1);\n    const eased = 1 - Math.pow(1 - progress, 3);\n    window.scrollTo(0, start + (end - start) * eased);\n    if (progress < 1) requestAnimationFrame(tick);\n  }\n\n  requestAnimationFrame(tick);\n  return true;\n}\n\njumpRegistry.set('${trigger}', () => ${fn}('${target}'));\n\ndocument.addEventListener('${trigger}', () => jumpRegistry.get('${trigger}')?.());`;
  }
}

function validate(form) {
  const required = fieldMap[form.codeType] || [];
  const missing = required.filter((field) => !String(form[field] ?? "").trim());
  const warnings = [];
  if (required.includes("sectionId") && !/^[a-zA-Z][\w-]*$/.test(toId(form.sectionId))) warnings.push("Section ID was normalized for HTML compatibility.");
  if (required.includes("path") && !String(form.path || "").startsWith("/")) warnings.push("Route path will be generated with a leading slash.");
  if (required.includes("functionName") && toFunctionName(form.functionName) !== form.functionName) warnings.push("Function name will be sanitized for JavaScript.");
  return { missing, warnings, valid: missing.length === 0 };
}

function getReadiness(form, validation) {
  const required = fieldMap[form.codeType] || [];
  const checks = [
    { label: "Code type selected", done: Boolean(form.codeType) },
    ...required.map((field) => ({ label: fieldConfig[field].label, done: !validation.missing.includes(field) })),
    { label: "Template generated", done: validation.valid },
    { label: "Preview synced", done: validation.valid },
  ];
  return { checks, score: Math.round((checks.filter((item) => item.done).length / checks.length) * 100) };
}

export function useJumpCodeGenerator() {
  const [form, setForm] = useState(() => {
    if (typeof window === "undefined") return defaultForm;
    try {
      const saved = localStorage.getItem("jump_code_generator_form");
      return saved ? { ...defaultForm, ...JSON.parse(saved) } : defaultForm;
    } catch {
      return defaultForm;
    }
  });
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("jump_code_generator_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("jump_code_generator_form", JSON.stringify(form));
  }, [form]);

  const validation = useMemo(() => validate(form), [form]);
  const code = useMemo(() => (validation.valid ? generateCode(form) : ""), [form, validation.valid]);
  const readiness = useMemo(() => getReadiness(form, validation), [form, validation]);
  const activeFields = useMemo(() => fieldMap[form.codeType] || [], [form.codeType]);
  const activeType = useMemo(() => codeTypes.find((type) => type.id === form.codeType) || codeTypes[0], [form.codeType]);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  }, []);

  const saveSnapshot = useCallback(() => {
    if (!code) return;
    const item = { id: Date.now(), type: activeType.label, code, createdAt: new Date().toISOString() };
    setHistory((current) => {
      const next = [item, ...current].slice(0, 8);
      localStorage.setItem("jump_code_generator_history", JSON.stringify(next));
      return next;
    });
  }, [activeType.label, code]);

  const stats = useMemo(() => ({
    lines: code ? code.split("\n").length : 0,
    chars: code.length,
    language: activeType.language.toUpperCase(),
  }), [activeType.language, code]);

  return {
    form,
    updateField,
    activeFields,
    activeType,
    fieldConfig,
    code,
    copied,
    setCopied,
    readiness,
    validation,
    stats,
    history,
    saveSnapshot,
  };
}
