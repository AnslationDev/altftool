const seo = {
  title: "IPv6 Address Expander: Full 8-Group Notation",
  metaDescription:
    "Expand a compressed IPv6 address: the :: shorthand is refilled with zero groups and every group padded to 4 hex digits — 2001:db8::1 to its full form.",
  intro:
    "The IPv6 Expander rewrites a compressed IPv6 address into its full uncompressed form: it replaces the :: shorthand with the exact number of zero groups needed to reach eight, then left-pads every group to four hex digits. Enter 2001:db8::1 and you get 2001:0db8:0000:0000:0000:0000:0000:0001. It is for network engineers, developers and anyone who needs the canonical long form because a device, config file or comparison refuses to accept the shortened notation.",
  useCases: [
    "A firewall or ACL entry rejects the :: shorthand and you need the fully written 8-group address to paste into the rule.",
    "You are comparing an address from a log against one in a config and the two are written with different compression, so neither string match nor eyeballing works until both are expanded.",
    "You are writing a reverse DNS ip6.arpa record and need every one of the 32 hex digits spelled out before reversing them.",
  ],
  benefits: [
    [
      "Handles :: in any position",
      "Works whether the double colon sits at the start, the middle or the end, filling exactly the number of zero groups required to reach eight.",
    ],
    [
      "Pads every group to four digits",
      "Restores dropped leading zeros so db8 becomes 0db8, which is what makes two differently written addresses directly comparable as strings.",
    ],
    [
      "Expands as you type",
      "The full form updates with each keystroke, so a mistyped group is obvious immediately rather than after a submit step.",
    ],
  ],
  faqs: [
    [
      "What does expanding an IPv6 address mean?",
      "It means writing all eight 16-bit groups in full, each as four hexadecimal digits — 32 hex digits and seven colons in total. Compression drops leading zeros within a group and replaces one run of all-zero groups with ::, and expansion puts both back.",
    ],
    [
      "What is the full form of 2001:db8::1?",
      "2001:0db8:0000:0000:0000:0000:0000:0001. The :: stands in for five all-zero groups here, because the written groups (2001, db8 and 1) account for three of the eight, and db8 is padded to 0db8.",
    ],
    [
      "Why can :: only appear once in an address?",
      "Because it means 'as many zero groups as needed to make eight', and two of them would be ambiguous — there would be no way to tell how many zeros belong to each run. A single :: always has exactly one valid expansion.",
    ],
    [
      "Does the expanded address mean anything different from the short one?",
      "No. The compressed and expanded forms are the same 128-bit address, and both are valid IPv6 notation under RFC 4291. The expanded form is simply unambiguous for text comparison and for systems that do not parse the shorthand.",
    ],
  ],
};

export default seo;
