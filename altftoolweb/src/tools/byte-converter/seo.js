const seo = {
  title: "Byte Converter — Bytes to KB, MB, GB, TB & MiB",
  h1: "Byte Converter",
  metaDescription:
    "Convert bytes, bits, kB/MB/GB/TB and KiB/MiB/GiB/TiB in one table — plus transfer time and why a 1 TB drive shows as 931 GB. Free, in-browser.",
  intro:
    "Byte Converter turns one size into all 15 supported units at once: bits through gigabits, SI decimal bytes (kB, MB, GB, TB, PB — powers of 1000) and IEC binary bytes (KiB, MiB, GiB, TiB, PiB — powers of 1024). Each unit is stored as its exact byte factor, so your input is normalised to a single byte total and then divided into every target unit — one division per row, with no chained rounding. Both prefix families, and the fixed 8-bits-per-byte octet, come from IEC 80000-13, which is why the tool keeps kB and KiB visibly apart instead of treating them as the same thing. The whole calculation is plain JavaScript running in your browser: no upload, no API call, no account.",
  useCases: [
    "Work out why a 1 TB SSD shows as 931 GB in Windows — 1,000,000,000,000 bytes divided by 1024³ is 931.32 GiB, the number Windows prints under a \"GB\" label",
    "Convert an upload limit written as 25 MB into the exact byte count for a Content-Length check or an nginx client_max_body_size value",
    "Turn a 4.7 GB file and a 100 Mbps link into a transfer time before you start the copy",
  ],
  benefits: [
    [
      "Both prefix systems, side by side",
      "Decimal and binary values for the same size sit in one table with a Group column, so the 1000-versus-1024 gap is visible rather than guessed at.",
    ],
    [
      "Bits and bytes in the same view",
      "Link speeds are quoted in bits and file sizes in bytes. Both appear together at a fixed 8 bits per byte, plus a transfer-time readout for any Mbps figure you enter.",
    ],
    [
      "Refuses to print a wrong number",
      "Sizes above 2^53 bytes, negative values and non-numeric input return a plain-language message instead of a silently rounded or NaN result.",
    ],
    [
      "Nothing leaves your device",
      "The conversion is arithmetic in your browser — no file upload, no server request, no sign-up, and no usage limit.",
    ],
  ],
  faqs: [
    [
      "Why does my 1 TB drive show as 931 GB?",
      "Because the manufacturer counts a terabyte as 1,000,000,000,000 bytes, while Windows divides by 1024 three times and still writes the label \"GB\". 1,000,000,000,000 ÷ 1024³ = 931.32, so the same drive is honestly 1 TB and 931.32 GiB. No capacity is missing — the two labels just use different bases.",
    ],
    [
      "What is the difference between MB and MiB?",
      "1 MB is 1,000,000 bytes and 1 MiB is 1,048,576 bytes, so MiB is 4.86% larger. The binary prefixes (kibi, mebi, gibi) were standardised in IEC 60027-2 and carried into IEC 80000-13 precisely so a power-of-1024 quantity has its own name. Drive makers, network gear and macOS mean the decimal MB; Windows and most RAM specs mean MiB even when they print \"MB\".",
    ],
    [
      "How many bytes are in a GB?",
      "1,000,000,000 bytes in a decimal gigabyte (GB), and 1,073,741,824 bytes in a binary gibibyte (GiB) — a 7.4% difference. This converter shows both rows for the same input, so you can pick whichever one your operating system or spec sheet actually means.",
    ],
    [
      "How many bits are in a byte?",
      "8, universally in modern computing — IEC 80000-13 defines the byte as an 8-bit octet. That is why a 100 Mbps connection moves at most 12.5 MB per second: 100,000,000 bits ÷ 8 = 12,500,000 bytes.",
    ],
    [
      "How long does a 4.7 GB file take to download at 100 Mbps?",
      "About 376 seconds, or 6 minutes 16 seconds, at the theoretical line rate. The tool computes it as bytes × 8 ÷ (Mbps × 1,000,000), so 4.7 GB is 37,600,000,000 bits over a 100,000,000 bit/s link. Real transfers run slower because of protocol overhead and shared bandwidth.",
    ],
    [
      "Why does the converter stop at about 9 petabytes?",
      "The ceiling is 2^53 − 1 bytes, or 9,007,199,254,740,991 — the largest integer a JavaScript number represents exactly. Past that, conversions start dropping low-order digits, so the tool returns an error rather than a figure that looks precise but isn't.",
    ],
    [
      "Is the byte converter free, and does it upload anything?",
      "Yes it's free with no sign-up, and nothing is uploaded. Every conversion is arithmetic performed in your browser; there are no network requests in the tool, so the numbers you type never reach a server. It also keeps working on a page you already have open if your connection drops.",
    ],
    [
      "Which units does it convert between?",
      "15 in total: bit, kilobit, megabit and gigabit; the decimal bytes B, kB, MB, GB, TB and PB; and the binary bytes KiB, MiB, GiB, TiB and PiB. Enter a size in any one of them and every other unit updates in the same table, with a Copy button that puts the full list on your clipboard.",
    ],
  ],
  steps: [
    "Type the size into the Size field and pick its unit from the menu — the options are grouped into Bits, Decimal (×1000) and Binary (×1024).",
    "Read the total in bytes, the human-readable binary and decimal forms, and the full table of all 15 units, which recalculates as you type.",
    "Enter a link speed in Mbps for a transfer-time estimate, or press Copy result to put every converted value on your clipboard.",
  ],
};

export default seo;
