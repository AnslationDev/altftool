const seo = {
  intro:
    "This Base32 encoder converts text to RFC 4648 Base32 using the standard A-Z and 2-7 alphabet, reading your input as UTF-8 so accented characters and emoji encode correctly. It packs the byte stream five bits at a time, pads the result with = to a multiple of 8 characters, and lets you switch to the lowercase alphabet or wrap the output at a fixed line length. It is for developers who need a case-insensitive, transcription-safe encoding of a value and want to see the byte count, padding count and size overhead alongside the result.",
  useCases: [
    "You need a token or identifier that survives being read aloud, typed by hand, or printed on a label, where Base64's case-sensitivity and + / characters would cause errors.",
    "You are debugging a system that stores Base32 strings and want to confirm what a given piece of text encodes to, byte for byte.",
    "You are producing Base32 for a file format or config that requires unpadded lowercase output, or fixed-width lines.",
  ],
  benefits: [
    [
      "Padding and case are switches, not afterthoughts",
      "Turn the = padding off for systems that reject it, and switch the whole alphabet to lowercase, without editing the output by hand.",
    ],
    [
      "UTF-8 correct for non-ASCII input",
      "Input goes through TextEncoder first, so a multi-byte character or emoji becomes its real UTF-8 bytes rather than being mangled or dropped.",
    ],
    [
      "Shows the cost of the encoding",
      "Alongside the output you get the source byte length, the encoded length, the number of padding characters, and the percentage size change.",
    ],
  ],
  faqs: [
    [
      "What alphabet does RFC 4648 Base32 use?",
      "The 32 symbols A through Z followed by the digits 2 through 7, with = as padding. The digits 0, 1 and 8 are deliberately left out because they are easily confused with O, I and B when read or typed.",
    ],
    [
      "How much bigger does Base32 make my data?",
      "About 60 percent. Every 5 bytes of input become 8 Base32 characters, so 5 bytes in gives 8 characters out — noticeably larger than Base64, which produces 4 characters per 3 bytes for roughly 33 percent overhead.",
    ],
    [
      "Why does my output end in equals signs?",
      "Because the encoded length was not a multiple of 8. Padding fills it out to the next multiple, which is why you commonly see 1, 3, 4 or 6 = characters at the end. You can switch padding off if the receiving system does not want it.",
    ],
    [
      "Base32 or Base64 — which should I use?",
      "Use Base64 when size matters and the value only ever moves between machines. Use Base32 when a human has to read, type, or dictate the value, or when the transport is case-insensitive, since Base32 uses one case and avoids ambiguous characters.",
    ],
  ],
};

export default seo;
