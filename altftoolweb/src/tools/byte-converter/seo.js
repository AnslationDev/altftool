const seo = {
  intro:
    "Byte Converter converts a digital size between bits, SI decimal units (kB, MB, GB, TB, PB, powers of 1000) and IEC binary units (KiB, MiB, GiB, TiB, PiB, powers of 1024), and shows every unit at once. It is for developers, sysadmins and anyone reconciling a quoted capacity with what an operating system reports. Both prefix families come from IEC 80000-13, which is also where the fixed rule of 8 bits per byte is defined.",
  useCases: [
    "Work out why a 1 TB SSD shows as 931 GB in Windows — 1,000,000,000,000 bytes divided by 1024^4 is 0.9095 TiB, or 931.32 GiB",
    "Convert an upload limit written as 25 MB into the byte count you need for a Content-Length check or an nginx client_max_body_size value",
    "Turn a 4.7 GB file and a 100 Mbps link into a transfer time before starting the copy",
  ],
  benefits: [
    ["Both prefix systems side by side", "Decimal and binary values for the same size appear in one table, so the 1000-versus-1024 gap is visible instead of guessed at."],
    ["Bits included", "Link speeds are quoted in bits and file sizes in bytes; both are in the same table at a fixed 8 bits per byte."],
    ["Refuses to print a wrong number", "Sizes above 2^53 bytes, negative values and non-numeric input return a plain-language message rather than a rounded or NaN result."],
  ],
  faqs: [
    [
      "Why does my 1 TB drive show as 931 GB?",
      "Because the manufacturer counts a terabyte as 1,000,000,000,000 bytes while Windows divides by 1024 three times and still writes the label \"GB\". 1,000,000,000,000 / 1024^3 = 931.32, so the same drive is honestly 1 TB and 931.32 GiB. Nothing is missing; the two labels use different bases.",
    ],
    [
      "What is the difference between MB and MiB?",
      "1 MB is 1,000,000 bytes and 1 MiB is 1,048,576 bytes — MiB is 4.86% larger. The binary prefixes (kibi, mebi, gibi) were standardised in IEC 60027-2 and carried into IEC 80000-13 specifically so that a power-of-1024 quantity has a name of its own. Linux, macOS and network gear generally mean the decimal MB; Windows and most RAM specs mean MiB even when they print MB.",
    ],
    [
      "How many bits are in a byte?",
      "8, universally in modern computing — IEC 80000-13 defines the byte as an 8-bit octet. That is why a 100 Mbps connection moves at most 12.5 MB per second: 100,000,000 bits divided by 8 is 12,500,000 bytes.",
    ],
    [
      "Why does the converter stop at about 9 petabytes?",
      "The limit is 2^53 − 1 bytes, or 9,007,199,254,740,991 — the largest integer a JavaScript number represents exactly. Beyond that, conversions start dropping low-order digits, so the tool returns an error instead of a figure that looks precise but is not.",
    ],
  ],
};

export default seo;
