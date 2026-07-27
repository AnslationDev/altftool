/**
 * Unix file permission conversion — numeric (octal) <-> symbolic (rwx) form.
 *
 * Rules per POSIX / chmod(1):
 *  - Each of user, group, other holds three bits: read=4, write=2, execute=1.
 *  - An optional leading fourth digit holds the special bits:
 *    setuid=4, setgid=2, sticky (restricted deletion)=1.
 *  - In ls -l output, setuid/setgid replace the x slot with 's' (execute also
 *    set) or 'S' (execute NOT set); the sticky bit shows 't'/'T' in the other
 *    slot the same way.
 *
 * Pure module — no React, no DOM.
 */

/** POSIX permission bit weights (chmod(1)). */
export const READ_BIT = 4;
export const WRITE_BIT = 2;
export const EXEC_BIT = 1;

/** Special-bit weights in the leading octal digit (chmod(1)). */
export const SETUID_BIT = 4;
export const SETGID_BIT = 2;
export const STICKY_BIT = 1;

export const CLASSES = ["user", "group", "other"];
export const CLASS_LABELS = { user: "Owner (u)", group: "Group (g)", other: "Others (o)" };

/** Frequently used modes and where they belong. */
export const COMMON_MODES = [
  { octal: "755", note: "Directories and executables — owner writes, everyone runs" },
  { octal: "644", note: "Regular files — owner writes, everyone reads" },
  { octal: "700", note: "Private directory or script — owner only" },
  { octal: "600", note: "Private file (SSH keys must be 600)" },
  { octal: "775", note: "Group-writable project directory" },
  { octal: "664", note: "Group-writable file" },
  { octal: "1777", note: "World-writable with sticky bit — /tmp" },
  { octal: "4755", note: "Setuid root executable — runs as the file owner" },
];

function emptyBits() {
  return {
    user: { r: false, w: false, x: false },
    group: { r: false, w: false, x: false },
    other: { r: false, w: false, x: false },
    special: { setuid: false, setgid: false, sticky: false },
  };
}

/**
 * Parse a numeric mode of 3 or 4 octal digits ("755", "0644", "4755").
 * @returns {{ok:true, bits:object}} | {ok:false, message:string}
 */
export function parseOctal(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { ok: false, message: "Enter a numeric mode such as 755." };
  if (!/^[0-7]{3,4}$/.test(raw)) {
    return {
      ok: false,
      message: "A numeric mode is 3 or 4 octal digits (0-7 only), e.g. 644, 755 or 4755.",
    };
  }
  const digits = raw.padStart(4, "0").split("").map(Number);
  const [specialDigit, userDigit, groupDigit, otherDigit] = digits;

  const toTriplet = (digit) => ({
    r: (digit & READ_BIT) !== 0,
    w: (digit & WRITE_BIT) !== 0,
    x: (digit & EXEC_BIT) !== 0,
  });

  return {
    ok: true,
    bits: {
      user: toTriplet(userDigit),
      group: toTriplet(groupDigit),
      other: toTriplet(otherDigit),
      special: {
        setuid: (specialDigit & SETUID_BIT) !== 0,
        setgid: (specialDigit & SETGID_BIT) !== 0,
        sticky: (specialDigit & STICKY_BIT) !== 0,
      },
    },
  };
}

/** Octal string from a bits object; 4 digits only when a special bit is set. */
export function bitsToOctal(bits) {
  const digit = (t) => (t.r ? READ_BIT : 0) + (t.w ? WRITE_BIT : 0) + (t.x ? EXEC_BIT : 0);
  const special =
    (bits.special.setuid ? SETUID_BIT : 0) +
    (bits.special.setgid ? SETGID_BIT : 0) +
    (bits.special.sticky ? STICKY_BIT : 0);
  const core = `${digit(bits.user)}${digit(bits.group)}${digit(bits.other)}`;
  return special > 0 ? `${special}${core}` : core;
}

/** 9-character ls-style string, with s/S, t/T for the special bits. */
export function bitsToSymbolic(bits) {
  const triplet = (t, specialSet, specialChar) => {
    const r = t.r ? "r" : "-";
    const w = t.w ? "w" : "-";
    let x = t.x ? "x" : "-";
    if (specialSet) x = t.x ? specialChar : specialChar.toUpperCase();
    return r + w + x;
  };
  return (
    triplet(bits.user, bits.special.setuid, "s") +
    triplet(bits.group, bits.special.setgid, "s") +
    triplet(bits.other, bits.special.sticky, "t")
  );
}

/**
 * Parse a 9-character symbolic string like rwxr-xr-x (s/S and t/T accepted).
 * @returns {{ok:true, bits:object}} | {ok:false, message:string}
 */
export function parseSymbolic(text) {
  const raw = String(text ?? "").trim();
  if (raw === "") return { ok: false, message: "Enter a symbolic mode such as rwxr-xr-x." };
  // Accept an optional leading file-type character from ls -l (e.g. -rwxr-xr-x, drwxr-xr-x).
  const body = raw.length === 10 && "-dlbcps".includes(raw[0]) ? raw.slice(1) : raw;
  if (body.length !== 9) {
    return {
      ok: false,
      message: "A symbolic mode has exactly 9 characters (three rwx triplets), e.g. rw-r--r--.",
    };
  }

  const bits = emptyBits();
  const groups = [
    { key: "user", specialKey: "setuid", specialChar: "s" },
    { key: "group", specialKey: "setgid", specialChar: "s" },
    { key: "other", specialKey: "sticky", specialChar: "t" },
  ];

  for (let index = 0; index < 3; index += 1) {
    const [rc, wc, xc] = body.slice(index * 3, index * 3 + 3);
    const { key, specialKey, specialChar } = groups[index];
    if (rc !== "r" && rc !== "-") return { ok: false, message: `Position ${index * 3 + 1} must be r or -, got "${rc}".` };
    if (wc !== "w" && wc !== "-") return { ok: false, message: `Position ${index * 3 + 2} must be w or -, got "${wc}".` };
    bits[key].r = rc === "r";
    bits[key].w = wc === "w";
    if (xc === "x") {
      bits[key].x = true;
    } else if (xc === "-") {
      bits[key].x = false;
    } else if (xc === specialChar) {
      // lower-case s/t: special bit AND execute both set
      bits[key].x = true;
      bits.special[specialKey] = true;
    } else if (xc === specialChar.toUpperCase()) {
      // upper-case S/T: special bit set, execute NOT set
      bits[key].x = false;
      bits.special[specialKey] = true;
    } else {
      return {
        ok: false,
        message: `Position ${index * 3 + 3} must be x, -, ${specialChar} or ${specialChar.toUpperCase()}, got "${xc}".`,
      };
    }
  }
  return { ok: true, bits };
}

/** Plain-English description of what each class can do. */
export function describeBits(bits) {
  const abilities = (t) => {
    const list = [];
    if (t.r) list.push("read");
    if (t.w) list.push("write");
    if (t.x) list.push("execute / enter");
    return list.length > 0 ? list.join(", ") : "no access";
  };
  const lines = CLASSES.map((cls) => `${CLASS_LABELS[cls]}: ${abilities(bits[cls])}`);
  if (bits.special.setuid) lines.push("setuid: executable runs with the file owner's user ID.");
  if (bits.special.setgid) lines.push("setgid: runs with the file's group ID; on a directory, new files inherit its group.");
  if (bits.special.sticky) lines.push("sticky: in this directory only a file's owner (or root) can delete or rename it.");
  return lines;
}

/** Warnings for risky or nonsensical modes. */
export function warningsFor(bits) {
  const warnings = [];
  if (bits.other.w && !bits.special.sticky) {
    warnings.push("World-writable: any user on the system can modify or replace this file. Rarely intended outside /tmp-style directories.");
  }
  if (bits.special.setuid && bits.other.w) {
    warnings.push("Setuid combined with world-write is a critical security hole — anyone can replace the file and run code as its owner.");
  }
  if (bits.special.setuid && !bits.user.x) {
    warnings.push("Setuid without owner execute (capital S in ls) does nothing useful on most systems.");
  }
  if (bits.user.w && !bits.user.r) {
    warnings.push("Write without read on the owner is legal but almost always a mistake.");
  }
  return warnings;
}

/**
 * Full conversion from either representation.
 * @param {"octal"|"symbolic"} source which text field drives the result
 */
export function convertPermissions({ source = "octal", octalText = "", symbolicText = "" }) {
  const parsed = source === "symbolic" ? parseSymbolic(symbolicText) : parseOctal(octalText);
  if (!parsed.ok) return { error: parsed.message };
  const { bits } = parsed;
  const octal = bitsToOctal(bits);
  return {
    bits,
    octal,
    symbolic: bitsToSymbolic(bits),
    chmodCommand: `chmod ${octal} <file>`,
    description: describeBits(bits),
    warnings: warningsFor(bits),
  };
}
