const seo = {
  title: "File Name Sanitiser for Portal Uploads",
  metaDescription:
    "Rewrite a file name into the POSIX portable set - letters, digits, dot, hyphen, underscore. Fixes spaces, accents and CON/PRN names, keeps the extension.",
  steps: [
    "Type the rejected file name into File name to clean, including its extension.",
    "Choose what to Replace bad characters with, set Maximum length, and tick Lowercase everything if the portal is case-sensitive.",
    "Read the Safe file name and the Problems found list covering spaces, accents and reserved names such as CON, then press Copy name and rename your file.",
  ],
  intro:
    "This sanitiser rewrites any file name into the POSIX portable filename character set — letters, digits, dot, hyphen and underscore (POSIX.1-2017 §3.282) — which is the safest alphabet for government portals, legacy Java/ASP upload validators, URLs and every operating system. It replaces spaces and symbols, transliterates accents (é becomes e), lowercases the extension, avoids Windows reserved device names like CON and PRN, and truncates long names while always preserving the extension. It is built for applicants whose scans keep bouncing off upload forms with vague errors.",
  useCases: [
    "An applicant whose scan named 'Photo of Aadhaar (Front & Back).JPG' is rejected by a portal renames it safely in one paste",
    "A cyber-cafe operator standardises dozens of applicants' document names before a bulk application session",
    "A developer cleans user-supplied file names before storing them on a case-sensitive Linux server",
  ],
  benefits: [
    ["Every rule in one pass", "Spaces, symbols, accents, reserved names, hidden-file dots and length are all fixed together."],
    ["Explains each change", "Lists exactly which problems the original name had, so uploads stop failing mysteriously."],
    ["Extension always survives", "Truncation shortens only the base name, and the extension is lowercased for strict validators."],
  ],
  faqs: [
    [
      "Why do government portals reject file names with spaces?",
      "Many portals run old server-side validators that whitelist only letters, digits and a few separators, and spaces also break naive URL handling when the file is served back. Replacing each space with an underscore or hyphen — as this tool does — is the standard fix.",
    ],
    [
      "Which characters are always safe in a file name?",
      "The POSIX portable filename character set: uppercase and lowercase A-Z, digits 0-9, dot, hyphen and underscore — 65 characters in total. A name built only from these works on Windows, macOS, Linux, in URLs and past effectively every upload validator.",
    ],
    [
      "Why can't I name a file CON or PRN on Windows?",
      "CON, PRN, AUX, NUL, COM1-COM9 and LPT1-LPT9 are reserved DOS device names, and Windows refuses them as base file names regardless of extension — con.pdf is as invalid as con. The sanitiser appends a separator character to any such base name so the file stays usable everywhere.",
    ],
    [
      "Does renaming a file change its contents or size?",
      "No — a rename changes only the label the filesystem stores, never the bytes inside, so a renamed photo has identical quality and file size. If a portal complains about size or format rather than the name, you need a converter or compressor instead.",
    ],
  ],
};

export default seo;
