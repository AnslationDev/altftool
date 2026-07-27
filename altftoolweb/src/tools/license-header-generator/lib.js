/**
 * License header texts and per-language comment styles.
 *
 * Sources for the header wording:
 *  - Apache-2.0: Appendix "How to apply the Apache License to your work" of the
 *    Apache License, Version 2.0 (apache.org/licenses/LICENSE-2.0).
 *  - GPL-3.0 / AGPL-3.0 / LGPL-3.0: the "How to Apply These Terms to Your New
 *    Programs" appendix of each GNU license (gnu.org/licenses).
 *  - MPL-2.0: Exhibit A of the Mozilla Public License 2.0.
 *  - SPDX-License-Identifier / SPDX-FileCopyrightText lines: the REUSE
 *    specification v3 (reuse.software/spec) and SPDX spec Annex E.
 * Licenses with no official per-file header (MIT, BSD, ISC, Unlicense) get a
 * copyright line plus the SPDX identifier, which is the REUSE-recommended form.
 */

const YEAR_TOKEN = "{{year}}";
const HOLDER_TOKEN = "{{holder}}";

/** Valid copyright-year window — sanity bounds, not a legal rule. */
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2999;

export const LICENSES = [
  {
    id: "MIT",
    name: "MIT License",
    hasOfficialHeader: false,
    lines: ["Copyright (c) {{year}} {{holder}}"],
  },
  {
    id: "Apache-2.0",
    name: "Apache License 2.0",
    hasOfficialHeader: true,
    lines: [
      "Copyright {{year}} {{holder}}",
      "",
      'Licensed under the Apache License, Version 2.0 (the "License");',
      "you may not use this file except in compliance with the License.",
      "You may obtain a copy of the License at",
      "",
      "    http://www.apache.org/licenses/LICENSE-2.0",
      "",
      "Unless required by applicable law or agreed to in writing, software",
      'distributed under the License is distributed on an "AS IS" BASIS,',
      "WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.",
      "See the License for the specific language governing permissions and",
      "limitations under the License.",
    ],
  },
  {
    id: "GPL-3.0-or-later",
    name: "GNU GPL v3 (or later)",
    hasOfficialHeader: true,
    lines: [
      "Copyright (C) {{year}} {{holder}}",
      "",
      "This program is free software: you can redistribute it and/or modify",
      "it under the terms of the GNU General Public License as published by",
      "the Free Software Foundation, either version 3 of the License, or",
      "(at your option) any later version.",
      "",
      "This program is distributed in the hope that it will be useful,",
      "but WITHOUT ANY WARRANTY; without even the implied warranty of",
      "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the",
      "GNU General Public License for more details.",
      "",
      "You should have received a copy of the GNU General Public License",
      "along with this program.  If not, see <https://www.gnu.org/licenses/>.",
    ],
  },
  {
    id: "AGPL-3.0-or-later",
    name: "GNU AGPL v3 (or later)",
    hasOfficialHeader: true,
    lines: [
      "Copyright (C) {{year}} {{holder}}",
      "",
      "This program is free software: you can redistribute it and/or modify",
      "it under the terms of the GNU Affero General Public License as published by",
      "the Free Software Foundation, either version 3 of the License, or",
      "(at your option) any later version.",
      "",
      "This program is distributed in the hope that it will be useful,",
      "but WITHOUT ANY WARRANTY; without even the implied warranty of",
      "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the",
      "GNU Affero General Public License for more details.",
      "",
      "You should have received a copy of the GNU Affero General Public License",
      "along with this program.  If not, see <https://www.gnu.org/licenses/>.",
    ],
  },
  {
    id: "LGPL-3.0-or-later",
    name: "GNU LGPL v3 (or later)",
    hasOfficialHeader: true,
    lines: [
      "Copyright (C) {{year}} {{holder}}",
      "",
      "This library is free software: you can redistribute it and/or modify",
      "it under the terms of the GNU Lesser General Public License as published by",
      "the Free Software Foundation, either version 3 of the License, or",
      "(at your option) any later version.",
      "",
      "This library is distributed in the hope that it will be useful,",
      "but WITHOUT ANY WARRANTY; without even the implied warranty of",
      "MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the",
      "GNU Lesser General Public License for more details.",
      "",
      "You should have received a copy of the GNU Lesser General Public License",
      "along with this library.  If not, see <https://www.gnu.org/licenses/>.",
    ],
  },
  {
    id: "MPL-2.0",
    name: "Mozilla Public License 2.0",
    hasOfficialHeader: true,
    lines: [
      "Copyright (c) {{year}} {{holder}}",
      "",
      "This Source Code Form is subject to the terms of the Mozilla Public",
      "License, v. 2.0. If a copy of the MPL was not distributed with this",
      "file, You can obtain one at https://mozilla.org/MPL/2.0/.",
    ],
  },
  {
    id: "BSD-3-Clause",
    name: "BSD 3-Clause",
    hasOfficialHeader: false,
    lines: ["Copyright (c) {{year}} {{holder}}"],
  },
  {
    id: "ISC",
    name: "ISC License",
    hasOfficialHeader: false,
    lines: ["Copyright (c) {{year}} {{holder}}"],
  },
  {
    id: "Unlicense",
    name: "The Unlicense (public domain)",
    hasOfficialHeader: true,
    lines: [
      "This is free and unencumbered software released into the public domain.",
      "",
      "For more information, please refer to <https://unlicense.org>",
    ],
  },
];

/**
 * Comment syntaxes per language family.
 *  - type "line": every header line is prefixed.
 *  - type "block": one opening delimiter, a per-line prefix, one closing delimiter.
 */
export const LANGUAGES = [
  { id: "js", label: "JavaScript / TypeScript / Java / Go / Rust / C# (//)", style: { type: "line", prefix: "// " } },
  { id: "c-block", label: "C / C++ / CSS block comment (/* ... */)", style: { type: "block", open: "/*", prefix: " * ", close: " */" } },
  { id: "python", label: "Python / Shell / Ruby / YAML / TOML (#)", style: { type: "line", prefix: "# " } },
  { id: "html", label: "HTML / XML / Markdown (<!-- ... -->)", style: { type: "block", open: "<!--", prefix: "  ", close: "-->" } },
  { id: "sql", label: "SQL / Lua / Haskell (--)", style: { type: "line", prefix: "-- " } },
  { id: "lisp", label: "Lisp / Clojure / Scheme (;;)", style: { type: "line", prefix: ";; " } },
  { id: "matlab", label: "MATLAB / Erlang / LaTeX (%)", style: { type: "line", prefix: "% " } },
  { id: "vb", label: "Visual Basic (')", style: { type: "line", prefix: "' " } },
  { id: "fortran", label: "Fortran (!)", style: { type: "line", prefix: "! " } },
  { id: "bat", label: "Windows batch (REM)", style: { type: "line", prefix: "REM " } },
];

function fillTemplate(line, year, holder) {
  return line.split(YEAR_TOKEN).join(String(year)).split(HOLDER_TOKEN).join(holder);
}

/** Wrap raw text lines in the chosen comment style. Trailing spaces on blank lines are trimmed. */
export function applyCommentStyle(lines, style) {
  if (style.type === "line") {
    return lines.map((line) => (line === "" ? style.prefix.trimEnd() : style.prefix + line));
  }
  const body = lines.map((line) => (line === "" ? style.prefix.trimEnd() : style.prefix + line));
  return [style.open, ...body, style.close];
}

/**
 * Build a ready-to-paste license header comment.
 *
 * @param {object} input
 * @param {string} input.licenseId   SPDX identifier from LICENSES.
 * @param {string} input.languageId  Entry id from LANGUAGES.
 * @param {number|string} input.year Copyright year (or a range string like "2020-2026").
 * @param {string} input.holder      Copyright holder name.
 * @param {boolean} [input.includeSpdx=true]  Prepend the SPDX-License-Identifier line (REUSE style).
 * @returns {{header:string, lineCount:number, licenseName:string, spdxId:string, hasOfficialHeader:boolean}|{error:string}}
 */
export function generateLicenseHeader({ licenseId, languageId, year, holder, includeSpdx = true }) {
  const license = LICENSES.find((entry) => entry.id === licenseId);
  if (!license) return { error: "Choose a license from the list." };

  const language = LANGUAGES.find((entry) => entry.id === languageId);
  if (!language) return { error: "Choose a language / comment style from the list." };

  const holderText = typeof holder === "string" ? holder.trim() : "";
  if (holderText === "") return { error: "Enter the copyright holder (a person or organisation name)." };

  // Accept a single year or a range like "2020-2026" / "2020–2026".
  const yearText = String(year).trim();
  const rangeMatch = yearText.match(/^(\d{4})\s*[-–]\s*(\d{4})$/);
  const singleMatch = yearText.match(/^(\d{4})$/);
  if (!rangeMatch && !singleMatch) {
    return { error: "Enter the year as a 4-digit number (e.g. 2026) or a range like 2020-2026." };
  }
  const firstYear = Number(rangeMatch ? rangeMatch[1] : singleMatch[1]);
  const lastYear = Number(rangeMatch ? rangeMatch[2] : singleMatch[1]);
  if (firstYear < MIN_YEAR || lastYear > MAX_YEAR) {
    return { error: `Years must fall between ${MIN_YEAR} and ${MAX_YEAR}.` };
  }
  if (lastYear < firstYear) {
    return { error: "The end of the year range cannot be before the start." };
  }

  const rawLines = [];
  if (includeSpdx) rawLines.push(`SPDX-License-Identifier: ${license.id}`);
  const body = license.lines.map((line) => fillTemplate(line, yearText, holderText));
  if (rawLines.length > 0 && body.length > 0) rawLines.push("");
  rawLines.push(...body);

  const commented = applyCommentStyle(rawLines, language.style);
  return {
    header: commented.join("\n"),
    lineCount: commented.length,
    licenseName: license.name,
    spdxId: license.id,
    hasOfficialHeader: license.hasOfficialHeader,
  };
}
