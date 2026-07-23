// Email-safe signature HTML generator + vCard builder + quality analyzer.
//
// The exported markup is deliberately old-school: nested tables, inline
// styles, explicit widths, no flexbox/grid/CSS variables/media queries —
// the only dialect all major clients (including Outlook's Word engine)
// render consistently. `options.outlookMode` strips border-radius so the
// preview can show what Outlook actually does to rounded corners.

import { fontStack, SOCIAL_NETWORKS, MEETING_SERVICES } from "./signatureData";

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ensureUrl(url) {
  const trimmed = (url || "").trim();
  if (!trimmed) return "";
  return /^(https?:\/\/|mailto:|tel:)/i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function radiusStyle(px, { outlookMode }) {
  return outlookMode || !px ? "" : `border-radius:${px}px;`;
}

function photoRadius(shape, size, opts) {
  if (shape === "circle") return radiusStyle(Math.round(size / 2), opts);
  if (shape === "rounded") return radiusStyle(10, opts);
  return "";
}

function dividerHtml(design, opts) {
  if (design.divider === "none") return "";
  const style =
    design.divider === "dots"
      ? `border-top:2px dotted ${design.accent};`
      : `border-top:1px solid ${design.accent};`;
  return `<tr><td colspan="9" style="padding:10px 0 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="${style}font-size:0;line-height:0;" height="1">&nbsp;</td></tr></table></td></tr>`;
}

function textLine(content, { size, color, font, lineHeight, bold = false, accent = false, design }) {
  if (!content) return "";
  return `<div style="font-family:${font};font-size:${size}px;line-height:${lineHeight};color:${accent ? design.accent : color};${bold ? "font-weight:bold;" : ""}">${content}</div>`;
}

function contactRow(state, font) {
  const { personal, design } = state;
  const parts = [];
  const s = design.fontSize - 1;
  const item = (label, value, href) => {
    if (!value) return;
    const inner = href
      ? `<a href="${esc(href)}" style="color:${design.text};text-decoration:none;">${esc(value)}</a>`
      : esc(value);
    parts.push(
      `<span style="font-family:${font};font-size:${s}px;color:${design.text};"><span style="color:${design.accent};font-weight:bold;">${label}</span> ${inner}</span>`,
    );
  };

  item("E:", personal.email, personal.email ? `mailto:${personal.email}` : "");
  item("T:", personal.phone, personal.phone ? `tel:${personal.phone.replace(/[^+\d]/g, "")}` : "");
  item("M:", personal.mobile, personal.mobile ? `tel:${personal.mobile.replace(/[^+\d]/g, "")}` : "");
  item("W:", personal.website.replace(/^https?:\/\//i, ""), ensureUrl(personal.website));

  const rows = [];
  if (parts.length) {
    rows.push(parts.join(`<span style="color:${design.accent};">&nbsp;&nbsp;|&nbsp;&nbsp;</span>`));
  }
  if (personal.address) {
    rows.push(`<span style="font-family:${font};font-size:${s}px;color:${design.text};"><span style="color:${design.accent};font-weight:bold;">A:</span> ${esc(personal.address)}</span>`);
  }
  if (personal.hours) {
    rows.push(`<span style="font-family:${font};font-size:${s}px;color:${design.text};"><span style="color:${design.accent};font-weight:bold;">H:</span> ${esc(personal.hours)}</span>`);
  }
  return rows.map((r) => `<div style="line-height:${state.design.lineHeight};padding-top:2px;">${r}</div>`).join("");
}

function identityHtml(state, opts) {
  const { personal, design } = state;
  const font = fontStack(design.font);
  const nameSize = design.fontSize + 5;

  const nameBlock =
    textLine(esc(personal.fullName), { size: nameSize, color: design.text, font, lineHeight: 1.3, bold: true, design }) +
    textLine(
      [esc(personal.title), esc(personal.department)].filter(Boolean).join(" · "),
      { size: design.fontSize, color: design.text, font, lineHeight: design.lineHeight, accent: true, design },
    ) +
    textLine(esc(personal.company), { size: design.fontSize, color: design.text, font, lineHeight: design.lineHeight, bold: true, design }) +
    (personal.tagline
      ? `<div style="font-family:${font};font-size:${design.fontSize - 1}px;line-height:${design.lineHeight};color:${design.text};font-style:italic;padding-top:3px;">${esc(personal.tagline)}</div>`
      : "");

  const contact = `<div style="padding-top:6px;">${contactRow(state, font)}</div>`;

  const photoCell = state.photo.src
    ? `<td valign="top" style="padding:0 14px 0 0;" width="${state.photo.size}"><img src="${esc(state.photo.src)}" width="${state.photo.size}" height="${state.photo.size}" alt="${esc(personal.fullName || "Profile photo")}" style="display:block;width:${state.photo.size}px;height:${state.photo.size}px;${photoRadius(state.photo.shape, state.photo.size, opts)}" /></td>`
    : "";

  const logoImg = state.logo.src
    ? `<img src="${esc(state.logo.src)}" width="${state.logo.width}" alt="${esc(personal.company || "Company logo")}" style="display:block;width:${state.logo.width}px;height:auto;" />`
    : "";
  const logoBlock = state.logo.src
    ? `<div style="padding-top:8px;">${state.logo.url ? `<a href="${esc(ensureUrl(state.logo.url))}">${logoImg}</a>` : logoImg}</div>`
    : "";

  const textCell = `<td valign="top">${nameBlock}${contact}${logoBlock}</td>`;

  if (design.layout === "vertical-line") {
    return `<tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${photoCell}<td valign="top" width="3" style="background-color:${design.accent};font-size:0;line-height:0;" bgcolor="${design.accent}">&nbsp;</td><td valign="top" style="padding:0 0 0 14px;">${nameBlock}${contact}${logoBlock}</td></tr></table></td></tr>`;
  }
  if (design.layout === "accent-bar") {
    return `<tr><td style="border-top:4px solid ${design.accent};padding-top:10px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${photoCell}${textCell}</tr></table></td></tr>`;
  }
  if (design.layout === "stacked") {
    const stackedPhoto = state.photo.src
      ? `<tr><td style="padding:0 0 8px 0;"><img src="${esc(state.photo.src)}" width="${state.photo.size}" height="${state.photo.size}" alt="${esc(personal.fullName || "Profile photo")}" style="display:block;width:${state.photo.size}px;height:${state.photo.size}px;${photoRadius(state.photo.shape, state.photo.size, opts)}" /></td></tr>`
      : "";
    return `${stackedPhoto}<tr><td>${nameBlock}${contact}${logoBlock}</td></tr>`;
  }
  if (design.layout === "text-only") {
    return `<tr><td>${nameBlock}${contact}${logoBlock}</td></tr>`;
  }
  // horizontal (default)
  return `<tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${photoCell}${textCell}</tr></table></td></tr>`;
}

function socialHtml(state, opts) {
  const entries = SOCIAL_NETWORKS.filter((n) => (state.socials[n.id] || "").trim());
  if (!entries.length) return "";
  const font = fontStack(state.design.font);

  const cells = entries
    .map((n) => {
      const href = esc(ensureUrl(state.socials[n.id]));
      if (state.design.iconStyle === "text") {
        return `<td style="padding:0 10px 0 0;"><a href="${href}" style="font-family:${font};font-size:${state.design.fontSize - 1}px;color:${state.design.accent};text-decoration:none;font-weight:bold;">${esc(n.label)}</a></td>`;
      }
      return `<td style="padding:0 6px 0 0;"><a href="${href}" style="text-decoration:none;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" width="24" height="24" bgcolor="${n.color}" style="background-color:${n.color};width:24px;height:24px;${radiusStyle(12, opts)}font-family:Arial,sans-serif;font-size:11px;font-weight:bold;color:#FFFFFF;text-align:center;">${esc(n.badge)}</td></tr></table></a></td>`;
    })
    .join("");

  return `<tr><td style="padding-top:10px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`;
}

function buttonHtml({ label, url, bg, color, radius, font, size }, opts) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${bg}" style="background-color:${bg};${radiusStyle(radius, opts)}"><a href="${esc(ensureUrl(url))}" style="display:inline-block;padding:8px 18px;font-family:${font};font-size:${size}px;font-weight:bold;color:${color};text-decoration:none;">${esc(label)}</a></td></tr></table>`;
}

function ctaHtml(state, opts) {
  if (!state.cta.url.trim() || !state.cta.label.trim()) return "";
  const font = fontStack(state.design.font);
  return `<tr><td style="padding-top:12px;">${buttonHtml({ ...state.cta, font, size: state.design.fontSize - 1 }, opts)}</td></tr>`;
}

function meetingsHtml(state, opts) {
  const font = fontStack(state.design.font);
  const active = MEETING_SERVICES.filter((s) => (state.meetings[s.id] || "").trim());
  if (!active.length) return "";
  const cells = active
    .map(
      (s) =>
        `<td style="padding:0 8px 0 0;">${buttonHtml({ label: s.cta, url: state.meetings[s.id], bg: s.color, color: "#FFFFFF", radius: 5, font, size: state.design.fontSize - 2 }, opts)}</td>`,
    )
    .join("");
  return `<tr><td style="padding-top:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>${cells}</tr></table></td></tr>`;
}

function bannerHtml(state) {
  if (!state.banner.src.trim()) return "";
  const img = `<img src="${esc(state.banner.src)}" width="${state.banner.width}" alt="${esc(state.banner.alt || "Promotional banner")}" style="display:block;width:${state.banner.width}px;max-width:100%;height:auto;" />`;
  const inner = state.banner.url.trim() ? `<a href="${esc(ensureUrl(state.banner.url))}">${img}</a>` : img;
  return `<tr><td style="padding-top:12px;">${inner}</td></tr>`;
}

// The QR data URL is generated by the UI (qrcode.react canvas) and passed in
// via options so this module stays DOM-free.
function qrHtml(state, opts) {
  if (!opts.qrDataUrl) return "";
  const font = fontStack(state.design.font);
  return `<tr><td style="padding-top:12px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 10px 0 0;"><img src="${opts.qrDataUrl}" width="72" height="72" alt="QR code" style="display:block;width:72px;height:72px;" /></td><td valign="middle" style="font-family:${font};font-size:${state.design.fontSize - 2}px;color:${state.design.text};">Scan to ${state.qr.mode === "vcard" ? "save my contact" : "visit my link"}</td></tr></table></td></tr>`;
}

function disclaimerHtml(state) {
  if (!state.disclaimer.trim()) return "";
  const font = fontStack(state.design.font);
  return `<tr><td style="padding-top:12px;border-top:1px solid #E5E7EB;"><div style="font-family:${font};font-size:${Math.max(10, state.design.fontSize - 3)}px;line-height:1.45;color:#6B7280;padding-top:8px;">${esc(state.disclaimer)}</div></td></tr>`;
}

const SECTION_RENDERERS = {
  social: socialHtml,
  cta: ctaHtml,
  meetings: meetingsHtml,
  banner: (state) => bannerHtml(state),
  qr: qrHtml,
  disclaimer: (state) => disclaimerHtml(state),
};

export function renderSignatureHtml(state, options = {}) {
  const opts = { outlookMode: false, qrDataUrl: "", ...options };
  const { design, sections } = state;

  const blocks = [identityHtml(state, opts)];
  const sectionRows = sections.order
    .filter((id) => sections.visible[id])
    .map((id) => SECTION_RENDERERS[id]?.(state, opts) || "")
    .filter(Boolean);

  if (sectionRows.length && design.divider !== "none") blocks.push(dividerHtml(design, opts));
  blocks.push(...sectionRows);

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="${design.width}" style="width:${design.width}px;max-width:100%;"><tbody>${blocks.join("")}</tbody></table>`;
}

export function buildVCard(state) {
  const p = state.personal;
  const nameParts = (p.fullName || "").trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  const first = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : nameParts[0] || "";

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${p.fullName || ""}`,
    p.company ? `ORG:${p.company}${p.department ? `;${p.department}` : ""}` : "",
    p.title ? `TITLE:${p.title}` : "",
    p.email ? `EMAIL;TYPE=WORK:${p.email}` : "",
    p.phone ? `TEL;TYPE=WORK,VOICE:${p.phone}` : "",
    p.mobile ? `TEL;TYPE=CELL:${p.mobile}` : "",
    p.website ? `URL:${ensureUrl(p.website)}` : "",
    p.address ? `ADR;TYPE=WORK:;;${p.address};;;;` : "",
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}

export function qrPayload(state) {
  if (state.qr.mode === "vcard") return buildVCard(state);
  if (state.qr.mode === "custom") return state.qr.custom.trim();
  return ensureUrl(state.personal.website);
}

// Deterministic quality checks over the current state + generated HTML.
export function analyzeSignature(state, html) {
  const checks = [];
  const add = (level, title, detail) => checks.push({ level, title, detail });

  const dataUrlImages = (html.match(/src="data:/g) || []).length;
  if (dataUrlImages > 0) {
    add(
      "warning",
      `${dataUrlImages} embedded (base64) image(s)`,
      "Outlook and some webmail clients don't display base64 images. For maximum compatibility, host the image online and paste its https:// URL instead of uploading.",
    );
  }

  const insecureImages = (html.match(/src="http:\/\//g) || []).length;
  if (insecureImages > 0) {
    add("error", `${insecureImages} image(s) served over http://`, "Mixed-content images are blocked by most clients — use https:// URLs.");
  }

  if (!state.personal.fullName.trim()) add("error", "No name set", "A signature without a name renders as an empty block — fill in the full name.");
  if (!state.personal.email.trim() && !state.personal.phone.trim() && !state.personal.mobile.trim()) {
    add("warning", "No contact method", "Add at least an email or phone number so recipients can reach you.");
  }

  if (state.photo.src && state.photo.size > 120) {
    add("info", "Large profile photo", `Photo is ${state.photo.size}px — 72-100px keeps signatures compact in reply threads.`);
  }
  if (state.banner.src && state.sections.visible.banner && state.banner.width > 500) {
    add("info", "Wide banner", `Banner is ${state.banner.width}px — many mobile clients show ~320-420px, so wider images get scaled or cut.`);
  }
  if (state.design.width > 600) {
    add("warning", "Signature wider than 600px", "Most email bodies render at 600px or less; wider tables can force horizontal scrolling.");
  }

  const sizeKb = Math.round((new Blob([html]).size / 1024) * 10) / 10;
  if (sizeKb > 40) {
    add("warning", `Signature HTML is ${sizeKb}KB`, "Large signatures repeated in every reply bloat threads and can push messages toward Gmail's clipping limit.");
  }

  if (state.sections.visible.disclaimer && state.disclaimer.length > 500) {
    add("info", "Long disclaimer", "Disclaimers over ~500 characters dominate the signature visually — keep it short or link to a policy page.");
  }

  const linkCount = (html.match(/<a /g) || []).length;
  if (linkCount > 12) add("info", `${linkCount} links in signature`, "Very link-heavy signatures can look promotional to spam filters.");

  const imgWithoutAlt = (html.match(/<img (?![^>]*alt=)/g) || []).length;
  if (imgWithoutAlt > 0) add("warning", `${imgWithoutAlt} image(s) missing alt text`, "Alt text is what recipients see while images load or stay blocked.");

  if (checks.length === 0) add("pass", "All checks passed", "This signature uses email-safe markup with no compatibility warnings.");

  const score = Math.max(
    0,
    100 -
      checks.reduce(
        (sum, c) => sum + (c.level === "error" ? 25 : c.level === "warning" ? 12 : c.level === "info" ? 4 : 0),
        0,
      ),
  );
  return { checks, score };
}
